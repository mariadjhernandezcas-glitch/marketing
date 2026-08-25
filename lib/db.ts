import { neon, NeonQueryFunction } from "@neondatabase/serverless";

declare global {
  // eslint-disable-next-line no-var
  var __ticketsSql: NeonQueryFunction<false, false> | undefined;
  // eslint-disable-next-line no-var
  var __ticketsSchemaReady: Promise<void> | undefined;
}

function getSql(): NeonQueryFunction<false, false> {
  if (!global.__ticketsSql) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      "";

    if (!connectionString) {
      throw new Error(
        "Falta configurar la base de datos: define DATABASE_URL (o POSTGRES_URL) en las variables de entorno."
      );
    }

    global.__ticketsSql = neon(connectionString);
  }
  return global.__ticketsSql;
}

async function ensureSchema(sql: NeonQueryFunction<false, false>): Promise<void> {
  await sql(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      folio TEXT NOT NULL UNIQUE,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      tipo TEXT NOT NULL,
      prioridad TEXT NOT NULL DEFAULT 'media',
      solicitante_nombre TEXT NOT NULL,
      solicitante_email TEXT NOT NULL,
      area TEXT,
      stage TEXT NOT NULL DEFAULT 'nuevo',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS stage_history (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      from_stage TEXT,
      to_stage TEXT NOT NULL,
      changed_by TEXT,
      comment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await sql(`CREATE INDEX IF NOT EXISTS idx_stage_history_ticket ON stage_history(ticket_id)`);
  await sql(`CREATE INDEX IF NOT EXISTS idx_tickets_stage ON tickets(stage)`);
}

export async function getSqlReady(): Promise<NeonQueryFunction<false, false>> {
  const sql = getSql();
  if (!global.__ticketsSchemaReady) {
    global.__ticketsSchemaReady = ensureSchema(sql);
  }
  await global.__ticketsSchemaReady;
  return sql;
}
