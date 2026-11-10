
# Manual de ejecución

## 1. Descripción

Aplicación web de chat en tiempo real que permite registrar usuarios, iniciar sesión, crear conversaciones y enviar mensajes entre usuarios.

El proyecto está dividido en dos aplicaciones:

- `apps/web`: interfaz web desarrollada con Next.js.
- `apps/api`: API REST y comunicación en tiempo real mediante Socket.IO.

La persistencia de información se realiza con PostgreSQL y Prisma ORM.

## 2. Requisitos

- Node.js 22 o superior.
- pnpm 10 o superior.
- PostgreSQL 16 o superior.
- Git.

También se puede utilizar Docker para ejecutar PostgreSQL.

## 3. Instalación

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
cd juanquiroz-chat
```

Instalar las dependencias:

```bash
pnpm install
```

## 4. Variables de entorno

### Backend

Crear el archivo `.env` a partir del ejemplo:

```bash
cp apps/api/.env.example apps/api/.env
```

Configurar las variables:

- `NODE_ENV`: entorno de ejecución.
- `PORT`: puerto de la API.
- `DATABASE_URL`: conexión a PostgreSQL.
- `JWT_SECRET`: clave privada para firmar los tokens.
- `JWT_EXPIRES_IN`: tiempo de expiración del token.
- `CLIENT_URL`: dirección del frontend.

### Frontend

Crear el archivo `.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Configurar las direcciones de la API y del servidor Socket.IO según el entorno.

## 5. Base de datos

Verificar que PostgreSQL esté iniciado y que la base de datos indicada en `DATABASE_URL` exista.

Generar el cliente de Prisma:

```bash
pnpm --filter @acema/api db:generate
```

Ejecutar las migraciones:

```bash
pnpm --filter @acema/api db:migrate
```

## 6. Ejecución en desarrollo

Iniciar el backend en una terminal:

```bash
pnpm --filter @acema/api dev
```

Iniciar el frontend en otra terminal:

```bash
pnpm --filter @acema/web dev
```

La aplicación web estará disponible en:

`http://localhost:3000`

La API estará disponible en:

`http://localhost:4000`

Para comprobar el estado de la API:

`http://localhost:4000/api/health`

## 7. Compilación

Compilar el backend:

```bash
pnpm --filter @acema/api build
```

Compilar el frontend:

```bash
pnpm --filter @acema/web build
```

## 8. Consideraciones

- Los archivos `.env` y `.env.local` contienen configuración privada y no deben subirse al repositorio.
- Los archivos `.env.example` sirven como referencia para configurar el proyecto.
- La base de datos debe estar disponible antes de iniciar el backend.
- Las migraciones deben ejecutarse antes de utilizar la aplicación por primera vez.
- Las migraciones de Prisma se encuentran en `apps/api/prisma/migrations`.
- Al ejecutar el comando de migración, Prisma utiliza estos archivos para crear
la estructura de tablas en la base de datos configurada.