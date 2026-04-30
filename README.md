# MenuQR Backend — DonPunto API

API REST multi-tenant para digitalizar menús de restaurantes con códigos QR.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 22 LTS |
| Framework | Express.js |
| ORM | Sequelize v6 |
| Base de datos | PostgreSQL 17 |
| Auth | JWT + bcryptjs |
| Documentación | Swagger (OpenAPI 3.0) |
| Contenedores | Docker + docker-compose |

---

## Setup local (sin Docker)

### 1. Prerrequisitos
- Node.js 22+
- PostgreSQL 17 corriendo en `localhost:5432`

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales reales
```

### 4. Crear base de datos
```sql
CREATE DATABASE menuqr_dev;
```

### 5. Ejecutar migraciones y seeders
```bash
npm run db:migrate   # Crea las tablas
npm run db:seed      # Carga roles, ciudades y super admin inicial
```

### 6. Arrancar el servidor
```bash
npm run dev          # nodemon — hot reload
```

La API estará disponible en: `http://localhost:3000`

---

## Setup con Docker (recomendado)

```bash
# Levantar app + PostgreSQL 17
docker compose up --build

# Primera vez — ejecutar seeders
docker compose exec app npm run db:migrate
docker compose exec app npm run db:seed
```

---

## URLs disponibles

| URL | Descripción |
|---|---|
| `GET /health` | Health check |
| `GET /api/docs` | Swagger UI interactiva |
| `GET /api/docs.json` | Spec OpenAPI (importar en Postman) |
| `POST /api/v1/auth/login` | Login — retorna JWT |
| `POST /api/v1/admin/tenants` | Crear cliente (solo super_admin) |
| `GET /api/v1/admin/tenants` | Listar todos los restaurantes |

---

## Autenticación

Todos los endpoints protegidos requieren un header `Authorization`:

```
Authorization: Bearer <token_jwt>
```

El token se obtiene en `POST /api/v1/auth/login`.

---

## Roles

| Rol | Descripción | tenant_id en JWT |
|---|---|---|
| `super_admin` | Equipo DonPunto — acceso global | `null` |
| `admin` | Dueño del restaurante | su `tenant_id` |
| `viewer` | Empleado solo lectura | su `tenant_id` |

---

## Credenciales de Super Admin (desarrollo)

```
Email:    superadmin@donpunto.com
Password: DonPunto2026!
```

> ⚠️ Cambiar en producción via variables de entorno `SUPER_ADMIN_EMAIL` y `SUPER_ADMIN_PASSWORD`.

---

## Variables de entorno

Ver `.env.example` para la lista completa documentada.

---

## Scripts

```bash
npm run dev              # Desarrollo con hot reload
npm run start            # Producción
npm run db:migrate       # Ejecutar migraciones
npm run db:migrate:undo  # Revertir todas las migraciones
npm run db:seed          # Ejecutar seeders
npm run db:reset         # Revertir + migrar + seedear
npm run test             # Jest
npm run test:coverage    # Jest con cobertura
```

---

## Estructura del proyecto

```
src/
├── config/         # DB, Swagger, Cloudinary
├── models/         # Modelos Sequelize (tableName singular)
├── middlewares/    # auth.js, requireRole.js, validate.js
├── controllers/    # Thin layer → delega a services
├── services/       # Lógica de negocio
├── routes/         # v1/ + public/
└── utils/          # QR generator, audit logger
migrations/         # Sequelize CLI migrations
seeders/            # Datos iniciales
tests/              # unit/ + integration/
```
