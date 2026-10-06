import { getSqlReady } from "./db";
import {
  EscalaActivity,
  EscalaDeal,
  fetchActivitiesSince,
  fetchAllPipelines,
  scrollDeals,
} from "./escala";

function toDate(value: string | undefined): Date | null {
  if (!value) return null;
  // Escala returns naive "yyyy-MM-ddThh:mm:ss" timestamps documented as UTC.
  const iso = /Z|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function getSyncCursor(key: string): Promise<string | undefined> {
  const sql = await getSqlReady();
  const rows = (await sql`SELECT value FROM escala_sync_state WHERE key = ${key}`) as {
    value: string;
  }[];
  return rows[0]?.value;
}

async function setSyncCursor(key: string, value: string): Promise<void> {
  const sql = await getSqlReady();
  await sql`
    INSERT INTO escala_sync_state (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
}

async function syncPipelines(): Promise<number> {
  const sql = await getSqlReady();
  const pipelines = await fetchAllPipelines();
  for (const pipeline of pipelines) {
    await sql`
      INSERT INTO escala_pipelines (id, name, is_default, stages, synced_at)
      VALUES (${pipeline.id}, ${pipeline.name}, ${pipeline.default ?? false}, ${JSON.stringify(pipeline.stages)}, now())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        is_default = EXCLUDED.is_default,
        stages = EXCLUDED.stages,
        synced_at = now()
    `;
  }
  return pipelines.length;
}

// Siempre trae el historial completo de negocios (sin filtro de fecha): el
// endpoint incremental de Escala (/deals/scroll?since=...) demostró ser poco
// confiable (500 intermitentes) y, más importante, es la única forma de
// garantizar que el dashboard no se desincronice silenciosamente de Escala.
// Para que una cuenta con miles de negocios no exceda el tiempo límite de la
// función serverless, cada página de 200 negocios se escribe en lote (una
// consulta para ver qué ya existía + un solo INSERT múltiple) en vez de
// fila por fila.
async function syncDeals(): Promise<number> {
  const sql = await getSqlReady();
  let count = 0;

  const onPage = async (deals: EscalaDeal[]) => {
    if (deals.length === 0) return;
    count += deals.length;

    const ids = deals.map((d) => d.id);
    const existingRows = (await sql`
      SELECT id, stage_id FROM escala_deals WHERE id = ANY(${ids})
    `) as { id: string; stage_id: string | null }[];
    const existingStageById = new Map(existingRows.map((r) => [r.id, r.stage_id]));
    const existingIds = new Set(existingRows.map((r) => r.id));

    const rows = deals.map((deal) => {
      const contactName = [deal.contact?.firstName, deal.contact?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      const createdAt = toDate(deal.created);
      const modifiedAt = toDate(deal.modified);
      const newStageId = deal.pipeline?.stageId ?? null;
      return {
        id: deal.id,
        name: deal.name,
        assigned_to: deal.assignedTo || "unassigned",
        contact_id: deal.contact?.id ?? null,
        contact_name: contactName || null,
        contact_email: deal.contact?.email ?? null,
        contact_phone: deal.contact?.phone ?? null,
        pipeline_id: deal.pipeline?.id ?? null,
        pipeline_name: deal.pipeline?.name ?? null,
        stage_id: newStageId,
        stage_type: deal.pipeline?.stageType ?? null,
        value: deal.value ?? null,
        escala_created_at: createdAt ? createdAt.toISOString() : null,
        escala_modified_at: modifiedAt ? modifiedAt.toISOString() : null,
      };
    });

    await sql`
      INSERT INTO escala_deals (
        id, name, assigned_to, contact_id, contact_name, contact_email, contact_phone,
        pipeline_id, pipeline_name, stage_id, stage_type, value,
        escala_created_at, escala_modified_at, synced_at
      )
      SELECT
        id, name, assigned_to, contact_id, contact_name, contact_email, contact_phone,
        pipeline_id, pipeline_name, stage_id, stage_type, value,
        escala_created_at::timestamptz, escala_modified_at::timestamptz, now()
      FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS t(
        id text, name text, assigned_to text, contact_id text, contact_name text,
        contact_email text, contact_phone text, pipeline_id text, pipeline_name text,
        stage_id text, stage_type text, value numeric,
        escala_created_at text, escala_modified_at text
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        assigned_to = EXCLUDED.assigned_to,
        contact_id = EXCLUDED.contact_id,
        contact_name = EXCLUDED.contact_name,
        contact_email = EXCLUDED.contact_email,
        contact_phone = EXCLUDED.contact_phone,
        pipeline_id = EXCLUDED.pipeline_id,
        pipeline_name = EXCLUDED.pipeline_name,
        stage_id = EXCLUDED.stage_id,
        stage_type = EXCLUDED.stage_type,
        value = EXCLUDED.value,
        escala_created_at = EXCLUDED.escala_created_at,
        escala_modified_at = EXCLUDED.escala_modified_at,
        synced_at = now()
    `;

    // Solo registra un evento para un cambio de etapa que sí observamos entre
    // dos sincronizaciones. Un negocio visto por primera vez no tiene etapa
    // previa conocida (puede llevar tiempo existiendo en Escala desde antes
    // de que empezáramos a sincronizar), así que inventar un evento "inicial"
    // aquí falsearía el historial y distorsionaría los tiempos de gestión.
    for (const deal of deals) {
      const newStageId = deal.pipeline?.stageId ?? null;
      if (!existingIds.has(deal.id) || !newStageId) continue;
      const previousStageId = existingStageById.get(deal.id) ?? null;
      if (previousStageId === newStageId) continue;
      const createdAt = toDate(deal.created);
      const modifiedAt = toDate(deal.modified);
      await sql`
        INSERT INTO escala_deal_stage_events (deal_id, from_stage_id, to_stage_id, stage_type, changed_at)
        VALUES (
          ${deal.id}, ${previousStageId}, ${newStageId},
          ${deal.pipeline?.stageType ?? null}, ${modifiedAt ?? createdAt ?? new Date()}
        )
      `;
    }

    // Respaldo para negocios ganados/perdidos que nunca tuvieron un evento de
    // etapa registrado: la regla de arriba (no fabricar un evento "inicial"
    // al ver un negocio por primera vez) deja sin fecha de cierre a todo lo
    // que ya estaba ganado/perdido antes de que empezáramos a sincronizar, o
    // a lo que entró a la cuenta durante una sincronización incremental
    // anterior. Como la sincronización ahora siempre trae el historial
    // completo, cada negocio ganado/perdido pasa por aquí tarde o temprano,
    // así que esto rellena el hueco usando la fecha de modificación de
    // Escala (la mejor aproximación disponible a la fecha real de cierre) sin
    // duplicar el evento ya insertado arriba cuando sí hubo un cambio real.
    await sql`
      INSERT INTO escala_deal_stage_events (deal_id, from_stage_id, to_stage_id, stage_type, changed_at)
      SELECT d.id, NULL, d.stage_id, d.stage_type, COALESCE(d.escala_modified_at, d.escala_created_at, now())
      FROM escala_deals d
      WHERE d.id = ANY(${ids})
        AND d.stage_type IN ('won', 'lost')
        AND NOT EXISTS (
          SELECT 1 FROM escala_deal_stage_events e
          WHERE e.deal_id = d.id AND e.to_stage_id = d.stage_id
        )
    `;
  };

  await scrollDeals(undefined, onPage);
  return count;
}

async function syncActivities(): Promise<number> {
  const sql = await getSqlReady();
  const since = await getSyncCursor("activities_since");
  let maxModified = since;
  let count = 0;

  await fetchActivitiesSince(since, undefined, async (activities: EscalaActivity[]) => {
    for (const activity of activities) {
      count += 1;
      const contactName = [activity.contact?.firstName, activity.contact?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      await sql`
        INSERT INTO escala_activities (
          id, deal_id, contact_id, contact_name, assigned_to, type, status, title,
          start_at, escala_modified_at, synced_at
        ) VALUES (
          ${activity.id}, ${activity.dealId ?? null}, ${activity.contact?.id ?? null},
          ${contactName || null}, ${activity.assignedTo ?? "unassigned"}, ${activity.type ?? null},
          ${activity.status ?? null}, ${activity.title ?? null}, ${toDate(activity.startAt)},
          ${toDate(activity.modified)}, now()
        )
        ON CONFLICT (id) DO UPDATE SET
          deal_id = EXCLUDED.deal_id,
          contact_id = EXCLUDED.contact_id,
          contact_name = EXCLUDED.contact_name,
          assigned_to = EXCLUDED.assigned_to,
          type = EXCLUDED.type,
          status = EXCLUDED.status,
          title = EXCLUDED.title,
          start_at = EXCLUDED.start_at,
          escala_modified_at = EXCLUDED.escala_modified_at,
          synced_at = now()
      `;

      if (activity.modified && (!maxModified || activity.modified > maxModified)) {
        maxModified = activity.modified;
      }
    }
  });

  if (maxModified) await setSyncCursor("activities_since", maxModified);
  return count;
}

export interface SyncResult {
  pipelines: number;
  pipelinesError: string | null;
  deals: number;
  dealsError: string | null;
}

async function runSyncStep(step: () => Promise<number>): Promise<{ count: number; error: string | null }> {
  try {
    return { count: await step(), error: null };
  } catch (error) {
    return { count: 0, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}

// La API de Escala puede responder 500 en un endpoint puntual (p. ej. un
// error interno de su servicio de búsqueda) sin que eso signifique que
// toda la cuenta esté mal configurada. Cada recurso se sincroniza de forma
// aislada: un fallo en uno no debe tumbar a los demás ni impedir que el
// dashboard muestre lo que sí se logró traer.
//
// La búsqueda de actividades (/activities) de Escala responde 500 de forma
// consistente para esta cuenta (error interno de su lado), así que no se
// intenta sincronizar — negocios y pipeline son el núcleo del dashboard.
export async function syncEscala(): Promise<SyncResult> {
  const pipelinesResult = await runSyncStep(syncPipelines);
  const dealsResult = await runSyncStep(syncDeals);

  return {
    pipelines: pipelinesResult.count,
    pipelinesError: pipelinesResult.error,
    deals: dealsResult.count,
    dealsError: dealsResult.error,
  };
}

export interface AdvisorOption {
  email: string;
  dealCount: number;
}

export async function listAdvisors(): Promise<AdvisorOption[]> {
  const sql = await getSqlReady();
  const rows = (await sql`
    SELECT assigned_to, COUNT(*)::int AS count
    FROM escala_deals
    GROUP BY assigned_to
    ORDER BY count DESC
  `) as { assigned_to: string; count: number }[];
  return rows
    .filter((row) => row.assigned_to !== "unassigned")
    .map((row) => ({ email: row.assigned_to, dealCount: row.count }));
}

export type PeriodKey = "all" | "this_month" | "last_month";

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  all: "Todo",
  this_month: "Este mes",
  last_month: "Mes pasado",
};

// Rango [start, end) en UTC para el período elegido. `null` significa "sin
// filtro de fecha". El filtro se aplica sobre escala_created_at (fecha en
// que se creó el negocio en Escala).
export function getPeriodRange(period: PeriodKey): { start: Date; end: Date } | null {
  if (period === "all") return null;
  const now = new Date();
  const startOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  if (period === "this_month") {
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return { start: startOfThisMonth, end };
  }
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return { start, end: startOfThisMonth };
}

// Rango [start, end) a partir de dos fechas "yyyy-mm-dd" de un date picker.
// `to` es inclusivo (se le suma un día al límite superior).
export function parseCustomRange(from?: string, to?: string): { start: Date; end: Date } | null {
  if (!from || !to) return null;
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export interface PipelineStage {
  id: string;
  name: string;
  type: "open" | "won" | "lost";
  color?: string;
}

export interface StageBreakdown extends PipelineStage {
  count: number;
  value: number;
}

export interface DealRow {
  id: string;
  name: string;
  contact_name: string | null;
  stage_id: string | null;
  stage_type: string | null;
  value: number | null;
  escala_created_at: string | null;
  escala_modified_at: string | null;
  last_activity_at: string | null;
  days_since_activity: number | null;
}

export interface StageTiming {
  stage_id: string;
  name: string;
  color?: string;
  dealCount: number;
  avgDays: number | null;
}

export interface AdvisorSummary {
  email: string;
  total: number;
  open: number;
  won: number;
  lost: number;
  openValue: number;
  conversionRate: number | null;
  avgDaysToClose: number | null;
}

export interface DashboardMetrics {
  totalDeals: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalOpenValue: number;
  totalLostValue: number;
  conversionRate: number | null;
  avgHoursToFirstMove: number | null;
  avgDaysToClose: number | null;
  stageBreakdown: StageBreakdown[];
  lostBreakdown: StageBreakdown[];
  stageTimings: StageTiming[];
  recentDeals: DealRow[];
  staleDeals: DealRow[];
  lostDealsList: DealRow[];
}

const STALE_AFTER_DAYS = 5;

export interface DateRange {
  start: Date;
  end: Date;
}

// El filtro de fecha se aplica sobre la fecha relevante de cada cosa: para
// negocios abiertos y pipeline nuevo, la fecha de creación en Escala; para
// ganados/perdidos, la fecha en que se movieron a esa etapa (no cuándo se
// creó el negocio) — así "este mes" muestra lo que realmente se cerró ese
// mes, sin importar cuándo se había abierto la oportunidad.
export async function getDashboardMetrics(
  advisorEmail: string | null,
  range: DateRange | null = null
): Promise<DashboardMetrics> {
  const sql = await getSqlReady();
  const start = range?.start ?? null;
  const end = range?.end ?? null;

  const createdCounts = (await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE stage_type = 'open')::int AS open,
      COALESCE(SUM(value) FILTER (WHERE stage_type = 'open'), 0)::float AS "openValue"
    FROM escala_deals
    WHERE assigned_to <> 'unassigned'
      AND (${advisorEmail}::text IS NULL OR assigned_to = ${advisorEmail})
      AND (${start}::timestamptz IS NULL OR escala_created_at >= ${start})
      AND (${end}::timestamptz IS NULL OR escala_created_at < ${end})
  `) as { total: number; open: number; openValue: number }[];

  const closedCounts = (await sql`
    SELECT
      COUNT(*) FILTER (WHERE d.stage_type = 'won')::int AS won,
      COUNT(*) FILTER (WHERE d.stage_type = 'lost')::int AS lost,
      COALESCE(SUM(d.value) FILTER (WHERE d.stage_type = 'lost'), 0)::float AS "lostValue"
    FROM escala_deals d
    JOIN (
      SELECT DISTINCT ON (deal_id) deal_id, changed_at AS closed_at
      FROM escala_deal_stage_events
      WHERE stage_type IN ('won', 'lost')
      ORDER BY deal_id, changed_at DESC
    ) e ON e.deal_id = d.id
    WHERE d.assigned_to <> 'unassigned' AND d.stage_type IN ('won', 'lost')
      AND (${advisorEmail}::text IS NULL OR d.assigned_to = ${advisorEmail})
      AND (${start}::timestamptz IS NULL OR e.closed_at >= ${start})
      AND (${end}::timestamptz IS NULL OR e.closed_at < ${end})
  `) as { won: number; lost: number; lostValue: number }[];

  const c = { ...createdCounts[0], ...closedCounts[0] };

  const pipelineRows = (await sql`
    SELECT stages FROM escala_pipelines WHERE is_default = true ORDER BY synced_at DESC LIMIT 1
  `) as { stages: PipelineStage[] }[];
  const fallbackPipeline = (await sql`
    SELECT stages FROM escala_pipelines ORDER BY synced_at DESC LIMIT 1
  `) as { stages: PipelineStage[] }[];
  const stages: PipelineStage[] = pipelineRows[0]?.stages ?? fallbackPipeline[0]?.stages ?? [];
  const stageById = new Map(stages.map((s) => [s.id, s]));

  const stageCounts = (await sql`
    SELECT stage_id, COUNT(*)::int AS count, COALESCE(SUM(value), 0)::float AS value
    FROM escala_deals
    WHERE assigned_to <> 'unassigned' AND stage_type = 'open'
      AND (${advisorEmail}::text IS NULL OR assigned_to = ${advisorEmail})
      AND (${start}::timestamptz IS NULL OR escala_created_at >= ${start})
      AND (${end}::timestamptz IS NULL OR escala_created_at < ${end})
    GROUP BY stage_id
  `) as { stage_id: string; count: number; value: number }[];
  const stageCountMap = new Map(stageCounts.map((r) => [r.stage_id, r]));

  const stageBreakdown: StageBreakdown[] = stages
    .filter((s) => s.type === "open")
    .map((stage) => ({
      ...stage,
      count: stageCountMap.get(stage.id)?.count ?? 0,
      value: stageCountMap.get(stage.id)?.value ?? 0,
    }));

  const lostCounts = (await sql`
    SELECT d.stage_id, COUNT(*)::int AS count, COALESCE(SUM(d.value), 0)::float AS value
    FROM escala_deals d
    JOIN (
      SELECT DISTINCT ON (deal_id) deal_id, changed_at AS closed_at
      FROM escala_deal_stage_events
      WHERE stage_type IN ('won', 'lost')
      ORDER BY deal_id, changed_at DESC
    ) e ON e.deal_id = d.id
    WHERE d.assigned_to <> 'unassigned' AND d.stage_type = 'lost'
      AND (${advisorEmail}::text IS NULL OR d.assigned_to = ${advisorEmail})
      AND (${start}::timestamptz IS NULL OR e.closed_at >= ${start})
      AND (${end}::timestamptz IS NULL OR e.closed_at < ${end})
    GROUP BY d.stage_id
  `) as { stage_id: string; count: number; value: number }[];
  const lostBreakdown: StageBreakdown[] = lostCounts.map((row) => {
    const stage = stageById.get(row.stage_id);
    return {
      id: row.stage_id,
      name: stage?.name ?? row.stage_id ?? "Sin etapa",
      type: "lost",
      color: stage?.color ?? "#dc2626",
      count: row.count,
      value: row.value,
    };
  });

  const firstMoveRows = (await sql`
    SELECT AVG(EXTRACT(EPOCH FROM (e.changed_at - d.escala_created_at)) / 3600)::float AS avg_hours
    FROM (
      SELECT DISTINCT ON (deal_id) deal_id, changed_at
      FROM escala_deal_stage_events
      ORDER BY deal_id, changed_at ASC
    ) e
    JOIN escala_deals d ON d.id = e.deal_id
    WHERE d.assigned_to <> 'unassigned' AND d.escala_created_at IS NOT NULL
      AND (${advisorEmail}::text IS NULL OR d.assigned_to = ${advisorEmail})
      AND (${start}::timestamptz IS NULL OR d.escala_created_at >= ${start})
      AND (${end}::timestamptz IS NULL OR d.escala_created_at < ${end})
  `) as { avg_hours: number | null }[];

  const closeRows = (await sql`
    SELECT AVG(EXTRACT(EPOCH FROM (e.changed_at - d.escala_created_at)) / 86400)::float AS avg_days
    FROM (
      SELECT DISTINCT ON (deal_id) deal_id, changed_at
      FROM escala_deal_stage_events
      WHERE stage_type IN ('won', 'lost')
      ORDER BY deal_id, changed_at DESC
    ) e
    JOIN escala_deals d ON d.id = e.deal_id
    WHERE d.assigned_to <> 'unassigned' AND d.escala_created_at IS NOT NULL
      AND (${advisorEmail}::text IS NULL OR d.assigned_to = ${advisorEmail})
      AND (${start}::timestamptz IS NULL OR e.changed_at >= ${start})
      AND (${end}::timestamptz IS NULL OR e.changed_at < ${end})
  `) as { avg_days: number | null }[];

  // Tiempo promedio que un negocio permanece en cada etapa: para cada
  // transición registrada, mide desde que entró a la etapa hasta la
  // siguiente transición (o hasta ahora, si sigue ahí). Solo cubre etapas
  // alcanzadas por una transición observada desde que se activó la
  // sincronización — se vuelve más completo con el tiempo.
  const stageTimingRows = (await sql`
    WITH events AS (
      SELECT
        e.to_stage_id,
        e.changed_at,
        LEAD(e.changed_at) OVER (PARTITION BY e.deal_id ORDER BY e.changed_at) AS next_changed_at
      FROM escala_deal_stage_events e
      JOIN escala_deals d ON d.id = e.deal_id
      WHERE d.assigned_to <> 'unassigned'
        AND (${advisorEmail}::text IS NULL OR d.assigned_to = ${advisorEmail})
        AND (${start}::timestamptz IS NULL OR d.escala_created_at >= ${start})
        AND (${end}::timestamptz IS NULL OR d.escala_created_at < ${end})
    )
    SELECT
      to_stage_id AS stage_id,
      COUNT(*)::int AS deal_count,
      AVG(EXTRACT(EPOCH FROM (COALESCE(next_changed_at, now()) - changed_at)) / 86400)::float AS avg_days
    FROM events
    GROUP BY to_stage_id
  `) as { stage_id: string; deal_count: number; avg_days: number | null }[];
  const stageTimings: StageTiming[] = stageTimingRows.map((row) => {
    const stage = stageById.get(row.stage_id);
    return {
      stage_id: row.stage_id,
      name: stage?.name ?? row.stage_id ?? "Sin etapa",
      color: stage?.color,
      dealCount: row.deal_count,
      avgDays: row.avg_days,
    };
  });

  const recentDeals = (await sql`
    SELECT
      d.id, d.name, d.contact_name, d.stage_id, d.stage_type, d.value,
      d.escala_created_at, d.escala_modified_at,
      GREATEST(d.escala_modified_at, COALESCE(MAX(a.start_at), d.escala_modified_at)) AS last_activity_at,
      EXTRACT(
        DAY FROM now() - GREATEST(d.escala_modified_at, COALESCE(MAX(a.start_at), d.escala_modified_at))
      )::int AS days_since_activity
    FROM escala_deals d
    LEFT JOIN escala_activities a ON a.deal_id = d.id
    WHERE d.assigned_to <> 'unassigned'
      AND (${advisorEmail}::text IS NULL OR d.assigned_to = ${advisorEmail})
      AND (${start}::timestamptz IS NULL OR d.escala_created_at >= ${start})
      AND (${end}::timestamptz IS NULL OR d.escala_created_at < ${end})
    GROUP BY d.id
    ORDER BY d.escala_modified_at DESC
    LIMIT 15
  `) as DealRow[];

  const staleDeals = (await sql`
    SELECT
      d.id, d.name, d.contact_name, d.stage_id, d.stage_type, d.value,
      d.escala_created_at, d.escala_modified_at,
      GREATEST(d.escala_modified_at, COALESCE(MAX(a.start_at), d.escala_modified_at)) AS last_activity_at,
      EXTRACT(
        DAY FROM now() - GREATEST(d.escala_modified_at, COALESCE(MAX(a.start_at), d.escala_modified_at))
      )::int AS days_since_activity
    FROM escala_deals d
    LEFT JOIN escala_activities a ON a.deal_id = d.id
    WHERE d.assigned_to <> 'unassigned' AND d.stage_type = 'open'
      AND (${advisorEmail}::text IS NULL OR d.assigned_to = ${advisorEmail})
      AND (${start}::timestamptz IS NULL OR d.escala_created_at >= ${start})
      AND (${end}::timestamptz IS NULL OR d.escala_created_at < ${end})
    GROUP BY d.id
    HAVING now() - GREATEST(d.escala_modified_at, COALESCE(MAX(a.start_at), d.escala_modified_at))
      > make_interval(days => ${STALE_AFTER_DAYS})
    ORDER BY days_since_activity DESC
    LIMIT 20
  `) as DealRow[];

  const lostDealsList = (await sql`
    SELECT
      d.id, d.name, d.contact_name, d.stage_id, d.stage_type, d.value,
      d.escala_created_at, d.escala_modified_at,
      GREATEST(d.escala_modified_at, COALESCE(MAX(a.start_at), d.escala_modified_at)) AS last_activity_at,
      EXTRACT(
        DAY FROM now() - GREATEST(d.escala_modified_at, COALESCE(MAX(a.start_at), d.escala_modified_at))
      )::int AS days_since_activity
    FROM escala_deals d
    LEFT JOIN escala_activities a ON a.deal_id = d.id
    JOIN (
      SELECT DISTINCT ON (deal_id) deal_id, changed_at AS closed_at
      FROM escala_deal_stage_events
      WHERE stage_type IN ('won', 'lost')
      ORDER BY deal_id, changed_at DESC
    ) e ON e.deal_id = d.id
    WHERE d.assigned_to <> 'unassigned' AND d.stage_type = 'lost'
      AND (${advisorEmail}::text IS NULL OR d.assigned_to = ${advisorEmail})
      AND (${start}::timestamptz IS NULL OR e.closed_at >= ${start})
      AND (${end}::timestamptz IS NULL OR e.closed_at < ${end})
    GROUP BY d.id
    ORDER BY d.escala_modified_at DESC
    LIMIT 20
  `) as DealRow[];

  const closedTotal = c.won + c.lost;

  return {
    totalDeals: c.total,
    openDeals: c.open,
    wonDeals: c.won,
    lostDeals: c.lost,
    totalOpenValue: c.openValue,
    totalLostValue: c.lostValue,
    conversionRate: closedTotal > 0 ? c.won / closedTotal : null,
    avgHoursToFirstMove: firstMoveRows[0]?.avg_hours ?? null,
    avgDaysToClose: closeRows[0]?.avg_days ?? null,
    stageBreakdown,
    lostBreakdown,
    stageTimings,
    recentDeals,
    staleDeals,
    lostDealsList,
  };
}

// Resumen de todas las asesoras a la vez, para la vista comparativa. Igual
// que getDashboardMetrics: abiertos por fecha de creación, ganados/perdidos
// por fecha de cierre (cambio a esa etapa).
export async function getAdvisorsOverview(range: DateRange | null = null): Promise<AdvisorSummary[]> {
  const sql = await getSqlReady();
  const start = range?.start ?? null;
  const end = range?.end ?? null;

  const createdCounts = (await sql`
    SELECT
      assigned_to,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE stage_type = 'open')::int AS open,
      COALESCE(SUM(value) FILTER (WHERE stage_type = 'open'), 0)::float AS "openValue"
    FROM escala_deals
    WHERE assigned_to <> 'unassigned'
      AND (${start}::timestamptz IS NULL OR escala_created_at >= ${start})
      AND (${end}::timestamptz IS NULL OR escala_created_at < ${end})
    GROUP BY assigned_to
  `) as { assigned_to: string; total: number; open: number; openValue: number }[];

  const closedCounts = (await sql`
    SELECT
      d.assigned_to,
      COUNT(*) FILTER (WHERE d.stage_type = 'won')::int AS won,
      COUNT(*) FILTER (WHERE d.stage_type = 'lost')::int AS lost,
      AVG(EXTRACT(EPOCH FROM (e.closed_at - d.escala_created_at)) / 86400)::float AS avg_days
    FROM escala_deals d
    JOIN (
      SELECT DISTINCT ON (deal_id) deal_id, changed_at AS closed_at
      FROM escala_deal_stage_events
      WHERE stage_type IN ('won', 'lost')
      ORDER BY deal_id, changed_at DESC
    ) e ON e.deal_id = d.id
    WHERE d.assigned_to <> 'unassigned' AND d.stage_type IN ('won', 'lost') AND d.escala_created_at IS NOT NULL
      AND (${start}::timestamptz IS NULL OR e.closed_at >= ${start})
      AND (${end}::timestamptz IS NULL OR e.closed_at < ${end})
    GROUP BY d.assigned_to
  `) as { assigned_to: string; won: number; lost: number; avg_days: number | null }[];
  const closedMap = new Map(closedCounts.map((r) => [r.assigned_to, r]));

  const emails = new Set([...createdCounts.map((r) => r.assigned_to), ...closedCounts.map((r) => r.assigned_to)]);

  return Array.from(emails)
    .map((email) => {
      const created = createdCounts.find((r) => r.assigned_to === email);
      const closed = closedMap.get(email);
      const won = closed?.won ?? 0;
      const lost = closed?.lost ?? 0;
      const closedTotal = won + lost;
      return {
        email,
        total: created?.total ?? 0,
        open: created?.open ?? 0,
        won,
        lost,
        openValue: created?.openValue ?? 0,
        conversionRate: closedTotal > 0 ? won / closedTotal : null,
        avgDaysToClose: closed?.avg_days ?? null,
      };
    })
    .sort((a, b) => b.total - a.total);
}
