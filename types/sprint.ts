export interface Sprint {
  id: string;
  clientId: string;
  name: string;
  startDate: string;
  endDate: string;
  /** true si es el sprint activo actualmente. Solo uno por cliente. */
  isCurrent: boolean;
}

export interface SprintMetrics {
  sprintId: string;
  committed: number;
  completed: number;
  inProgress: number;
  carryOver: number;
  completionRate: number;
}
