-- Migración para añadir campos de cancelación y hilos de conversación
-- Fecha: 2025-09-26
-- Descripción: Añadir campos 'cancelado' e 'hilo_conversacion' a las tablas de chats

-- Para MySQL
-- Añadir campo cancelado a chat_messages
ALTER TABLE chat_messages 
ADD COLUMN cancelado BOOLEAN DEFAULT FALSE COMMENT 'Indica si el mensaje fue cancelado por el usuario';

-- Añadir campo hilo_conversacion a chat_messages
ALTER TABLE chat_messages 
ADD COLUMN hilo_conversacion VARCHAR(36) NULL COMMENT 'ID del hilo de conversación que agrupa mensaje del usuario y respuesta del asistente';

-- Crear índice para el campo hilo_conversacion
CREATE INDEX idx_chat_messages_hilo_conversacion ON chat_messages(hilo_conversacion);

-- Para PostgreSQL, usar esto en su lugar:
/*
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
*/