import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { getClientTheme } from "@/config/clients";
import { getTicketRepository } from "@/lib/repositories";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { TicketsExplorer } from "@/components/tickets/TicketsExplorer";

export default async function SolicitudesPage({ params }: { params: { clientId: string } }) {
  const clientTheme = getClientTheme(params.clientId);
  if (!clientTheme) notFound();

  const repository = getTicketRepository();
  const tickets = await repository.listByClient(params.clientId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes"
        subtitle={`${tickets.length} solicitudes registradas para ${clientTheme.name}.`}
        action={
          <Link
            href={`/client/${params.clientId}/solicitudes/nueva`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva solicitud
          </Link>
        }
      />

      <Card>
        <TicketsExplorer tickets={tickets} clientId={params.clientId} />
      </Card>
    </div>
  );
}
