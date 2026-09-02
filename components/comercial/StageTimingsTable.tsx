import type { StageTiming } from "@/lib/deals";
import { formatDays } from "@/lib/format";

export function StageTimingsTable({ timings }: { timings: StageTiming[] }) {
  if (timings.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Todavía no hay suficiente historial de cambios de etapa para calcular tiempos. Se va llenando
        con cada sincronización a medida que los negocios cambian de etapa.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {timings
        .slice()
        .sort((a, b) => (b.avgDays ?? 0) - (a.avgDays ?? 0))
        .map((timing) => (
          <div key={timing.stage_id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: timing.color || "#3b5bfd" }}
              />
              {timing.name}
            </span>
            <span className="whitespace-nowrap text-xs text-slate-500">
              {formatDays(timing.avgDays)} en promedio · {timing.dealCount} negocio
              {timing.dealCount === 1 ? "" : "s"}
            </span>
          </div>
        ))}
    </div>
  );
}
