# Triario Implementation Portal

Portal ejecutivo de seguimiento de solicitudes de implementación entre
**Triario** y sus clientes. La primera implementación es para **COSMO
Schools**, pero la arquitectura está diseñada para reutilizarse con
clientes futuros sin reescribir la interfaz.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- Tailwind CSS
- [Recharts](https://recharts.org/) para visualizaciones
- [Lucide](https://lucide.dev/) para iconografía
- Datos mock en memoria (ver sección "Fuente de datos")

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — redirige automáticamente
a `/client/cosmo`, el dashboard de COSMO Schools.

Otros scripts disponibles:

```bash
npm run lint       # ESLint (next/core-web-vitals)
npm run typecheck   # TypeScript sin emitir archivos
npm run build       # Build de producción
npm run start        # Sirve el build de producción
```

## Build

```bash
npm run build
```

El build de producción compila sin errores de TypeScript ni de ESLint (se
verifican como parte del propio `next build`).

## Estructura del proyecto

```text
app/
  client/[clientId]/           Layout con sidebar + todas las páginas del portal
    page.tsx                   Dashboard ("Centro de implementación")
    solicitudes/page.tsx       Listado con filtros y buscador
    solicitudes/nueva/page.tsx Formulario de nueva solicitud
    solicitudes/[id]/page.tsx  Detalle de una solicitud
    sprints/page.tsx           Sprint actual + histórico
components/
  ui/                          Primitivas de interfaz (Card, Badge, EmptyState, ...)
  layout/                      Sidebar / navegación responsive (AppShell)
  dashboard/                   KPIs y gráficas del dashboard
  tickets/                     Tabla de solicitudes, badges de estado, timeline, etc.
  sprints/                     Métricas y tabla de tickets por sprint
config/
  clients.ts                   Registro de clientes (tema, nombre, colores)
  status.ts                    Configuración visual de los 8 estados del pipeline
data/
  tickets.ts, sprints.ts       Datos mock de COSMO Schools
lib/
  repositories/                Abstracción de fuente de datos (ver siguiente sección)
  services/                    Cálculo de KPIs, distribución por estado/frente, sprints
  actions/                     Server Action para crear una solicitud
  utils/                       Helpers de fecha y clases CSS
types/                         Modelo de datos (Ticket, Sprint, ClientTheme)
```

## Rutas disponibles

| Ruta | Descripción |
| --- | --- |
| `/` | Redirige al cliente por defecto (`/client/cosmo`) |
| `/client/[clientId]` | Dashboard — "Centro de implementación" |
| `/client/[clientId]/solicitudes` | Listado de solicitudes con filtros |
| `/client/[clientId]/solicitudes/nueva` | Formulario de nueva solicitud |
| `/client/[clientId]/solicitudes/[id]` | Detalle de una solicitud |
| `/client/[clientId]/sprints` | Sprint actual + histórico |

Un `clientId` que no existe en `config/clients.ts` responde con un 404.

## Fuente de datos

Esta primera versión usa **datos mock** (`data/tickets.ts`, `data/sprints.ts`),
pero toda la app depende únicamente de la interfaz `TicketRepository`
(`lib/repositories/ticket-repository.ts`):

```text
TicketRepository (interfaz)
├── MockTicketRepository     ← activo hoy
└── HubSpotTicketRepository  ← preparado, no conectado
```

`lib/repositories/index.ts` es el único punto de selección de la fuente de
datos activa. Ninguna página ni componente importa `MockTicketRepository`
o `HubSpotTicketRepository` directamente.

### Conectar HubSpot en el futuro

`lib/repositories/hubspot-ticket-repository.ts` documenta en detalle (en
comentarios) lo que falta implementar: autenticación con un Private App
Token, mapeo de pipeline/stages, propiedades custom a crear en HubSpot y el
mapeo entre esas propiedades y el modelo `Ticket`. Mientras esa clase no
esté implementada, lanza errores explícitos si se instancia.

Variables de entorno necesarias (ver `.env.example`, sin valores reales):

```text
HUBSPOT_ACCESS_TOKEN=
HUBSPOT_TICKET_PIPELINE_ID=
```

Estas variables **nunca** deben tener el prefijo `NEXT_PUBLIC_`: se leen
exclusivamente server-side (Route Handlers / Server Components / Server
Actions), nunca en el bundle del cliente.

## Arquitectura multicliente

Todas las páginas viven bajo `/client/[clientId]`. Agregar un cliente
nuevo de Triario implica:

1. Agregar una entrada en `config/clients.ts` (nombre, iniciales, colores).
2. Agregar su set de datos mock en `data/` (o, una vez conectado HubSpot,
   filtrar por `client_id` en HubSpot).

No se requiere tocar componentes ni rutas.

## Publicación en Vercel

Este proyecto **no ha sido publicado todavía**. Pasos para publicarlo:

1. Sube el repositorio a GitHub (o el remoto que uses).
2. En [vercel.com](https://vercel.com/), "Add New Project" → importa el repo.
   Vercel detecta Next.js automáticamente (build command `next build`,
   output `.next`).
3. Si en el futuro se conecta HubSpot, configura `HUBSPOT_ACCESS_TOKEN` y
   `HUBSPOT_TICKET_PIPELINE_ID` en Project Settings → Environment Variables
   (nunca como variables `NEXT_PUBLIC_`).
4. Deploy.

## Estado de los datos mock

`MockTicketRepository` guarda los tickets en memoria a nivel de módulo.
Esto es suficiente para la demo (crear una solicitud nueva la deja
visible durante la sesión del servidor), pero no es persistencia real: se
reinicia en cada cold start / redeploy. Esa limitación desaparece al
conectar HubSpot como fuente de verdad.
