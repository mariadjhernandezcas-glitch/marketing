import { getDashboardMetrics, listAdvisors } from "@/lib/deals";
import { formatCurrency, formatDays, formatHours, formatPercent } from "@/lib/format";
import { AdvisorSelect } from "@/components/comercial/AdvisorSelect";
import { SyncButton } from "@/components/comercial/SyncButton";
import { MetricCard } from "@/components/comercial/MetricCard";
import { StageFunnel } from "@/components/comercial/StageFunnel";
import { DealsTable } from "@/components/comercial/DealsTable";
import { ActivityList } from "@/components/comercial/ActivityList";

export const dynamic = "force-dynamic";

export default async function ComercialPage({
  searchParams,
}: {
  searchParams: { advisor?: string };
}) {
  const advisors = await listAdvisors();
  const advisorEmail =
    searchParams.advisor || process.env.DEFAULT_ADVISOR_EMAIL || advisors[0]?.email;

  if (!advisorEmail) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold mb-2">Gestión comercial</h1>
        <p className="text-sm text-slate-500 mb-4">
          Todavía no hay negocios sincronizados desde Escala. Corre la primera sincronización para
          empezar a ver el dashboard.
        </p>
        <SyncButton />
      </div>
    );
  }

  const metrics = await getDashboardMetrics(advisorEmail);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Gestión comercial</h1>
          <p className="text-sm text-slate-500">Negocios asignados y tiempos de gestión por asesora</p>
        </div>
        <div className="flex items-center gap-3">
          <AdvisorSelect advisors={advisors} selected={advisorEmail} />
          <SyncButton />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Negocios asignados" value={String(metrics.totalDeals)} />
        <MetricCard label="Abiertos" value={String(metrics.openDeals)} />
        <MetricCard label="Ganados" value={String(metrics.wonDeals)} />
        <MetricCard label="Perdidos" value={String(metrics.lostDeals)} />
        <MetricCard label="Tasa de conversión" value={formatPercent(metrics.conversionRate)} hint="Ganados / (ganados + perdidos)" />
        <MetricCard label="Valor en pipeline abierto" value={formatCurrency(metrics.totalOpenValue)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricCard
          label="Tiempo a primera gestión"
          value={formatHours(metrics.avgHoursToFirstMove)}
          hint="Promedio desde que se asigna el negocio hasta el primer cambio de etapa registrado"
        />
        <MetricCard
          label="Tiempo de cierre"
          value={formatDays(metrics.avgDaysToClose)}
          hint="Promedio desde la asignación hasta que el negocio se marca ganado o perdido"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Pipeline por etapa (negocios abiertos)</h2>
        <StageFunnel stages={metrics.stageBreakdown} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Negocios sin actividad reciente ({metrics.staleDeals.length})
          </h2>
          <DealsTable
            deals={metrics.staleDeals}
            emptyMessage="Ningún negocio abierto lleva más de 5 días sin actividad."
            showDaysStale
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Últimas gestiones registradas</h2>
          <ActivityList activities={metrics.recentActivities} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Negocios actualizados recientemente</h2>
        <DealsTable deals={metrics.recentDeals} emptyMessage="Sin negocios sincronizados todavía." />
      </div>
    </div>
  );
}
