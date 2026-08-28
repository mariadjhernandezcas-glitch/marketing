import { notFound } from "next/navigation";
import { getClientTheme } from "@/config/clients";
import { getTicketRepository } from "@/lib/repositories";
import {
  computeDashboardKpis,
  computeStatusDistribution,
  computeWorkstreamDistribution,
  selectActiveWork,
  selectBlockedTickets,
} from "@/lib/services/ticket-metrics";
import { computeSprintEvolution, getCurrentSprint } from "@/lib/services/sprint-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { WorkstreamChart } from "@/components/dashboard/WorkstreamChart";
import { SprintEvolutionChart } from "@/components/dashboard/SprintEvolutionChart";
import { ActiveWorkTable } from "@/components/tickets/ActiveWorkTable";
import { BlockedList } from "@/components/tickets/BlockedList";

export default async function DashboardPage({ params }: { params: { clientId: string } }) {
  const clientTheme = getClientTheme(params.clientId);
  if (!clientTheme) notFound();

  const repository = getTicketRepository();
  const tickets = await repository.listByClient(params.clientId);
  const currentSprint = getCurrentSprint(params.clientId);

  const kpis = computeDashboardKpis(tickets, currentSprint?.name);
  const statusDistribution = computeStatusDistribution(tickets);
  const workstreamDistribution = computeWorkstreamDistribution(tickets);
  const sprintEvolution = computeSprintEvolution(params.clientId, tickets);
  const activeWork = selectActiveWork(tickets);
  const blockedTickets = selectBlockedTickets(tickets);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Centro de implementación"
        subtitle="Seguimiento de solicitudes, implementaciones, bloqueos y entregables."
      />

      <KpiGrid kpis={kpis} currentSprintName={currentSprint?.name} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Estado de solicitudes" description="Distribución de tickets por estado." />
          <div className="p-4">
            <StatusDistributionChart data={statusDistribution} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Solicitudes por frente" description="Volumen de solicitudes por área funcional." />
          <div className="p-4">
            <WorkstreamChart data={workstreamDistribution} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Evolución por sprint"
          description="Comprometidas, completadas y carry-over en los últimos sprints."
        />
        <div className="p-4">
          <SprintEvolutionChart data={sprintEvolution} />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="En qué estamos trabajando"
          description="Solicitudes priorizadas, en implementación, en QA, en validación o bloqueadas."
        />
        <ActiveWorkTable tickets={activeWork} clientId={params.clientId} />
      </Card>

      <Card>
        <CardHeader
          title="Bloqueos actuales"
          description="Solicitudes detenidas y de quién depende desbloquearlas."
        />
        <BlockedList tickets={blockedTickets} clientId={params.clientId} />
      </Card>
    </div>
  );
}
