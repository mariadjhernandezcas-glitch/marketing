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

async function syncDeals(): Promise<number> {
  const sql = await getSqlReady();
  const since = await getSyncCursor("deals_since");
  let maxModified = since;
  let count = 0;

  await scrollDeals(since, async (deals: EscalaDeal[]) => {
    for (const deal of deals) {
      count += 1;
      const existing = (await sql`
        SELECT stage_id FROM escala_deals WHERE id = ${deal.id}
      `) as { stage_id: string | null }[];

      const contactName = [deal.contact?.firstName, deal.contact?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      const createdAt = toDate(deal.created);
      const modifiedAt = toDate(deal.modified);
      const newStageId = deal.pipeline?.stageId ?? null;

      await sql`
        INSERT INTO escala_deals (
          id, name, assigned_to, contact_id, contact_name, contact_email, contact_phone,
          pipeline_id, pipeline_name, stage_id, stage_type, value,
          escala_created_at, escala_modified_at, synced_at
        ) VALUES (
          ${deal.id}, ${deal.name}, ${deal.assignedTo || "unassigned"},
          ${deal.contact?.id ?? null}, ${contactName || null}, ${deal.contact?.email ?? null},
          ${deal.contact?.phone ?? null}, ${deal.pipeline?.id ?? null}, ${deal.pipeline?.name ?? null},
          ${newStageId}, ${deal.pipeline?.stageType ?? null}, ${deal.value ?? null},
          ${createdAt}, ${modifiedAt}, now()
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

      const previousStageId = existing[0]?.stage_id ?? null;
      const isNewDeal = existing.length === 0;
      // Only log an event for a change we actually observed between two syncs.
      // A deal seen for the first time has no known prior stage (it may have
      // existed in Escala for a long time before we started tracking it), so
      // recording a synthetic "first" event here would fabricate history and
      // skew the time-to-first-move / time-to-close averages below.
      if (!isNewDeal && newStageId && previousStageId !== newStageId) {
        await sql`
          INSERT INTO escala_deal_stage_events (deal_id, from_stage_id, to_stage_id, stage_type, changed_at)
          VALUES (
            ${deal.id}, ${previousStageId}, ${newStageId},
            ${deal.pipeline?.stageType ?? null}, ${modifiedAt ?? createdAt ?? new Date()}
          )
        `;
      }

      if (!maxModified || (deal.modified && deal.modified > maxModified)) {
        maxModified = deal.modified;
      }
    }
  });

  if (maxModified) await setSyncCursor("deals_since", maxModified);
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
  deals: number;
  activities: number;
  activitiesError: string | null;
}

export async function syncEscala(): Promise<SyncResult> {
  const pipelines = await syncPipelines();
  const deals = await syncDeals();

  // Negocios y pipelines son el núcleo del dashboard; si la búsqueda de
  // actividades de Escala falla (p. ej. error 500 del lado de Escala en
  // cuentas sin actividades aún, o con un historial muy grande), no debe
  // tumbar la sincronización completa — el dashboard sigue siendo útil
  // sin la lista de "últimas gestiones".
  let activities = 0;
  let activitiesError: string | null = null;
  try {
    activities = await syncActivities();
  } catch (error) {
    activitiesError = error instanceof Error ? error.message : "Error desconocido";
  }

  return { pipelines, deals, activities, activitiesError };
}

export interface AdvisorOption {
  email: string;
  dealCount: number;
}

export async function listAdvisors(): Promise<AdvisorOption[]> {
  const sql = await getSqlReady();
  const rows = (await sql`
    SELECT assigned_to AS email, COUNT(*)::int AS "dealCount"
    FROM escala_deals
    WHERE assigned_to <> 'unassigned'
    GROUP BY assigned_to
    ORDER BY "dealCount" DESC
  `) as AdvisorOption[];
  return rows;
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

export interface DashboardMetrics {
  totalDeals: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalOpenValue: number;
  conversionRate: number | null;
  avgHoursToFirstMove: number | null;
  avgDaysToClose: number | null;
  stageBreakdown: StageBreakdown[];
  recentDeals: DealRow[];
  staleDeals: DealRow[];
  recentActivities: {
    id: string;
    title: string | null;
    type: string | null;
    status: string | null;
    contact_name: string | null;
    start_at: string | null;
  }[];
}

const STALE_AFTER_DAYS = 5;

export async function getDashboardMetrics(advisorEmail: string): Promise<DashboardMetrics> {
  const sql = await getSqlReady();

  const counts = (await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE stage_type = 'open')::int AS open,
      COUNT(*) FILTER (WHERE stage_type = 'won')::int AS won,
      COUNT(*) FILTER (WHERE stage_type = 'lost')::int AS lost,
      COALESCE(SUM(value) FILTER (WHERE stage_type = 'open'), 0)::float AS "openValue"
    FROM escala_deals
    WHERE assigned_to = ${advisorEmail}
  `) as { total: number; open: number; won: number; lost: number; openValue: number }[];
  const c = counts[0];

  const pipelineRows = (await sql`
    SELECT stages FROM escala_pipelines WHERE is_default = true ORDER BY synced_at DESC LIMIT 1
  `) as { stages: PipelineStage[] }[];
  const fallbackPipeline = (await sql`
    SELECT stages FROM escala_pipelines ORDER BY synced_at DESC LIMIT 1
  `) as { stages: PipelineStage[] }[];
  const stages: PipelineStage[] = pipelineRows[0]?.stages ?? fallbackPipeline[0]?.stages ?? [];

  const stageCounts = (await sql`
    SELECT stage_id, COUNT(*)::int AS count, COALESCE(SUM(value), 0)::float AS value
    FROM escala_deals
    WHERE assigned_to = ${advisorEmail} AND stage_type = 'open'
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

  const firstMoveRows = (await sql`
    SELECT AVG(EXTRACT(EPOCH FROM (e.changed_at - d.escala_created_at)) / 3600)::float AS avg_hours
    FROM (
      SELECT DISTINCT ON (deal_id) deal_id, changed_at
      FROM escala_deal_stage_events
      ORDER BY deal_id, changed_at ASC
    ) e
    JOIN escala_deals d ON d.id = e.deal_id
    WHERE d.assigned_to = ${advisorEmail} AND d.escala_created_at IS NOT NULL
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
    WHERE d.assigned_to = ${advisorEmail} AND d.escala_created_at IS NOT NULL
  `) as { avg_days: number | null }[];

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
    WHERE d.assigned_to = ${advisorEmail}
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
    WHERE d.assigned_to = ${advisorEmail} AND d.stage_type = 'open'
    GROUP BY d.id
    HAVING now() - GREATEST(d.escala_modified_at, COALESCE(MAX(a.start_at), d.escala_modified_at))
      > make_interval(days => ${STALE_AFTER_DAYS})
    ORDER BY days_since_activity DESC
    LIMIT 20
  `) as DealRow[];

  const recentActivities = (await sql`
    SELECT id, title, type, status, contact_name, start_at
    FROM escala_activities
    WHERE assigned_to = ${advisorEmail}
    ORDER BY COALESCE(start_at, escala_modified_at) DESC
    LIMIT 15
  `) as DashboardMetrics["recentActivities"];

  const closedTotal = c.won + c.lost;

  return {
    totalDeals: c.total,
    openDeals: c.open,
    wonDeals: c.won,
    lostDeals: c.lost,
    totalOpenValue: c.openValue,
    conversionRate: closedTotal > 0 ? c.won / closedTotal : null,
    avgHoursToFirstMove: firstMoveRows[0]?.avg_hours ?? null,
    avgDaysToClose: closeRows[0]?.avg_days ?? null,
    stageBreakdown,
    recentDeals,
    staleDeals,
    recentActivities,
  };
}
