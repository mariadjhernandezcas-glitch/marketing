import type { StageBreakdown } from "@/lib/deals";
import { formatCurrency } from "@/lib/format";

export function StageFunnel({ stages }: { stages: StageBreakdown[] }) {
  const maxCount = Math.max(1, ...stages.map((s) => s.count));

  if (stages.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Aún no hay pipeline sincronizado. Usa &quot;Sincronizar con Escala&quot; para traer los datos.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {stages.map((stage) => (
        <div key={stage.id}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">{stage.name}</span>
            <span className="text-slate-500">
              {stage.count} negocio{stage.count === 1 ? "" : "s"} · {formatCurrency(stage.value)}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full"
              style={{
                width: `${(stage.count / maxCount) * 100}%`,
                backgroundColor: stage.color || "#3b5bfd",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
