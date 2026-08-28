import { STATUS_CONFIG } from "@/config/status";
import type { Ticket, TicketStatus, Workstream } from "@/types/ticket";
import { WORKSTREAMS } from "@/types/ticket";

export interface DashboardKpis {
  total: number;
  inProgress: number;
  inValidation: number;
  blocked: number;
  completed: number;
  sprintCompliance: number | null;
}

/**
 * KPIs del "Centro de implementación". Todo se deriva de la lista de
 * tickets recibida — nunca hardcodear estos números.
 */
export function computeDashboardKpis(tickets: Ticket[], currentSprintName?: string): DashboardKpis {
  const total = tickets.length;
  const inProgress = tickets.filter((t) => t.status === "in_progress").length;
  const inValidation = tickets.filter(
    (t) => t.status === "triario_qa" || t.status === "cosmo_validation"
  ).length;
  const blocked = tickets.filter((t) => t.status === "blocked").length;
  const completed = tickets.filter((t) => t.status === "completed").length;

  let sprintCompliance: number | null = null;
  if (currentSprintName) {
    const committed = tickets.filter((t) => t.sprint === currentSprintName);
    if (committed.length > 0) {
      const done = committed.filter((t) => t.status === "completed").length;
      sprintCompliance = Math.round((done / committed.length) * 100);
    }
  }

  return { total, inProgress, inValidation, blocked, completed, sprintCompliance };
}

export interface StatusDistributionItem {
  status: TicketStatus;
  label: string;
  count: number;
}

export function computeStatusDistribution(tickets: Ticket[]): StatusDistributionItem[] {
  return (Object.keys(STATUS_CONFIG) as TicketStatus[]).map((status) => ({
    status,
    label: STATUS_CONFIG[status].label,
    count: tickets.filter((t) => t.status === status).length,
  }));
}

export interface WorkstreamDistributionItem {
  workstream: Workstream;
  count: number;
}

export function computeWorkstreamDistribution(tickets: Ticket[]): WorkstreamDistributionItem[] {
  return WORKSTREAMS.map((workstream) => ({
    workstream,
    count: tickets.filter((t) => t.workstream === workstream).length,
  })).filter((item) => item.count > 0);
}

const ACTIVE_WORK_STATUSES: TicketStatus[] = [
  "prioritized",
  "in_progress",
  "triario_qa",
  "cosmo_validation",
  "blocked",
];

export function selectActiveWork(tickets: Ticket[]): Ticket[] {
  return tickets
    .filter((t) => ACTIVE_WORK_STATUSES.includes(t.status))
    .sort((a, b) => STATUS_CONFIG[a.status].order - STATUS_CONFIG[b.status].order);
}

export function selectBlockedTickets(tickets: Ticket[]): Ticket[] {
  return tickets
    .filter((t) => t.status === "blocked" && t.blockedSince)
    .sort((a, b) => (a.blockedSince! < b.blockedSince! ? -1 : 1));
}
