# 🛒 Eagle Shop — Full Stack E-commerce

Sistema web integral de comercio electrónico moderno construido con arquitectura full stack escalable.

---

## 🚀 Stack tecnológico

| Capa | Tecnología |
|------|------------|
| 🎨 Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v3, react-router-dom, i18next |
| ⚙️ Backend | Node.js, Express 5, TypeScript, PostgreSQL (pg), JWT, bcryptjs, Zod |
| 🐳 Infraestructura | Docker Compose (Postgres + API) |
| 🌐 Deploy UI | Vercel (frontend SPA con vercel.json) |

---

## 📦 Estado del proyecto

- 🟢 Autenticación con JWT
- 🟢 Gestión de productos
- 🟢 Carrito y órdenes reales en PostgreSQL
- 🟢 Panel básico de admin
- 🟡 Stripe (pendiente integración)
- 🟡 Strapi CMS (opcional futuro)

---

## 🧰 Requisitos

- Node.js 22+
- Docker Desktop
- Git

---

## 🖼️ Imágenes del proyecto

Coloca tus imágenes en:

```
frontend/public/templates/
```

📌 Deben coincidir con los nombres definidos en:
```
frontend/src/data/products.ts
```

Si no existen, se mostrará un placeholder SVG automáticamente.

---

## 🧪 Desarrollo local

### 🐳 1. Levantar base de datos + API

```bash
docker compose up --build
```

📍 Servicios:

- 🗄️ PostgreSQL → `localhost:5432`
  - user: `eagle`
  - password: `eagle`
  - db: `eagle_shop`

- ⚡ API → `http://localhost:4000`
  - health check: `GET /health`

👤 Usuario admin por defecto:

- 📧 Email: `admin@eagle.store`
- 🔑 Password: `Admin123!`

---

### 💻 2. Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

📌 El proxy `/api` apunta automáticamente a:
```
http://localhost:4000
```

---

### 🏗️ 3. Build producción

```bash
cd frontend
npm run build

cd ../backend
npm run build
npm start
```

---

## 🌐 Deploy en Vercel (Frontend)

### 1. Configuración

- Root directory: `frontend/`
- Framework: Vite

### 2. Variables de entorno

```env
VITE_API_URL=https://tu-api-publica.com
```

⚠️ Sin barra final (`/`)

---

### 3. Backend en producción

Puedes desplegarlo en:

- 🚂 Railway
- 🪶 Fly.io
- ⚡ Render
- 🖥️ VPS

Variables necesarias:

```env
DATABASE_URL=
JWT_SECRET=
CORS_ORIGIN=https://tu-frontend.vercel.app
```

---

## 📡 API Overview

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login + JWT |
| GET | `/api/auth/me` | Perfil usuario |
| GET | `/api/products` | Catálogo |
| POST | `/api/orders` | Crear orden |
| GET | `/api/orders` | Historial de órdenes |
| GET | `/api/returns` | Devoluciones |
| POST | `/api/returns` | Crear devolución |
| GET | `/api/admin/stats` | Estadísticas admin |
| GET | `/api/admin/returns` | Gestión devoluciones |
| PATCH | `/api/admin/returns/:id` | Actualizar estado |

---

## 🌍 Internacionalización

Soporte multi-idioma:

- 🇺🇸 EN
- 🇪🇸 ES
- 🇫🇷 FR
- 🇩🇪 DE

📁 Configuración:
```
src/i18n
```

---

## 💱 Monedas

Soporte:

- USD
- EUR
- GBP

📌 Actualmente en modo demo:
```
src/lib/currency.ts
```

⚠️ Recomendado: integrar API real de conversión.

---

## 🧭 Roadmap

### 💳 Stripe
- Checkout Sessions
- Webhooks de pago
- Estado `paid` en órdenes

### 🧩 Strapi CMS
- Productos dinámicos
- Blog / contenido
- Sincronización con Postgres

### 🔐 Roles avanzados
- Admin
- Editor
- Soporte

---

## 🐳 Docker

```bash
docker compose up --build
```

Incluye:

- PostgreSQL
- Backend API

---

## 📌 Notas

- Frontend es SPA (React Router)
- Backend sigue arquitectura REST
- Preparado para escalar a microservicios
- Diseño modular y extensible

---

## ⭐ Autor

Paulo Salazar