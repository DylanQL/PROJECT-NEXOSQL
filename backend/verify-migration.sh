#!/bin/bash

# Script para verificar que la migración se aplicó correctamente

echo "🔍 Verificando migración de base de datos..."
echo "=============================================="

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio backend"
    exit 1
fi

# Leer variables de entorno
if [ -f ".env" ]; then
    echo "📋 Cargando variables de entorno..."
    source .env
else
    echo "⚠️  Advertencia: No se encontró archivo .env"
fi

echo ""
echo "🗄️  Verificando estructura de tabla chat_messages..."

# Para MySQL
if command -v mysql >/dev/null 2>&1; then
    echo "Ejecutando: DESCRIBE chat_messages"
    
    MYSQL_CMD="mysql -u ${DB_USER:-root}"
    
    if [ ! -z "$DB_PASSWORD" ]; then
        MYSQL_CMD="$MYSQL_CMD -p$DB_PASSWORD"
    fi
    
    if [ ! -z "$DB_HOST" ]; then
        MYSQL_CMD="$MYSQL_CMD -h $DB_HOST"
    fi
    
    if [ ! -z "$DB_PORT" ]; then
        MYSQL_CMD="$MYSQL_CMD -P $DB_PORT"
    fi
    
    if [ ! -z "$DB_NAME" ]; then
        MYSQL_CMD="$MYSQL_CMD $DB_NAME"
    fi
    
    echo "Comando: $MYSQL_CMD -e \"DESCRIBE chat_messages;\""
    $MYSQL_CMD -e "DESCRIBE chat_messages;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Conexión exitosa. Verificando campos específicos..."
        
        # Verificar campo cancelado
        CANCELADO_EXISTS=$($MYSQL_CMD -e "DESCRIBE chat_messages;" 2>/dev/null | grep -c "cancelado")
        if [ "$CANCELADO_EXISTS" -gt 0 ]; then
            echo "✅ Campo 'cancelado' encontrado"
        else
            echo "❌ Campo 'cancelado' NO encontrado"
        fi
        
        # Verificar campo hilo_conversacion
        HILO_EXISTS=$($MYSQL_CMD -e "DESCRIBE chat_messages;" 2>/dev/null | grep -c "hilo_conversacion")
        if [ "$HILO_EXISTS" -gt 0 ]; then
            echo "✅ Campo 'hilo_conversacion' encontrado"
        else
            echo "❌ Campo 'hilo_conversacion' NO encontrado"
        fi
        
        echo ""
        echo "📊 Datos actuales en chat_messages:"
        $MYSQL_CMD -e "SELECT COUNT(*) as total_messages FROM chat_messages;" 2>/dev/null
        $MYSQL_CMD -e "SELECT COUNT(*) as messages_with_thread FROM chat_messages WHERE hilo_conversacion IS NOT NULL;" 2>/dev/null
        $MYSQL_CMD -e "SELECT COUNT(*) as cancelled_messages FROM chat_messages WHERE cancelado = 1;" 2>/dev/null
        
    else
        echo "❌ Error conectando a MySQL. Verifica las credenciales."
        echo ""
        echo "🔧 Variables de entorno actuales:"
        echo "   DB_HOST: ${DB_HOST:-localhost}"
        echo "   DB_PORT: ${DB_PORT:-3306}"  
        echo "   DB_USER: ${DB_USER:-root}"
        echo "   DB_NAME: ${DB_NAME:-no especificada}"
        echo ""
        echo "💡 Para aplicar manualmente la migración:"
        echo "   mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST $DB_NAME < migrations/20250926_add_cancellation_and_thread_fields.sql"
    fi
else
    echo "❌ MySQL no está disponible en el sistema"
fi

echo ""
echo "🛠️  Si los campos no existen, ejecuta:"
echo "   ./apply-migration.sh"
echo ""
echo "🧪 Para probar la cancelación:"
echo "   1. Inicia el backend: npm run dev"
echo "   2. Haz una pregunta en el frontend"
echo "   3. Cancela durante el procesamiento"
echo "   4. Verifica con: SELECT * FROM chat_messages WHERE cancelado = 1;"