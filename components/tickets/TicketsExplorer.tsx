"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Ticket } from "@/types/ticket";
import { STATUS_CONFIG } from "@/config/status";
import { WORKSTREAMS, PRIORITY_LEVELS } from "@/types/ticket";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/dates";

type BlockedFilter = "all" | "blocked" | "unblocked";

const SELECT_CLASS =
  "w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink focus:border-zinc-400 focus:outline-none sm:w-auto";

export function TicketsExplorer({ tickets, clientId }: { tickets: Ticket[]; clientId: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [workstream, setWorkstream] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sprint, setSprint] = useState("all");
  const [owner, setOwner] = useState("all");
  const [blocked, setBlocked] = useState<BlockedFilter>("all");

  const sprints = useMemo(
    () => Array.from(new Set(tickets.map((t) => t.sprint).filter(Boolean))) as string[],
    [tickets]
  );
  const owners = useMemo(
    () => Array.from(new Set(tickets.map((t) => t.owner).filter(Boolean))) as string[],
    [tickets]
  );

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (workstream !== "all" && t.workstream !== workstream) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (sprint !== "all" && t.sprint !== sprint) return false;
      if (owner !== "all" && t.owner !== owner) return false;
      if (blocked === "blocked" && t.status !== "blocked") return false;
      if (blocked === "unblocked" && t.status === "blocked") return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tickets, status, workstream, priority, sprint, owner, blocked, query]);

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setWorkstream("all");
    setPriority("all");
    setSprint("all");
    setOwner("all");
    setBlocked("all");
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar solicitud o ID…"
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-zinc-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={SELECT_CLASS}>
            <option value="all">Todos los estados</option>
            {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
          <select value={workstream} onChange={(e) => setWorkstream(e.target.value)} className={SELECT_CLASS}>
            <option value="all">Todos los frentes</option>
            {WORKSTREAMS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={SELECT_CLASS}>
            <option value="all">Toda prioridad</option>
            {PRIORITY_LEVELS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select value={sprint} onChange={(e) => setSprint(e.target.value)} className={SELECT_CLASS}>
            <option value="all">Todo sprint</option>
            {sprints.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className={SELECT_CLASS}>
            <option value="all">Todo responsable</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <select
            value={blocked}
            onChange={(e) => setBlocked(e.target.value as BlockedFilter)}
            className={SELECT_CLASS}
          >
            <option value="all">Bloqueadas y no bloqueadas</option>
            <option value="blocked">Solo bloqueadas</option>
            <option value="unblocked">Solo no bloqueadas</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-zinc-50"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No hay solicitudes que coincidan con la búsqueda o los filtros seleccionados."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-faint">
                  <th className="px-5 py-2.5 font-medium">Solicitud</th>
                  <th className="px-3 py-2.5 font-medium">Frente</th>
                  <th className="px-3 py-2.5 font-medium">Prioridad</th>
                  <th className="px-3 py-2.5 font-medium">Estado</th>
                  <th className="px-3 py-2.5 font-medium">Responsable</th>
                  <th className="px-3 py-2.5 font-medium">Sprint</th>
                  <th className="px-5 py-2.5 font-medium">Fecha objetivo</th>
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
                    <td className="px-5 py-3 text-ink-soft">{formatDate(ticket.targetDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
      <div className="px-5 py-3 text-xs text-ink-faint">
        {filtered.length} de {tickets.length} solicitudes
      </div>
    </div>
  );
}
