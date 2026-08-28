import type { DashboardKpis } from "@/lib/services/ticket-metrics";
import { cn } from "@/lib/utils/cn";

interface KpiDef {
  label: string;
  value: string;
  hint?: string;
  emphasis?: "default" | "warning" | "success";
}

export function KpiGrid({ kpis, currentSprintName }: { kpis: DashboardKpis; currentSprintName?: string }) {
  const items: KpiDef[] = [
    { label: "Solicitudes totales", value: String(kpis.total) },
    { label: "En ejecución", value: String(kpis.inProgress) },
    { label: "En validación", value: String(kpis.inValidation) },
    {
      label: "Bloqueadas",
      value: String(kpis.blocked),
      emphasis: kpis.blocked > 0 ? "warning" : "default",
    },
    { label: "Completadas", value: String(kpis.completed), emphasis: "success" },
    {
      label: "Cumplimiento del sprint",
      value: kpis.sprintCompliance === null ? "—" : `${kpis.sprintCompliance}%`,
      hint: currentSprintName,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <p
            className={cn(
              "text-2xl font-semibold tabular-nums tracking-tight",
              item.emphasis === "warning" && item.value !== "0" ? "text-red-600" : "text-ink",
              item.emphasis === "success" ? "text-emerald-700" : undefined
            )}
          >
            {item.value}
          </p>
          <p className="mt-1 text-xs text-ink-soft">{item.label}</p>
          {item.hint ? <p className="mt-0.5 text-[11px] text-ink-faint">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
