# Changelog

## Gestión comercial (Escala)

- Dashboard en `/comercial`: pipeline por etapa, tiempos de gestión, tasa de
  conversión y negocios sin actividad reciente, por asesora.
- Sincronización con la API de Escala (`/api/escala/sync`) para negocios,
  pipelines y actividades.

## Initial release

- Página de solicitud (`/nuevo`) para que el equipo de Hommik envíe ajustes de
  automatización de Escala u otras solicitudes del proceso.
- Tablero pipeline (`/`) con las etapas Nuevo → En revisión → En progreso →
  En pruebas → Completado/Rechazado.
- Detalle de ticket (`/tickets/:id`) con trazabilidad completa de cambios de
  etapa.
- Notificaciones automáticas por correo al crear un ticket y en cada cambio
  de etapa (configurables vía SMTP).
- Persistencia en SQLite local.
