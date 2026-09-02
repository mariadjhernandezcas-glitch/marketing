import Link from "next/link";
import type { AdvisorSummary } from "@/lib/deals";
import { formatCurrency, formatDays, formatPercent } from "@/lib/format";

export function AdvisorsOverviewTable({
  advisors,
  selected,
  period,
}: {
  advisors: AdvisorSummary[];
  selected: string;
  period: string;
}) {
  if (advisors.length === 0) {
    return <p className="text-sm text-slate-400">Sin negocios sincronizados todavía.</p>;
  }

  const periodQuery = period !== "all" ? `&period=${period}` : "";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            <th className="pb-2 pr-3 font-medium">Asesora</th>
            <th className="pb-2 pr-3 font-medium">Total</th>
            <th className="pb-2 pr-3 font-medium">Abiertos</th>
            <th className="pb-2 pr-3 font-medium">Ganados</th>
            <th className="pb-2 pr-3 font-medium">Perdidos</th>
            <th className="pb-2 pr-3 font-medium">Conversión</th>
            <th className="pb-2 pr-3 font-medium">Valor pipeline abierto</th>
            <th className="pb-2 font-medium">Tiempo de cierre</th>
          </tr>
        </thead>
        <tbody>
          {advisors.map((advisor) => (
            <tr
              key={advisor.email}
              className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/80 ${
                advisor.email === selected ? "bg-brand-50/60" : ""
              }`}
            >
              <td className="py-2.5 pr-3 font-medium text-slate-800">
                <Link href={`/comercial?advisor=${encodeURIComponent(advisor.email)}${periodQuery}`} className="hover:underline">
                  {advisor.email}
                </Link>
              </td>
              <td className="py-2.5 pr-3 tabular-nums text-slate-600">{advisor.total}</td>
              <td className="py-2.5 pr-3 tabular-nums text-slate-600">{advisor.open}</td>
              <td className="py-2.5 pr-3 tabular-nums text-success-700">{advisor.won}</td>
              <td className="py-2.5 pr-3 tabular-nums text-danger-700">{advisor.lost}</td>
              <td className="py-2.5 pr-3 tabular-nums text-slate-600">{formatPercent(advisor.conversionRate)}</td>
              <td className="py-2.5 pr-3 tabular-nums text-slate-600">{formatCurrency(advisor.openValue)}</td>
              <td className="py-2.5 tabular-nums text-slate-600">{formatDays(advisor.avgDaysToClose)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
