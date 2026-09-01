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

  await sql(`
    CREATE TABLE IF NOT EXISTS escala_pipelines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT false,
      stages JSONB NOT NULL,
      synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS escala_deals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      assigned_to TEXT NOT NULL DEFAULT 'unassigned',
      contact_id TEXT,
      contact_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      pipeline_id TEXT,
      pipeline_name TEXT,
      stage_id TEXT,
      stage_type TEXT,
      value NUMERIC,
      escala_created_at TIMESTAMPTZ,
      escala_modified_at TIMESTAMPTZ,
      synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await sql(`CREATE INDEX IF NOT EXISTS idx_escala_deals_assigned ON escala_deals(assigned_to)`);
  await sql(`CREATE INDEX IF NOT EXISTS idx_escala_deals_stage_type ON escala_deals(stage_type)`);

  await sql(`
    CREATE TABLE IF NOT EXISTS escala_deal_stage_events (
      id SERIAL PRIMARY KEY,
      deal_id TEXT NOT NULL REFERENCES escala_deals(id) ON DELETE CASCADE,
      from_stage_id TEXT,
      to_stage_id TEXT NOT NULL,
      stage_type TEXT,
      changed_at TIMESTAMPTZ NOT NULL,
      detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await sql(
    `CREATE INDEX IF NOT EXISTS idx_escala_stage_events_deal ON escala_deal_stage_events(deal_id)`
  );

  await sql(`
    CREATE TABLE IF NOT EXISTS escala_activities (
      id TEXT PRIMARY KEY,
      deal_id TEXT,
      contact_id TEXT,
      contact_name TEXT,
      assigned_to TEXT,
      type TEXT,
      status TEXT,
      title TEXT,
      start_at TIMESTAMPTZ,
      escala_modified_at TIMESTAMPTZ,
      synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await sql(`CREATE INDEX IF NOT EXISTS idx_escala_activities_deal ON escala_activities(deal_id)`);
  await sql(
    `CREATE INDEX IF NOT EXISTS idx_escala_activities_assigned ON escala_activities(assigned_to)`
  );

  await sql(`
    CREATE TABLE IF NOT EXISTS escala_sync_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

export async function getSqlReady(): Promise<NeonQueryFunction<false, false>> {
  const sql = getSql();
  if (!global.__ticketsSchemaReady) {
    global.__ticketsSchemaReady = ensureSchema(sql);
  }
  await global.__ticketsSchemaReady;
  return sql;
}
