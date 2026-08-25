"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  STAGES,
  StageKey,
  Ticket,
  prioridadColor,
  prioridadLabel,
  tipoLabel,
} from "@/lib/types";
import { Badge } from "./Badge";

export function KanbanBoard({ tickets }: { tickets: Ticket[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [movingId, setMovingId] = useState<number | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>("todos");

  const filtered = useMemo(
    () => (filterTipo === "todos" ? tickets : tickets.filter((t) => t.tipo === filterTipo)),
    [tickets, filterTipo]
  );

  const byStage = useMemo(() => {
    const map: Record<string, Ticket[]> = {};
    for (const stage of STAGES) map[stage.key] = [];
    for (const t of filtered) {
      (map[t.stage] ||= []).push(t);
    }
    return map;
  }, [filtered]);

  async function moveTicket(ticket: Ticket, toStage: StageKey) {
    if (toStage === ticket.stage) return;
    setMovingId(ticket.id);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStage }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo mover el ticket.");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setMovingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Pipeline de solicitudes</h1>
          <p className="text-sm text-slate-500">
            {filtered.length} ticket{filtered.length === 1 ? "" : "s"} en el tablero
          </p>
        </div>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="todos">Todos los tipos</option>
          <option value="ajuste_escala">Ajuste de automatización Escala</option>
          <option value="otro">Otra solicitud del proceso</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAGES.map((stage) => (
          <div key={stage.key} className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
              <h2 className="text-sm font-semibold text-slate-700">{stage.label}</h2>
              <span className="text-xs text-slate-400">{byStage[stage.key]?.length ?? 0}</span>
            </div>
            <div className="flex flex-col gap-3 min-h-[80px] rounded-lg bg-slate-100/60 p-2">
              {(byStage[stage.key] ?? []).map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow transition-shadow"
                >
                  <Link href={`/tickets/${ticket.id}`} className="block">
                    <p className="text-xs text-slate-400 font-mono">{ticket.folio}</p>
                    <p className="text-sm font-medium text-slate-800 line-clamp-2">{ticket.titulo}</p>
                    <p className="text-xs text-slate-500 mt-1">{tipoLabel(ticket.tipo)}</p>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <Badge label={prioridadLabel(ticket.prioridad)} color={prioridadColor(ticket.prioridad)} />
                    <span className="text-[11px] text-slate-400">{ticket.solicitante_nombre}</span>
                  </div>
                  <select
                    className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs disabled:opacity-50"
                    value={ticket.stage}
                    disabled={movingId === ticket.id || isPending}
                    onChange={(e) => moveTicket(ticket, e.target.value as StageKey)}
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        Mover a: {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {(byStage[stage.key]?.length ?? 0) === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Sin tickets</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
