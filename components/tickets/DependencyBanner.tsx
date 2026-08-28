import { AlertOctagon } from "lucide-react";
import type { Ticket } from "@/types/ticket";
import { daysSince, formatDate } from "@/lib/utils/dates";

export function DependencyBanner({ ticket }: { ticket: Ticket }) {
  if (ticket.status !== "blocked") return null;

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800">Esta solicitud está bloqueada</p>
          <p className="mt-1 text-sm text-red-900/80">{ticket.blockedReason}</p>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-red-700/70">Responsable de desbloquear</dt>
              <dd className="mt-0.5 text-sm font-medium text-red-900">{ticket.dependencyOwner}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-red-700/70">Bloqueado desde</dt>
              <dd className="mt-0.5 text-sm font-medium text-red-900">{formatDate(ticket.blockedSince)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-red-700/70">Días bloqueado</dt>
              <dd className="mt-0.5 text-sm font-medium text-red-900">
                {ticket.blockedSince ? daysSince(ticket.blockedSince) : "—"} días
              </dd>
            </div>
          </dl>
          {ticket.dependency ? (
            <p className="mt-3 text-xs text-red-800/70">
              <span className="font-medium">Dependencia:</span> {ticket.dependency}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
