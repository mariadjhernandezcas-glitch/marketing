import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.TICKETS_DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, "tickets.db");

declare global {
  // eslint-disable-next-line no-var
  var __ticketsDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folio TEXT NOT NULL UNIQUE,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      tipo TEXT NOT NULL,
      prioridad TEXT NOT NULL DEFAULT 'media',
      solicitante_nombre TEXT NOT NULL,
      solicitante_email TEXT NOT NULL,
      area TEXT,
      stage TEXT NOT NULL DEFAULT 'nuevo',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stage_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      from_stage TEXT,
      to_stage TEXT NOT NULL,
      changed_by TEXT,
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_stage_history_ticket ON stage_history(ticket_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_stage ON tickets(stage);
  `);

  return db;
}

export function getDb(): Database.Database {
  if (!global.__ticketsDb) {
    global.__ticketsDb = createConnection();
  }
  return global.__ticketsDb;
}
