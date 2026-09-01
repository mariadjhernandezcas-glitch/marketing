# Changelog

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
