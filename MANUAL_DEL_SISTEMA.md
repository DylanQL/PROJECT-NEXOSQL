# Manual del Sistema - NexoSQL

## Índice
1. [Procedimiento de Implementación Backend](#1-procedimiento-de-implementación-backend)
2. [Procedimiento de Implementación Frontend](#2-procedimiento-de-implementación-frontend)
3. [Configuración de Servicios Externos](#3-configuración-de-servicios-externos)
4. [Seguridad](#4-seguridad)
5. [Mantenimiento y Monitoreo](#5-mantenimiento-y-monitoreo)

---

## 1. Procedimiento de Implementación Backend

### 1.1 Requisitos Mínimos

**Software necesario:**
- Node.js v18 o superior
- npm v9 o superior
- MySQL 8.0 o superior
- Git v2.30 o superior

**Dependencias principales:**
- Express.js 4.18+
- Sequelize 6.33+
- Firebase Admin SDK 11.11+
- OpenAI API 5.20+
- PayPal Checkout Server SDK 1.0+

**Recursos AWS recomendados:**
- EC2: t3.medium o superior (2 vCPU, 4 GB RAM)
- RDS: db.t3.medium o superior (MySQL 8.0)
- VPC con subnets públicas y privadas
- Security Groups configurados
- IAM Roles con permisos necesarios

---

### 1.2 Implementación Local

#### Paso I: Clonar el repositorio

```bash
git clone https://github.com/DylanQL/PROJECT-NEXOSQL.git
cd PROJECT-NEXOSQL/backend
```

**URL del Repositorio:** `https://github.com/DylanQL/PROJECT-NEXOSQL`

#### Paso II: Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias especificadas en el archivo `package.json`:
- Express.js para el servidor HTTP
- Sequelize como ORM para MySQL
- Firebase Admin para autenticación
- OpenAI para funcionalidades de IA
- PayPal SDK para procesamiento de pagos
- Drivers de bases de datos (MySQL, PostgreSQL, MongoDB, MSSQL, Oracle)

#### Paso III: Configurar variables de entorno

Crear un archivo `.env` en la carpeta `backend/` con la siguiente estructura:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nexosql_db
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql

# Firebase Configuration
FIREBASE_PROJECT_ID=tu_proyecto_firebase
FIREBASE_PRIVATE_KEY="tu_clave_privada_firebase"
FIREBASE_CLIENT_EMAIL=tu_email_servicio_firebase

# OpenAI Configuration
OPENAI_API_KEY=tu_api_key_openai

# PayPal Configuration
PAYPAL_CLIENT_ID=tu_client_id_paypal
PAYPAL_CLIENT_SECRET=tu_client_secret_paypal
PAYPAL_MODE=sandbox

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Nota:** Reemplazar todos los valores de ejemplo con tus credenciales reales.

#### Paso IV: Configurar Firebase Admin SDK

1. Acceder a la consola de Firebase (https://console.firebase.google.com)
2. Seleccionar tu proyecto o crear uno nuevo
3. Ir a Configuración del proyecto > Cuentas de servicio
4. Generar nueva clave privada
5. Descargar el archivo JSON y guardar las credenciales en el archivo `.env`

#### Paso V: Configurar la base de datos MySQL

```bash
# Conectarse a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE nexosql_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crear usuario (opcional)
CREATE USER 'nexosql_user'@'localhost' IDENTIFIED BY 'tu_contraseña';
GRANT ALL PRIVILEGES ON nexosql_db.* TO 'nexosql_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Paso VI: Inicializar las tablas de la base de datos

Las tablas se crearán automáticamente al iniciar el servidor gracias a Sequelize. El sistema incluye los siguientes modelos:

- Users (Usuarios)
- ConexionDB (Conexiones a bases de datos)
- MotorDB (Motores de bases de datos soportados)
- Chat (Conversaciones)
- ChatMessage (Mensajes de chat)
- Subscription (Suscripciones)
- SupportTicket (Tickets de soporte)
- AdminUser (Usuarios administradores)

#### Paso VII: Iniciar el servidor

**Modo desarrollo (con auto-recarga):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3001`

#### Paso VIII: Verificar el funcionamiento

```bash
# Verificar que el servidor responde
curl http://localhost:3001/api/health

# Deberías recibir una respuesta indicando que el servidor está funcionando
```

---

### 1.3 Implementación en AWS

#### Paso 1: Crear la VPC

1. Acceder a la consola de AWS > VPC > Create VPC
2. Seleccionar "VPC and more" para configuración completa
3. Configurar los siguientes parámetros:

```
Name tag: nexosql-vpc
IPv4 CIDR block: 10.0.0.0/16
Number of Availability Zones: 2
Number of public subnets: 2
Number of private subnets: 2
NAT gateways: 1 per AZ
VPC endpoints: S3 Gateway
```

4. Hacer clic en "Create VPC"

**Resultado esperado:**
- VPC: 10.0.0.0/16
- Public Subnets: 10.0.1.0/24, 10.0.2.0/24
- Private Subnets: 10.0.11.0/24, 10.0.12.0/24
- Internet Gateway
- NAT Gateways en cada AZ
- Route Tables configuradas

#### Paso 2: Configurar Security Groups

**Security Group para EC2 (Backend):**

1. Ir a VPC > Security Groups > Create security group
2. Configurar:

```
Name: nexosql-backend-sg
Description: Security group for NexoSQL backend EC2 instances
VPC: nexosql-vpc

Inbound Rules:
- Type: SSH, Port: 22, Source: My IP (tu IP)
- Type: Custom TCP, Port: 3001, Source: nexosql-alb-sg (Application Load Balancer)
- Type: Custom TCP, Port: 3001, Source: 0.0.0.0/0 (solo para testing)

Outbound Rules:
- Type: All traffic, Destination: 0.0.0.0/0
```

**Security Group para RDS (Base de datos):**

```
Name: nexosql-rds-sg
Description: Security group for NexoSQL MySQL RDS
VPC: nexosql-vpc

Inbound Rules:
- Type: MySQL/Aurora, Port: 3306, Source: nexosql-backend-sg

Outbound Rules:
- Type: All traffic, Destination: 0.0.0.0/0
```

**Security Group para Application Load Balancer:**

```
Name: nexosql-alb-sg
Description: Security group for Application Load Balancer
VPC: nexosql-vpc

Inbound Rules:
- Type: HTTP, Port: 80, Source: 0.0.0.0/0
- Type: HTTPS, Port: 443, Source: 0.0.0.0/0

Outbound Rules:
- Type: All traffic, Destination: 0.0.0.0/0
```

#### Paso 3: Crear la base de datos RDS (MySQL)

1. Ir a AWS RDS > Create database
2. Configurar los siguientes parámetros:

```
Database creation method: Standard create
Engine type: MySQL
Engine version: MySQL 8.0.35 (o la más reciente)
Templates: Production (o Dev/Test para desarrollo)

DB instance identifier: nexosql-db
Master username: admin
Master password: [crear contraseña segura]

DB instance class: db.t3.medium (2 vCPU, 4 GB RAM)
Storage type: General Purpose SSD (gp3)
Allocated storage: 20 GB
Storage autoscaling: Enable (máximo 100 GB)

VPC: nexosql-vpc
Subnet group: Create new (seleccionar private subnets)
Public access: No
VPC security groups: nexosql-rds-sg
Availability Zone: No preference

Database authentication: Password authentication
Initial database name: nexosql_db

Backup retention period: 7 days
Enable encryption: Yes
Enhanced monitoring: Enable
```

3. Hacer clic en "Create database"
4. Esperar 5-10 minutos hasta que el estado sea "Available"
5. Anotar el endpoint de conexión (ejemplo: `nexosql-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`)

#### Paso 4: Crear instancia EC2 para el Backend

1. Ir a EC2 > Launch Instance
2. Configurar:

```
Name: nexosql-backend-01
AMI: Amazon Linux 2023 AMI (o Ubuntu Server 22.04 LTS)
Instance type: t3.medium
Key pair: Crear o seleccionar un par de claves existente

Network settings:
- VPC: nexosql-vpc
- Subnet: Public subnet 1
- Auto-assign public IP: Enable
- Security group: nexosql-backend-sg

Storage: 20 GB gp3

Advanced details:
- IAM instance profile: (crear un rol con permisos para CloudWatch, Systems Manager)
```

3. Hacer clic en "Launch instance"

#### Paso 5: Configurar la instancia EC2

1. Conectarse a la instancia via SSH:

```bash
ssh -i "tu-keypair.pem" ec2-user@[IP-PUBLICA-DE-TU-INSTANCIA]
```

2. Actualizar el sistema:

```bash
sudo yum update -y  # Para Amazon Linux
# O para Ubuntu:
# sudo apt update && sudo apt upgrade -y
```

3. Instalar Node.js:

```bash
# Instalar nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Instalar Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Verificar instalación
node --version
npm --version
```

4. Instalar Git:

```bash
sudo yum install git -y  # Amazon Linux
# O para Ubuntu:
# sudo apt install git -y
```

5. Instalar PM2 (Process Manager para Node.js):

```bash
npm install -g pm2
```

6. Clonar el repositorio:

```bash
cd /home/ec2-user
git clone https://github.com/DylanQL/PROJECT-NEXOSQL.git
cd PROJECT-NEXOSQL/backend
```

7. Instalar dependencias:

```bash
npm install --production
```

8. Crear archivo de variables de entorno:

```bash
nano .env
```

Contenido del archivo `.env` para producción:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration (usar endpoint de RDS)
DB_HOST=nexosql-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=nexosql_db
DB_USER=admin
DB_PASSWORD=tu_contraseña_rds

# Firebase Configuration
FIREBASE_PROJECT_ID=tu_proyecto_firebase
FIREBASE_PRIVATE_KEY="tu_clave_privada"
FIREBASE_CLIENT_EMAIL=tu_email@proyecto.iam.gserviceaccount.com

# OpenAI Configuration
OPENAI_API_KEY=tu_api_key_openai

# PayPal Configuration
PAYPAL_CLIENT_ID=tu_client_id_production
PAYPAL_CLIENT_SECRET=tu_client_secret_production
PAYPAL_MODE=live

# CORS Configuration
FRONTEND_URL=https://tu-dominio.com
```

9. Iniciar la aplicación con PM2:

```bash
pm2 start src/index.js --name nexosql-backend
pm2 save
pm2 startup
```

10. Verificar que el servidor está corriendo:

```bash
pm2 status
pm2 logs nexosql-backend
```

#### Paso 6: Configurar Application Load Balancer (ALB)

1. Ir a EC2 > Load Balancers > Create Load Balancer
2. Seleccionar "Application Load Balancer"
3. Configurar:

```
Name: nexosql-alb
Scheme: Internet-facing
IP address type: IPv4

Network mapping:
- VPC: nexosql-vpc
- Mappings: Seleccionar las 2 zonas de disponibilidad con public subnets

Security groups: nexosql-alb-sg

Listeners:
- Protocol: HTTP, Port: 80
- Protocol: HTTPS, Port: 443 (configurar certificado SSL)
```

4. Crear Target Group:

```
Name: nexosql-backend-tg
Target type: Instances
Protocol: HTTP
Port: 3001
VPC: nexosql-vpc

Health check:
- Protocol: HTTP
- Path: /api/health
- Interval: 30 seconds
- Timeout: 5 seconds
- Healthy threshold: 2
- Unhealthy threshold: 3
```

5. Registrar la instancia EC2 en el Target Group
6. Completar la creación del Load Balancer

#### Paso 7: Configurar Route 53 (DNS)

1. Ir a Route 53 > Hosted zones
2. Seleccionar tu dominio o crear uno nuevo
3. Crear un registro tipo A:

```
Record name: api.tu-dominio.com (o subdominio deseado)
Record type: A
Alias: Yes
Route traffic to: Application Load Balancer
Region: tu-region
Load Balancer: nexosql-alb
Routing policy: Simple routing
```

4. Guardar los cambios

#### Paso 8: Configurar SSL/TLS con AWS Certificate Manager

1. Ir a AWS Certificate Manager > Request certificate
2. Seleccionar "Request a public certificate"
3. Configurar:

```
Domain names:
- api.tu-dominio.com
- *.tu-dominio.com (opcional, para wildcards)

Validation method: DNS validation
```

4. Seguir las instrucciones para validar el dominio en Route 53
5. Una vez validado, asociar el certificado al ALB:
   - Ir al ALB > Listeners
   - Editar el listener HTTPS
   - Seleccionar el certificado de ACM

#### Paso 9: Configurar Auto Scaling (Opcional pero recomendado)

1. Crear una AMI de la instancia configurada:
   - EC2 > Instances > Seleccionar instancia > Actions > Image and templates > Create image

2. Crear Launch Template:

```
Name: nexosql-backend-template
AMI: Seleccionar la AMI creada
Instance type: t3.medium
Key pair: tu-keypair
Security groups: nexosql-backend-sg
```

3. Crear Auto Scaling Group:

```
Name: nexosql-backend-asg
Launch template: nexosql-backend-template
VPC: nexosql-vpc
Subnets: Public subnets
Load balancing: Attach to existing load balancer (nexosql-backend-tg)

Group size:
- Desired capacity: 2
- Minimum capacity: 1
- Maximum capacity: 4

Scaling policies:
- Target tracking: Average CPU utilization 70%
```

#### Paso 10: Configurar CloudWatch para monitoreo

1. Ir a CloudWatch > Dashboards > Create dashboard
2. Nombre: "NexoSQL-Monitoring"
3. Agregar widgets para:
   - CPU Utilization (EC2)
   - Network In/Out (EC2)
   - Database Connections (RDS)
   - Request Count (ALB)
   - Target Response Time (ALB)

4. Configurar alarmas:

```
Alarma 1: High CPU
- Metric: EC2 CPU Utilization
- Threshold: > 80% durante 5 minutos
- Action: SNS notification

Alarma 2: Database Connections
- Metric: RDS DatabaseConnections
- Threshold: > 80 conexiones
- Action: SNS notification

Alarma 3: ALB 5XX Errors
- Metric: ALB HTTPCode_Target_5XX_Count
- Threshold: > 10 en 1 minuto
- Action: SNS notification
```

#### Paso 11: Configurar backups automáticos

**Para RDS:**
- Ya configurado en el paso 3 (Backup retention: 7 días)
- Verificar en RDS > Automated backups

**Para el código (opcional):**
- Configurar AWS CodePipeline para CI/CD
- O usar scripts de backup con AWS Systems Manager

#### Paso 12: Implementar logging con CloudWatch Logs

1. Instalar el agente de CloudWatch en EC2:

```bash
# Descargar e instalar el agente
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configurar el agente
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

2. Configurar PM2 para enviar logs a CloudWatch:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 2. Procedimiento de Implementación Frontend

### 2.1 Requisitos Mínimos

**Software necesario:**
- Node.js v18 o superior
- npm v9 o superior
- Git v2.30 o superior

**Dependencias principales:**
- React.js 18.2+
- React Router DOM 6.15+
- React Bootstrap 2.8+
- Axios 1.5+
- Firebase SDK 10.3+
- PayPal React SDK 8.9+

**Recursos AWS recomendados para hosting:**
- S3 Bucket para archivos estáticos
- CloudFront para CDN
- Route 53 para DNS
- Certificate Manager para SSL

---

### 2.2 Implementación Local

#### Paso I: Clonar el repositorio

```bash
git clone https://github.com/DylanQL/PROJECT-NEXOSQL.git
cd PROJECT-NEXOSQL/frontend
```

Si ya clonaste el repositorio para el backend, solo navega a la carpeta frontend:

```bash
cd PROJECT-NEXOSQL/frontend
```

#### Paso II: Instalar las dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- React y React DOM
- React Router para navegación
- React Bootstrap para componentes UI
- Axios para peticiones HTTP
- Firebase para autenticación
- PayPal React SDK para pagos

#### Paso III: Configurar variables de entorno

Crear un archivo `.env` en la carpeta `frontend/` con la siguiente estructura:

```env
# API Backend URL
REACT_APP_API_URL=http://localhost:3001

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=tu_api_key_firebase
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id

# PayPal Configuration
REACT_APP_PAYPAL_CLIENT_ID=tu_client_id_paypal
```

**Nota:** Obtener las credenciales de Firebase desde la consola de Firebase:
1. Firebase Console > Configuración del proyecto
2. Tus aplicaciones > Aplicación web
3. Copiar los valores de configuración

#### Paso IV: Configurar Firebase Authentication

1. Acceder a Firebase Console (https://console.firebase.google.com)
2. Seleccionar tu proyecto
3. Ir a Authentication > Sign-in method
4. Habilitar los siguientes proveedores:
   - Correo electrónico/contraseña
   - Google (opcional pero recomendado)

5. Configurar dominios autorizados:
   - localhost (ya autorizado por defecto)
   - tu-dominio.com (agregar para producción)

#### Paso V: Verificar la configuración del proxy

El archivo `package.json` debe incluir:

```json
"proxy": "http://localhost:3001"
```

Esto permite que las peticiones a `/api/*` se redirijan automáticamente al backend durante el desarrollo.

#### Paso VI: Iniciar el servidor de desarrollo

```bash
npm start
```

La aplicación se abrirá automáticamente en el navegador en: `http://localhost:3000`

**Hot reload:** Los cambios en el código se reflejarán automáticamente sin necesidad de reiniciar el servidor.

#### Paso VII: Verificar el funcionamiento

1. Abrir el navegador en `http://localhost:3000`
2. Verificar que la página de inicio carga correctamente
3. Probar el registro de un nuevo usuario
4. Probar el inicio de sesión
5. Verificar la navegación entre páginas

#### Paso VIII: Construir para producción (opcional en local)

```bash
npm run build
```

Esto creará una carpeta `build/` con los archivos optimizados para producción.

---

### 2.3 Implementación en AWS (S3 + CloudFront)

#### Paso I: Construir la aplicación para producción

1. Actualizar las variables de entorno para producción:

Crear archivo `.env.production`:

```env
# API Backend URL (usar el dominio real)
REACT_APP_API_URL=https://api.tu-dominio.com

# Firebase Configuration (mismas credenciales)
REACT_APP_FIREBASE_API_KEY=tu_api_key_firebase
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id

# PayPal Configuration (usar credenciales de producción)
REACT_APP_PAYPAL_CLIENT_ID=tu_client_id_production
```

2. Construir la aplicación:

```bash
npm run build
```

#### Paso II: Crear un bucket de S3

1. Ir a AWS S3 > Create bucket
2. Configurar:

```
Bucket name: nexosql-frontend (debe ser único globalmente)
AWS Region: us-east-1 (o tu región preferida)

Object Ownership: ACLs disabled

Block Public Access settings:
- Desmarcar "Block all public access"
- Aceptar la advertencia

Bucket Versioning: Enable (recomendado)
Default encryption: Enable (SSE-S3)
```

3. Hacer clic en "Create bucket"

#### Paso III: Configurar el bucket para hosting estático

1. Seleccionar el bucket creado
2. Ir a Properties > Static website hosting
3. Configurar:

```
Static website hosting: Enable
Hosting type: Host a static website
Index document: index.html
Error document: index.html (importante para React Router)
```

4. Guardar los cambios
5. Anotar el endpoint del sitio web (ejemplo: `http://nexosql-frontend.s3-website-us-east-1.amazonaws.com`)

#### Paso IV: Configurar política del bucket

1. Ir a Permissions > Bucket policy
2. Agregar la siguiente política:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::nexosql-frontend/*"
        }
    ]
}
```

**Nota:** Reemplazar `nexosql-frontend` con el nombre de tu bucket.

3. Guardar los cambios

#### Paso V: Subir los archivos al bucket

**Opción A: Usando la consola de AWS**

1. Ir a Objects > Upload
2. Arrastrar todos los archivos de la carpeta `build/`
3. Hacer clic en "Upload"

**Opción B: Usando AWS CLI (recomendado)**

1. Instalar AWS CLI:

```bash
# En Linux/Mac
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verificar instalación
aws --version
```

2. Configurar credenciales:

```bash
aws configure
# Ingresar:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (ej: us-east-1)
# - Default output format (json)
```

3. Sincronizar archivos:

```bash
cd PROJECT-NEXOSQL/frontend
aws s3 sync build/ s3://nexosql-frontend --delete
```

El flag `--delete` elimina archivos del bucket que ya no existen localmente.

#### Paso VI: Crear distribución de CloudFront

1. Ir a CloudFront > Create distribution
2. Configurar:

```
Origin domain: nexosql-frontend.s3.us-east-1.amazonaws.com
Origin path: (dejar vacío)
Name: nexosql-frontend-origin

Origin access: Origin access control settings (recommended)
- Create control setting
  - Name: nexosql-oac
  - Sign requests: Yes

Viewer protocol policy: Redirect HTTP to HTTPS
Allowed HTTP methods: GET, HEAD, OPTIONS

Cache key and origin requests:
- Cache policy: CachingOptimized
- Origin request policy: CORS-S3Origin

Alternate domain names (CNAMEs): www.tu-dominio.com, tu-dominio.com
Custom SSL certificate: Seleccionar certificado de ACM

Default root object: index.html
```

3. Hacer clic en "Create distribution"

4. Copiar la política de bucket S3 que CloudFront sugiere y actualizar la política del bucket

#### Paso VII: Configurar páginas de error personalizadas

1. En la distribución de CloudFront creada, ir a Error pages
2. Crear error response personalizada:

```
HTTP error code: 403
Response page path: /index.html
HTTP response code: 200

HTTP error code: 404
Response page path: /index.html
HTTP response code: 200
```

Esto es necesario para que React Router funcione correctamente con URLs directas.

#### Paso VIII: Solicitar certificado SSL en AWS Certificate Manager

1. Ir a AWS Certificate Manager (en región us-east-1 para CloudFront)
2. Request certificate > Request a public certificate
3. Configurar:

```
Domain names:
- tu-dominio.com
- www.tu-dominio.com
- *.tu-dominio.com (opcional)

Validation method: DNS validation
```

4. Seguir el proceso de validación agregando registros CNAME en Route 53
5. Una vez validado, asociar el certificado a la distribución de CloudFront

#### Paso IX: Configurar Route 53 para el dominio

1. Ir a Route 53 > Hosted zones
2. Seleccionar tu dominio
3. Create record:

```
Record name: (dejar vacío para root domain)
Record type: A
Alias: Yes
Route traffic to: CloudFront distribution
Distribution: Seleccionar tu distribución
Routing policy: Simple routing
```

4. Crear otro registro para www:

```
Record name: www
Record type: A
Alias: Yes
Route traffic to: CloudFront distribution
Distribution: Seleccionar tu distribución
Routing policy: Simple routing
```

#### Paso X: Verificar el despliegue

1. Esperar 10-15 minutos para que CloudFront distribuya el contenido
2. Acceder a tu dominio: `https://tu-dominio.com`
3. Verificar que el sitio carga con HTTPS
4. Probar la navegación y funcionalidades
5. Verificar en diferentes navegadores y dispositivos

#### Paso XI: Configurar despliegue continuo (opcional)

**Opción A: Script de despliegue manual**

Crear archivo `deploy.sh` en la raíz de frontend:

```bash
#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Sync with S3
echo "Uploading to S3..."
aws s3 sync build/ s3://nexosql-frontend --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUTION_ID --paths "/*"

echo "Deployment complete!"
```

Hacer el script ejecutable:

```bash
chmod +x deploy.sh
```

Ejecutar el despliegue:

```bash
./deploy.sh
```

**Opción B: GitHub Actions (CI/CD)**

Crear archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
        
    - name: Build
      run: |
        cd frontend
        npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
        REACT_APP_FIREBASE_API_KEY: ${{ secrets.REACT_APP_FIREBASE_API_KEY }}
        REACT_APP_FIREBASE_AUTH_DOMAIN: ${{ secrets.REACT_APP_FIREBASE_AUTH_DOMAIN }}
        REACT_APP_FIREBASE_PROJECT_ID: ${{ secrets.REACT_APP_FIREBASE_PROJECT_ID }}
        REACT_APP_FIREBASE_STORAGE_BUCKET: ${{ secrets.REACT_APP_FIREBASE_STORAGE_BUCKET }}
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.REACT_APP_FIREBASE_MESSAGING_SENDER_ID }}
        REACT_APP_FIREBASE_APP_ID: ${{ secrets.REACT_APP_FIREBASE_APP_ID }}
        REACT_APP_PAYPAL_CLIENT_ID: ${{ secrets.REACT_APP_PAYPAL_CLIENT_ID }}
        
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
        
    - name: Deploy to S3
      run: |
        cd frontend
        aws s3 sync build/ s3://nexosql-frontend --delete
        
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

Configurar los secrets en GitHub:
- Repository > Settings > Secrets and variables > Actions
- Agregar todos los secrets necesarios

---

## 3. Configuración de Servicios Externos

### 3.1 Firebase

**Configuración de Authentication:**

1. Acceder a Firebase Console: https://console.firebase.google.com
2. Crear proyecto nuevo o seleccionar existente
3. Authentication > Sign-in method:
   - Email/Password: Habilitar
   - Google: Habilitar y configurar

**Configuración de dominio:**

4. Authentication > Settings > Authorized domains
5. Agregar:
   - localhost (ya incluido)
   - tu-dominio.com
   - www.tu-dominio.com

**Configuración de Service Account (Backend):**

6. Project Settings > Service accounts
7. Generate new private key
8. Descargar archivo JSON
9. Extraer valores para `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 3.2 OpenAI API

1. Crear cuenta en: https://platform.openai.com
2. Ir a API keys: https://platform.openai.com/api-keys
3. Create new secret key
4. Copiar la clave y guardarla en `.env`:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   ```

**Configuración de límites:**

5. Organization settings > Limits
6. Configurar:
   - Usage limits: Establecer límite mensual
   - Rate limits: Configurar según plan

### 3.3 PayPal

**Crear aplicación en PayPal:**

1. Acceder a PayPal Developer: https://developer.paypal.com
2. Dashboard > My Apps & Credentials
3. Create App:
   - App Name: NexoSQL
   - App Type: Merchant

**Obtener credenciales Sandbox (desarrollo):**

4. Seleccionar la app creada
5. Copiar:
   - Client ID (Sandbox)
   - Secret (Sandbox)
6. Guardar en `.env`:
   ```
   PAYPAL_CLIENT_ID=tu_client_id_sandbox
   PAYPAL_CLIENT_SECRET=tu_secret_sandbox
   PAYPAL_MODE=sandbox
   ```

**Obtener credenciales Live (producción):**

7. Switch to Live en la misma página
8. Copiar:
   - Client ID (Live)
   - Secret (Live)
9. Para producción, actualizar `.env`:
   ```
   PAYPAL_CLIENT_ID=tu_client_id_live
   PAYPAL_CLIENT_SECRET=tu_secret_live
   PAYPAL_MODE=live
   ```

**Configurar Webhooks (opcional):**

10. Developer Dashboard > Webhooks
11. Add Webhook:
    - URL: https://api.tu-dominio.com/api/webhooks/paypal
    - Events: Seleccionar eventos de pago

---

## 4. Seguridad

### 4.1 Seguridad en el Backend

**Variables de entorno:**
- ✅ Nunca commitear archivos `.env` al repositorio
- ✅ Usar `.env.example` como plantilla sin valores sensibles
- ✅ En AWS EC2, almacenar secrets en AWS Secrets Manager o AWS Systems Manager Parameter Store

**Autenticación y autorización:**
- ✅ Implementado Firebase Authentication para verificar usuarios
- ✅ Middleware de autenticación en todas las rutas protegidas
- ✅ Validación de tokens JWT en cada petición

**Base de datos:**
- ✅ RDS en subnet privada (no accesible desde internet)
- ✅ Conexiones encriptadas (SSL/TLS)
- ✅ Credenciales rotadas periódicamente
- ✅ Backups automáticos habilitados
- ✅ Principle of least privilege para usuarios de DB

**API Security:**
- ✅ CORS configurado solo para dominios autorizados
- ✅ Rate limiting implementado para prevenir abuso
- ✅ Validación de entrada en todos los endpoints
- ✅ Sanitización de queries SQL (prevención de SQL injection)
- ✅ Headers de seguridad configurados (Helmet.js recomendado)

**Recomendaciones adicionales:**

```javascript
// Instalar helmet para headers de seguridad
npm install helmet

// En app.js
const helmet = require('helmet');
app.use(helmet());

// Implementar rate limiting
npm install express-rate-limit

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones
});
app.use('/api/', limiter);
```

### 4.2 Seguridad en el Frontend

**Variables de entorno:**
- ✅ Nunca incluir API keys secretas en el frontend
- ✅ Solo usar credenciales públicas (Firebase config, PayPal Client ID)
- ✅ Variables de entorno se compilan en el bundle (no son secretas)

**Autenticación:**
- ✅ Tokens almacenados de forma segura por Firebase SDK
- ✅ Auto-refresh de tokens implementado
- ✅ Logout completo al cerrar sesión

**Comunicación:**
- ✅ HTTPS obligatorio en producción
- ✅ Validación de certificados SSL
- ✅ SameSite cookies para protección CSRF

**Recomendaciones adicionales:**
- ✅ Implementar Content Security Policy (CSP)
- ✅ Sanitizar inputs del usuario
- ✅ Validación de datos en cliente y servidor
- ✅ No exponer información sensible en logs del navegador

### 4.3 Seguridad en AWS

**IAM (Identity and Access Management):**

1. Crear roles específicos con permisos mínimos:

```json
// Rol para EC2 (backend)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:nexosql/*"
    }
  ]
}
```

2. Habilitar MFA para usuarios con acceso a la consola
3. Rotar access keys regularmente
4. Usar AWS Organizations para gestión multi-cuenta

**Security Groups:**
- ✅ Principio de least privilege
- ✅ Solo permitir tráfico necesario
- ✅ Usar CIDR blocks específicos en lugar de 0.0.0.0/0 cuando sea posible
- ✅ Documentar cada regla de seguridad

**Encryption:**
- ✅ EBS volumes encriptados
- ✅ RDS encryption at rest habilitado
- ✅ S3 buckets con encryption
- ✅ SSL/TLS para datos en tránsito
- ✅ Certificados gestionados por ACM

**Monitoring y Auditoría:**
- ✅ CloudTrail habilitado para auditoría de API calls
- ✅ GuardDuty para detección de amenazas
- ✅ Config para compliance monitoring
- ✅ VPC Flow Logs para análisis de tráfico

**Backup y Disaster Recovery:**
- ✅ RDS automated backups (7 días)
- ✅ Snapshots manuales antes de cambios importantes
- ✅ Backup cross-region para datos críticos
- ✅ Plan de recuperación documentado

### 4.4 Checklist de Seguridad Pre-Producción

Antes de lanzar a producción, verificar:

- [ ] Todas las credenciales de desarrollo reemplazadas por producción
- [ ] Archivos `.env` no commiteados al repositorio
- [ ] HTTPS configurado y funcionando
- [ ] Certificados SSL válidos y renovación automática
- [ ] CORS configurado solo para dominios autorizados
- [ ] Rate limiting implementado
- [ ] Logs de errores no exponen información sensible
- [ ] Base de datos en subnet privada
- [ ] Backups automáticos configurados y probados
- [ ] Monitoreo y alertas configuradas
- [ ] Security groups revisados (least privilege)
- [ ] IAM roles con permisos mínimos necesarios
- [ ] Secretos almacenados en AWS Secrets Manager
- [ ] CloudTrail habilitado
- [ ] Plan de respuesta a incidentes documentado

---

## 5. Mantenimiento y Monitoreo

### 5.1 Monitoreo de Aplicación

**CloudWatch Metrics:**

Métricas clave a monitorear:

1. **Backend (EC2):**
   - CPU Utilization
   - Memory Usage
   - Disk I/O
   - Network In/Out
   - Status Check Failed

2. **Base de datos (RDS):**
   - CPU Utilization
   - Database Connections
   - Free Storage Space
   - Read/Write IOPS
   - Read/Write Latency

3. **Load Balancer (ALB):**
   - Request Count
   - Target Response Time
   - HTTP 2xx/4xx/5xx Counts
   - Healthy/Unhealthy Host Count

4. **CloudFront:**
   - Requests
   - Bytes Downloaded/Uploaded
   - Error Rate
   - Cache Hit Rate

**Configurar alarmas críticas:**

```bash
# Ejemplo: Crear alarma para CPU alta
aws cloudwatch put-metric-alarm \
  --alarm-name nexosql-high-cpu \
  --alarm-description "Alertar cuando CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### 5.2 Logs

**Configuración de logs centralizados:**

1. CloudWatch Logs Groups:
   - `/aws/ec2/nexosql-backend/application`
   - `/aws/ec2/nexosql-backend/access`
   - `/aws/rds/nexosql-db/error`
   - `/aws/rds/nexosql-db/slowquery`

2. Retención de logs: 30 días (producción), 7 días (desarrollo)

3. Configurar filtros de métricas para detectar patrones:
   - Errores 500
   - Queries lentas
   - Fallos de autenticación

### 5.3 Mantenimiento Regular

**Diario:**
- [ ] Revisar dashboard de CloudWatch
- [ ] Verificar alarmas activas
- [ ] Revisar logs de errores

**Semanal:**
- [ ] Revisar métricas de rendimiento
- [ ] Verificar espacio en disco
- [ ] Revisar conexiones de base de datos
- [ ] Verificar backups exitosos

**Mensual:**
- [ ] Actualizar dependencias de seguridad (npm audit fix)
- [ ] Revisar y optimizar queries lentas
- [ ] Revisar costos de AWS
- [ ] Limpiar logs antiguos
- [ ] Revisar y actualizar documentación

**Trimestral:**
- [ ] Actualizar versiones de Node.js (si aplica)
- [ ] Revisar y actualizar políticas de seguridad
- [ ] Realizar drill de disaster recovery
- [ ] Revisar y optimizar arquitectura
- [ ] Auditoría de seguridad completa

### 5.4 Procedimiento de Actualización

**Actualización del Backend:**

1. Probar cambios en local:
   ```bash
   npm test
   npm run dev
   ```

2. Crear backup de la base de datos:
   ```bash
   # En RDS, crear snapshot manual
   aws rds create-db-snapshot \
     --db-instance-identifier nexosql-db \
     --db-snapshot-identifier nexosql-db-pre-update-$(date +%Y%m%d)
   ```

3. Conectarse a la instancia EC2:
   ```bash
   ssh -i "keypair.pem" ec2-user@tu-instancia
   ```

4. Actualizar código:
   ```bash
   cd PROJECT-NEXOSQL/backend
   git pull origin main
   npm install
   ```

5. Reiniciar aplicación:
   ```bash
   pm2 restart nexosql-backend
   pm2 logs nexosql-backend --lines 50
   ```

6. Verificar funcionamiento:
   ```bash
   curl https://api.tu-dominio.com/api/health
   ```

**Actualización del Frontend:**

1. Construir nueva versión:
   ```bash
   cd PROJECT-NEXOSQL/frontend
   npm run build
   ```

2. Subir a S3:
   ```bash
   aws s3 sync build/ s3://nexosql-frontend --delete
   ```

3. Invalidar caché de CloudFront:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id TU_DISTRIBUTION_ID \
     --paths "/*"
   ```

4. Verificar en navegador (esperar 5-10 minutos)

### 5.5 Troubleshooting Común

**Problema: Backend no responde**

1. Verificar estado de EC2:
   ```bash
   aws ec2 describe-instance-status --instance-ids i-xxxxxxxxx
   ```

2. Verificar logs de PM2:
   ```bash
   pm2 logs nexosql-backend --lines 100
   ```

3. Verificar conectividad a RDS:
   ```bash
   telnet nexosql-db.xxxxx.us-east-1.rds.amazonaws.com 3306
   ```

4. Reiniciar aplicación:
   ```bash
   pm2 restart nexosql-backend
   ```

**Problema: Errores de base de datos**

1. Verificar estado de RDS:
   ```bash
   aws rds describe-db-instances --db-instance-identifier nexosql-db
   ```

2. Revisar logs de RDS en CloudWatch Logs

3. Verificar conexiones activas:
   ```sql
   SHOW PROCESSLIST;
   ```

**Problema: Frontend no carga**

1. Verificar CloudFront:
   ```bash
   aws cloudfront get-distribution --id TU_DISTRIBUTION_ID
   ```

2. Verificar contenido en S3:
   ```bash
   aws s3 ls s3://nexosql-frontend/
   ```

3. Verificar DNS:
   ```bash
   nslookup tu-dominio.com
   ```

### 5.6 Contactos de Soporte

**Servicios de AWS:**
- AWS Support Center: https://console.aws.amazon.com/support
- Plan de soporte recomendado: Business o superior

**Servicios externos:**
- Firebase Support: https://firebase.google.com/support
- OpenAI Support: https://help.openai.com
- PayPal Technical Support: https://developer.paypal.com/support

**Equipo de desarrollo:**
- GitHub Repository: https://github.com/DylanQL/PROJECT-NEXOSQL
- Issues: https://github.com/DylanQL/PROJECT-NEXOSQL/issues

---

## Anexos

### A. Costos Estimados AWS

**Estimación mensual (producción):**

| Servicio | Configuración | Costo estimado (USD) |
|----------|--------------|---------------------|
| EC2 | 2 x t3.medium | $60 |
| RDS MySQL | db.t3.medium | $80 |
| ALB | Standard | $25 |
| CloudFront | 1TB transferencia | $85 |
| S3 | 10GB storage + requests | $5 |
| Route 53 | 1 hosted zone | $0.50 |
| Data Transfer | Outbound | $50 |
| **Total estimado** | | **~$305/mes** |

**Nota:** Costos varían según uso real. Usar AWS Cost Calculator para estimaciones precisas.

### B. Comandos Útiles

```bash
# Backend - PM2
pm2 list                    # Listar procesos
pm2 logs nexosql-backend    # Ver logs en tiempo real
pm2 restart nexosql-backend # Reiniciar aplicación
pm2 stop nexosql-backend    # Detener aplicación
pm2 monit                   # Monitor de recursos

# Base de datos
mysql -h endpoint -u admin -p  # Conectar a RDS
SHOW DATABASES;                # Listar bases de datos
USE nexosql_db;               # Seleccionar base de datos
SHOW TABLES;                  # Listar tablas

# AWS CLI
aws s3 sync                   # Sincronizar archivos con S3
aws ec2 describe-instances    # Listar instancias EC2
aws rds describe-db-instances # Listar instancias RDS
aws cloudfront create-invalidation # Invalidar caché CloudFront

# Git
git pull origin main          # Actualizar código
git status                    # Ver estado de cambios
git log --oneline -10        # Ver últimos 10 commits
```

### C. Recursos Adicionales

**Documentación oficial:**
- [AWS Documentation](https://docs.aws.amazon.com)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev)
- [Sequelize Docs](https://sequelize.org/docs/v6/)
- [Firebase Docs](https://firebase.google.com/docs)

**Tutoriales recomendados:**
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev/learn/thinking-in-react)

---

**Documento creado:** Octubre 2025  
**Versión:** 1.0  
**Última actualización:** 12 de octubre de 2025
