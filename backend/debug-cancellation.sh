#!/bin/bash

# Script para probar directamente el endpoint de cancelación

echo "🧪 Probando endpoint de cancelación directamente"
echo "================================================="

# Configuración
BACKEND_URL="http://localhost:3001/api"

echo ""
echo "1️⃣ Verificando que el backend esté ejecutándose..."

if curl -s "$BACKEND_URL" > /dev/null 2>&1; then
    echo "   ✅ Servidor backend accesible en $BACKEND_URL"
else
    echo "   ❌ Servidor backend no accesible en $BACKEND_URL"
    echo ""
    echo "🔧 Para iniciar el servidor:"
    echo "   npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "2️⃣ Consultando mensajes existentes con hilo_conversacion..."

# Obtener un hilo de conversación real de la base de datos
REAL_THREAD_ID=$(mysql -u root -p123456 -h localhost -P 3306 NexoSQL_DB -se "SELECT hilo_conversacion FROM chat_messages WHERE hilo_conversacion IS NOT NULL LIMIT 1;" 2>/dev/null)

if [ ! -z "$REAL_THREAD_ID" ]; then
    echo "   📍 Hilo encontrado: $REAL_THREAD_ID"
    
    # Mostrar los mensajes de este hilo antes de cancelar
    echo ""
    echo "   📋 Mensajes en este hilo ANTES de cancelar:"
    mysql -u root -p123456 -h localhost -P 3306 NexoSQL_DB -e "SELECT id, type, LEFT(content, 50) as content, cancelado, hilo_conversacion FROM chat_messages WHERE hilo_conversacion = '$REAL_THREAD_ID';" 2>/dev/null
    
    echo ""
    echo "3️⃣ Probando cancelación con hilo real: $REAL_THREAD_ID"
    
    # Probar el endpoint de cancelación
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer fake-token" \
        -H "x-firebase-uid: test-user-id" \
        "$BACKEND_URL/ai/cancel/$REAL_THREAD_ID" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "   📡 Status Code: $http_code"
    echo "   📄 Response Body: $body"
    
    if [ "$http_code" -eq 200 ]; then
        echo "   ✅ Cancelación exitosa"
        
        echo ""
        echo "4️⃣ Verificando cambios en la base de datos..."
        
        # Mostrar los mensajes después de cancelar
        echo "   📋 Mensajes en este hilo DESPUÉS de cancelar:"
        mysql -u root -p123456 -h localhost -P 3306 NexoSQL_DB -e "SELECT id, type, LEFT(content, 50) as content, cancelado, hilo_conversacion FROM chat_messages WHERE hilo_conversacion = '$REAL_THREAD_ID';" 2>/dev/null
        
        echo ""
        echo "   📊 Total de mensajes cancelados en la DB:"
        mysql -u root -p123456 -h localhost -P 3306 NexoSQL_DB -e "SELECT COUNT(*) as cancelled_count FROM chat_messages WHERE cancelado = 1;" 2>/dev/null
        
    else
        echo "   ❌ Error en cancelación"
        echo "   🔧 Posibles causas:"
        echo "      • Problema de autenticación (Firebase token)"
        echo "      • El hilo no pertenece al usuario"
        echo "      • Error en el controlador"
    fi
    
else
    echo "   ❌ No se encontraron mensajes con hilo_conversacion"
    echo "   💡 Primero envía una pregunta desde el frontend para generar un hilo"
fi

echo ""
echo "5️⃣ Debug manual recomendado:"
echo "   🔍 Ver logs del backend en tiempo real:"
echo "      npm run dev (y observar los logs de consola)"
echo ""
echo "   🗃️  Consulta manual en MySQL:"
echo "      SELECT id, type, content, cancelado, hilo_conversacion FROM chat_messages ORDER BY createdAt DESC LIMIT 5;"
echo ""
echo "   🧪 Probar desde el navegador:"
echo "      1. Abre DevTools (F12)"
echo "      2. Ve a Network tab"
echo "      3. Haz una pregunta y cancélala"
echo "      4. Busca la petición POST a /ai/cancel/..."
echo "      5. Revisa la respuesta"