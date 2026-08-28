"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import type { Ticket } from "@/types/ticket";
import { STATUS_CONFIG } from "@/config/status";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

type SortKey = "priority" | "targetDate" | "status";

const PRIORITY_WEIGHT: Record<string, number> = { Crítica: 4, Alta: 3, Media: 2, Baja: 1 };

export function ActiveWorkTable({ tickets, clientId }: { tickets: Ticket[]; clientId: string }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const statuses = useMemo(() => {
    const set = new Set(tickets.map((t) => t.status));
    return Array.from(set).sort((a, b) => STATUS_CONFIG[a].order - STATUS_CONFIG[b].order);
  }, [tickets]);

  const filtered = useMemo(() => {
    let result = tickets;
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }
    const sorted = [...result].sort((a, b) => {
      let diff = 0;
      if (sortKey === "priority") {
        diff = (PRIORITY_WEIGHT[a.priority ?? ""] ?? 0) - (PRIORITY_WEIGHT[b.priority ?? ""] ?? 0);
      } else if (sortKey === "targetDate") {
        diff = (a.targetDate ?? "9999").localeCompare(b.targetDate ?? "9999");
      } else {
        diff = STATUS_CONFIG[a.status].order - STATUS_CONFIG[b.status].order;
      }
      return diff * sortDir;
    });
    return sorted;
  }, [tickets, statusFilter, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar solicitud o ID…"
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-zinc-400 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink focus:border-zinc-400 focus:outline-none sm:w-auto"
        >
          <option value="all">Todos los estados</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {STATUS_CONFIG[status].label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No hay solicitudes que coincidan con la búsqueda o el filtro seleccionado."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-faint">
                  <th className="px-5 py-2.5 font-medium">Solicitud</th>
                  <th className="px-3 py-2.5 font-medium">Frente</th>
                  <th className="px-3 py-2.5 font-medium">
                    <button onClick={() => toggleSort("priority")} className="inline-flex items-center gap-1 hover:text-ink">
                      Prioridad <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 font-medium">
                    <button onClick={() => toggleSort("status")} className="inline-flex items-center gap-1 hover:text-ink">
                      Estado <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 font-medium">Responsable</th>
                  <th className="px-3 py-2.5 font-medium">Sprint</th>
                  <th className="px-3 py-2.5 font-medium">
                    <button onClick={() => toggleSort("targetDate")} className="inline-flex items-center gap-1 hover:text-ink">
                      Fecha objetivo <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-5 py-2.5 font-medium">Dependencia</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border last:border-0 hover:bg-zinc-50/70">
                    <td className="max-w-[260px] px-5 py-3">
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
                    <td className="px-3 py-3 text-ink-soft">{ticket.sprint ?? "—"}</td>
                    <td className="px-3 py-3 text-ink-soft">{formatDate(ticket.targetDate)}</td>
                    <td className="px-5 py-3">
                      {ticket.status === "blocked" ? (
                        <span className="text-xs font-medium text-red-600">{ticket.dependencyOwner ?? "—"}</span>
                      ) : (
                        <span className="text-xs text-ink-faint">{ticket.dependency ?? "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 p-4 md:hidden">
            {filtered.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/client/${clientId}/solicitudes/${ticket.id}`}
                className="rounded-lg border border-border p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{ticket.title}</p>
                  <span className="shrink-0 text-xs text-ink-faint">{ticket.id}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
                  <dt className="text-ink-faint">Frente</dt>
                  <dd className="text-right text-ink-soft">{ticket.workstream}</dd>
                  <dt className="text-ink-faint">Responsable</dt>
                  <dd className="text-right text-ink-soft">{ticket.owner ?? "—"}</dd>
                  <dt className="text-ink-faint">Sprint</dt>
                  <dd className="text-right text-ink-soft">{ticket.sprint ?? "—"}</dd>
                  <dt className="text-ink-faint">Fecha objetivo</dt>
                  <dd className="text-right text-ink-soft">{formatDate(ticket.targetDate)}</dd>
                </dl>
              </Link>
            ))}
          </div>
        </>
      )}
      <div className={cn("px-5 py-3 text-xs text-ink-faint", filtered.length === 0 && "hidden")}>
        {filtered.length} de {tickets.length} solicitudes activas
      </div>
    </div>
  );
}
