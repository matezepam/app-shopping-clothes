# Sprint — comercio electrónico integral

Aplicación web para catálogo, clientes, inventario, proveedores, solicitudes de compra, contacto comercial por WhatsApp, seguimiento, devoluciones, moderación y reportes. La identidad se gestiona exclusivamente con Amazon Cognito; PostgreSQL conserva perfiles y datos comerciales, pero nunca contraseñas.

## Arquitectura final

- Frontend: React 19, TypeScript, Vite, Tailwind CSS e i18next.
- Backend: Kotlin, Spring Boot 3, Spring Security OAuth2 Resource Server y JPA.
- Identidad: Amazon Cognito (registro, confirmación, login, recuperación, renovación y grupos).
- Datos: PostgreSQL administrado, esquema versionado por Flyway.
- Canal comercial: solicitud persistente y enlace oficial de WhatsApp; no se procesan tarjetas.
- Despliegue: frontend estático y backend contenedorizado; todos los secretos se inyectan desde el proveedor.

## Funciones implementadas

- Registro, confirmación, reenvío de código, inicio de sesión, recuperación y cambio de contraseña con Cognito.
- Validación de emisor, App Client, expiración y `token_use=access` mediante JWKS de Cognito.
- Respuestas 401 para token ausente/inválido y 403 para grupo insuficiente.
- Perfiles asociados al `sub` de Cognito y preferencias de idioma.
- CRUD de productos, categorías y proveedores.
- Grupos `ADMIN`, `VENDOR`, `SUPPLIER`, `MODERATOR` y `USER` aplicados en backend.
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
SPRING_DATASOURCE_URL=jdbc:postgresql://.../sprint?sslmode=require
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
APP_CORS_ALLOWED_ORIGINS=https://store.example.com
APP_WHATSAPP_BUSINESS_NUMBER=593999999999
AWS_COGNITO_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_xxx
AWS_COGNITO_CLIENT_ID=...
AWS_COGNITO_CLIENT_SECRET=...
```

El frontend requiere:

```text
VITE_API_URL=https://api.example.com
```

## Configuración de Cognito que debe realizar el propietario de AWS

1. Crear un User Pool con correo verificado y política de contraseña fuerte.
2. Crear los grupos `USER`, `ADMIN`, `VENDOR`, `SUPPLIER` y `MODERATOR`.
3. Crear un App Client habilitado para `USER_PASSWORD_AUTH` y `REFRESH_TOKEN_AUTH`; si tiene secreto, guardarlo solo en el backend.
4. Configurar caducidad de access token y refresh token según la política institucional.
5. Asignar grupos desde Cognito; la aplicación nunca permite que un usuario se eleve de rol.
6. Inyectar región, User Pool ID y App Client ID/secret en el servicio desplegado.

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

Las pruebas automatizadas verifican el arranque, 401 sin token, 403 con grupo insuficiente, acceso administrativo, reserva de inventario, rechazo por stock e idempotencia. La validación real de correos/SMS y tokens requiere ejecutar los casos contra el User Pool de defensa.

## Despliegue

- Backend: construir `backend/Dockerfile` y desplegarlo con HTTPS, variables secretas y acceso restringido a PostgreSQL.
- PostgreSQL: usar una instancia administrada, TLS, copias automáticas y un usuario con privilegios mínimos.
- Frontend: desplegar `frontend/dist` y configurar `VITE_API_URL` antes del build.
- CORS: permitir exclusivamente el dominio definitivo del frontend.
- Observabilidad: el backend expone el endpoint de salud de Actuator; los logs no deben contener tokens ni datos sensibles.

## Evidencia de tesis

El commit utilizado en la defensa debe ser único. Sobre ese commit se deben ejecutar y conservar los logs de Gradle/Vite, casos API, prueba real de Cognito, prueba del flujo pedido–inventario–WhatsApp, P95, compatibilidad, usabilidad y backup/restore. No se deben marcar como aprobadas tareas cloud que no hayan sido ejecutadas en la cuenta definitiva.
