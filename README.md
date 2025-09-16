# Proyecto NexoSQL

Este proyecto es una aplicación web full-stack con autenticación de usuarios utilizando Firebase y una base de datos MySQL. Está estructurado en dos partes principales: un backend con Express.js y un frontend con React.js.

## Estructura del Proyecto

```
PROJECT NEXOSQL/
├── backend/          # Servidor Express.js
│   ├── src/
│   │   ├── config/       # Configuraciones (DB, Firebase)
│   │   ├── controllers/  # Controladores para la lógica de negocio
│   │   ├── middleware/   # Middleware (autenticación, etc.)
│   │   ├── models/       # Modelos de datos con Sequelize ORM
│   │   ├── routes/       # Rutas de la API
│   │   ├── app.js        # Configuración de Express
│   │   └── index.js      # Punto de entrada del servidor
│   ├── .env              # Variables de entorno
│   └── package.json      # Dependencias del backend
└── frontend/         # Aplicación React.js
    ├── public/           # Archivos estáticos
    ├── src/
    │   ├── components/   # Componentes reutilizables
    │   ├── contexts/     # Contextos de React (Auth)
    │   ├── pages/        # Componentes de página
    │   ├── services/     # Servicios (Firebase, API)
    │   ├── App.js        # Componente principal de la aplicación
    │   └── index.js      # Punto de entrada de React
    └── package.json      # Dependencias del frontend
```

## Tecnologías Utilizadas

### Backend
- **Express.js**: Framework de Node.js para el servidor
- **Sequelize**: ORM para interactuar con MySQL
- **MySQL**: Base de datos relacional
- **Firebase Admin SDK**: Para verificar tokens de autenticación
- **dotenv**: Para gestionar variables de entorno
- **cors**: Para permitir solicitudes cross-origin

### Frontend
- **React.js**: Biblioteca para construir interfaces de usuario
- **React Router**: Para la navegación
- **React Bootstrap**: Para los componentes de UI
- **Firebase SDK**: Para autenticación de usuarios
- **Axios**: Para realizar peticiones HTTP

## Funcionalidades

### Autenticación
- Registro de usuarios con correo electrónico y contraseña
- Inicio de sesión con correo electrónico y contraseña
- Autenticación con Google
- Protección de rutas para usuarios autenticados

### Gestión de Usuarios
- Creación de perfil de usuario en la base de datos MySQL
- Visualización de perfil de usuario
- Actualización de información de perfil
- Eliminación de cuenta

## Modelo de Datos

**Usuario**:
- id (PK): UUID generado automáticamente
- nombres: Nombre(s) del usuario
- apellidos: Apellido(s) del usuario
- email: Correo electrónico (único)
- telefono: Número de teléfono (opcional)
- pais: País de residencia (opcional)
- firebaseUid: ID único de Firebase (único)
- createdAt: Fecha de creación
- updatedAt: Fecha de última actualización

## Flujo de la Aplicación

1. El usuario se registra o inicia sesión usando Firebase Authentication
2. Después de autenticarse, es redirigido a la página de bienvenida
3. Si es la primera vez, debe completar su perfil
4. Los datos del perfil se guardan en la base de datos MySQL
5. El usuario puede ver y actualizar su perfil

## Configuración

### Backend

1. Instalar dependencias:
```
cd backend
npm install
```

2. Configurar variables de entorno en el archivo `.env`:
```
PORT=3001
DB_HOST=tu_host_mysql
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_PORT=tu_puerto
```

3. Iniciar el servidor:
```
npm run dev
```

### Frontend

1. Instalar dependencias:
```
cd frontend
npm install
```

2. Iniciar la aplicación:
```
npm start
```

## Desarrollo

- El backend se ejecuta en `http://localhost:3001`
- El frontend se ejecuta en `http://localhost:3000`
- El frontend hace peticiones al backend a través de un proxy configurado

## Notas para el Desarrollo

- En el entorno de desarrollo, la autenticación de Firebase Admin SDK está configurada para ser tolerante con las credenciales faltantes
- Para un entorno de producción, se necesitarían configurar correctamente las credenciales de Firebase Admin SDK
- El proyecto incluye middleware para proteger rutas que requieren autenticación