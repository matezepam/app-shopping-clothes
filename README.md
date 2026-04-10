# Eagle (React + TS + Tailwind v3 + Express + Postgres + Docker)

Tienda moderna para turistas: categorías (hombre / mujer / recuerdos), conceptos (Galápagos, Quito, Otavalo…), **historia por producto** (i18n), **carrito**, **registro / login**, **historial de pedidos**, **devoluciones**, panel **admin con estadísticas** (top productos, ingresos, gráfico simple, cola de devoluciones).

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, TypeScript, Vite 8, **Tailwind CSS v3**, react-router-dom, i18next |
| Backend | Node.js, **Express 5**, TypeScript, **PostgreSQL** (`pg`), JWT, bcryptjs, Zod |
| Contenedores | Docker Compose (Postgres + API) |
| Deploy UI | **Vercel** (carpeta `frontend`, `vercel.json` SPA) |

**Strapi** y **Stripe** no están cableados aún: el backend ya permite órdenes reales en Postgres; puedes añadir Strapi como CMS de contenidos y Stripe Checkout sustituyendo el checkout demo (ver sección Roadmap).

## Requisitos

- Node 22+ (recomendado)
- Docker Desktop (para Postgres + API)

## Imágenes (plantillas)

Coloca tus fotos en `frontend/public/templates/` con los mismos nombres que en `frontend/src/data/products.ts` (o actualiza las rutas). Hay un placeholder SVG en error de carga en tarjetas.

## Desarrollo local

### 1) Base de datos + API (Docker)

```bash
docker compose up --build
```

- Postgres: `localhost:5432` (usuario `eagle`, contraseña `eagle`, BD `eagle_shop`)
- API: `http://localhost:4000` (health: `GET /health`)

El script `backend/db/init.sql` crea tablas, productos de ejemplo y un **admin**:

- **Email:** `admin@eagle.store`
- **Password:** `Admin123!`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite hace **proxy** de `/api` → `http://localhost:4000` (`vite.config.ts`). No necesitas `.env` en local.

### 3) Build

```bash
cd frontend && npm run build
cd ../backend && npm run build && npm start
```

## Vercel (solo frontend)

1. Proyecto en Vercel apuntando a `frontend/`.
2. Variable de entorno: `VITE_API_URL=https://tu-api-publica.com` (sin barra final).
3. Despliega el **backend** en otro servicio (Railway, Fly.io, Render, VPS) con `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (origen de Vercel).

## API (resumen)

| Método | Ruta | Notas |
|--------|------|--------|
| POST | `/api/auth/register` | Usuario `user` |
| POST | `/api/auth/login` | JWT |
| GET | `/api/auth/me` | Bearer token |
| GET | `/api/products` | Catálogo (sincronizado con seeds SQL) |
| GET | `/api/orders` | Historial del usuario |
| POST | `/api/orders` | Checkout (descuenta stock) |
| GET/POST | `/api/returns` | Lista / crear devolución |
| GET | `/api/admin/stats` | **Admin:** resumen, top productos, ingresos por día |
| GET | `/api/admin/returns` | **Admin:** todas las devoluciones |
| PATCH | `/api/admin/returns/:id` | **Admin:** `approved` / `rejected` / `refunded` + nota |

## Idiomas y moneda

- **Idiomas:** EN, ES, FR, DE (`src/i18n`).
- **Monedas:** USD, EUR, GBP con tipos de cambio **demo** en `src/lib/currency.ts` (sustituir por API real).

## Roadmap sugerido

1. **Stripe:** crear PaymentIntent o Checkout Session en el backend; marcar orden `paid` tras webhook.
2. **Strapi:** modelos `Product`, `Story`, `Concept`; el front consumiría la API de Strapi o sincronizaría a Postgres.
3. **Roles:** más granular (editor, soporte).
4. **Informes:** export CSV, filtros por fechas.

