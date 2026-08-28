import { COSMO_TICKETS } from "@/data/tickets";
import type { NewTicketInput, Ticket } from "@/types/ticket";
import type { TicketRepository } from "./ticket-repository";

/**
 * Almacén en memoria, seedeado con los datos de data/tickets.ts.
 * Vive a nivel de módulo para sobrevivir entre requests dentro de la misma
 * instancia del servidor (suficiente para una demo con datos mock). No es
 * persistencia real: se reinicia en cada cold start / redeploy. Cuando se
 * conecte HubSpot, HubSpotTicketRepository reemplaza esta clase sin que las
 * páginas necesiten cambiar.
 */
const store = new Map<string, Ticket[]>();

function seedClient(clientId: string): Ticket[] {
  if (!store.has(clientId)) {
    const seed = clientId === "cosmo" ? COSMO_TICKETS : [];
    store.set(clientId, seed.map((ticket) => ({ ...ticket })));
  }
  return store.get(clientId)!;
}

let sequence = 200;

export class MockTicketRepository implements TicketRepository {
  async listByClient(clientId: string): Promise<Ticket[]> {
    return seedClient(clientId).slice();
  }

  async getById(clientId: string, ticketId: string): Promise<Ticket | null> {
    const tickets = seedClient(clientId);
    return tickets.find((ticket) => ticket.id === ticketId) ?? null;
  }

  async create(clientId: string, input: NewTicketInput): Promise<Ticket> {
    const tickets = seedClient(clientId);
    const id = `COS-${sequence++}`;
    const ticket: Ticket = {
      id,
      title: input.title,
      description: input.description,
      clientId,
      requester: input.requester,
      area: input.area,
      workstream: input.workstream,
      impact: input.impact,
      priority: null,
      urgency: input.urgency,
      status: "identified",
      createdAt: new Date().toISOString().slice(0, 10),
      requestedDate: input.requestedDate,
      evidenceUrl: input.evidenceUrl,
    };
    tickets.unshift(ticket);
    return ticket;
  }
}
