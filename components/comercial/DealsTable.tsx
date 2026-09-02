import type { DealRow } from "@/lib/deals";
import { formatCurrency, formatDate } from "@/lib/format";
import { IconCheckCircle, IconCircleDot, IconXCircle } from "./icons";

const STAGE_TYPE_STYLE: Record<string, { color: string; bg: string; Icon: typeof IconCircleDot }> = {
  open: { color: "#2a44e0", bg: "bg-brand-50", Icon: IconCircleDot },
  won: { color: "#15803d", bg: "bg-success-50", Icon: IconCheckCircle },
  lost: { color: "#b91c1c", bg: "bg-danger-50", Icon: IconXCircle },
};

function StagePill({ stageId, stageType }: { stageId: string | null; stageType: string | null }) {
  const style = STAGE_TYPE_STYLE[stageType ?? "open"] ?? STAGE_TYPE_STYLE.open;
  const { Icon } = style;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${style.bg}`}
      style={{ color: style.color }}
    >
      <Icon className="h-3 w-3" />
      {stageId ?? "—"}
    </span>
  );
}

export function DealsTable({
  deals,
  emptyMessage,
  showDaysStale = false,
}: {
  deals: DealRow[];
  emptyMessage: string;
  showDaysStale?: boolean;
}) {
  if (deals.length === 0) {
    return <p className="text-sm text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            <th className="pb-2 pr-3 font-medium">Negocio</th>
            <th className="pb-2 pr-3 font-medium">Contacto</th>
            <th className="pb-2 pr-3 font-medium">Etapa</th>
            <th className="pb-2 pr-3 font-medium">Valor</th>
            <th className="pb-2 pr-3 font-medium">Última actualización</th>
            {showDaysStale && <th className="pb-2 font-medium">Sin actividad</th>}
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80">
              <td className="max-w-[220px] truncate py-2.5 pr-3 font-medium text-slate-800" title={deal.name}>
                {deal.name}
              </td>
              <td className="py-2.5 pr-3 text-slate-600">{deal.contact_name || "—"}</td>
              <td className="py-2.5 pr-3">
                <StagePill stageId={deal.stage_id} stageType={deal.stage_type} />
              </td>
              <td className="py-2.5 pr-3 tabular-nums text-slate-600">{formatCurrency(deal.value)}</td>
              <td className="py-2.5 pr-3 text-slate-500">{formatDate(deal.escala_modified_at)}</td>
              {showDaysStale && (
                <td className="py-2.5">
                  {deal.days_since_activity !== null ? (
                    <span className="inline-flex items-center rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700">
                      {deal.days_since_activity} días
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
