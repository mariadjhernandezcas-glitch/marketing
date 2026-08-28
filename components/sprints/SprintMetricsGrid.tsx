import type { SprintMetrics } from "@/types/sprint";

export function SprintMetricsGrid({ metrics }: { metrics: SprintMetrics }) {
  const items = [
    { label: "Comprometidas", value: metrics.committed },
    { label: "Completadas", value: metrics.completed },
    { label: "En curso", value: metrics.inProgress },
    { label: "Carry-over", value: metrics.carryOver },
    { label: "Cumplimiento", value: `${metrics.completionRate}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-zinc-50/60 p-3.5">
          <p className="text-lg font-semibold tabular-nums text-ink">{item.value}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
