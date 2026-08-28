import type { Sprint } from "@/types/sprint";

/**
 * Sprints mock para COSMO Schools. Ciclos de 2 semanas.
 * Sprint 131 es el sprint actual (termina hoy, 2026-08-28, para que el
 * dashboard muestre un cumplimiento de sprint "en vivo").
 */
export const COSMO_SPRINTS: Sprint[] = [
  {
    id: "sprint-128",
    clientId: "cosmo",
    name: "Sprint 128",
    startDate: "2026-07-06",
    endDate: "2026-07-17",
    isCurrent: false,
  },
  {
    id: "sprint-129",
    clientId: "cosmo",
    name: "Sprint 129",
    startDate: "2026-07-20",
    endDate: "2026-07-31",
    isCurrent: false,
  },
  {
    id: "sprint-130",
    clientId: "cosmo",
    name: "Sprint 130",
    startDate: "2026-08-03",
    endDate: "2026-08-14",
    isCurrent: false,
  },
  {
    id: "sprint-131",
    clientId: "cosmo",
    name: "Sprint 131",
    startDate: "2026-08-17",
    endDate: "2026-08-28",
    isCurrent: true,
  },
];
