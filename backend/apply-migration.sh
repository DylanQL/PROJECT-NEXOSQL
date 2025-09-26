#!/bin/bash

# Script para aplicar la migración de campos de cancelación y hilos de conversación
# Ejecuta este script desde la raíz del proyecto backend

echo "🚀 Aplicando migración: Campos de cancelación y hilos de conversación"
echo "=================================================="

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio backend"
    exit 1
fi

# Verificar si existe el archivo de migración
MIGRATION_FILE="migrations/20250926_add_cancellation_and_thread_fields.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: No se encontró el archivo de migración: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Archivo de migración encontrado: $MIGRATION_FILE"

# Leer variables de entorno
if [ -f ".env" ]; then
    echo "📋 Cargando variables de entorno..."
    source .env
else
    echo "⚠️  Advertencia: No se encontró archivo .env"
fi

# Función para ejecutar migración en MySQL/MariaDB
apply_mysql_migration() {
    echo "🔧 Aplicando migración para MySQL/MariaDB..."
    
    # Construir comando mysql
    MYSQL_CMD="mysql"
    
    if [ ! -z "$DB_HOST" ]; then
        MYSQL_CMD="$MYSQL_CMD -h $DB_HOST"
    fi
    
    if [ ! -z "$DB_PORT" ]; then
        MYSQL_CMD="$MYSQL_CMD -P $DB_PORT"
    fi
    
    if [ ! -z "$DB_USER" ]; then
        MYSQL_CMD="$MYSQL_CMD -u $DB_USER"
    fi
    
    if [ ! -z "$DB_PASSWORD" ]; then
        MYSQL_CMD="$MYSQL_CMD -p$DB_PASSWORD"
    fi
    
    if [ ! -z "$DB_NAME" ]; then
        MYSQL_CMD="$MYSQL_CMD $DB_NAME"
    fi
    
    echo "Ejecutando: $MYSQL_CMD < $MIGRATION_FILE"
    $MYSQL_CMD < "$MIGRATION_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ Migración MySQL aplicada exitosamente"
        return 0
    else
        echo "❌ Error aplicando migración MySQL"
        return 1
    fi
}

# Función para ejecutar migración en PostgreSQL
apply_postgres_migration() {
    echo "🔧 Aplicando migración para PostgreSQL..."
    
    # Extraer la parte de PostgreSQL del archivo de migración
    sed -n '/\/\* For PostgreSQL/,/\*\//p' "$MIGRATION_FILE" | \
    sed '1d;$d' | \
    sed 's/^\/\*$//' | sed 's/^\*\/$//' > temp_postgres_migration.sql
    
    # Construir comando psql
    PSQL_CMD="psql"
    
    if [ ! -z "$DB_HOST" ]; then
        PSQL_CMD="$PSQL_CMD -h $DB_HOST"
    fi
    
    if [ ! -z "$DB_PORT" ]; then
        PSQL_CMD="$PSQL_CMD -p $DB_PORT"
    fi
    
    if [ ! -z "$DB_USER" ]; then
        PSQL_CMD="$PSQL_CMD -U $DB_USER"
    fi
    
    if [ ! -z "$DB_NAME" ]; then
        PSQL_CMD="$PSQL_CMD -d $DB_NAME"
    fi
    
    echo "Ejecutando: $PSQL_CMD -f temp_postgres_migration.sql"
    $PSQL_CMD -f temp_postgres_migration.sql
    
    # Limpiar archivo temporal
    rm -f temp_postgres_migration.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Migración PostgreSQL aplicada exitosamente"
        return 0
    else
        echo "❌ Error aplicando migración PostgreSQL"
        return 1
    fi
}

# Detectar tipo de base de datos y aplicar migración correspondiente
echo "🔍 Detectando tipo de base de datos..."

if [ ! -z "$DB_TYPE" ]; then
    case "$DB_TYPE" in
        "mysql"|"mariadb")
            apply_mysql_migration
            ;;
        "postgres"|"postgresql")
            apply_postgres_migration
            ;;
        *)
            echo "❌ Tipo de base de datos no soportado: $DB_TYPE"
            echo "   Tipos soportados: mysql, mariadb, postgres, postgresql"
            exit 1
            ;;
    esac
else
    echo "⚠️  Variable DB_TYPE no definida. Intentando MySQL por defecto..."
    apply_mysql_migration
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Migración completada exitosamente!"
    echo ""
    echo "📝 Cambios aplicados:"
    echo "   ✅ Campo 'cancelado' (BOOLEAN) añadido a chat_messages"
    echo "   ✅ Campo 'hilo_conversacion' (UUID/VARCHAR) añadido a chat_messages"
    echo "   ✅ Índice creado para hilo_conversacion"
    echo ""
    echo "🔄 Reinicia el servidor backend para que los cambios surtan efecto:"
    echo "   npm run dev"
    echo ""
else
    echo ""
    echo "❌ Error durante la migración"
    echo ""
    echo "🔧 Soluciones posibles:"
    echo "   1. Verificar credenciales de base de datos en .env"
    echo "   2. Asegurarse de que la base de datos esté ejecutándose"
    echo "   3. Verificar permisos de usuario de base de datos"
    echo "   4. Ejecutar manualmente el SQL desde:"
    echo "      $MIGRATION_FILE"
    echo ""
    exit 1
fi