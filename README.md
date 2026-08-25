# Tickets Hommik — Automatizaciones Escala

Página interna para que el equipo de Hommik envíe ajustes de solicitudes de
automatización de Escala u otras solicitudes del proceso, con trazabilidad
completa y notificaciones por correo en cada cambio de etapa.

## Qué incluye

- **Formulario de solicitud** (`/nuevo`): captura título, descripción, tipo
  (ajuste de automatización Escala u otra solicitud), prioridad y datos del
  solicitante.
- **Tablero pipeline** (`/`): vista Kanban con las etapas
  `Nuevo → En revisión → En progreso → En pruebas → Completado / Rechazado`.
  Cada ticket se puede mover de etapa directamente desde su tarjeta.
- **Detalle y trazabilidad** (`/tickets/:id`): historial completo de cambios
  de etapa (quién, cuándo y comentario), y un formulario para actualizar el
  estado.
- **Notificaciones por correo**: al crear un ticket y al cambiar de etapa se
  envía un correo automático al solicitante (y, si se configura, a un correo
  interno del equipo) informando el avance.
- **Persistencia**: SQLite local (`better-sqlite3`), sin necesidad de una
  base de datos externa para empezar a usarlo.

## Requisitos

- Node.js 18+

## Instalación y desarrollo local

```bash
npm install
cp .env.example .env.local   # opcional, para habilitar el envío de correos
npm run dev
```

Abre http://localhost:3000

## Configurar el envío de correos

Completa estas variables en `.env.local` (ver `.env.example`):

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

## Datos

Los tickets se guardan en un archivo SQLite dentro de `./data/tickets.db`
(configurable con `TICKETS_DATA_DIR`). Esta carpeta no se sube al
repositorio (ver `.gitignore`).

**Importante para producción:** si despliegas en una plataforma serverless
con sistema de archivos efímero (por ejemplo Vercel), el archivo SQLite no
persistirá entre despliegues. Para producción se recomienda:
- Desplegar en un servidor Node persistente (VPS, Railway, Render, etc.) con
  un volumen para `./data`, o
- Migrar `lib/db.ts` a una base de datos gestionada (Postgres, etc.) si se
  necesita alta disponibilidad.

## Build de producción

```bash
npm run build
npm start
```

## Seguridad

Este MVP no incluye autenticación: cualquier persona con la URL puede crear
tickets y cambiar de etapa. Si se va a exponer públicamente, colócalo detrás
de un proveedor de autenticación (SSO, proxy con login, red interna/VPN) antes
de usarlo en producción.

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
  db.ts        Conexión y esquema SQLite
  tickets.ts    Acceso a datos (crear, listar, cambiar etapa, historial)
  mailer.ts     Envío de correos (nodemailer)
  types.ts      Etapas del pipeline, tipos y prioridades
```

## Personalizar las etapas del pipeline

Las etapas están centralizadas en `lib/types.ts` (`STAGES`). Para agregar,
renombrar o reordenar etapas, edita ese arreglo; el tablero, el detalle y las
notificaciones las usan automáticamente.
