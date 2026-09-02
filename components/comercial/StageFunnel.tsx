import type { StageBreakdown } from "@/lib/deals";
import { formatCurrency } from "@/lib/format";

export function StageFunnel({ stages }: { stages: StageBreakdown[] }) {
  const maxCount = Math.max(1, ...stages.map((s) => s.count));
  const totalCount = stages.reduce((sum, s) => sum + s.count, 0);

  if (stages.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Aún no hay pipeline sincronizado. Usa &quot;Sincronizar con Escala&quot; para traer los datos.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {stages.map((stage) => {
        const color = stage.color || "#3b5bfd";
        const widthPct = totalCount === 0 ? 0 : Math.max((stage.count / maxCount) * 100, stage.count > 0 ? 6 : 0);
        return (
          <div key={stage.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                {stage.name}
              </span>
              <span className="whitespace-nowrap text-xs text-slate-500">
                {stage.count} negocio{stage.count === 1 ? "" : "s"} · {formatCurrency(stage.value)}
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full transition-[width]"
                style={{ width: `${widthPct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
