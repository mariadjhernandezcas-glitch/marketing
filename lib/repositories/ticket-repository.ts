import type { NewTicketInput, Ticket } from "@/types/ticket";

/**
 * Contrato que debe cumplir cualquier fuente de datos de tickets.
 *
 * Todas las páginas y componentes del portal dependen únicamente de esta
 * interfaz (nunca de MockTicketRepository ni de HubSpotTicketRepository
 * directamente), para que cambiar la fuente de datos sea un cambio de una
 * línea en `lib/repositories/index.ts` y no un rediseño de la interfaz.
 */
export interface TicketRepository {
  /** Todos los tickets de un cliente. */
  listByClient(clientId: string): Promise<Ticket[]>;
  /** Un ticket puntual por id, o null si no existe / no pertenece al cliente. */
  getById(clientId: string, ticketId: string): Promise<Ticket | null>;
  /** Crea una nueva solicitud en estado "identified". */
  create(clientId: string, input: NewTicketInput): Promise<Ticket>;
}
