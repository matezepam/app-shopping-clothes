# Sprint

Sprint is a full stack e-commerce platform designed as a professional, production-oriented retail experience. It combines a modern React storefront with a Kotlin/Spring Boot REST API, PostgreSQL persistence, Flyway database migrations, JWT authentication, product administration, user profiles, localization, and a scalable foundation for real payments, orders, returns, and analytics.

This project is built to demonstrate strong engineering practices for a real-world hiring portfolio: clean separation of concerns, typed frontend architecture, backend validation, database versioning, authentication, admin workflows, responsive UX, deployment readiness, and a clear path toward production payment processing.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Production Scope](#production-scope)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Available API](#available-api)
- [Payments Roadmap](#payments-roadmap)
- [Database and Migrations](#database-and-migrations)
- [Build and Verification](#build-and-verification)
- [Deployment](#deployment)
- [Production Checklist](#production-checklist)
- [Future Improvements](#future-improvements)
- [Author](#author)

## Overview

Eagle Store provides a complete storefront experience for browsing collections, viewing product details, managing a cart and wishlist, authenticating users, editing profiles, and administering a product catalog. The backend currently supports authentication, user profile management, role modeling, and product CRUD operations backed by PostgreSQL.

The frontend already includes UI flows for checkout, order history, returns, user settings, support pages, and admin dashboards. These flows are structured to be connected to production-grade backend endpoints for real payment authorization, order persistence, refunds, and operational reporting.

## Core Features

- User registration, login, JWT session handling, and authenticated profile recovery.
- Profile management with personal data, preferences, location, avatar upload, avatar removal, and password change.
- Persistent product catalog with SKU, collection, category, subcategory, concept, pricing, images, stock, size, status, description, and brand story.
- Admin product management for listing, creating, updating, and deleting products.
- Storefront pages for home, collections, categories, product detail, cart, favorites, checkout, order history, returns, profile, settings, support, FAQ, terms, and privacy.
- Internationalization support for English, Spanish, French, and German.
- Responsive UI built with reusable components, lazy-loaded routes, and centralized store state.
- PostgreSQL schema management with versioned Flyway migrations.
- Frontend deployment support through Vercel SPA rewrites.

## Production Scope

The project is structured to move from portfolio/demo mode into production through a controlled implementation path:

- Replace local development secrets with managed production environment variables.
- Restrict CORS to the deployed frontend domain.
- Add real payment processing with Stripe Checkout or Payment Intents.
- Persist orders, order items, payment status, refunds, and return requests in PostgreSQL.
- Handle Stripe webhooks server-side for reliable payment confirmation.
- Protect admin routes with role-based authorization at the backend level.
- Add integration tests for authentication, product management, checkout, and webhooks.
- Add CI/CD validation before deployment.
- Configure logging, monitoring, error tracking, and database backups.

## Architecture

```text
app-shopping-clothes/
├── backend/      # REST API: Kotlin + Spring Boot + PostgreSQL + Flyway
├── frontend/     # SPA: React + TypeScript + Vite + Tailwind CSS
├── LICENSE
└── README.md
```

The application is organized as a monorepo with two independent layers:

- `frontend`: React SPA, routing, UI components, i18n, store state, and API consumption.
- `backend`: authentication, users, roles, products, validation, security configuration, and persistence.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS, React Router, i18next, lucide-react |
| Backend | Kotlin 1.9, Spring Boot 3.5, Spring Security, Spring Web, Spring Data JPA |
| Database | PostgreSQL 16 |
| Migrations | Flyway |
| Security | JWT, BCrypt, CORS, Jakarta Validation |
| Tooling | Gradle, npm, Docker Compose |
| Frontend Hosting | Vercel |
| Planned Payments | Stripe Checkout, Stripe Webhooks, refunds |

## Project Structure

```text
backend/
├── docker-compose.yml
├── build.gradle.kts
└── src/main/
    ├── kotlin/com/sprint/backend/
    │   ├── auth/
    │   ├── config/
    │   ├── products/
    │   └── users/
    └── resources/
        ├── application.yaml
        └── db/migration/

frontend/
├── package.json
├── vite.config.ts
├── vercel.json
└── src/
    ├── components/
    ├── context/
    ├── data/
    ├── i18n/
    ├── lib/
    ├── pages/
    └── types/
```

## Requirements

- Java 21
- Node.js 22 or higher
- npm
- Docker Desktop
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd app-shopping-clothes
```

### 2. Start PostgreSQL

```bash
cd backend
docker compose up -d
```

PostgreSQL is exposed at:

```text
localhost:5433
```

### 3. Run the backend

```bash
cd backend
./gradlew bootRun
```

On Windows:

```bash
cd backend
gradlew.bat bootRun
```

The API runs at:

```text
http://localhost:8080
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The storefront runs at:

```text
http://localhost:5173
```

Create `frontend/.env.local` to connect the frontend to the local API:

```env
VITE_API_URL=http://localhost:8080
```

## Environment Variables

### Frontend

```env
VITE_API_URL=http://localhost:8080
```

For production:

```env
VITE_API_URL=https://api.your-domain.com
```

### Backend

The current local configuration lives in `backend/src/main/resources/application.yaml`. For production, secrets and database settings should be externalized through environment variables or Spring profiles.

Recommended production variables:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/db_sprint
SPRING_DATASOURCE_USERNAME=production_user
SPRING_DATASOURCE_PASSWORD=production_password
SECURITY_JWT_SECRET=replace_with_a_long_secure_secret
APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Production security notes:

- Never commit real passwords, API keys, JWT secrets, or Stripe keys.
- Use separate credentials for development, staging, and production.
- Store secrets in the hosting provider secret manager.
- Use HTTPS-only production URLs.
- Restrict CORS to trusted frontend domains.
- Rotate secrets after any accidental exposure.

## Available API

### Authentication and Profile

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Registers a user and returns a JWT |
| POST | `/api/auth/login` | Authenticates credentials and returns a JWT |
| GET | `/api/auth/me` | Returns the authenticated user |
| PATCH | `/api/auth/profile` | Updates user profile data |
| PATCH | `/api/auth/avatar` | Updates avatar using `multipart/form-data` |
| DELETE | `/api/auth/avatar` | Removes the user avatar |
| PATCH | `/api/auth/password` | Changes the user password |

### Products

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/products` | Lists public active products |
| GET | `/api/products/{id}` | Returns public product detail |
| GET | `/api/products/admin` | Lists products for administration |
| POST | `/api/products/admin` | Creates a product |
| PUT | `/api/products/admin/{id}` | Updates a product |
| DELETE | `/api/products/admin/{id}` | Deletes a product |

## Payments Roadmap

Real payment processing should be implemented on the backend, never directly from the browser with secret keys.

Recommended Stripe implementation:

1. Create an `orders` table and `order_items` table in PostgreSQL.
2. Create a backend endpoint such as `POST /api/checkout/session`.
3. Validate cart items server-side using product IDs, prices, stock, and authenticated user data.
4. Create a Stripe Checkout Session or Payment Intent from the backend.
5. Redirect the user from the frontend to the Stripe-hosted checkout page.
6. Add a backend webhook endpoint such as `POST /api/webhooks/stripe`.
7. Verify Stripe webhook signatures using `STRIPE_WEBHOOK_SECRET`.
8. Update order status only from trusted webhook events.
9. Store payment status, Stripe session ID, payment intent ID, timestamps, and failure reasons.
10. Add refund and return workflows for admin operations.

Suggested payment statuses:

```text
pending
requires_payment
paid
failed
cancelled
refunded
partially_refunded
```

This approach keeps payment confirmation reliable, auditable, and secure.

## Database and Migrations

Flyway runs migrations from:

```text
backend/src/main/resources/db/migration
```

Current migrations create:

- Users, roles, and user-role relationship tables.
- Extended profile fields.
- Product catalog table.
- Initial roles and product seed data.

JPA is configured with:

```yaml
ddl-auto: validate
```

This prevents Hibernate from changing the schema automatically and ensures database changes are handled through controlled migrations.

## Build and Verification

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
./gradlew test
./gradlew build
```

On Windows:

```bash
cd backend
gradlew.bat test
gradlew.bat build
```

## Deployment

### Frontend on Vercel

Recommended configuration:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Required variable:

```env
VITE_API_URL=https://api.your-domain.com
```

`frontend/vercel.json` includes SPA rewrites for React Router.

### Backend

The backend can be deployed to Railway, Render, Fly.io, AWS, DigitalOcean, or a VPS with Java 21.

Recommended production setup:

- Managed PostgreSQL database.
- Environment-managed secrets.
- Spring production profile.
- HTTPS through the platform or reverse proxy.
- Strict CORS.
- Automated migrations during deploy.
- CI/CD pipeline running tests and builds before release.
- Centralized logs and error monitoring.

## Production Checklist

- [ ] Move all secrets out of `application.yaml`.
- [ ] Configure production database credentials.
- [ ] Configure a strong JWT secret.
- [ ] Restrict CORS to production domains.
- [ ] Add role-based access control for admin endpoints.
- [ ] Implement persistent orders and order items.
- [ ] Integrate Stripe Checkout or Payment Intents.
- [ ] Add Stripe webhook verification.
- [ ] Store payment status and payment provider references.
- [ ] Add refund and return workflows.
- [ ] Add backend integration tests.
- [ ] Add frontend smoke tests for critical user flows.
- [ ] Configure CI/CD.
- [ ] Configure monitoring, logs, backups, and alerting.

## Future Improvements

- Persistent order and return management in the backend.
- Stripe Checkout, webhooks, refunds, and payment status tracking.
- Admin dashboard with real sales, revenue, inventory, and return metrics.
- Backend-enforced authorization for admin product operations.
- External image storage through S3, Cloudinary, or similar.
- Email notifications for registration, purchases, refunds, and support.
- Inventory reservation during checkout.
- Full test coverage for authentication, product management, checkout, and payments.
- Staging environment before production releases.

## Author

**Paulo Salazar**

Built as a professional full stack e-commerce project focused on production readiness, scalable architecture, polished user experience, secure backend foundations, and a clear roadmap for real-world payment processing.
