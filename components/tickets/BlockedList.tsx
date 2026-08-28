import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { Ticket } from "@/types/ticket";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, daysSince } from "@/lib/utils/dates";

const OWNER_BADGE: Record<string, string> = {
  Triario: "bg-blue-50 text-blue-700 border-blue-200",
  COSMO: "bg-amber-50 text-amber-800 border-amber-200",
  "COSMO IT": "bg-amber-50 text-amber-800 border-amber-200",
  Tercero: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export function BlockedList({ tickets, clientId }: { tickets: Ticket[]; clientId: string }) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No existen bloqueos activos."
        description="Todas las solicitudes en curso avanzan sin dependencias externas pendientes."
      />
    );
  }

  return (
    <div className="divide-y divide-border">
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          href={`/client/${clientId}/solicitudes/${ticket.id}`}
          className="block px-5 py-4 hover:bg-zinc-50/70"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{ticket.title}</p>
              <p className="mt-1 text-xs text-ink-soft">{ticket.blockedReason}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-right">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                  OWNER_BADGE[ticket.dependencyOwner ?? ""] ?? "bg-zinc-100 text-zinc-700 border-zinc-200"
                }`}
              >
                {ticket.dependencyOwner}
              </span>
              <div className="text-xs text-ink-faint">
                <p>Desde {formatDate(ticket.blockedSince)}</p>
                <p className="font-medium text-red-600">{daysSince(ticket.blockedSince!)} días bloqueado</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
