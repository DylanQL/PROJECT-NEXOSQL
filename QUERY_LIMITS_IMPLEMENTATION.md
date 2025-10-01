# Implementación de Límites de Consultas Mensuales

##### 3. Cont### 4. Controlador User (`backend/src/controllers/userController.js`)
Nuevo endpoint `getQueryStats()` que retorna:
```javascrip### En la interfaz:
1. La página "Conexiones" muestra una tarjeta unificada **"Límites del Plan"** que incluye:
   - **Conexiones de BD**: Muestra conexiones usadas/totales con barra de progreso
   - **Consultas mensuales**: Muestra consultas usadas/totales con barra de progreso
   - Ambas métricas se muestran lado a lado (responsive)
   - Alertas unificadas cuando se acerca a cualquier límite

2. La página "Subscriptions" muestra los límites en las features de cada plan

3. Cuando el usuario se acerca al límite de cualquier recurso:
   - 75%+: Alerta informativa
   - 90%+: Alerta de advertencia con botón "Mejorar Plan"
   - 100%: Mensaje de límite alcanzadoss: true,
  data: {
    used: 45,              // Consultas usadas
    limit: 500,            // Límite del plan
    remaining: 455,        // Consultas restantes
    planType: "bronce",    // Tipo de plan
    resetDate: "2025-10-01",
    hasActiveSubscription: true
  }
}
```

### 5. Controlador Subscription (`backend/src/controllers/subscriptionController.js`)
Modificado el método `confirmSubscription()` para:
- Resetear el contador de consultas cuando se activa una nueva suscripción
- Resetear el contador cuando se actualiza/cambia de plan
- Establecer `monthly_queries_used = 0` y `queries_reset_date = fecha actual`
- Aplicar tanto para nuevas suscripciones como para actualizaciones de planckend/src/controllers/aiController.js`)
Modificado para:
- **Verificar si fue cancelado ANTES de guardar la respuesta**
- Si fue cancelado: guarda mensaje de cancelación pero NO incrementa contador
- Si NO fue cancelado: guarda respuesta normal e incrementa contador
- Solo cuenta consultas completadas exitosamente que NO fueron canceladasmen
Este documento describe la implementación del sistema de límites de consultas mensuales para cada tipo de suscripción en NexoSQL.

## Límites por Plan
- **Bronce**: 500 consultas/mes
- **Plata**: 1,000 consultas/mes
- **Oro**: 2,000 consultas/mes

## Cambios en la Base de Datos

### Migración: `20251001_add_query_limits.sql`
Se añadieron dos nuevos campos a la tabla `usuarios`:

```sql
-- Campo para rastrear consultas usadas en el mes actual
monthly_queries_used INT DEFAULT 0

-- Campo para rastrear la fecha de reseteo del contador
queries_reset_date DATE NULL
```

## Cambios en el Backend

### 1. Modelo User (`backend/src/models/User.js`)
Se agregaron campos y métodos:

**Campos nuevos:**
- `monthly_queries_used`: Contador de consultas del mes actual
- `queries_reset_date`: Fecha del último reseteo

**Métodos nuevos:**
- `resetMonthlyQueriesIfNeeded()`: Resetea el contador si cambió el mes
- `hasReachedQueryLimit()`: Verifica si alcanzó el límite
- `incrementQueryCount()`: Incrementa el contador de consultas
- `getRemainingQueries()`: Obtiene consultas restantes

### 2. Modelo Subscription (`backend/src/models/Subscription.js`)
Se actualizó el método `getPlanDetails()` para incluir:

```javascript
bronce: { maxQueries: 500, ... }
plata: { maxQueries: 1000, ... }
oro: { maxQueries: 2000, ... }
```

### 3. Middleware de Límite de Consultas (`backend/src/middleware/queryLimit.js`)
Nuevo middleware que:
- Verifica si el usuario tiene suscripción activa
- Resetea el contador mensual si es necesario
- Bloquea consultas si se alcanzó el límite
- Retorna error 429 (Too Many Requests) cuando se alcanza el límite

### 4. Controlador AI (`backend/src/controllers/aiController.js`)
Modificado para:
- Incrementar el contador solo después de consultas exitosas
- No contar consultas canceladas
- Usar `req.userWithLimit` del middleware

### 5. Controlador User (`backend/src/controllers/userController.js`)
Nuevo endpoint `getQueryStats()` que retorna:
```javascript
{
  success: true,
  data: {
    used: 45,              // Consultas usadas
    limit: 500,            // Límite del plan
    remaining: 455,        // Consultas restantes
    planType: "bronce",    // Tipo de plan
    resetDate: "2025-10-01",
    hasActiveSubscription: true
  }
}
```

### 5. Rutas (`backend/src/routes/`)
**aiRoutes.js**: Se añadió middleware `checkQueryLimit` a la ruta `/query`
**userRoutes.js**: Nueva ruta `GET /api/users/query-stats`

## Cambios en el Frontend

### 1. Servicio API (`frontend/src/services/api.js`)
Nuevo método en `userApi`:
```javascript
getQueryStats: async () => { ... }
```

### 2. Servicio de Suscripciones (`frontend/src/services/subscriptionService.js`)
Actualizado `getPlanDetails()` con:
- `maxQueries` para cada plan
- Features actualizados mostrando límites de consultas

### 3. Componente QueryLimitInfo (`frontend/src/components/QueryLimitInfo.js`)
Nuevo componente que muestra:
- Barra de progreso de uso de consultas
- Consultas usadas vs límite del plan
- Alertas cuando se usa el 75%, 90% o se alcanza el límite
- Botón para mejorar plan cuando se acerca al límite

### 4. Componente PlanLimitsInfo (`frontend/src/components/PlanLimitsInfo.js`)
**Componente unificado que combina ConnectionLimitInfo y QueryLimitInfo** en una sola tarjeta:
- Muestra límites de conexiones y consultas lado a lado
- Barras de progreso para ambos recursos
- Alertas unificadas cuando se acerca a cualquier límite
- Diseño responsive (columnas en desktop, apilado en mobile)
- Indicador de estado general del plan

### 5. Página Conexiones (`frontend/src/pages/Conexiones.js`)
Se agregó el componente `<PlanLimitsInfo />` que reemplaza a los componentes individuales de ConnectionLimitInfo y QueryLimitInfo

### 5. Página Subscriptions (`frontend/src/pages/Subscriptions.js`)
Las tarjetas de planes ahora muestran:
- "500 consultas mensuales con IA" (Bronce)
- "1,000 consultas mensuales con IA" (Plata)
- "2,000 consultas mensuales con IA" (Oro)

## Flujo de Funcionamiento

### Al realizar una consulta:
1. El middleware `checkQueryLimit` verifica:
   - ¿Tiene suscripción activa? → Si no, error 403
   - ¿Cambió el mes? → Si cambió, resetea el contador a 0
   - ¿Alcanzó el límite? → Si alcanzó, error 429

2. Si pasa las validaciones:
   - Se guarda el mensaje del usuario en la BD
   - Se procesa la consulta en `aiController.processQuery()` (puede tomar varios segundos)
   - **ANTES de guardar la respuesta, se verifica si fue cancelado**
   - Si fue cancelado:
     - Se guarda mensaje "Consulta cancelada por el usuario"
     - **NO se incrementa el contador** ⏭️
     - Se retorna con `cancelled: true`
   - Si NO fue cancelado:
     - Se guarda la respuesta normal del asistente
     - **Se incrementa el contador** ✅
     - Se retorna la respuesta completa

3. El contador se resetea automáticamente al inicio de cada mes

### Al actualizar/cambiar de plan:
1. Usuario selecciona nuevo plan (upgrade o downgrade)
2. Se crea nueva suscripción en PayPal
3. Usuario completa el pago
4. Al confirmar la suscripción:
   - Se cancela la suscripción anterior (si existe)
   - Se activa la nueva suscripción
   - **Se resetea el contador de consultas a 0** 🔄
   - Se actualiza `queries_reset_date` a la fecha actual
5. Usuario comienza con 0 consultas usadas en su nuevo plan

### Casos de reseteo del contador:
- ✅ Al inicio de cada mes (automático)
- ✅ Al activar una nueva suscripción (primera vez)
- ✅ Al actualizar/cambiar de plan (upgrade/downgrade)

### Cancelación desde el Frontend:
1. Usuario hace clic en "Cancelar" mientras se procesa
2. Frontend llama a `/api/ai/cancel/:hiloConversacion`
3. Backend marca `cancelado = true` en el mensaje del usuario
4. Cuando el procesamiento de IA termina:
   - Backend recarga el mensaje del usuario desde la BD
   - Detecta que `cancelado = true`
   - **NO guarda la respuesta del asistente**
   - **NO incrementa el contador de consultas**
   - Retorna respuesta indicando cancelación

### En la interfaz:
1. La página "Conexiones" muestra dos tarjetas:
   - Límite de Conexiones (ya existente)
   - Consultas Mensuales (nueva)

2. La página "Subscriptions" muestra los límites en las features de cada plan

3. Cuando el usuario se acerca al límite:
   - 75%: Alerta informativa
   - 90%: Alerta de advertencia con botón "Mejorar Plan"
   - 100%: No puede hacer más consultas hasta el próximo mes

## Códigos de Error

### Error 403 - NO_SUBSCRIPTION
```json
{
  "success": false,
  "error": "Necesitas una suscripción activa para realizar consultas",
  "code": "NO_SUBSCRIPTION"
}
```

### Error 429 - QUERY_LIMIT_REACHED
```json
{
  "success": false,
  "error": "Has alcanzado el límite de 500 consultas mensuales para tu plan bronce",
  "code": "QUERY_LIMIT_REACHED",
  "data": {
    "used": 500,
    "limit": 500,
    "planType": "bronce"
  }
}
```

## Características Importantes

1. **Reseteo Automático**: El contador se resetea automáticamente al cambiar de mes
2. **No cuenta canceladas**: Las consultas canceladas por el usuario NO se cuentan
3. **Thread-safe**: El incremento usa el método `.increment()` de Sequelize
4. **Visible para el usuario**: Información clara en tiempo real del uso
5. **Upgrade sugerido**: Botones para mejorar plan cuando se acerca al límite
6. **Reseteo al cambiar plan**: Cuando el usuario actualiza su suscripción (upgrade/downgrade), el contador de consultas se resetea a 0

## Testing Manual

### Verificar límites:
1. Crear usuario con plan Bronce
2. Hacer 500 consultas (verificar contador)
3. Intentar consulta 501 (debe fallar con error 429)
4. Esperar al próximo mes o cambiar manualmente `queries_reset_date`
5. Verificar que el contador se resetea

### Verificar UI:
1. Ir a página "Conexiones"
2. Verificar que aparece tarjeta "Consultas Mensuales"
3. Hacer algunas consultas
4. Recargar página y verificar que el contador aumenta
5. Ir a "Subscriptions" y verificar que se muestran los límites

## Archivos Modificados

### Backend
- `migrations/20251001_add_query_limits.sql` (nuevo)
- `src/models/User.js` (modificado)
- `src/models/Subscription.js` (modificado)
- `src/middleware/queryLimit.js` (nuevo)
- `src/controllers/aiController.js` (modificado)
- `src/controllers/userController.js` (modificado)
- `src/routes/aiRoutes.js` (modificado)
- `src/routes/userRoutes.js` (modificado)

### Frontend
- `src/services/api.js` (modificado)
- `src/services/subscriptionService.js` (modificado)
- `src/components/QueryLimitInfo.js` (nuevo)
- `src/pages/Conexiones.js` (modificado)
- `src/pages/Subscriptions.js` (ya tenía el sistema de features)

## Próximos Pasos Sugeridos

1. **Testing exhaustivo**: Probar todos los casos límite
2. **Monitoreo**: Agregar logs para tracking de uso
3. **Analytics**: Dashboard para ver estadísticas de uso
4. **Notificaciones**: Email cuando el usuario alcanza 80%, 90%, 100%
5. **Grace period**: Considerar permitir X consultas extra antes de bloquear
