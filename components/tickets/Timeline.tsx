import { Check, Ban } from "lucide-react";
import type { Ticket, TicketStatus } from "@/types/ticket";
import { cn } from "@/lib/utils/cn";

const STEPS = ["Solicitud", "Priorización", "Implementación", "QA Triario", "Validación COSMO", "Completado"];

/** Índice del paso más avanzado alcanzado por el ticket (0-5). */
function furthestStepIndex(status: TicketStatus): number {
  switch (status) {
    case "identified":
    case "to_prioritize":
      return 0;
    case "prioritized":
      return 1;
    case "in_progress":
      return 2;
    case "blocked":
      // Los bloqueos de este portal ocurren durante la implementación.
      return 2;
    case "triario_qa":
      return 3;
    case "cosmo_validation":
      return 4;
    case "completed":
      return 5;
    default:
      return 0;
  }
}

export function Timeline({ ticket }: { ticket: Ticket }) {
  const current = furthestStepIndex(ticket.status);
  const isBlocked = ticket.status === "blocked";

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
      {STEPS.map((step, index) => {
        const done = index < current || (index === current && ticket.status === "completed");
        const isCurrent = index === current && !done;
        return (
          <li key={step} className="relative flex flex-1 items-start gap-3 pb-6 sm:flex-col sm:items-center sm:gap-2 sm:pb-0">
            {index < STEPS.length - 1 ? (
              <span
                className={cn(
                  "absolute left-[15px] top-8 h-full w-px sm:left-1/2 sm:top-[15px] sm:h-px sm:w-full",
                  done ? "bg-emerald-400" : "bg-border"
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                done && "border-emerald-500 bg-emerald-500 text-white",
                isCurrent && !isBlocked && "border-blue-500 bg-blue-50 text-blue-700",
                isCurrent && isBlocked && "border-red-500 bg-red-50 text-red-600",
                !done && !isCurrent && "border-border bg-surface text-ink-faint"
              )}
            >
              {done ? (
                <Check className="h-4 w-4" />
              ) : isCurrent && isBlocked ? (
                <Ban className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                "text-xs font-medium sm:text-center",
                done || isCurrent ? "text-ink" : "text-ink-faint"
              )}
            >
              {step}
              {isCurrent && isBlocked ? <span className="block text-[11px] text-red-600">Bloqueado aquí</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
