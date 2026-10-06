import {
  getAdvisorsOverview,
  getDashboardMetrics,
  getPeriodRange,
  listAdvisors,
  parseCustomRange,
  type PeriodKey,
} from "@/lib/deals";
import { formatCurrency, formatDays, formatHours, formatPercent } from "@/lib/format";
import { AdvisorTabs } from "@/components/comercial/AdvisorTabs";
import { PeriodFilter } from "@/components/comercial/PeriodFilter";
import { SyncButton } from "@/components/comercial/SyncButton";
import { MetricCard } from "@/components/comercial/MetricCard";
import { StageFunnel } from "@/components/comercial/StageFunnel";
import { StageTimingsTable } from "@/components/comercial/StageTimingsTable";
import { DealsTable } from "@/components/comercial/DealsTable";
import { AdvisorsOverviewTable } from "@/components/comercial/AdvisorsOverviewTable";
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

const VALID_PERIODS: PeriodKey[] = ["all", "this_month", "last_month"];

export default async function ComercialPage({
  searchParams,
}: {
  searchParams: { advisor?: string; period?: string; from?: string; to?: string };
}) {
  const period: PeriodKey = VALID_PERIODS.includes(searchParams.period as PeriodKey)
    ? (searchParams.period as PeriodKey)
    : "all";
  const customRange = parseCustomRange(searchParams.from, searchParams.to);
  const isCustom = customRange !== null;
  const range = isCustom ? customRange : getPeriodRange(period);

  const advisors = await listAdvisors();
  const advisorEmail = searchParams.advisor || process.env.DEFAULT_ADVISOR_EMAIL || null;

  const advisorsOverview = await getAdvisorsOverview(range);

  if (advisors.length === 0) {
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Gestión comercial</h1>
          <p className="text-sm text-slate-500">Negocios asignados y tiempos de gestión por asesora</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PeriodFilter selected={period} isCustom={isCustom} from={searchParams.from} to={searchParams.to} />
          <SyncButton />
        </div>
      </div>

      <AdvisorTabs advisors={advisors} selected={advisorEmail} />

      {!advisorEmail && (
        <ComercialAdvisorDetail advisorEmail={null} range={range} title="Gestión general (todas las asesoras)" />
      )}

      {!advisorEmail ? (
        <div className="card p-4">
          <SectionHeader title="Resumen por asesora" badge={advisorsOverview.length} />
          <p className="mb-3 text-xs text-slate-400">
            Abiertos por fecha de creación del negocio; ganados y perdidos por fecha en que se movieron a esa
            etapa. Haz clic en una asesora para ver su detalle completo.
          </p>
          <AdvisorsOverviewTable
            advisors={advisorsOverview}
            selected=""
            extraQuery={
              isCustom
                ? `from=${searchParams.from}&to=${searchParams.to}`
                : period !== "all"
                  ? `period=${period}`
                  : ""
            }
          />
        </div>
      ) : (
        <ComercialAdvisorDetail advisorEmail={advisorEmail} range={range} title={advisorEmail} />
      )}
    </div>
  );
}

async function ComercialAdvisorDetail({
  advisorEmail,
  range,
  title,
}: {
  advisorEmail: string | null;
  range: { start: Date; end: Date } | null;
  title: string;
}) {
  const metrics = await getDashboardMetrics(advisorEmail, range);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold text-slate-500">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        <MetricCard
          label="Negocios asignados"
          value={String(metrics.totalDeals)}
          hint="Creados en el período"
          icon={<IconBriefcase />}
          tone="slate"
        />
        <MetricCard
          label="Abiertos"
          value={String(metrics.openDeals)}
          icon={<IconCircleDot />}
          tone="brand"
        />
        <MetricCard
          label="Ganados"
          value={String(metrics.wonDeals)}
          hint="Por fecha en que se ganaron"
          icon={<IconCheckCircle />}
          tone="success"
        />
        <MetricCard
          label="Perdidos"
          value={String(metrics.lostDeals)}
          hint="Por fecha en que se perdieron"
          icon={<IconXCircle />}
          tone="danger"
        />
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
        <MetricCard
          label="Valor perdido"
          value={formatCurrency(metrics.totalLostValue)}
          icon={<IconWallet />}
          tone="danger"
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
          <SectionHeader title="Negocios perdidos por etapa" badge={metrics.lostDeals} />
          <StageFunnel stages={metrics.lostBreakdown} />
        </div>
        <div className="card p-4">
          <SectionHeader title="Tiempo promedio por etapa" />
          <p className="mb-3 text-xs text-slate-400">
            Desde que un negocio entra a la etapa hasta que sale (o hasta hoy, si sigue ahí).
          </p>
          <StageTimingsTable timings={metrics.stageTimings} />
        </div>
      </div>

      <div className="card p-4">
        <SectionHeader title="Detalle de negocios perdidos" badge={metrics.lostDealsList.length} />
        <DealsTable deals={metrics.lostDealsList} emptyMessage="Sin negocios perdidos en este período." />
      </div>

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
        <SectionHeader title="Negocios actualizados recientemente" />
        <DealsTable deals={metrics.recentDeals} emptyMessage="Sin negocios sincronizados todavía." />
      </div>
    </div>
  );
}
