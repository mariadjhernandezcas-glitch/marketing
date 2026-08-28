import type { NewTicketInput, Ticket } from "@/types/ticket";
import type { TicketRepository } from "./ticket-repository";

/**
 * Implementación futura de TicketRepository sobre la API de HubSpot.
 *
 * HubSpot será la única fuente de verdad de las solicitudes de
 * implementación. Esta clase queda preparada como punto de entrada, pero
 * NO está conectada todavía: toda llamada lanza un error explícito.
 *
 * ── Reglas de seguridad ──────────────────────────────────────────────
 * - El token de HubSpot (HUBSPOT_ACCESS_TOKEN) SOLO puede leerse en código
 *   server-side (Route Handlers, Server Components, Server Actions).
 *   NUNCA debe tener el prefijo NEXT_PUBLIC_ ni llegar al bundle del cliente.
 * - Esta clase, por lo tanto, solo debe instanciarse desde código que corre
 *   en el servidor (ver lib/repositories/index.ts).
 *
 * ── Qué falta implementar cuando conectemos HubSpot ─────────────────
 * 1. Autenticación: usar un Private App Token de HubSpot
 *    (`HUBSPOT_ACCESS_TOKEN`) con scopes de lectura/escritura sobre el
 *    objeto de Tickets (o un objeto custom si se prefiere modelar las
 *    solicitudes de implementación por separado de soporte).
 * 2. Pipeline: los tickets deben vivir en el pipeline identificado por
 *    `HUBSPOT_TICKET_PIPELINE_ID`. Cada TicketStatus de nuestro modelo debe
 *    mapearse a un `stageId` de ese pipeline (mapa status → stageId).
 * 3. Propiedades custom a crear en HubSpot para cubrir el modelo `Ticket`:
 *    - client_id, workstream, impact_area, urgency, priority
 *    - owner (o usar hubspot_owner_id nativo)
 *    - sprint, requested_date, target_date, started_at, completed_at
 *    - dependency, dependency_owner, blocked_reason, blocked_since
 *    - expected_result, final_result, evidence_url
 * 4. listByClient: GET /crm/v3/objects/tickets con un filtro por
 *    `client_id` (search API), paginando con `after`.
 * 5. getById: GET /crm/v3/objects/tickets/{id} con `properties` explícitos.
 * 6. create: POST /crm/v3/objects/tickets, seteando pipeline + stage inicial
 *    (equivalente a "identified") y client_id.
 * 7. Mapeo bidireccional entre las propiedades de HubSpot (snake_case,
 *    strings) y los tipos fuertes de `types/ticket.ts` (fechas ISO,
 *    uniones literales) — recomendado en un módulo `mapper.ts` separado
 *    para no ensuciar esta clase.
 * 8. Manejo de rate limits / reintentos y caché corta (p. ej. revalidate de
 *    Next.js) para no golpear la API en cada render.
 *
 * Mientras esto no esté implementado, `lib/repositories/index.ts` sigue
 * devolviendo MockTicketRepository sin importar el valor de las env vars.
 */
export class HubSpotTicketRepository implements TicketRepository {
  constructor(private readonly accessToken: string, private readonly pipelineId: string) {
    if (!accessToken || !pipelineId) {
      throw new Error(
        "HubSpotTicketRepository requiere HUBSPOT_ACCESS_TOKEN y HUBSPOT_TICKET_PIPELINE_ID configurados server-side."
      );
    }
  }

  async listByClient(_clientId: string): Promise<Ticket[]> {
    throw new Error("HubSpotTicketRepository.listByClient no está implementado todavía.");
  }

  async getById(_clientId: string, _ticketId: string): Promise<Ticket | null> {
    throw new Error("HubSpotTicketRepository.getById no está implementado todavía.");
  }

  async create(_clientId: string, _input: NewTicketInput): Promise<Ticket> {
    throw new Error("HubSpotTicketRepository.create no está implementado todavía.");
  }
}
