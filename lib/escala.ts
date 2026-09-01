const DEFAULT_BASE_URL = "https://public-api.escala.com/v1/crm";

function getConfig() {
  const apiKey = process.env.ESCALA_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar ESCALA_API_KEY en las variables de entorno.");
  }
  const baseUrl = process.env.ESCALA_API_BASE_URL || DEFAULT_BASE_URL;
  return { apiKey, baseUrl };
}

async function escalaGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const { apiKey, baseUrl } = getConfig();
  const url = new URL(baseUrl.replace(/\/$/, "") + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    headers: { "x-api-key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Escala API ${path} respondió ${res.status}: ${body.slice(0, 500)}`);
  }
  return res.json() as Promise<T>;
}

export interface EscalaStage {
  id: string;
  name: string;
  type: "open" | "won" | "lost";
  color?: string;
}

export interface EscalaPipeline {
  id: string;
  name: string;
  default?: boolean;
  stages: EscalaStage[];
  created?: string;
  modified?: string;
}

export interface EscalaDealContact {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface EscalaDealPipelineRef {
  id?: string;
  name?: string;
  stageId?: string;
  stageType?: "open" | "won" | "lost";
}

export interface EscalaDeal {
  id: string;
  name: string;
  assignedTo: string;
  contact?: EscalaDealContact;
  pipeline?: EscalaDealPipelineRef;
  value?: number;
  created: string;
  modified: string;
}

export interface EscalaActivity {
  id: string;
  title: string;
  type: string;
  status: "pending" | "completed" | "discarded";
  startAt?: string;
  endAt?: string;
  dealId?: string;
  assignedTo?: string;
  contact?: { id?: string; firstName?: string; lastName?: string };
  created?: string;
  modified?: string;
}

// The published spec doesn't model a scrollId field on the scroll response body,
// but the /deals/scroll and /contacts/scroll endpoints require one to page past
// the first call, so we read it defensively under either likely key.
interface ScrollResponse<T> {
  items: T[];
  scrollId?: string;
  nextScrollId?: string;
  total?: number;
}

function nextScrollId<T>(res: ScrollResponse<T>): string | undefined {
  return res.scrollId || res.nextScrollId;
}

export async function fetchAllPipelines(): Promise<EscalaPipeline[]> {
  const pipelines: EscalaPipeline[] = [];
  let page = 0;
  const size = 100;
  for (;;) {
    const res = await escalaGet<{ items: EscalaPipeline[]; total: number }>("/pipelines", {
      page,
      size,
    });
    pipelines.push(...res.items);
    if (res.items.length < size || pipelines.length >= (res.total ?? pipelines.length)) break;
    page += 1;
  }
  return pipelines;
}

export async function scrollDeals(
  since: string | undefined,
  onPage: (deals: EscalaDeal[]) => Promise<void>
): Promise<void> {
  let scrollId: string | undefined;
  const size = 200;
  for (let iterations = 0; iterations < 500; iterations += 1) {
    const res = await escalaGet<ScrollResponse<EscalaDeal>>("/deals/scroll", {
      since,
      size,
      scrollId,
    });
    if (!res.items.length) break;
    await onPage(res.items);
    scrollId = nextScrollId(res);
    if (!scrollId || res.items.length < size) break;
  }
}

// /activities only supports page-based search (no scroll endpoint), so this
// pages through it directly instead of using a scroll cursor.
export async function fetchActivitiesSince(
  since: string | undefined,
  assignedTo: string | undefined,
  onPage: (activities: EscalaActivity[]) => Promise<void>
): Promise<void> {
  let page = 0;
  const size = 200;
  for (;;) {
    const res = await escalaGet<{ items: EscalaActivity[]; total: number }>("/activities", {
      since,
      assignedTo,
      page,
      size,
    });
    if (!res.items.length) break;
    await onPage(res.items);
    if (res.items.length < size) break;
    page += 1;
  }
}
