export const STAGES = [
  { key: "nuevo", label: "Nuevo", color: "#64748b" },
  { key: "en_revision", label: "En revisión", color: "#a855f7" },
  { key: "en_progreso", label: "En progreso", color: "#3b5bfd" },
  { key: "en_pruebas", label: "En pruebas", color: "#f59e0b" },
  { key: "completado", label: "Completado", color: "#16a34a" },
  { key: "rechazado", label: "Rechazado", color: "#dc2626" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export const STAGE_KEYS = STAGES.map((s) => s.key) as StageKey[];

export const TIPOS = [
  { key: "ajuste_escala", label: "Ajuste de automatización Escala" },
  { key: "otro", label: "Otra solicitud del proceso" },
] as const;

export type TipoKey = (typeof TIPOS)[number]["key"];

export const PRIORIDADES = [
  { key: "baja", label: "Baja", color: "#64748b" },
  { key: "media", label: "Media", color: "#3b5bfd" },
  { key: "alta", label: "Alta", color: "#f59e0b" },
  { key: "urgente", label: "Urgente", color: "#dc2626" },
] as const;

export type PrioridadKey = (typeof PRIORIDADES)[number]["key"];

export interface Ticket {
  id: number;
  folio: string;
  titulo: string;
  descripcion: string;
  tipo: TipoKey;
  prioridad: PrioridadKey;
  solicitante_nombre: string;
  solicitante_email: string;
  area: string | null;
  stage: StageKey;
  created_at: string;
  updated_at: string;
}

export interface StageHistoryEntry {
  id: number;
  ticket_id: number;
  from_stage: StageKey | null;
  to_stage: StageKey;
  changed_by: string | null;
  comment: string | null;
  created_at: string;
}

export function stageLabel(key: string): string {
  return STAGES.find((s) => s.key === key)?.label ?? key;
}

export function stageColor(key: string): string {
  return STAGES.find((s) => s.key === key)?.color ?? "#64748b";
}

export function tipoLabel(key: string): string {
  return TIPOS.find((t) => t.key === key)?.label ?? key;
}

export function prioridadLabel(key: string): string {
  return PRIORIDADES.find((p) => p.key === key)?.label ?? key;
}

export function prioridadColor(key: string): string {
  return PRIORIDADES.find((p) => p.key === key)?.color ?? "#64748b";
}
