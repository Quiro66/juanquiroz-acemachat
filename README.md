
# acema - Chat en tiempo real - Juan Quiroz 

Nexo es una aplicación web de mensajería que permite a los usuarios registrarse, iniciar sesión y mantener conversaciones con otros usuarios en tiempo real.

El proyecto cuenta con una interfaz web, un servidor backend y una base de datos para almacenar usuarios, conversaciones y mensajes.

## Funcionalidades

- Registro e inicio de sesión de usuarios.
- Autenticación mediante tokens JWT.
- Consulta de usuarios disponibles.
- Creación de conversaciones.
- Envío y recepción de mensajes en tiempo real.
- Almacenamiento de mensajes en PostgreSQL.
- Actualización de conversaciones mediante Socket.IO.
- Indicadores de mensajes sin leer.
- Estado de conexión en tiempo real.

## Tecnologías utilizadas

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express
- TypeScript
- Socket.IO
- Prisma ORM
- PostgreSQL
- JWT

### Herramientas
- pnpm
- Docker
- Git

## Estructura del proyecto

```text
juanquiroz-chat/
├── apps/
│   ├── api/        # Servidor backend y API REST
│   └── web/        # Aplicación frontend
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Ejecución del proyecto

Para ejecutar el proyecto localmente se necesita tener instalado Node.js, pnpm y PostgreSQL.

Instalar dependencias:

```bash
pnpm install
```

Configurar las variables de entorno del backend y frontend utilizando los archivos `.env.example`.

Generar el cliente de Prisma:

```bash
pnpm --filter @acema/api db:generate
```

Ejecutar las migraciones de la base de datos:

```bash
pnpm --filter @acema/api db:migrate
```

Iniciar el backend:

```bash
pnpm --filter @acema/api dev
```

Iniciar el frontend en otra terminal:

```bash
pnpm --filter @acema/web dev
```

La aplicación estará disponible en:

http://localhost:3000

La API estará disponible en:

http://localhost:4000

## Base de datos

El proyecto utiliza PostgreSQL para almacenar la información.

Las migraciones de Prisma se encuentran en:

`apps/api/prisma/migrations`

Estas permiten crear la estructura de la base de datos al configurar el proyecto por primera vez.

## Documentación

Para consultar los pasos detallados de instalación y configuración, revisar el archivo:

`MANUAL-EJECUCION.md`
