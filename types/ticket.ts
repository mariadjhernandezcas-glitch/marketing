/**
 * Modelo de datos central del portal. Estos tipos son la única fuente de
 * verdad para lo que un "TicketRepository" (mock o HubSpot) debe producir,
 * y para lo que las páginas/componentes consumen. No dupliques estas formas
 * en otros lugares: importa desde aquí.
 */

export type TicketStatus =
  | "identified"
  | "to_prioritize"
  | "prioritized"
  | "in_progress"
  | "triario_qa"
  | "cosmo_validation"
  | "blocked"
  | "completed";

export const TICKET_STATUSES: TicketStatus[] = [
  "identified",
  "to_prioritize",
  "prioritized",
  "in_progress",
  "triario_qa",
  "cosmo_validation",
  "blocked",
  "completed",
];

export type Workstream =
  | "HubSpot"
  | "Automatización"
  | "Datos"
  | "Admisiones"
  | "WhatsApp"
  | "Wompi"
  | "Reportería"
  | "SEO/AEO"
  | "Integraciones";

export const WORKSTREAMS: Workstream[] = [
  "HubSpot",
  "Automatización",
  "Datos",
  "Admisiones",
  "WhatsApp",
  "Wompi",
  "Reportería",
  "SEO/AEO",
  "Integraciones",
];

export type ImpactArea =
  | "Captación"
  | "Conversión"
  | "Operación"
  | "Medición"
  | "Experiencia";

export const IMPACT_AREAS: ImpactArea[] = [
  "Captación",
  "Conversión",
  "Operación",
  "Medición",
  "Experiencia",
];

export type Urgency = "Baja" | "Media" | "Alta" | "Crítica";

export const URGENCY_LEVELS: Urgency[] = ["Baja", "Media", "Alta", "Crítica"];

/** Prioridad asignada tras el proceso de priorización de Triario. */
export type Priority = "Baja" | "Media" | "Alta" | "Crítica";

export const PRIORITY_LEVELS: Priority[] = ["Baja", "Media", "Alta", "Crítica"];

export type RequesterArea = "Marketing" | "Admisiones" | "IT" | "Dirección" | "Otro";

export const REQUESTER_AREAS: RequesterArea[] = [
  "Marketing",
  "Admisiones",
  "IT",
  "Dirección",
  "Otro",
];

/** Quién puede estar generando un bloqueo. */
export type BlockOwner = "Triario" | "COSMO" | "COSMO IT" | "Tercero";

export const BLOCK_OWNERS: BlockOwner[] = ["Triario", "COSMO", "COSMO IT", "Tercero"];

export interface Ticket {
  id: string;
  title: string;
  description: string;

  clientId: string;

  requester: string;
  area: RequesterArea;

  workstream: Workstream;
  impact: ImpactArea;
  priority: Priority | null;
  urgency: Urgency;
  status: TicketStatus;

  owner?: string;
  sprint?: string;

  createdAt: string;
  requestedDate?: string;
  targetDate?: string;
  startedAt?: string;
  completedAt?: string;

  dependency?: string;
  dependencyOwner?: BlockOwner;
  blockedReason?: string;
  blockedSince?: string;

  expectedResult?: string;
  finalResult?: string;

  evidenceUrl?: string;
}

export interface NewTicketInput {
  title: string;
  requester: string;
  area: RequesterArea;
  description: string;
  workstream: Workstream;
  impact: ImpactArea;
  urgency: Urgency;
  requestedDate?: string;
  evidenceUrl?: string;
}
