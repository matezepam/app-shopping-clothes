# Sprint — comercio electrónico integral

Aplicación web para catálogo, clientes, inventario, proveedores, solicitudes de compra, contacto comercial por WhatsApp, seguimiento, devoluciones, moderación y reportes. La identidad se gestiona exclusivamente con Amazon Cognito; PostgreSQL conserva perfiles y datos comerciales, pero nunca contraseñas.

## Arquitectura final

- Frontend: React 19, TypeScript, Vite, Tailwind CSS e i18next.
- Backend: Kotlin, Spring Boot 3, Spring Security OAuth2 Resource Server y JPA.
- Identidad: Amazon Cognito (registro, confirmación, login, recuperación, renovación y grupos).
- Datos: PostgreSQL 16 aislado en red privada y dividido físicamente en `sprint_identity` (perfiles Cognito) y `sprint_commerce` (operación y auditoría). Cada base tiene su conexión, migraciones Flyway y transacciones independientes.
- Canal comercial: solicitud persistente y enlace oficial de WhatsApp; no se procesan tarjetas.
- Despliegue: Nginx, frontend, backend, PostgreSQL y pgAdmin reproducibles con Docker Compose; los secretos se inyectan desde el entorno o el gestor del proveedor.

## Inicio completo con Docker

Con Docker Desktop iniciado:

```powershell
.\scripts\docker-up.ps1 -OpenBrowser
```

La plataforma completa queda en `http://localhost:8088`; Nginx sirve React y dirige `/api/*` al backend. El script importa automáticamente los datos de `backend/.env.cognito.generated` cuando existen. Para verificar la instalación:

```powershell
.\scripts\smoke-test.ps1
```

pgAdmin queda disponible en `http://localhost:5050` con el servidor **Sprint - PostgreSQL 16** registrado automáticamente. Si solicita la contraseña local usa `SprintLocal#2026`. La relación entre ambas bases se mantiene mediante `identity_user_id` y `user_sub`; PostgreSQL no admite claves foráneas entre bases físicas diferentes.

Para detener sin borrar PostgreSQL:

```powershell
.\scripts\docker-down.ps1
```

## Funciones implementadas

- Registro, confirmación, reenvío de código, inicio de sesión, recuperación y cambio de contraseña con Cognito.
- Validación de emisor, App Client, expiración y `token_use=access` mediante JWKS de Cognito.
- Respuestas 401 para token ausente/inválido y 403 para grupo insuficiente.
- Perfiles asociados al `sub` de Cognito y preferencias de idioma.
- Aprovisionamiento automático del perfil local al recibir por primera vez un token válido de Cognito.
- CRUD de productos, categorías y proveedores.
- Historial persistente de moderación y de cambios de estado de pedidos para auditoría y trazabilidad.
- Registro automático e inmutable de actividades API con actor Cognito, roles, ruta, resultado, código HTTP, identificador de solicitud y duración; no almacena tokens ni cuerpos sensibles.
- Grupos `ADMIN`, `VENDOR`, `MODERATOR` y `USER` aplicados en backend.
- Movimientos trazables de inventario con bloqueo pesimista y saldo no negativo.
- Solicitudes idempotentes; precio calculado en servidor, reserva transaccional de stock y liberación al cancelar.
- Resumen y enlace de WhatsApp generados desde la solicitud persistida.
- Seguimiento con transiciones de estado controladas.
- Devoluciones con validación de cantidades y reintegro de stock al recibirlas.
- Moderación con decisión, motivo, responsable y fecha.
- Reportes de pedidos, ingresos, unidades, devoluciones, stock bajo, productos y ventas por día.
- Frontend sin datos simulados como sustituto del backend.

## Variables de producción

Copiar únicamente los nombres de `backend/.env.example` al gestor de secretos del proveedor. No subir un `.env` real.

```text
IDENTITY_DATASOURCE_URL=jdbc:postgresql://.../sprint_identity?sslmode=require
COMMERCE_DATASOURCE_URL=jdbc:postgresql://.../sprint_commerce?sslmode=require
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
APP_CORS_ALLOWED_ORIGINS=https://store.example.com
APP_WHATSAPP_BUSINESS_NUMBER=593939051525
AWS_COGNITO_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_xxx
AWS_COGNITO_CLIENT_ID=...
AWS_COGNITO_CLIENT_SECRET=...
```

El frontend requiere:

```text
VITE_API_URL=https://api.example.com
```

## Configuración de Cognito desplegada

La pila `sprint-cognito` de `infra/aws/cognito.yml` crea el User Pool con correo verificado, política fuerte, App Client, grupos `USER`, `ADMIN`, `VENDOR`, `MODERATOR` y una función posterior a la confirmación que asigna solamente `USER` a cuentas públicas. La aplicación nunca acepta el rol durante el registro ni permite autoelevación.

## Construcción y pruebas

Backend:

```powershell
cd backend
.\gradlew.bat clean test build --no-daemon
```

Frontend:

```powershell
cd frontend
npm ci
npm run build
```

Auditoría de dependencias:

```powershell
cd frontend
npm audit --audit-level=high
```

Las pruebas automatizadas verifican el arranque, 401 sin token, 403 con grupo insuficiente, acceso administrativo, reserva de inventario, rechazo por stock e idempotencia. Las pruebas reales de correos, SMS y tokens requieren un User Pool de Cognito configurado.

## Despliegue

- Frontend productivo: `https://sprint-clothes-ecuador.vercel.app`.
- Backend productivo: `https://d2q9niwakr7mc.cloudfront.net` (`/actuator/health`).
- AWS: CloudFront HTTPS, EC2 sin SSH público, ECR con escaneo, Secrets Manager, Systems Manager y EBS cifrado persistente.
- CORS permite exclusivamente el dominio definitivo de Vercel.
- El entorno local usa `compose.yaml`: PostgreSQL no publica puerto, el backend solo es accesible por la red interna y Nginx es el único punto de entrada.
- La canalización `.github/workflows/ci.yml` repite pruebas, auditoría, build y construcción de contenedores en cada cambio.
