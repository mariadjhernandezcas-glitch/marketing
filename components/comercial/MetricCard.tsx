import type { ReactNode } from "react";

const TONE_STYLES = {
  brand: "bg-brand-50 text-brand-600",
  success: "bg-success-50 text-success-600",
  danger: "bg-danger-50 text-danger-600",
  slate: "bg-slate-100 text-slate-500",
} as const;

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = "slate",
  emphasize = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: keyof typeof TONE_STYLES;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`card flex flex-col gap-3 p-4 ${
        emphasize ? "ring-1 ring-brand-100 bg-brand-50/40" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {icon && (
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${TONE_STYLES[tone]}`}>
            <span className="h-4 w-4 [&>svg]:h-full [&>svg]:w-full">{icon}</span>
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-slate-800">{value}</p>
      {hint && <p className="text-xs leading-snug text-slate-400">{hint}</p>}
    </div>
  );
}
