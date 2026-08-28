# CLAUDE.md — Triario Implementation Portal

Reglas permanentes para trabajar en este proyecto. Léelas antes de hacer
cambios: mantienen consistencia entre sesiones de Claude Code.

## Propósito

Portal ejecutivo (no una herramienta técnica) para que un cliente de
Triario —hoy **COSMO Schools**— entienda de un vistazo qué solicitó, qué
está priorizado, qué se está trabajando, qué está bloqueado y quién genera
cada bloqueo, y cuál es el cumplimiento del sprint. Está inspirado en
Linear / Stripe Dashboard / HubSpot / Notion: sobrio, mucho blanco,
jerarquía tipográfica clara, cero ruido visual.

## Stack (no cambiar sin razón fuerte)

- Next.js App Router + TypeScript, Tailwind CSS, Recharts, Lucide.
- Sin librerías de UI adicionales (no shadcn, no MUI, no Chakra). Los
  componentes en `components/ui/` son la única base de diseño.
- Evita agregar dependencias nuevas salvo que sean claramente necesarias.

## Arquitectura multicliente — no romper esto

Toda la app vive bajo `/client/[clientId]`. Un cliente se define en
`config/clients.ts` (`ClientTheme`: nombre, iniciales, colores). **Nunca**
hardcodees "COSMO" fuera de `config/clients.ts` y `data/*.ts` — páginas y
componentes deben recibir el nombre/tema del cliente por props o vía
`getClientTheme(clientId)`, nunca como texto literal.

Agregar un cliente nuevo = una entrada en `config/clients.ts` + su archivo
de datos mock en `data/`. Si eso no alcanza para agregar un cliente, es un
bug de arquitectura.

## Fuente de datos — el patrón Repository es intencional

```text
lib/repositories/ticket-repository.ts       interfaz TicketRepository
lib/repositories/mock-ticket-repository.ts  implementación activa hoy
lib/repositories/hubspot-ticket-repository.ts implementación futura (no conectada)
lib/repositories/index.ts                    único punto de selección
```

- **Ninguna página ni componente debe importar `MockTicketRepository` o
  `HubSpotTicketRepository` directamente.** Siempre `getTicketRepository()`
  desde `lib/repositories/index.ts`.
- HubSpot será la única fuente de verdad de las solicitudes en el futuro.
  Hasta que `HubSpotTicketRepository` esté implementado (hoy lanza
  errores explícitos), `index.ts` debe seguir devolviendo el mock.
- Al conectar HubSpot, el cambio debe quedar contenido en
  `lib/repositories/*`. Si tocas páginas o componentes para eso, algo está
  mal diseñado.

## Prohibido exponer secretos

- Ninguna variable de entorno con datos de HubSpot (token, IDs) puede
  tener el prefijo `NEXT_PUBLIC_`. Deben leerse solo en código
  server-side (Server Components, Route Handlers, Server Actions).
- No hardcodees tokens, ni siquiera de prueba, en el código o en
  `.env.example`.
- Antes de commitear, verifica que no haya credenciales reales en ningún
  archivo.

## Estados del pipeline (exactos, no renombrar)

```text
identified          Identificado
to_prioritize        Por priorizar
prioritized          Priorizado
in_progress          En implementación
triario_qa           QA Triario
cosmo_validation      Validación COSMO
blocked              Bloqueado
completed            Completado
```

Toda la configuración visual (label, color, orden) vive en
`config/status.ts` (`STATUS_CONFIG`). Si necesitas cambiar el color o la
etiqueta de un estado, cámbialo ahí — no en los componentes que lo
consumen.

## Modelo de datos

`types/ticket.ts` es la fuente de verdad del shape `Ticket`. Cualquier
campo nuevo que necesite el negocio se agrega ahí primero, y luego se
propaga a `MockTicketRepository`, `HubSpotTicketRepository` (comentario de
mapeo) y a los componentes que lo muestran.

## Decisiones de UX que no deben revertirse sin pedirlo explícitamente

- El dashboard se llama **"Centro de implementación"**, con el subtítulo
  "Seguimiento de solicitudes, implementaciones, bloqueos y entregables."
- Los KPIs del dashboard (`lib/services/ticket-metrics.ts`) se **calculan
  siempre** a partir de los tickets — nunca se hardcodean números.
- "En qué estamos trabajando" y "Bloqueos actuales" son las dos secciones
  más importantes del dashboard: deben permanecer visibles y por encima
  del fold en desktop tanto como sea razonable.
- Cuando un ticket está bloqueado, la sección de dependencias en el
  detalle (`DependencyBanner`) debe ser muy visible (fondo rojo, no un
  badge discreto).
- Los gráficos (`components/dashboard/*Chart.tsx`) usan
  `isAnimationActive={false}`: es intencional (evita el efecto de "barras
  vacías" en la primera pintura y mantiene el tono sobrio del portal). No
  reactives animaciones de entrada sin una buena razón.
- Estados vacíos, de carga y de error usan siempre `EmptyState`,
  `LoadingState` y `ErrorState` de `components/ui/` — no textos sueltos
  ni componentes ad-hoc nuevos para lo mismo.

## Convenciones de código

- Server Components por defecto. `"use client"` solo donde hay estado o
  interactividad real (filtros, sidebar móvil, uploads simulados).
- La creación de tickets pasa por una Server Action
  (`lib/actions/create-ticket.ts`), no por un Route Handler ni por fetch
  desde el cliente.
- Tailwind utility classes directo en JSX; el único helper de clases es
  `cn()` en `lib/utils/cn.ts`. No introduzcas `clsx`/`tailwind-merge`
  salvo necesidad real.
- Componentes reutilizables de tabla/badge/estado viven en
  `components/tickets/` y `components/sprints/`; no dupliques lógica de
  render de una fila de ticket en una página.
- Sin comentarios que expliquen el "qué" (los nombres ya lo hacen). Los
  comentarios que existen documentan decisiones no obvias (p. ej. por qué
  el repositorio mock usa un Map a nivel de módulo).

## Antes de dar por terminado un cambio

`npm run lint`, `npm run typecheck` y `npm run build` deben pasar sin
errores. Si tocaste una página, verifica manualmente responsive (mobile
375px / desktop 1440px) — no asumas que Tailwind lo resuelve solo.
