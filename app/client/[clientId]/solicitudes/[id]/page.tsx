import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getClientTheme } from "@/config/clients";
import { getTicketRepository } from "@/lib/repositories";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { DependencyBanner } from "@/components/tickets/DependencyBanner";
import { CreatedBanner } from "@/components/tickets/CreatedBanner";
import { Timeline } from "@/components/tickets/Timeline";
import { formatDate } from "@/lib/utils/dates";

export default async function TicketDetailPage({
  params,
  searchParams,
}: {
  params: { clientId: string; id: string };
  searchParams: { created?: string };
}) {
  const clientTheme = getClientTheme(params.clientId);
  if (!clientTheme) notFound();

  const repository = getTicketRepository();
  const ticket = await repository.getById(params.clientId, params.id);
  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      {searchParams.created === "1" ? <CreatedBanner /> : null}

      <Link
        href={`/client/${params.clientId}/solicitudes`}
        className="text-sm text-ink-soft hover:text-ink hover:underline"
      >
        ← Volver a solicitudes
      </Link>

      <PageHeader
        title={ticket.title}
        subtitle={ticket.id}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        }
      />

      {ticket.status === "blocked" ? <DependencyBanner ticket={ticket} /> : null}

      <Card>
        <CardHeader title="Avance" description="Hasta dónde ha llegado esta solicitud en el proceso." />
        <div className="overflow-x-auto p-5">
          <Timeline ticket={ticket} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Descripción" />
            <p className="whitespace-pre-line px-5 py-4 text-sm leading-relaxed text-ink-soft">
              {ticket.description}
            </p>
          </Card>

          <Card>
            <CardHeader title="Resultado esperado" />
            <p className="px-5 py-4 text-sm leading-relaxed text-ink-soft">
              {ticket.expectedResult ?? "Aún no definido."}
            </p>
          </Card>

          <Card>
            <CardHeader title="Resultado final" />
            <p className="px-5 py-4 text-sm leading-relaxed text-ink-soft">
              {ticket.finalResult ?? "La solicitud todavía no ha sido completada."}
            </p>
          </Card>

          <Card>
            <CardHeader title="Evidencia" />
            <div className="px-5 py-4">
              {ticket.evidenceUrl ? (
                ticket.evidenceUrl.startsWith("http") ? (
                  <a
                    href={ticket.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
                  >
                    {ticket.evidenceUrl} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="text-sm text-ink-soft">{ticket.evidenceUrl}</p>
                )
              ) : (
                <p className="text-sm text-ink-faint">No se ha adjuntado evidencia todavía.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Información general" />
            <DefinitionList
              items={[
                { label: "Solicitante", value: ticket.requester },
                { label: "Área", value: ticket.area },
                { label: "Frente", value: ticket.workstream },
                { label: "Impacto", value: ticket.impact },
                { label: "Responsable", value: ticket.owner ?? "Sin asignar" },
                { label: "Sprint", value: ticket.sprint ?? "Sin asignar" },
              ]}
            />
          </Card>

          <Card>
            <CardHeader title="Fechas" />
            <DefinitionList
              items={[
                { label: "Solicitud", value: formatDate(ticket.createdAt) },
                { label: "Fecha requerida", value: formatDate(ticket.requestedDate) },
                { label: "Fecha objetivo", value: formatDate(ticket.targetDate) },
                { label: "Inicio", value: formatDate(ticket.startedAt) },
                { label: "Completado", value: formatDate(ticket.completedAt) },
              ]}
            />
          </Card>

          {ticket.status !== "blocked" ? (
            <Card>
              <CardHeader title="Dependencias" />
              <p className="px-5 py-4 text-sm text-ink-faint">
                Esta solicitud no tiene bloqueos activos.
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
