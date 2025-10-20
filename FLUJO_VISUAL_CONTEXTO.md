# 🎨 Visualización del Flujo de Contexto

## 🔄 Flujo Completo de una Conversación Contextual

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
│                                                                  │
│  Usuario escribe: "Muéstrame los clientes"                      │
│  ├─ connectionId: 123                                            │
│  ├─ chatId: 456                                                  │
│  ├─ threadId: abc-def-ghi                                        │
│  └─ question: "Muéstrame los clientes"                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP POST /api/ai/query
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND - aiController.js                      │
│                                                                  │
│  1. Valida credenciales del usuario                              │
│  2. Verifica que la conexión existe                              │
│  3. Busca o crea el chat                                         │
│  4. Guarda mensaje del usuario en DB                             │
│  5. Llama a aiService.processQuery(...)  ◄─── NUEVO PARÁMETRO   │
│                                          └─ chatId: 456          │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│               BACKEND - aiService.js (processQuery)              │
│                                                                  │
│  1. Crea cliente de base de datos                                │
│  2. Obtiene schema de la DB                                      │
│  3. Crea system prompt                                           │
│  4. 🆕 getConversationHistory(chatId)  ◄────── NUEVA FUNCIÓN    │
│     ├─ Busca últimos 20 mensajes                                 │
│     ├─ Filtra cancelados                                         │
│     ├─ Ordena cronológicamente                                   │
│     └─ Formatea para OpenAI                                      │
│  5. Llama processWithAI(... conversationHistory)                 │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│            BACKEND - aiService.js (processWithAI)                │
│                                                                  │
│  🆕 CONSTRUCCIÓN DE MENSAJES CON CONTEXTO:                       │
│                                                                  │
│  messages = [                                                    │
│    {                                                             │
│      role: "system",                                             │
│      content: "Eres un asistente SQL... [schema de DB]"          │
│    },                                                            │
│    // ─────── HISTORIAL (Últimos 20 mensajes) ─────────         │
│    {                                                             │
│      role: "user",                                               │
│      content: "Dame todas las tablas" // Mensaje 1 anterior     │
│    },                                                            │
│    {                                                             │
│      role: "assistant",                                          │
│      content: "Las tablas son: users, orders..." // Resp. 1     │
│    },                                                            │
│    {                                                             │
│      role: "user",                                               │
│      content: "Describe la primera" // Mensaje 2 anterior       │
│    },                                                            │
│    {                                                             │
│      role: "assistant",                                          │
│      content: "La tabla users tiene..." // Resp. 2              │
│    },                                                            │
│    // ─────── MENSAJE ACTUAL ─────────                          │
│    {                                                             │
│      role: "user",                                               │
│      content: "Muéstrame los clientes" // Pregunta actual       │
│    }                                                             │
│  ]                                                               │
│                                                                  │
│  openai.chat.completions.create({ messages })                    │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                   DeepSeek / OpenAI API                          │
│                                                                  │
│  🧠 IA ANALIZA TODO EL CONTEXTO:                                 │
│  • Conoce el schema de la base de datos                          │
│  • Recuerda conversaciones anteriores                            │
│  • Entiende referencias ("la primera", "los clientes")           │
│  • Genera SQL contextualizado                                    │
│                                                                  │
│  Respuesta:                                                      │
│  {                                                               │
│    action: "QUERY",                                              │
│    sql: "SELECT * FROM customers",                               │
│    reasoning: "Mostrando todos los clientes de la tabla..."      │
│  }                                                               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│            BACKEND - aiService.js (ejecuta query)                │
│                                                                  │
│  1. Ejecuta: SELECT * FROM customers                             │
│  2. Obtiene resultados                                           │
│  3. Formatea respuesta                                           │
│  4. Retorna al controller                                        │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND - aiController.js                      │
│                                                                  │
│  1. Verifica si fue cancelado                                    │
│  2. Guarda respuesta del asistente en DB                         │
│  3. Incrementa contador de queries                               │
│  4. Retorna respuesta al frontend                                │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
│                                                                  │
│  Muestra respuesta:                                              │
│  "Encontré 150 clientes. Aquí están los primeros 10..."          │
│  [Tabla con datos]                                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparación: Sin Contexto vs Con Contexto

### ❌ SIN CONTEXTO (Antes)

```
┌─────────────────────────────────────────┐
│  Mensaje 1                              │
│  👤: "Dame los productos"                │
│  🤖: [Lista productos]                   │
└─────────────────────────────────────────┘
         │
         │ Contexto perdido ❌
         ▼
┌─────────────────────────────────────────┐
│  Mensaje 2                              │
│  👤: "¿Cuántos son?"                     │
│  🤖: "¿Cuántos qué? Por favor          │
│       especifica sobre qué quieres      │
│       información"                       │
└─────────────────────────────────────────┘
```

**Enviado a la IA:**
```javascript
messages: [
  { role: "system", content: "System prompt..." },
  { role: "user", content: "¿Cuántos son?" }
]
// Solo 2 mensajes ❌ Sin contexto
```

---

### ✅ CON CONTEXTO (Ahora)

```
┌─────────────────────────────────────────┐
│  Mensaje 1                              │
│  👤: "Dame los productos"                │
│  🤖: [Lista productos]                   │
└────────────┬────────────────────────────┘
             │
             │ Contexto guardado ✅
             ▼
┌─────────────────────────────────────────┐
│  Mensaje 2                              │
│  👤: "¿Cuántos son?"                     │
│  🤖: "Son 150 productos en total"       │
│       [La IA entiende que se refiere    │
│        a los productos]                  │
└─────────────────────────────────────────┘
```

**Enviado a la IA:**
```javascript
messages: [
  { role: "system", content: "System prompt..." },
  { role: "user", content: "Dame los productos" },
  { role: "assistant", content: "SELECT * FROM productos..." },
  { role: "user", content: "¿Cuántos son?" }
]
// 4 mensajes ✅ Con contexto completo
```

---

## 🔍 Ejemplo de Conversación Completa

### Turno 1
```
👤 Usuario: "¿Qué tablas tiene esta base de datos?"

📤 Enviado a IA:
   [System: schema completo]
   [User: "¿Qué tablas tiene esta base de datos?"]

🤖 Respuesta: "Esta base de datos tiene las siguientes tablas:
   - customers (clientes)
   - orders (pedidos)
   - products (productos)
   - categories (categorías)"

💾 Guardado en DB como mensaje del chat
```

### Turno 2
```
👤 Usuario: "Descríbeme la primera"

📤 Enviado a IA:
   [System: schema completo]
   [User: "¿Qué tablas tiene esta base de datos?"]
   [Assistant: "Esta base de datos tiene las siguientes tablas..."]
   [User: "Descríbeme la primera"]  ← IA entiende que "la primera" = customers

🤖 Respuesta: "La tabla 'customers' contiene información de clientes:
   - id (INT, PK)
   - name (VARCHAR)
   - email (VARCHAR)
   - created_at (DATETIME)"

💾 Guardado en DB
```

### Turno 3
```
👤 Usuario: "¿Cuántos registros tiene?"

📤 Enviado a IA:
   [System: schema completo]
   [User: "¿Qué tablas tiene esta base de datos?"]
   [Assistant: "Esta base de datos tiene..."]
   [User: "Descríbeme la primera"]
   [Assistant: "La tabla 'customers' contiene..."]
   [User: "¿Cuántos registros tiene?"]  ← IA sabe que se refiere a customers

🤖 IA ejecuta: SELECT COUNT(*) FROM customers
    Respuesta: "La tabla customers tiene 1,523 registros"

💾 Guardado en DB
```

### Turno 4
```
👤 Usuario: "Muéstrame los últimos 5"

📤 Enviado a IA:
   [System: schema completo]
   [... historial previo ...]
   [User: "¿Cuántos registros tiene?"]
   [Assistant: "La tabla customers tiene 1,523 registros"]
   [User: "Muéstrame los últimos 5"]  ← IA mantiene contexto de customers

🤖 IA ejecuta: SELECT * FROM customers ORDER BY created_at DESC LIMIT 5
    Respuesta: [Tabla con 5 clientes más recientes]

💾 Guardado en DB
```

---

## 💡 Ventajas del Sistema de Contexto

### 1. Naturalidad 🗣️
```
Sin contexto: "Muéstrame los productos de la tabla productos donde el precio sea mayor a 100"
Con contexto: "Dame los productos"
              "Los que cuesten más de 100"
```

### 2. Referencias 🔗
```
Sin contexto: ❌ "Ordénalos por precio" → "¿Ordenar qué?"
Con contexto: ✅ "Ordénalos por precio" → [Ordena los productos anteriores]
```

### 3. Correcciones ✏️
```
Sin contexto: ❌ "Me equivoqué, quise decir..." → "¿Sobre qué te equivocaste?"
Con contexto: ✅ "Me equivoqué, quise decir..." → [Corrige la consulta anterior]
```

### 4. Seguimiento 📈
```
Sin contexto: ❌ "¿Y el mes pasado?" → "¿El mes pasado qué?"
Con contexto: ✅ "¿Y el mes pasado?" → [Aplica mismo análisis a mes anterior]
```

---

## 🎯 Puntos Clave de la Implementación

1. **Recuperación Inteligente**: Solo últimos 20 mensajes
2. **Filtrado**: Excluye mensajes cancelados
3. **Orden**: Cronológico para mantener coherencia
4. **Formato**: Compatible con OpenAI Chat API
5. **Eficiencia**: Una sola consulta a DB por request
6. **Seguridad**: Verifica permisos de acceso al chat

---

## 🚀 Resultado Final

El usuario ahora puede tener conversaciones **naturales y fluidas** con el asistente IA, similar a ChatGPT, donde puede hacer preguntas de seguimiento, usar pronombres, y hacer referencias a información previa sin tener que repetir contexto.
