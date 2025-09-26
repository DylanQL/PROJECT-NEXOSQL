#!/bin/bash

# Script de prueba para verificar la funcionalidad de cancelación
# Este script hace pruebas básicas de la API

echo "🧪 Probando funcionalidad de cancelación de mensajes"
echo "======================================================"

# Configuración
BACKEND_URL="http://localhost:3001/api"
TEST_CONNECTION_ID="test-connection-id"
TEST_QUESTION="¿Cuántos usuarios hay en la base de datos?"

echo ""
echo "📊 Estado del script:"
echo "• URL Backend: $BACKEND_URL"
echo "• Connection ID: $TEST_CONNECTION_ID"
echo "• Pregunta de prueba: $TEST_QUESTION"
echo ""

# Función para hacer una petición POST
make_post_request() {
    local url="$1"
    local data="$2"
    local description="$3"
    
    echo "🔄 $description"
    echo "   URL: $url"
    echo "   Data: $data"
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer test-token" \
        -d "$data" \
        "$url" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "   Status: $http_code"
    echo "   Response: $body"
    echo ""
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "   ✅ Success"
    else
        echo "   ❌ Failed"
    fi
    echo ""
}

# Función para probar cancelación
test_cancellation() {
    local thread_id="$1"
    echo "🚫 Probando cancelación para hilo: $thread_id"
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer test-token" \
        "$BACKEND_URL/ai/cancel/$thread_id" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "   Status: $http_code"
    echo "   Response: $body"
    echo ""
    
    if [ "$http_code" -eq 200 ]; then
        echo "   ✅ Cancellation API working"
    else
        echo "   ❌ Cancellation API failed"
    fi
    echo ""
}

echo "1️⃣ Verificando que el servidor esté ejecutándose..."
if curl -s "$BACKEND_URL" > /dev/null 2>&1; then
    echo "   ✅ Servidor backend accesible"
else
    echo "   ❌ Servidor backend no accesible en $BACKEND_URL"
    echo ""
    echo "🔧 Para iniciar el servidor:"
    echo "   cd backend"
    echo "   npm run dev"
    echo ""
    exit 1
fi
echo ""

echo "2️⃣ Probando endpoint de cancelación con thread ID ficticio..."
test_cancellation "test-thread-id-123"

echo "3️⃣ Verificando estructura de base de datos..."
echo "   Ejecuta este SQL para verificar que los campos existen:"
echo "   DESCRIBE chat_messages;"
echo ""
echo "   Deberías ver:"
echo "   • cancelado (tinyint/boolean)"
echo "   • hilo_conversacion (varchar(36)/uuid)"
echo ""

echo "4️⃣ Test manual recomendado:"
echo "   1. Abre la aplicación en http://localhost:3000"
echo "   2. Haz una pregunta compleja a la IA"
echo "   3. Mientras procesa, haz clic en el botón 'Cancelar'"
echo "   4. Verifica en los logs del backend que aparezca:"
echo "      '✅ Successfully marked X messages as cancelled'"
echo "   5. La IA debería detenerse y mostrar mensaje de cancelación"
echo ""

echo "5️⃣ Verificar logs en tiempo real:"
echo "   Backend logs: tail -f backend-logs.txt"
echo "   Frontend logs: Abrir DevTools en el navegador"
echo ""

echo "🔍 Debug SQL queries para verificar cancelación:"
echo "   SELECT id, type, content, cancelado, hilo_conversacion FROM chat_messages WHERE cancelado = 1;"
echo "   SELECT COUNT(*) as cancelled_messages FROM chat_messages WHERE cancelado = 1;"
echo ""

echo "✨ Prueba completada. Si ves ✅ en todos los puntos, la funcionalidad está lista."