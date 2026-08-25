import { getDb } from "./db";
import type { PrioridadKey, StageHistoryEntry, StageKey, Ticket, TipoKey } from "./types";

function nextFolio(): string {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as n FROM tickets").get() as { n: number };
  const seq = row.n + 1;
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

export function createTicket(input: CreateTicketInput): Ticket {
  const db = getDb();
  const folio = nextFolio();

  const insert = db.prepare(`
    INSERT INTO tickets (folio, titulo, descripcion, tipo, prioridad, solicitante_nombre, solicitante_email, area, stage)
    VALUES (@folio, @titulo, @descripcion, @tipo, @prioridad, @solicitante_nombre, @solicitante_email, @area, 'nuevo')
  `);

  const info = insert.run({
    folio,
    titulo: input.titulo,
    descripcion: input.descripcion,
    tipo: input.tipo,
    prioridad: input.prioridad,
    solicitante_nombre: input.solicitante_nombre,
    solicitante_email: input.solicitante_email,
    area: input.area ?? null,
  });

  db.prepare(
    `INSERT INTO stage_history (ticket_id, from_stage, to_stage, changed_by, comment) VALUES (?, NULL, 'nuevo', ?, 'Ticket creado')`
  ).run(info.lastInsertRowid, input.solicitante_nombre);

  return getTicketById(Number(info.lastInsertRowid))!;
}

export function listTickets(): Ticket[] {
  const db = getDb();
  return db.prepare("SELECT * FROM tickets ORDER BY created_at DESC").all() as Ticket[];
}

export function getTicketById(id: number): Ticket | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM tickets WHERE id = ?").get(id) as Ticket | undefined;
}

export function getStageHistory(ticketId: number): StageHistoryEntry[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM stage_history WHERE ticket_id = ? ORDER BY created_at ASC, id ASC")
    .all(ticketId) as StageHistoryEntry[];
}

export interface ChangeStageInput {
  toStage: StageKey;
  changedBy?: string | null;
  comment?: string | null;
}

export function changeStage(
  ticketId: number,
  input: ChangeStageInput
): { ticket: Ticket; entry: StageHistoryEntry } {
  const db = getDb();
  const current = getTicketById(ticketId);
  if (!current) {
    throw new Error("Ticket no encontrado");
  }

  const tx = db.transaction(() => {
    db.prepare("UPDATE tickets SET stage = ?, updated_at = datetime('now') WHERE id = ?").run(
      input.toStage,
      ticketId
    );

    const info = db
      .prepare(
        `INSERT INTO stage_history (ticket_id, from_stage, to_stage, changed_by, comment) VALUES (?, ?, ?, ?, ?)`
      )
      .run(ticketId, current.stage, input.toStage, input.changedBy ?? null, input.comment ?? null);

    return info.lastInsertRowid;
  });

  const entryId = tx();
  const entry = db.prepare("SELECT * FROM stage_history WHERE id = ?").get(entryId) as StageHistoryEntry;
  const ticket = getTicketById(ticketId)!;

  return { ticket, entry };
}
