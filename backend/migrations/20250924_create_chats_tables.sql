-- Migración para crear las tablas de chats y mensajes
-- Fecha: 2025-09-24
-- Descripción: Crear tablas para almacenar chats y mensajes de chat

-- Crear tabla chats
CREATE TABLE IF NOT EXISTS chats (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId VARCHAR(36) NOT NULL,
    conexionId VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Nueva consulta',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_chats_userId (userId),
    INDEX idx_chats_conexionId (conexionId),
    INDEX idx_chats_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conexionId) REFERENCES conexiondbs(id) ON DELETE CASCADE
);

-- Crear tabla chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    chatId VARCHAR(36) NOT NULL,
    type ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    metadata JSON NULL COMMENT 'Almacena metadatos como SQL generado, tiempos de ejecución, etc.',
    isError BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_chat_messages_chatId (chatId),
    INDEX idx_chat_messages_timestamp (timestamp),
    INDEX idx_chat_messages_type (type),
    FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE
);

-- Para PostgreSQL, usar esto en su lugar:
/*
-- Crear tabla chats
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "conexionId" UUID NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Nueva consulta',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chats_userId ON chats("userId");
CREATE INDEX IF NOT EXISTS idx_chats_conexionId ON chats("conexionId");
CREATE INDEX IF NOT EXISTS idx_chats_createdAt ON chats("createdAt");

-- Crear tabla chat_messages
CREATE TYPE message_type AS ENUM ('user', 'assistant');

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "chatId" UUID NOT NULL,
    type message_type NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NULL,
    "isError" BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chatId ON chat_messages("chatId");
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(type);

-- Foreign keys para PostgreSQL
ALTER TABLE chats ADD CONSTRAINT fk_chats_userId 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE chats ADD CONSTRAINT fk_chats_conexionId 
    FOREIGN KEY ("conexionId") REFERENCES "ConexionDBs"(id) ON DELETE CASCADE;
ALTER TABLE chat_messages ADD CONSTRAINT fk_chat_messages_chatId 
    FOREIGN KEY ("chatId") REFERENCES chats(id) ON DELETE CASCADE;
*/