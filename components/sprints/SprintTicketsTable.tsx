import Link from "next/link";
import type { Ticket } from "@/types/ticket";
import { STATUS_CONFIG } from "@/config/status";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/dates";

export function SprintTicketsTable({ tickets, clientId }: { tickets: Ticket[]; clientId: string }) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        title="Sin solicitudes en este sprint"
        description="Todavía no se han comprometido solicitudes a este sprint."
      />
    );
  }

  const sorted = [...tickets].sort((a, b) => STATUS_CONFIG[a.status].order - STATUS_CONFIG[b.status].order);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-ink-faint">
            <th className="px-5 py-2.5 font-medium">Solicitud</th>
            <th className="px-3 py-2.5 font-medium">Frente</th>
            <th className="px-3 py-2.5 font-medium">Prioridad</th>
            <th className="px-3 py-2.5 font-medium">Estado</th>
            <th className="px-3 py-2.5 font-medium">Responsable</th>
            <th className="px-5 py-2.5 font-medium">Fecha objetivo</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((ticket) => (
            <tr key={ticket.id} className="border-b border-border last:border-0 hover:bg-zinc-50/70">
              <td className="max-w-[240px] px-5 py-3">
                <Link
                  href={`/client/${clientId}/solicitudes/${ticket.id}`}
                  className="block truncate font-medium text-ink hover:underline"
                  title={ticket.title}
                >
                  {ticket.title}
                </Link>
                <span className="text-xs text-ink-faint">{ticket.id}</span>
              </td>
              <td className="px-3 py-3 text-ink-soft">{ticket.workstream}</td>
              <td className="px-3 py-3">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-3 py-3 text-ink-soft">{ticket.owner ?? "—"}</td>
              <td className="px-5 py-3 text-ink-soft">{formatDate(ticket.targetDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
