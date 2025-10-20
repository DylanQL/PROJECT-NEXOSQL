# Implementación de Contexto en Conversaciones con IA

## Problema Identificado
El asistente IA no mantenía el contexto de mensajes anteriores en la conversación. Cada pregunta se procesaba de forma aislada sin tener en cuenta el historial del chat.

## Solución Implementada

### 1. Modificaciones en `aiService.js`

#### a) Método `processQuery` actualizado
- **Antes**: Solo recibía `connection`, `question` y `hiloConversacion`
- **Ahora**: Recibe también el `chatId` para recuperar el historial
- Se agregó llamada a `getConversationHistory(chatId)` para obtener mensajes previos
- El historial se pasa al método `processWithAI`

```javascript
async processQuery(connection, question, hiloConversacion, chatId = null) {
  // ...código existente...
  
  // Get conversation history if chatId is provided
  let conversationHistory = [];
  if (chatId) {
    conversationHistory = await this.getConversationHistory(chatId);
  }

  // Process the question with conversation history
  const result = await this.processWithAI(
    dbClient, 
    systemPrompt, 
    question, 
    connection, 
    hiloConversacion, 
    conversationHistory
  );
}
```

#### b) Nuevo método `getConversationHistory`
Este método recupera el historial de conversación de un chat específico:

**Características:**
- Filtra mensajes cancelados (`cancelado: false`)
- Ordena cronológicamente (`order: [['createdAt', 'ASC']]`)
- Limita a los últimos 20 mensajes para evitar desbordamiento de tokens
- Formatea los mensajes para la API de OpenAI (role: 'user' o 'assistant')

```javascript
async getConversationHistory(chatId) {
  const messages = await ChatMessage.findAll({
    where: { 
      chatId,
      cancelado: false
    },
    order: [['createdAt', 'ASC']],
    limit: 20
  });

  return messages.map(msg => ({
    role: msg.type === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
}
```

#### c) Método `processWithAI` actualizado
- **Nuevo parámetro**: `conversationHistory = []`
- Construye un array de `messages` que incluye:
  1. El prompt del sistema (con schema de DB)
  2. El historial de conversación (mensajes previos)
  3. La pregunta actual del usuario

```javascript
async processWithAI(dbClient, systemPrompt, question, connection, hiloConversacion, conversationHistory = []) {
  // ...código existente...
  
  // Build messages array with conversation history
  const messages = [
    { role: "system", content: systemPrompt }
  ];

  // Add conversation history (excluding current question)
  if (conversationHistory && conversationHistory.length > 0) {
    const filteredHistory = conversationHistory.filter(msg => 
      !(msg.role === 'user' && msg.content === question)
    );
    messages.push(...filteredHistory);
  }

  // Add current user question
  messages.push({ role: "user", content: currentPrompt });

  console.log(`📝 Sending ${messages.length} messages to AI (including ${conversationHistory.length} history messages)`);

  // Call the AI service with full context
  const completion = await this.openai.chat.completions.create({
    model: this.model,
    messages: messages,
    temperature: 0.1,
    max_tokens: 2000
  });
}
```

### 2. Modificaciones en `aiController.js`

Se actualizó la llamada al servicio de IA para incluir el `chatId`:

```javascript
const result = await aiService.processQuery(
  connection, 
  question, 
  hiloConversacion, 
  chat.id  // <-- Nuevo parámetro
);
```

## Beneficios de la Implementación

1. **Contexto Persistente**: La IA ahora tiene acceso a las 20 últimas interacciones del chat
2. **Conversaciones Naturales**: Los usuarios pueden hacer preguntas de seguimiento sin repetir información
3. **Referencias Implícitas**: La IA entiende pronombres y referencias a consultas anteriores
4. **Optimización de Tokens**: Limita a 20 mensajes para no exceder límites de la API
5. **Filtrado Inteligente**: Excluye mensajes cancelados del contexto
6. **Sin Duplicados**: Filtra la pregunta actual si ya existe en el historial

## Ejemplos de Uso

### Antes (Sin Contexto)
```
Usuario: "Muéstrame los usuarios"
IA: [Lista de usuarios]

Usuario: "¿Cuántos son?"
IA: "No entiendo tu pregunta, ¿qué quieres contar?"
```

### Ahora (Con Contexto)
```
Usuario: "Muéstrame los usuarios"
IA: [Lista de usuarios]

Usuario: "¿Cuántos son?"
IA: "Hay 25 usuarios en total" [La IA entiende que se refiere a los usuarios de la consulta anterior]
```

## Consideraciones Técnicas

### Límite de Mensajes
Se limita a 20 mensajes para evitar:
- Exceder el límite de tokens de la API de DeepSeek/OpenAI
- Ralentización del procesamiento
- Costos excesivos de API

### Rendimiento
- La consulta al historial es rápida (indexada por `chatId`)
- Se excluyen mensajes cancelados automáticamente
- El ordenamiento cronológico mantiene coherencia

### Seguridad
- Se verifica que el `chatId` pertenezca al usuario antes de procesarlo
- Los mensajes cancelados no contaminan el contexto

## Logs de Depuración

Se agregó un log informativo para monitorear el uso del contexto:

```
📝 Sending 12 messages to AI (including 10 history messages)
```

Esto indica:
- Total de mensajes enviados a la IA
- Cuántos son del historial vs. el mensaje actual

## Testing Recomendado

1. Probar pregunta inicial en un chat nuevo
2. Hacer preguntas de seguimiento que requieran contexto
3. Verificar que después de 20 mensajes, solo se mantengan los más recientes
4. Confirmar que mensajes cancelados no aparecen en el contexto
5. Probar con diferentes tipos de preguntas (seguimiento, referencias, etc.)

## Notas Adicionales

- El límite de 20 mensajes es configurable si se necesita más o menos contexto
- La implementación es compatible con todas las bases de datos soportadas
- No afecta la funcionalidad de cancelación de consultas existente
