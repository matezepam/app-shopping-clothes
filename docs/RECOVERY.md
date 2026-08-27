# Clonar, respaldar y recuperar Sprint

## Qué guarda cada lugar

| Lugar | Contenido | ¿Basta para recuperar el equipo? |
| --- | --- | --- |
| GitHub | Código, migraciones y fotografías estáticas del catálogo | No incluye datos añadidos desde la aplicación ni secretos |
| Respaldo privado | Dos bases locales, imágenes subidas, configuración y copia del historial Git | Sí, para recuperar el estado local respaldado |
| Amazon Cognito | Cuentas, contraseñas y grupos de autorización | Permanece en AWS; conservar acceso a la cuenta AWS y MFA |
| AWS / Vercel | Entornos publicados, independientes del Docker local | No se borran al formatear el equipo, pero tampoco sustituyen el respaldo local |

Una copia guardada solo en el disco que se va a formatear **no es un respaldo externo**. Antes de restaurar el dispositivo, copiar el ZIP y su archivo `.sha256` a un disco externo o almacenamiento privado protegido y comprobar que se pueden leer desde allí. El ZIP contiene credenciales y datos personales **sin cifrar**: no compartirlo públicamente, subirlo al repositorio ni usarlo como adjunto de una incidencia.

## 1. Preparar un respaldo antes de borrar el equipo

Con Docker Desktop iniciado, desde la raíz del proyecto:

```powershell
.\scripts\backup-project.ps1 -Destination 'E:\RespaldosSprint'
```

Cambiar `E:\RespaldosSprint` por una carpeta real de tu disco externo. Sin `-Destination`, se guarda en `backups/`, ignorada por Git, y debes copiarla fuera del dispositivo después.

El script pausa temporalmente frontend y backend para evitar escrituras mientras respalda; PostgreSQL permanece encendido. Genera dos dumps, prueba su restauración en bases aisladas, copia imágenes y configuración, verifica SHA-256, guarda `repository.bundle` y crea un ZIP. Reinicia únicamente los servicios que estaban encendidos.

La configuración privada incluye `.env` y, si existen, `backend/.env.cognito.generated`, `frontend/.env.local` y el vínculo del proyecto de Vercel. No incluye sesiones del navegador, contraseñas de usuarios Cognito, credenciales globales de GitHub/AWS ni archivos ajenos al proyecto. Después del formateo debes volver a iniciar sesión en esos servicios.

El historial de `repository.bundle` contiene los commits existentes al hacer el respaldo, no cambios sin commit. Confirma y sube el código antes del respaldo final.

## 2. Clonar en una máquina nueva

Instalar Git, Docker Desktop con contenedores Linux y PowerShell 7. Para arrancar con Docker no hacen falta Java, Node.js ni PostgreSQL instalados en Windows. Se necesita Internet para descargar imágenes y comunicarse con Cognito.

```powershell
git clone https://github.com/matezepam/app-shopping-clothes.git
cd app-shopping-clothes
Copy-Item -LiteralPath '.env.example' -Destination '.env'
```

Si vas a recuperar un respaldo, usa su `configuration/.env` en lugar de la plantilla. Si empiezas sin respaldo, completa en `.env`:

- `POSTGRES_PASSWORD`, `PGADMIN_EMAIL` y `PGADMIN_PASSWORD` con valores propios.
- `AWS_COGNITO_REGION`, `AWS_COGNITO_USER_POOL_ID`, `AWS_COGNITO_CLIENT_ID` y, si el App Client tiene secreto, `AWS_COGNITO_CLIENT_SECRET`.

No inventar IDs de Cognito ni publicarlos junto con su secreto. Usa el User Pool y App Client existentes para conservar las mismas cuentas y roles. Un entorno nuevo incluye el catálogo inicial definido por migraciones, no todos los productos que creaste después.

```powershell
.\scripts\docker-up.ps1 -OpenBrowser
.\scripts\smoke-test.ps1
```

El inicio crea el volumen PostgreSQL si no existe, inicializa las bases, construye las imágenes y comprueba la salud de los servicios. La configuración incompleta provoca un error claro antes de iniciar, en lugar de mostrar un login aparentemente listo.

- Aplicación: `http://localhost:8088`
- Base de datos, vía pgAdmin: `http://localhost:5050`
- Salud local: `http://localhost:8088/api/health`

El puerto de `.env` se respeta; `-Port 8089` lo cambia explícitamente. Para ejecutar otra copia aislada, configurar también `COMPOSE_PROJECT_NAME`, `SPRINT_POSTGRES_VOLUME`, `SPRINT_PGADMIN_VOLUME` y `PGADMIN_PORT` con nombres/puertos diferentes. Nunca reutilizar los volúmenes de trabajo en una prueba de recuperación.

## 3. Recuperar datos e imágenes

Usa únicamente un respaldo de confianza. Descomprime el ZIP en una carpeta privada y verifica primero su integridad:

```powershell
$backup = 'E:\RespaldosSprint\sprint-recovery-FECHA-IDENTIFICADOR'
.\scripts\verify-project-backup.ps1 -BackupPath $backup
```

El verificador revisa los tamaños y hashes, rechaza rutas fuera de la carpeta y enlaces simbólicos, y exige bases, configuración y copia Git. Un hash detecta corrupción accidental; no demuestra quién creó el archivo.

En un clon nuevo, antes del primer arranque, copia la configuración guardada:

```powershell
Copy-Item -LiteralPath "$backup\configuration\.env" -Destination '.env'
.\scripts\docker-up.ps1
```

Si `backend/.env.cognito.generated` ya existe en el clon, comprobar que coincide con el `.env` respaldado: el script de inicio importa sus valores. No mezclar configuración de diferentes User Pools.

La restauración siguiente **reemplaza las bases locales actuales**. Solo ejecutarla en el clon nuevo o después de crear un respaldo del estado que se reemplazará:

```powershell
$manifest = Get-Content -LiteralPath "$backup\manifest.json" -Raw | ConvertFrom-Json
$databases = Join-Path $backup $manifest.databaseFolder
.\scripts\restore-database.ps1 -BackupPath $databases -ConfirmRestore -LeaveStopped
Copy-Item -Path "$backup\uploads\products\*" -Destination '.\runtime\uploads\products\' -Force
docker compose start backend frontend
.\scripts\smoke-test.ps1
```

Esperar a que backend y frontend aparezcan `healthy` con `docker compose ps` antes del smoke test. Si no hay imágenes en el respaldo, omitir `Copy-Item`. El stock, pedidos, historial, proveedores, categorías y perfiles se recuperan desde las bases; los archivos de imágenes necesitan la copia adicional. Esta secuencia es para un destino nuevo: no mezcla ni sincroniza catálogos distintos.

Cada base se restaura en una transacción. Si falla alguna, los servicios quedan detenidos para no exponer un estado parcialmente restaurado. Corregir el error y repetir; no reiniciarlos a ciegas. Nunca restaurar datos locales sobre producción sin una decisión y un respaldo independientes.

Comprobar al final: acceso con una cuenta real, rol correcto, un producto creado por ti con sus imágenes, stock y pedidos recientes. Las pruebas automáticas no sustituyen verificar tu cuenta y datos particulares.

## 4. Alternativa si GitHub no está disponible

```powershell
git clone 'E:\RespaldosSprint\sprint-recovery-FECHA-IDENTIFICADOR\repository.bundle' app-shopping-clothes
cd app-shopping-clothes
git remote set-url origin https://github.com/matezepam/app-shopping-clothes.git
```

Continuar con la configuración y restauración anterior. Conservar también el PDF de estudio u otros documentos personales fuera del disco que se va a borrar: no forman parte del repositorio.

## 5. Producción y cierre seguro

Vercel sirve el frontend y enruta `/api/*` hacia CloudFront antes del fallback de React. La API publicada tiene su propia base y archivos en AWS: los cambios locales no se sincronizan solos. No borrar User Pools, instancias, volúmenes AWS ni proyectos Vercel al restaurar Windows.

Para detener el entorno local conservando los datos:

```powershell
.\scripts\docker-down.ps1
```

No usar `docker volume prune`, `docker compose down -v` ni la opción de borrar datos de Docker antes de guardar y verificar el respaldo externo. El clonado recupera código; el respaldo privado recupera el trabajo realizado desde la aplicación.
