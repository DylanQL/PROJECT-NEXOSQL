# Guía de Componentes y Navegación - Proyecto NexoSQL

Esta guía proporciona información detallada sobre los componentes principales del frontend y la estructura de navegación del proyecto NexoSQL.

## Navegación y Rutas

El sistema de navegación está implementado utilizando React Router v6. A continuación se presentan las rutas principales y su funcionamiento:

| Ruta | Componente | Accesibilidad | Descripción |
|------|------------|---------------|-------------|
| `/` | `Home` | Pública | Página principal, muestra información general e invita a iniciar sesión o registrarse |
| `/login` | `Login` | Pública | Formulario de inicio de sesión con opciones para email/contraseña y Google |
| `/register` | `Register` | Pública | Formulario de registro con opciones para email/contraseña y Google |
| `/welcome` | `Welcome` | Privada (Auth) | Página de bienvenida después de iniciar sesión |
| `/complete-profile` | `CompleteProfile` | Privada (Auth) | Formulario para completar el perfil de usuario |
| `/profile` | `Profile` | Privada (Auth+Perfil) | Página para ver y editar el perfil del usuario |

## Componentes Principales

### Componentes de Autenticación

#### `<AuthProvider>` (contexts/AuthContext.js)

Un componente de contexto que gestiona el estado de autenticación y proporciona métodos para:

- Iniciar sesión con email/contraseña
- Registrarse con email/contraseña
- Autenticarse con Google
- Cerrar sesión
- Crear y actualizar perfiles de usuario

**Valores y métodos expuestos:**
- `currentUser`: Usuario actual de Firebase
- `userProfile`: Datos del perfil del usuario desde MySQL
- `loading`: Estado de carga
- `signup()`: Registro con email/contraseña
- `login()`: Inicio de sesión con email/contraseña
- `loginWithGoogle()`: Autenticación con Google
- `logout()`: Cerrar sesión
- `createProfile()`: Crear perfil en MySQL
- `updateProfile()`: Actualizar perfil en MySQL

#### `<PrivateRoute>` (components/PrivateRoute.js)

Un componente de orden superior que protege las rutas que requieren autenticación:

- Verifica si el usuario está autenticado
- Opcionalmente verifica si el usuario tiene un perfil completo
- Redirige a la página de inicio de sesión si no se cumplen las condiciones

**Props:**
- `requireProfile`: Boolean para indicar si la ruta requiere un perfil completo

### Componentes de UI

#### `<Navigation>` (components/Navigation.js)

Barra de navegación que muestra:
- Logo y enlaces de navegación
- Estado de autenticación del usuario
- Botones de inicio/cierre de sesión
- Enlaces relevantes según el estado de autenticación

#### `<Home>` (pages/Home.js)

Página principal que muestra:
- Mensaje de bienvenida
- Diferentes opciones según el estado de autenticación del usuario
- Botones para iniciar sesión, registrarse o ver el perfil

#### `<Welcome>` (pages/Welcome.js)

Página de bienvenida después de la autenticación:
- Mensaje personalizado con el nombre del usuario (si tiene perfil)
- Opciones para completar el perfil o ir al perfil existente
- Diseño atractivo que celebra el inicio de sesión exitoso

#### `<Login>` y `<Register>` (pages/Login.js, pages/Register.js)

Formularios para autenticación:
- Campos de entrada para email/contraseña
- Validación de formularios
- Botón para autenticación con Google
- Manejo de errores y estados de carga
- Redirección a la página de bienvenida después de autenticación exitosa

#### `<CompleteProfile>` (pages/CompleteProfile.js)

Formulario para completar el perfil del usuario:
- Pre-llena el email desde Firebase
- Campos para nombres, apellidos, teléfono y país
- Envía datos al backend para crear el perfil en MySQL
- Muestra mensajes de éxito/error
- Redirige al perfil después de completarlo

#### `<Profile>` (pages/Profile.js)

Página para gestionar el perfil:
- Muestra la información actual del perfil
- Permite editar la información
- Funcionalidad para guardar cambios
- Muestra fechas de creación y última actualización

## Flujo de Navegación Típico

1. **Usuario No Autenticado**:
   - Llega a la página principal (Home)
   - Navega a Login o Register
   - Se autentica con email/contraseña o Google
   - Es redirigido a Welcome

2. **Primer Inicio de Sesión**:
   - Desde Welcome ve que necesita completar su perfil
   - Navega a CompleteProfile (o es dirigido automáticamente)
   - Completa y envía el formulario
   - Es redirigido a Profile o Welcome

3. **Usuario Ya Registrado**:
   - Inicia sesión
   - Es redirigido a Welcome
   - Puede navegar libremente entre Home, Welcome y Profile

## Integración de Componentes con Servicios

### Integración con Firebase (services/firebase.js)

Los componentes de autenticación utilizan las siguientes funciones:
- `loginWithEmailAndPassword()`: Usado en Login.js
- `registerWithEmailAndPassword()`: Usado en Register.js
- `signInWithGoogle()`: Usado en Login.js y Register.js
- `logOut()`: Usado en Navigation.js

### Integración con API Backend (services/api.js)

Los componentes de perfil utilizan:
- `userApi.createUser()`: Usado en CompleteProfile.js
- `userApi.getUserProfile()`: Usado en AuthContext.js
- `userApi.updateUserProfile()`: Usado en Profile.js

## Personalización y Extensión

Para añadir nuevas páginas o componentes:

1. Crear el componente en `/pages` o `/components`
2. Añadir la ruta en `App.js`
3. Actualizar la navegación en `Navigation.js` si es necesario
4. Si requiere autenticación, protegerla con `<PrivateRoute>`

Para modificar el estilo:
- Utilizar las clases de Bootstrap
- Modificar `index.css` para estilos globales
- Usar estilos en línea para personalizaciones específicas