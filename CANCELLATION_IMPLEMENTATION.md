# Implementación de Cancelación de Mensajes y Hilos de Conversación

## 📋 Resumen de Cambios

Se han implementado dos nuevos campos en el sistema de chat para mejorar la funcionalidad:

1. **Campo `cancelado`**: Permite marcar mensajes como cancelados por el usuario
2. **Campo `hilo_conversacion`**: Agrupa mensajes de usuario y respuestas de IA en hilos únicos

## 🚀 Instrucciones de Implementación

### 1. Aplicar Migración de Base de Datos

```bash
# Desde el directorio backend
cd backend
./apply-migration.sh
```

O aplicar manualmente:

**MySQL/MariaDB:**
```sql
-- Añadir campo cancelado a chat_messages
ALTER TABLE chat_messages 
ADD COLUMN cancelado BOOLEAN DEFAULT FALSE COMMENT 'Indica si el mensaje fue cancelado por el usuario';

-- Añadir campo hilo_conversacion a chat_messages
ALTER TABLE chat_messages 
ADD COLUMN hilo_conversacion VARCHAR(36) NULL COMMENT 'ID del hilo de conversación que agrupa mensaje del usuario y respuesta del asistente';

-- Crear índice para el campo hilo_conversacion
CREATE INDEX idx_chat_messages_hilo_conversacion ON chat_messages(hilo_conversacion);
```

**PostgreSQL:**
```sql
-- Añadir campo cancelado a chat_messages
ALTER TABLE chat_messages 
ADD COLUMN cancelado BOOLEAN DEFAULT FALSE;

-- Añadir campo hilo_conversacion a chat_messages
ALTER TABLE chat_messages 
ADD COLUMN hilo_conversacion UUID NULL;

-- Crear índice para el campo hilo_conversacion
CREATE INDEX IF NOT EXISTS idx_chat_messages_hilo_conversacion ON chat_messages(hilo_conversacion);

-- Comentarios para PostgreSQL
COMMENT ON COLUMN chat_messages.cancelado IS 'Indica si el mensaje fue cancelado por el usuario';
COMMENT ON COLUMN chat_messages.hilo_conversacion IS 'ID del hilo de conversación que agrupa mensaje del usuario y respuesta del asistente';
```

### 2. Reiniciar Servicios

```bash
# Backend
cd backend
npm run dev

# Frontend (en otra terminal)
cd frontend
npm start
```

## 🔧 Archivos Modificados

### Backend

1. **`migrations/20250926_add_cancellation_and_thread_fields.sql`** ✨ *Nuevo*
   - Migración SQL para añadir los nuevos campos

2. **`src/models/ChatMessage.js`**
   - Añadidos campos `cancelado` y `hilo_conversacion` al modelo
   - Añadido índice para `hilo_conversacion`

3. **`src/controllers/aiController.js`**
   - Modificado `processQuery` para generar y usar `hilo_conversacion`
   - Añadido método `cancelMessage` para cancelar por thread ID

4. **`src/controllers/chatController.js`**
   - Actualizado `addMessage` para incluir `hilo_conversacion`
   - Modificados métodos de formateo para incluir nuevos campos

5. **`src/services/aiService.js`**
   - Añadido método `isThreadCancelled` para verificar cancelación
   - Modificado `processWithAI` para verificar cancelación en cada iteración
   - Añadidas verificaciones antes de ejecutar queries SQL/MongoDB

6. **`src/routes/aiRoutes.js`**
   - Añadida ruta `POST /ai/cancel/:hiloConversacion`

### Frontend

1. **`src/services/api.js`**
   - Añadido método `cancelMessage` en `aiApi`

2. **`src/services/chatService.js`**
   - Añadido método `cancelMessage`

3. **`src/components/ChatInterface.js`**
   - Añadido estado `currentThreadId` para rastrear hilos activos
   - Modificado `handleSubmit` para capturar thread ID
   - Actualizado `handleCancelRequest` para cancelar via thread ID
   - Mejorado renderizado de mensajes cancelados

## 💡 Funcionalidades Implementadas

### 1. Generación de Hilos de Conversación

- Cada pregunta del usuario genera un UUID único como `hilo_conversacion`
- El mensaje del usuario y la respuesta de la IA comparten el mismo hilo
- Permite agrupar y rastrear conversaciones relacionadas

### 2. Cancelación de Mensajes

- **Cancelación por HTTP**: AbortController para cancelar peticiones
- **Cancelación por DB**: Marca mensajes como cancelados en base de datos
- **Verificación continua**: El backend verifica cancelación en cada iteración del procesamiento

### 3. Verificaciones de Cancelación

El backend ahora verifica cancelación en:
- Inicio de cada iteración del loop de IA
- Antes de ejecutar consultas SQL/MongoDB
- Entre llamadas a la API de IA

### 4. Interfaz de Usuario

- Botón de cancelar visible durante el procesamiento
- Mensajes cancelados se muestran con estilo diferenciado (warning)
- Estado visual claro para el usuario

## 🔄 Flujo de Cancelación

1. **Usuario inicia consulta** → Se genera `hilo_conversacion` UUID
2. **Durante procesamiento** → Usuario hace clic en "Cancelar"
3. **Frontend** → Llama a `POST /ai/cancel/:hiloConversacion`
4. **Backend** → Marca mensajes como `cancelado: true` en DB
5. **AI Service** → Verifica cancelación y detiene procesamiento
6. **Respuesta** → Retorna mensaje de cancelación al usuario

## 🧪 Testing

Para probar la funcionalidad:

1. **Iniciar una consulta compleja** que tome tiempo en procesarse
2. **Hacer clic en cancelar** durante el procesamiento
3. **Verificar** que aparece el mensaje de cancelación
4. **Comprobar en BD** que el campo `cancelado` sea `true`

## 📊 Consideraciones de Rendimiento

- Las verificaciones de cancelación añaden consultas mínimas a la DB
- El índice en `hilo_conversacion` optimiza estas consultas
- El impacto en rendimiento es negligible

## 🔒 Seguridad

- Solo el propietario del chat puede cancelar sus mensajes
- Verificación de permisos en el endpoint de cancelación
- Thread IDs son UUIDs seguros y únicos

## 🚨 Troubleshooting

### Error "Column 'cancelado' doesn't exist"
- Aplicar la migración de base de datos
- Reiniciar el servidor backend

### Cancelación no funciona
- Verificar que el thread ID se está generando correctamente
- Comprobar logs del backend para errores de DB
- Verificar permisos de usuario en la base de datos

### Mensajes duplicados
- Limpiar localStorage del navegador
- Verificar que no hay conflictos en IDs de mensajes