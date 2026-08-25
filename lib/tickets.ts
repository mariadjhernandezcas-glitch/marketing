import { getSqlReady } from "./db";
import type { PrioridadKey, StageHistoryEntry, StageKey, Ticket, TipoKey } from "./types";

async function nextFolio(): Promise<string> {
  const sql = await getSqlReady();
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM tickets`) as { n: number }[];
  const seq = rows[0].n + 1;
  return `TCK-${String(seq).padStart(4, "0")}`;
}

export interface CreateTicketInput {
  titulo: string;
  descripcion: string;
  tipo: TipoKey;
  prioridad: PrioridadKey;
  solicitante_nombre: string;
  solicitante_email: string;
  area?: string | null;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const sql = await getSqlReady();
  const folio = await nextFolio();

  const rows = (await sql`
    INSERT INTO tickets (folio, titulo, descripcion, tipo, prioridad, solicitante_nombre, solicitante_email, area, stage)
    VALUES (${folio}, ${input.titulo}, ${input.descripcion}, ${input.tipo}, ${input.prioridad}, ${input.solicitante_nombre}, ${input.solicitante_email}, ${input.area ?? null}, 'nuevo')
    RETURNING *
  `) as Ticket[];
  const ticket = rows[0];

  await sql`
    INSERT INTO stage_history (ticket_id, from_stage, to_stage, changed_by, comment)
    VALUES (${ticket.id}, NULL, 'nuevo', ${input.solicitante_nombre}, 'Ticket creado')
  `;

  return ticket;
}

export async function listTickets(): Promise<Ticket[]> {
  const sql = await getSqlReady();
  return (await sql`SELECT * FROM tickets ORDER BY created_at DESC`) as Ticket[];
}

export async function getTicketById(id: number): Promise<Ticket | undefined> {
  const sql = await getSqlReady();
  const rows = (await sql`SELECT * FROM tickets WHERE id = ${id}`) as Ticket[];
  return rows[0];
}

export async function getStageHistory(ticketId: number): Promise<StageHistoryEntry[]> {
  const sql = await getSqlReady();
  return (await sql`
    SELECT * FROM stage_history WHERE ticket_id = ${ticketId} ORDER BY created_at ASC, id ASC
  `) as StageHistoryEntry[];
}

export interface ChangeStageInput {
  toStage: StageKey;
  changedBy?: string | null;
  comment?: string | null;
}

export async function changeStage(
  ticketId: number,
  input: ChangeStageInput
): Promise<{ ticket: Ticket; entry: StageHistoryEntry }> {
  const sql = await getSqlReady();
  const current = await getTicketById(ticketId);
  if (!current) {
    throw new Error("Ticket no encontrado");
  }

  await sql`UPDATE tickets SET stage = ${input.toStage}, updated_at = now() WHERE id = ${ticketId}`;

  const rows = (await sql`
    INSERT INTO stage_history (ticket_id, from_stage, to_stage, changed_by, comment)
    VALUES (${ticketId}, ${current.stage}, ${input.toStage}, ${input.changedBy ?? null}, ${input.comment ?? null})
    RETURNING *
  `) as StageHistoryEntry[];

  const ticket = (await getTicketById(ticketId))!;
  return { ticket, entry: rows[0] };
}
