import type { TicketStatus } from "@/types/ticket";

/**
 * Configuración visual centralizada de estados. Cambiar aquí actualiza
 * badges, gráficas y filtros en toda la app de forma consistente.
 */
export interface StatusConfig {
  label: string;
  /** Orden en el flujo de trabajo, usado para el timeline y el sort. */
  order: number;
  badgeClass: string;
  dotClass: string;
}

export const STATUS_CONFIG: Record<TicketStatus, StatusConfig> = {
  identified: {
    label: "Identificado",
    order: 0,
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    dotClass: "bg-zinc-400",
  },
  to_prioritize: {
    label: "Por priorizar",
    order: 1,
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
  },
  prioritized: {
    label: "Priorizado",
    order: 2,
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dotClass: "bg-indigo-500",
  },
  in_progress: {
    label: "En implementación",
    order: 3,
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
  },
  triario_qa: {
    label: "QA Triario",
    order: 4,
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    dotClass: "bg-violet-500",
  },
  cosmo_validation: {
    label: "Validación COSMO",
    order: 5,
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    dotClass: "bg-teal-500",
  },
  blocked: {
    label: "Bloqueado",
    order: 6,
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    dotClass: "bg-red-500",
  },
  completed: {
    label: "Completado",
    order: 7,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
};

export const TIMELINE_STEPS: { status: TicketStatus; label: string }[] = [
  { status: "identified", label: "Solicitud" },
  { status: "prioritized", label: "Priorización" },
  { status: "in_progress", label: "Implementación" },
  { status: "triario_qa", label: "QA Triario" },
  { status: "cosmo_validation", label: "Validación COSMO" },
  { status: "completed", label: "Completado" },
];

const PRIORITY_BADGE: Record<string, string> = {
  Baja: "bg-zinc-100 text-zinc-600 border-zinc-200",
  Media: "bg-sky-50 text-sky-700 border-sky-200",
  Alta: "bg-orange-50 text-orange-700 border-orange-200",
  Crítica: "bg-red-50 text-red-700 border-red-200",
};

export function priorityBadgeClass(priority: string | null | undefined): string {
  if (!priority) return "bg-zinc-100 text-zinc-500 border-zinc-200";
  return PRIORITY_BADGE[priority] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
}

const WORKSTREAM_ACTIVE_STATUSES: TicketStatus[] = [
  "prioritized",
  "in_progress",
  "triario_qa",
  "cosmo_validation",
  "blocked",
];

export function isActiveWorkStatus(status: TicketStatus): boolean {
  return WORKSTREAM_ACTIVE_STATUSES.includes(status);
}
