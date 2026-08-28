import { notFound } from "next/navigation";
import { getClientTheme } from "@/config/clients";
import { getTicketRepository } from "@/lib/repositories";
import { computeSprintMetrics, listSprints, ticketsForSprint } from "@/lib/services/sprint-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { SprintMetricsGrid } from "@/components/sprints/SprintMetricsGrid";
import { SprintTicketsTable } from "@/components/sprints/SprintTicketsTable";
import { formatDate } from "@/lib/utils/dates";
import { Badge } from "@/components/ui/Badge";

export default async function SprintsPage({ params }: { params: { clientId: string } }) {
  const clientTheme = getClientTheme(params.clientId);
  if (!clientTheme) notFound();

  const repository = getTicketRepository();
  const tickets = await repository.listByClient(params.clientId);
  const sprints = listSprints(params.clientId);
  const currentSprint = sprints.find((s) => s.isCurrent);
  const pastSprints = sprints.filter((s) => !s.isCurrent).slice().reverse();

  return (
    <div className="space-y-8">
      <PageHeader title="Sprints" subtitle={`Ciclos de trabajo de Triario para ${clientTheme.name}.`} />

      {currentSprint ? (
        <Card>
          <CardHeader
            title={currentSprint.name}
            description={`${formatDate(currentSprint.startDate)} – ${formatDate(currentSprint.endDate)}`}
            action={
              <Badge className="border-blue-200 bg-blue-50 text-blue-700" dotClassName="bg-blue-500">
                Sprint actual
              </Badge>
            }
          />
          <div className="space-y-5 p-5">
            <SprintMetricsGrid metrics={computeSprintMetrics(currentSprint, tickets)} />
          </div>
          <div className="border-t border-border">
            <SprintTicketsTable tickets={ticketsForSprint(currentSprint, tickets)} clientId={params.clientId} />
          </div>
        </Card>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink">Histórico de sprints</h2>
        <div className="space-y-4">
          {pastSprints.map((sprint) => {
            const metrics = computeSprintMetrics(sprint, tickets);
            return (
              <Card key={sprint.id}>
                <CardHeader
                  title={sprint.name}
                  description={`${formatDate(sprint.startDate)} – ${formatDate(sprint.endDate)}`}
                />
                <div className="p-5">
                  <SprintMetricsGrid metrics={metrics} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
