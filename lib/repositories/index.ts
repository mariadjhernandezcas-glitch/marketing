import { MockTicketRepository } from "./mock-ticket-repository";
import type { TicketRepository } from "./ticket-repository";

/**
 * Punto único de selección de la fuente de datos activa. Hoy siempre
 * devuelve el mock. El día que HubSpotTicketRepository esté implementado,
 * este es el único archivo que debe cambiar para que todo el portal
 * empiece a leer de HubSpot:
 *
 *   const useHubSpot = Boolean(process.env.HUBSPOT_ACCESS_TOKEN);
 *   return useHubSpot
 *     ? new HubSpotTicketRepository(process.env.HUBSPOT_ACCESS_TOKEN!, process.env.HUBSPOT_TICKET_PIPELINE_ID!)
 *     : new MockTicketRepository();
 */
let repository: TicketRepository | null = null;

export function getTicketRepository(): TicketRepository {
  if (!repository) {
    repository = new MockTicketRepository();
  }
  return repository;
}

export type { TicketRepository } from "./ticket-repository";
