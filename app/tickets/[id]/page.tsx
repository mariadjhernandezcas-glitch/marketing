import { notFound } from "next/navigation";
import { getStageHistory, getTicketById } from "@/lib/tickets";
import { Badge } from "@/components/Badge";
import { StageMover } from "@/components/StageMover";
import { prioridadColor, prioridadLabel, stageColor, stageLabel, tipoLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(value: string | Date) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const ticket = Number.isInteger(id) ? await getTicketById(id) : undefined;
  if (!ticket) notFound();

  const history = await getStageHistory(ticket.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-slate-400 font-mono">{ticket.folio}</p>
            <h1 className="text-xl font-semibold text-slate-900 mt-1">{ticket.titulo}</h1>
          </div>
          <Badge label={stageLabel(ticket.stage)} color={stageColor(ticket.stage)} />
        </div>

        <p className="mt-4 text-sm text-slate-600 whitespace-pre-wrap">{ticket.descripcion}</p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">Tipo</p>
            <p className="text-slate-700">{tipoLabel(ticket.tipo)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Prioridad</p>
            <Badge label={prioridadLabel(ticket.prioridad)} color={prioridadColor(ticket.prioridad)} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Solicitante</p>
            <p className="text-slate-700">{ticket.solicitante_nombre}</p>
            <p className="text-slate-400 text-xs">{ticket.solicitante_email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Área</p>
            <p className="text-slate-700">{ticket.area || "—"}</p>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-400">
          Creado el {formatDate(ticket.created_at)} · Última actualización {formatDate(ticket.updated_at)}
        </div>
      </div>

      <StageMover ticket={ticket} />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Trazabilidad del ticket</h3>
        <ol className="relative border-l border-slate-200 ml-2 space-y-6">
          {history.map((entry) => (
            <li key={entry.id} className="ml-4">
              <span
                className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: stageColor(entry.to_stage) }}
              />
              <p className="text-sm font-medium text-slate-800">
                {entry.from_stage ? (
                  <>
                    {stageLabel(entry.from_stage)} → {stageLabel(entry.to_stage)}
                  </>
                ) : (
                  <>Ticket creado en {stageLabel(entry.to_stage)}</>
                )}
              </p>
              <p className="text-xs text-slate-400">
                {formatDate(entry.created_at)}
                {entry.changed_by ? ` · ${entry.changed_by}` : ""}
              </p>
              {entry.comment && <p className="text-sm text-slate-600 mt-1">{entry.comment}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
