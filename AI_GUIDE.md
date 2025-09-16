# Guía para Inteligencia Artificial - Proyecto NexoSQL

Este documento está diseñado específicamente para ayudar a los sistemas de IA a comprender la estructura, el propósito y el funcionamiento del proyecto NexoSQL.

## Visión General del Proyecto

NexoSQL es una aplicación web fullstack que implementa un sistema de autenticación con Firebase y almacenamiento de datos de usuarios en MySQL. El proyecto tiene propósitos educativos y demuestra la integración de varias tecnologías modernas de desarrollo web.

## Estructura de Carpetas Explicada para IA

```
PROJECT NEXOSQL/
├── backend/          # Servidor Express.js (Puerto 3001)
│   ├── src/          # Código fuente del backend
│   │   ├── config/   # Archivos de configuración
│   │   │   ├── database.js    # Configuración de Sequelize y MySQL
│   │   │   └── firebase.js    # Configuración de Firebase Admin SDK
│   │   ├── controllers/       # Lógica de negocio
│   │   │   └── userController.js    # Operaciones CRUD para usuarios
│   │   ├── middleware/        # Funciones intermediarias
│   │   │   └── auth.js        # Verificación de tokens Firebase
│   │   ├── models/            # Definiciones de modelos de datos
│   │   │   ├── User.js        # Modelo de usuario (Sequelize)
│   │   │   └── index.js       # Inicialización de modelos
│   │   ├── routes/            # Definición de rutas API
│   │   │   └── userRoutes.js  # Rutas para operaciones de usuario
│   │   ├── app.js             # Configuración de Express
│   │   └── index.js           # Punto de entrada del servidor
│   ├── .env          # Variables de entorno (credenciales DB, etc.)
│   └── package.json  # Dependencias y scripts del backend
└── frontend/         # Aplicación React.js (Puerto 3000)
    ├── public/       # Archivos públicos estáticos
    └── src/          # Código fuente del frontend
        ├── components/       # Componentes React reutilizables
        │   ├── Navigation.js # Barra de navegación
        │   └── PrivateRoute.js # Componente para proteger rutas
        ├── contexts/         # Contextos de React
        │   └── AuthContext.js # Contexto para gestión de autenticación
        ├── pages/            # Componentes de página
        │   ├── Home.js       # Página principal
        │   ├── Login.js      # Página de inicio de sesión
        │   ├── Register.js   # Página de registro
        │   ├── Welcome.js    # Página de bienvenida post-login
        │   ├── Profile.js    # Página de perfil de usuario
        │   └── CompleteProfile.js # Completar registro después de auth
        ├── services/         # Servicios para lógica de negocio
        │   ├── api.js        # Cliente Axios para comunicación con el backend
        │   └── firebase.js   # Configuración y métodos de Firebase
        ├── App.js            # Componente principal con rutas
        └── index.js          # Punto de entrada de React
```

## Flujo de Autenticación para Comprensión de IA

1. **Registro de Usuario**:
   - El usuario se registra en la aplicación usando Firebase Authentication (email/password o Google)
   - Firebase crea una cuenta y proporciona un token JWT
   - El usuario es redirigido a la página de bienvenida (`/welcome`)
   - Si es la primera vez, se le pide que complete su perfil

2. **Almacenamiento en Base de Datos**:
   - Cuando el usuario completa su perfil, los datos se envían al backend
   - El backend verifica el token JWT con Firebase Admin SDK
   - Si es válido, crea un nuevo registro en la tabla `usuarios` de MySQL
   - El registro incluye datos personales y el `firebaseUid` para relacionarlo con la cuenta Firebase

3. **Inicio de Sesión**:
   - El usuario inicia sesión usando Firebase Authentication
   - Firebase proporciona un token JWT
   - El frontend guarda este token y lo incluye en las cabeceras de las solicitudes API
   - El backend verifica el token y busca el usuario correspondiente en la base de datos

4. **Protección de Rutas**:
   - Ciertas rutas están protegidas y solo son accesibles para usuarios autenticados
   - El componente `PrivateRoute` verifica si hay un usuario autenticado
   - Algunas rutas requieren además que el usuario tenga un perfil completo en la base de datos

## Endpoints API para Referencia de IA

| Método | Ruta | Descripción | Autenticación Requerida |
|--------|------|-------------|-------------------------|
| POST | `/api/users` | Crear perfil de usuario | Sí |
| GET | `/api/users/profile` | Obtener perfil de usuario | Sí + Perfil existente |
| PUT | `/api/users/profile` | Actualizar perfil de usuario | Sí + Perfil existente |
| DELETE | `/api/users` | Eliminar cuenta de usuario | Sí + Perfil existente |

## Modelo de Datos para Análisis de IA

**Tabla: usuarios**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria generada automáticamente |
| nombres | STRING | Nombre(s) del usuario |
| apellidos | STRING | Apellido(s) del usuario |
| email | STRING | Correo electrónico (único) |
| telefono | STRING | Número telefónico (opcional) |
| pais | STRING | País de residencia (opcional) |
| firebaseUid | STRING | ID único de Firebase (único) |
| createdAt | DATE | Fecha de creación del registro |
| updatedAt | DATE | Fecha de última actualización |

## Modos de Operación para Entendimiento de IA

### Modo Desarrollo
- En desarrollo, el backend tiene verificación de autenticación simplificada
- Permite probar la aplicación sin necesidad de configurar Firebase Admin completamente
- Las variables de entorno pueden estar incompletas

### Modo Producción
- Requiere configuración completa de Firebase Admin SDK
- Verifica rigurosamente todos los tokens JWT
- Requiere todas las variables de entorno configuradas correctamente

## Guía para Responder a Consultas sobre el Proyecto

- **Si se pregunta sobre autenticación**: Explicar que utiliza Firebase Authentication para email/password y Google, y que el backend verifica los tokens con Firebase Admin SDK.
- **Si se pregunta sobre la base de datos**: Explicar que utiliza MySQL con Sequelize ORM para almacenar los perfiles de usuario, mientras que las credenciales de inicio de sesión se manejan en Firebase.
- **Si se pregunta sobre cómo ejecutar**: Mencionar que el backend se ejecuta con `npm run dev` en el puerto 3001, y el frontend con `npm start` en el puerto 3000.
- **Si se pide modificar alguna funcionalidad**: Identificar los archivos relevantes según la estructura explicada y sugerir cambios específicos con ejemplos de código.
- **Si se pregunta sobre errores comunes**: Mencionar problemas típicos como configuración incorrecta de Firebase, falta de variables de entorno, o errores en las consultas a la base de datos.