# Pruebas de Contexto de Conversación

## Escenarios de Prueba

### Test 1: Pregunta de Seguimiento Simple
**Objetivo**: Verificar que la IA mantiene contexto básico

```
1. Usuario: "Muéstrame todos los usuarios de la base de datos"
   Esperado: Lista de usuarios

2. Usuario: "¿Cuántos son en total?"
   Esperado: La IA debe responder con el conteo de usuarios sin que el usuario tenga que especificar "usuarios" nuevamente
```

### Test 2: Referencias con Pronombres
**Objetivo**: Verificar que la IA entiende referencias pronominales

```
1. Usuario: "Dame información de la tabla productos"
   Esperado: Descripción de la tabla productos

2. Usuario: "Muéstrame los 5 más caros"
   Esperado: Top 5 productos por precio

3. Usuario: "¿Cuál de ellos tiene más stock?"
   Esperado: De los 5 productos anteriores, cuál tiene más stock
```

### Test 3: Modificación de Consulta Anterior
**Objetivo**: Verificar que la IA puede modificar consultas previas

```
1. Usuario: "Muéstrame los pedidos del mes actual"
   Esperado: Lista de pedidos del mes

2. Usuario: "Ahora solo los que están pendientes"
   Esperado: Filtro adicional aplicado a la consulta anterior

3. Usuario: "Ordénalos por fecha"
   Esperado: Misma consulta con ordenamiento
```

### Test 4: Contexto Extendido (Múltiples Turnos)
**Objetivo**: Verificar que el contexto se mantiene en conversaciones largas

```
1. Usuario: "¿Cuáles son las tablas principales de esta base de datos?"
2. Usuario: "Descríbeme la primera"
3. Usuario: "¿Cuántos registros tiene?"
4. Usuario: "Muéstrame los últimos 10"
5. Usuario: "¿Hay alguno con fecha de hoy?"
```

### Test 5: Corrección de Errores
**Objetivo**: Verificar que la IA entiende correcciones

```
1. Usuario: "Muéstrame los productos de la categoría 'electronics'"
   (Si no existe esa categoría)

2. Usuario: "Me equivoqué, quise decir 'electrónica'"
   Esperado: La IA debe entender que está corrigiendo la categoría
```

### Test 6: Agregación de Datos
**Objetivo**: Verificar operaciones en resultados previos

```
1. Usuario: "Dame las ventas de este año"
   Esperado: Lista de ventas

2. Usuario: "Agrúpalas por mes"
   Esperado: Ventas agrupadas mensualmente

3. Usuario: "Muéstrame solo los meses con más de 1000€"
   Esperado: Filtro aplicado a la agrupación anterior
```

## Cómo Ejecutar las Pruebas

### Opción 1: Manual (Recomendado)
1. Inicia la aplicación
2. Crea o selecciona una conexión a base de datos
3. Abre o crea un nuevo chat
4. Ejecuta cada escenario secuencialmente
5. Verifica que las respuestas tienen sentido en el contexto

### Opción 2: Monitorear Logs
Observa en la consola del backend:
```
📝 Sending X messages to AI (including Y history messages)
```

Esto te indicará:
- Total de mensajes enviados (X)
- Mensajes del historial (Y)

### Verificación de Éxito

✅ **La prueba es exitosa si:**
- La IA responde coherentemente sin necesitar re-explicación
- Las referencias pronominales son entendidas
- Las modificaciones a consultas previas funcionan
- Los logs muestran que se envía el historial

❌ **La prueba falla si:**
- La IA pide aclaración sobre contexto obvio
- No entiende "ellos", "eso", "los anteriores", etc.
- Cada pregunta requiere contexto completo
- Los logs muestran solo 2 mensajes (system + user)

## Notas Importantes

1. **Límite de Mensajes**: Solo los últimos 20 mensajes se incluyen
2. **Mensajes Cancelados**: No aparecen en el historial
3. **Nuevo Chat**: Al crear un chat nuevo, no hay historial

## Ejemplo de Conversación Exitosa

```
👤 Usuario: "Muéstrame los clientes de España"
🤖 IA: [Ejecuta: SELECT * FROM clientes WHERE pais = 'España']
     Resultado: 15 clientes encontrados

👤 Usuario: "¿Cuántos de ellos han hecho pedidos este mes?"
🤖 IA: [Ejecuta: SELECT COUNT(DISTINCT c.id) FROM clientes c 
        JOIN pedidos p ON c.id = p.cliente_id 
        WHERE c.pais = 'España' 
        AND MONTH(p.fecha) = MONTH(CURRENT_DATE)]
     Resultado: 8 clientes han hecho pedidos este mes

👤 Usuario: "Muéstramelos"
🤖 IA: [Ejecuta: SELECT DISTINCT c.* FROM clientes c 
        JOIN pedidos p ON c.id = p.cliente_id 
        WHERE c.pais = 'España' 
        AND MONTH(p.fecha) = MONTH(CURRENT_DATE)]
     [Lista de 8 clientes]
```

En este ejemplo, la IA:
1. Recuerda que hablamos de clientes de España
2. Mantiene el filtro de país en consultas subsiguientes
3. Entiende "ellos" = "clientes de España"
4. Entiende "muéstramelos" = "los clientes que hicieron pedidos este mes"

## Troubleshooting

### Problema: La IA no recuerda el contexto
**Solución**: 
- Verifica que estás en el mismo chat (no creaste uno nuevo)
- Revisa los logs del backend para confirmar que se envía historial
- Asegúrate de que hay mensajes previos no cancelados

### Problema: Respuestas muy lentas
**Solución**: 
- Podría estar enviando demasiado contexto
- Considera reducir el límite de 20 mensajes a 10 en `getConversationHistory`

### Problema: "Token limit exceeded"
**Solución**: 
- Reduce el límite de mensajes históricos
- Implementa truncado de mensajes muy largos
- Aumenta `max_tokens` en la configuración de OpenAI si es necesario

## Mejoras Futuras Sugeridas

1. **Resumen Inteligente**: Para conversaciones >20 mensajes, crear un resumen
2. **Contexto Selectivo**: Solo incluir mensajes relevantes al tema actual
3. **Compresión**: Eliminar redundancias en el historial
4. **Configuración por Usuario**: Permitir ajustar cuántos mensajes de historial usar
