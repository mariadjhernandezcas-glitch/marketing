import type { DealRow } from "@/lib/deals";
import { formatCurrency, formatDate } from "@/lib/format";

const STAGE_TYPE_COLOR: Record<string, string> = {
  open: "#3b5bfd",
  won: "#16a34a",
  lost: "#dc2626",
};

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
          <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
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
            <tr key={deal.id} className="border-b border-slate-100 last:border-0">
              <td className="py-2 pr-3 font-medium text-slate-800">{deal.name}</td>
              <td className="py-2 pr-3 text-slate-600">{deal.contact_name || "—"}</td>
              <td className="py-2 pr-3">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${STAGE_TYPE_COLOR[deal.stage_type ?? "open"]}1a`,
                    color: STAGE_TYPE_COLOR[deal.stage_type ?? "open"],
                  }}
                >
                  {deal.stage_id ?? "—"}
                </span>
              </td>
              <td className="py-2 pr-3 text-slate-600">{formatCurrency(deal.value)}</td>
              <td className="py-2 pr-3 text-slate-500">{formatDate(deal.escala_modified_at)}</td>
              {showDaysStale && (
                <td className="py-2 text-slate-500">
                  {deal.days_since_activity !== null ? `${deal.days_since_activity} días` : "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
