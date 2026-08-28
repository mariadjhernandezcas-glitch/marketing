import { COSMO_SPRINTS } from "@/data/sprints";
import type { Sprint, SprintMetrics } from "@/types/sprint";
import type { Ticket } from "@/types/ticket";

export function listSprints(clientId: string): Sprint[] {
  if (clientId === "cosmo") return COSMO_SPRINTS;
  return [];
}

export function getCurrentSprint(clientId: string): Sprint | undefined {
  return listSprints(clientId).find((sprint) => sprint.isCurrent);
}

export function computeSprintMetrics(sprint: Sprint, tickets: Ticket[]): SprintMetrics {
  const committedTickets = tickets.filter((t) => t.sprint === sprint.name);
  const committed = committedTickets.length;
  const completed = committedTickets.filter((t) => t.status === "completed").length;
  const inProgress = committedTickets.filter(
    (t) => t.status === "in_progress" || t.status === "triario_qa" || t.status === "cosmo_validation"
  ).length;
  const carryOver = sprint.isCurrent
    ? 0
    : committedTickets.filter((t) => t.status !== "completed").length;

  return {
    sprintId: sprint.id,
    committed,
    completed,
    inProgress,
    carryOver,
    completionRate: committed > 0 ? Math.round((completed / committed) * 100) : 0,
  };
}

export function ticketsForSprint(sprint: Sprint, tickets: Ticket[]): Ticket[] {
  return tickets.filter((t) => t.sprint === sprint.name);
}

export interface SprintEvolutionItem {
  sprintName: string;
  committed: number;
  completed: number;
  carryOver: number;
}

export function computeSprintEvolution(clientId: string, tickets: Ticket[]): SprintEvolutionItem[] {
  return listSprints(clientId).map((sprint) => {
    const metrics = computeSprintMetrics(sprint, tickets);
    return {
      sprintName: sprint.name,
      committed: metrics.committed,
      completed: metrics.completed,
      carryOver: metrics.carryOver,
    };
  });
}
