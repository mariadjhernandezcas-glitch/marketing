# Tickets Hommik — Automatizaciones Escala

Página interna para que el equipo de Hommik envíe ajustes de solicitudes de
automatización de Escala u otras solicitudes del proceso, con trazabilidad
completa y notificaciones por correo en cada cambio de etapa.

## Página estática (`docs/index.html`) — para GitHub Pages

Este repositorio incluye una versión ligera de una sola página HTML, sin
backend ni base de datos, pensada para publicarse gratis con **GitHub
Pages** y que el cliente la vea sin necesidad de crear cuenta en ninguna
plataforma.

**Cómo activarla** (una sola vez, ~30 segundos):

1. En este repositorio en GitHub: **Settings → Pages**.
2. En "Build and deployment" → Source: **Deploy from a branch**.
3. Branch: selecciona esta rama (o `main` después de hacer merge del PR) y
   carpeta **`/docs`**.
4. Guarda. GitHub te da la URL pública, algo como
   `https://<tu-usuario>.github.io/marketing/`.

**Qué hace y qué no:**

- Formulario para reportar ajustes de Escala u otras solicitudes, con
  adjuntar evidencia (captura de pantalla, se comprime automáticamente).
- Cada solicitud queda con folio y trazabilidad de cambios de etapa.
- **Importante:** al ser una página estática sin servidor, cada solicitud
  se guarda solo en el navegador de quien la envía (`localStorage`) — no
  hay un tablero compartido entre distintas personas ni envío de correos.
  Si más adelante necesitas un tablero realmente compartido entre todo el
  equipo, con base de datos propia, usa la app de Next.js descrita abajo
  (desplegada en Vercel).

## App con base de datos compartida (Next.js + Vercel)

La app completa de este repositorio (`app/`, `lib/`, `components/`) es la
versión con tablero compartido en tiempo real para todo el equipo, con base
de datos propia y notificaciones por correo. Requiere desplegarse en un
servicio como Vercel (ver más abajo) — a diferencia de la página estática de
`docs/`, sí necesita una cuenta de hosting.

## Qué incluye

- **Formulario de solicitud** (`/nuevo`): captura título, descripción, tipo
  (ajuste de automatización Escala u otra solicitud), prioridad y datos del
  solicitante. Es la página a la que entran los asesores/personas para dejar
  un ticket.
- **Tablero pipeline** (`/`): vista Kanban con las etapas
  `Nuevo → En revisión → En progreso → En pruebas → Completado / Rechazado`.
  Cada ticket se puede mover de etapa directamente desde su tarjeta.
- **Detalle y trazabilidad** (`/tickets/:id`): historial completo de cambios
  de etapa (quién, cuándo y comentario), y un formulario para actualizar el
  estado.
- **Notificaciones por correo**: al crear un ticket y al cambiar de etapa se
  envía un correo automático al solicitante (y, si se configura, a un correo
  interno del equipo) informando el avance.
- **Persistencia**: Postgres (vía `@vercel/postgres`), pensado para
  desplegarse en Vercel sin servidores propios.

## Desplegar en Vercel (recomendado)

1. **Importar el repo**: en https://vercel.com/new, importa este repositorio
   de GitHub y selecciona la rama que quieras publicar.
2. **Agregar una base de datos Postgres**: en el proyecto de Vercel, ve a la
   pestaña **Storage** → **Create Database** → **Postgres** (puede ser
   Neon o Vercel Postgres, cualquiera funciona). Al conectarla al proyecto,
   Vercel inyecta automáticamente las variables `POSTGRES_URL` y relacionadas
   — no hay que configurarlas a mano.
3. **Variables de entorno** (Project Settings → Environment Variables):
   agrega las variables de correo que necesites (ver tabla abajo). Sin ellas
   la app funciona igual, solo no manda correos.
4. **Deploy**. Al terminar, la URL pública queda como
   `https://<tu-proyecto>.vercel.app`. Comparte con el equipo:
   - `https://<tu-proyecto>.vercel.app/nuevo` → para que asesores/personas
     dejen tickets.
   - `https://<tu-proyecto>.vercel.app` → tablero pipeline para dar
     seguimiento.

Cada vez que se haga push/merge a la rama conectada, Vercel vuelve a
desplegar automáticamente.

## Requisitos (desarrollo local)

- Node.js 18+
- Una base de datos Postgres accesible (por ejemplo, una gratuita en
  [neon.tech](https://neon.tech) o `vercel env pull` si ya tienes el
  proyecto conectado en Vercel).

## Instalación y desarrollo local

```bash
npm install
cp .env.example .env.local   # completa POSTGRES_URL y, si quieres, el SMTP
npm run dev
```

Abre http://localhost:3000. Las tablas se crean automáticamente en el primer
request.

## Configurar el envío de correos

Completa estas variables en `.env.local` (ver `.env.example`) o en las
Environment Variables del proyecto en Vercel:

| Variable            | Descripción                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `SMTP_HOST`          | Servidor SMTP de tu proveedor (Gmail, Outlook, SendGrid, etc.)      |
| `SMTP_PORT`          | Puerto SMTP (587 con TLS, 465 con SSL)                              |
| `SMTP_USER`          | Usuario/cuenta SMTP                                                  |
| `SMTP_PASS`          | Contraseña o contraseña de aplicación                                |
| `SMTP_FROM`          | Remitente que verán los destinatarios (opcional)                    |
| `TEAM_NOTIFY_EMAIL`  | Correo interno que recibe copia de cada ticket nuevo/actualización  |
| `APP_BASE_URL`       | URL pública de la app, para el enlace "Ver ticket" en los correos   |

Si no configuras estas variables, la app funciona igual: los correos se
omiten y solo se registra un mensaje en la consola del servidor.

> Si usas Gmail, necesitas generar una "contraseña de aplicación" (no tu
> contraseña normal) en la configuración de seguridad de la cuenta.

## Build de producción

```bash
npm run build
npm start
```

## Seguridad

Este MVP no incluye autenticación: cualquier persona con la URL puede crear
tickets y cambiar de etapa. Si se va a exponer públicamente, colócalo detrás
de un proveedor de autenticación (SSO, proxy con login, red interna/VPN) antes
de usarlo en producción, o al menos evita compartir la URL fuera del equipo.

## Estructura del proyecto

```
app/
  page.tsx                 Tablero pipeline (Kanban)
  nuevo/page.tsx            Formulario de nueva solicitud
  tickets/[id]/page.tsx      Detalle + trazabilidad + cambio de etapa
  api/tickets/route.ts       Crear / listar tickets
  api/tickets/[id]/route.ts  Detalle de un ticket
  api/tickets/[id]/stage/route.ts  Cambiar etapa (dispara correo)
components/
  KanbanBoard.tsx, NewTicketForm.tsx, StageMover.tsx, Badge.tsx
lib/
  db.ts        Conexión y esquema Postgres
  tickets.ts    Acceso a datos (crear, listar, cambiar etapa, historial)
  mailer.ts     Envío de correos (nodemailer)
  types.ts      Etapas del pipeline, tipos y prioridades
```

## Personalizar las etapas del pipeline

Las etapas están centralizadas en `lib/types.ts` (`STAGES`). Para agregar,
renombrar o reordenar etapas, edita ese arreglo; el tablero, el detalle y las
notificaciones las usan automáticamente.
