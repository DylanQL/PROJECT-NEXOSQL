-- Migración para añadir límites de consultas mensuales
-- Fecha: 2025-10-01
-- Descripción: Añadir campos para rastrear el uso mensual de consultas por usuario

-- Para MySQL
-- Añadir campo monthly_queries_used a usuarios
ALTER TABLE usuarios 
ADD COLUMN monthly_queries_used INT DEFAULT 0 COMMENT 'Número de consultas utilizadas en el mes actual';

-- Añadir campo queries_reset_date a usuarios
ALTER TABLE usuarios 
ADD COLUMN queries_reset_date DATE NULL COMMENT 'Fecha del último reseteo del contador de consultas';

-- Crear índice para el campo queries_reset_date
CREATE INDEX idx_usuarios_queries_reset_date ON usuarios(queries_reset_date);

-- Para PostgreSQL, usar esto en su lugar:
/*
-- Añadir campo monthly_queries_used a usuarios
ALTER TABLE usuarios 
ADD COLUMN monthly_queries_used INTEGER DEFAULT 0;

-- Añadir campo queries_reset_date a usuarios
ALTER TABLE usuarios 
ADD COLUMN queries_reset_date DATE NULL;

-- Crear índice para el campo queries_reset_date
CREATE INDEX IF NOT EXISTS idx_usuarios_queries_reset_date ON usuarios(queries_reset_date);

-- Comentarios para PostgreSQL
COMMENT ON COLUMN usuarios.monthly_queries_used IS 'Número de consultas utilizadas en el mes actual';
COMMENT ON COLUMN usuarios.queries_reset_date IS 'Fecha del último reseteo del contador de consultas';
*/
