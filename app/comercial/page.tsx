import { debugDealsSummary, getDashboardMetrics, listAdvisors } from "@/lib/deals";
import { formatCurrency, formatDays, formatHours, formatPercent } from "@/lib/format";
import { AdvisorSelect } from "@/components/comercial/AdvisorSelect";
import { SyncButton } from "@/components/comercial/SyncButton";
import { MetricCard } from "@/components/comercial/MetricCard";
import { StageFunnel } from "@/components/comercial/StageFunnel";
import { DealsTable } from "@/components/comercial/DealsTable";
import { ActivityList } from "@/components/comercial/ActivityList";
import {
  IconAlertTriangle,
  IconBriefcase,
  IconCheckCircle,
  IconCircleDot,
  IconClock,
  IconTrendUp,
  IconWallet,
  IconXCircle,
} from "@/components/comercial/icons";

export const dynamic = "force-dynamic";

function SectionHeader({ title, badge }: { title: string; badge?: string | number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      {badge !== undefined && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-medium text-slate-500">
          {badge}
        </span>
      )}
    </div>
  );
}

export default async function ComercialPage({
  searchParams,
}: {
  searchParams: { advisor?: string };
}) {
  const advisors = await listAdvisors();
  const advisorEmail =
    searchParams.advisor || process.env.DEFAULT_ADVISOR_EMAIL || advisors[0]?.email;

  if (!advisorEmail) {
    const debug = await debugDealsSummary();
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <IconBriefcase className="h-6 w-6" />
        </span>
        <h1 className="text-xl font-semibold text-slate-800">Gestión comercial</h1>
        <p className="max-w-md text-sm text-slate-500">
          Todavía no hay negocios sincronizados desde Escala. Corre la primera sincronización para
          empezar a ver el dashboard.
        </p>
        <SyncButton />
        <div className="mt-4 max-w-md rounded-lg border border-warning-100 bg-warning-50 p-3 text-left text-xs text-warning-700">
          <p className="font-semibold">Diagnóstico temporal</p>
          <p>Total de filas en escala_deals: {debug.total}</p>
          {debug.byAssigned.map((row) => (
            <p key={row.assigned_to}>
              {JSON.stringify(row.assigned_to)}: {row.count}
            </p>
          ))}
        </div>
      </div>
    );
  }

  const metrics = await getDashboardMetrics(advisorEmail);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Gestión comercial</h1>
          <p className="text-sm text-slate-500">Negocios asignados y tiempos de gestión por asesora</p>
        </div>
        <div className="flex items-center gap-3">
          <AdvisorSelect advisors={advisors} selected={advisorEmail} />
          <SyncButton />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          label="Negocios asignados"
          value={String(metrics.totalDeals)}
          icon={<IconBriefcase />}
          tone="slate"
        />
        <MetricCard
          label="Abiertos"
          value={String(metrics.openDeals)}
          icon={<IconCircleDot />}
          tone="brand"
        />
        <MetricCard label="Ganados" value={String(metrics.wonDeals)} icon={<IconCheckCircle />} tone="success" />
        <MetricCard label="Perdidos" value={String(metrics.lostDeals)} icon={<IconXCircle />} tone="danger" />
        <MetricCard
          label="Tasa de conversión"
          value={formatPercent(metrics.conversionRate)}
          hint="Ganados / (ganados + perdidos)"
          icon={<IconTrendUp />}
          tone="success"
        />
        <MetricCard
          label="Valor en pipeline abierto"
          value={formatCurrency(metrics.totalOpenValue)}
          icon={<IconWallet />}
          tone="brand"
          emphasize
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <SectionHeader title="Pipeline por etapa (negocios abiertos)" />
          <StageFunnel stages={metrics.stageBreakdown} />
        </div>
        <div className="flex flex-col gap-4">
          <MetricCard
            label="Tiempo a primera gestión"
            value={formatHours(metrics.avgHoursToFirstMove)}
            hint="Promedio desde que se asigna el negocio hasta el primer cambio de etapa registrado"
            icon={<IconClock />}
            tone="slate"
          />
          <MetricCard
            label="Tiempo de cierre"
            value={formatDays(metrics.avgDaysToClose)}
            hint="Promedio desde la asignación hasta que el negocio se marca ganado o perdido"
            icon={<IconClock />}
            tone="slate"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <SectionHeader title="Negocios sin actividad reciente" badge={metrics.staleDeals.length} />
          {metrics.staleDeals.length > 0 && (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-warning-700">
              <IconAlertTriangle className="h-3.5 w-3.5" />
              Sin cambio de etapa ni actividad en más de 5 días.
            </p>
          )}
          <DealsTable
            deals={metrics.staleDeals}
            emptyMessage="Ningún negocio abierto lleva más de 5 días sin actividad."
            showDaysStale
          />
        </div>
        <div className="card p-4">
          <SectionHeader title="Últimas gestiones registradas" />
          <ActivityList activities={metrics.recentActivities} />
        </div>
      </div>

      <div className="card p-4">
        <SectionHeader title="Negocios actualizados recientemente" />
        <DealsTable deals={metrics.recentDeals} emptyMessage="Sin negocios sincronizados todavía." />
      </div>
    </div>
  );
}
