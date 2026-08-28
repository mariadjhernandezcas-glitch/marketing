import { notFound } from "next/navigation";
import { getClientTheme } from "@/config/clients";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EvidenceUploadField } from "@/components/tickets/EvidenceUploadField";
import { createTicketAction } from "@/lib/actions/create-ticket";
import { IMPACT_AREAS, REQUESTER_AREAS, URGENCY_LEVELS, WORKSTREAMS } from "@/types/ticket";

const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-ink";
const INPUT_CLASS =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-zinc-400 focus:outline-none";

export default function NewTicketPage({ params }: { params: { clientId: string } }) {
  const clientTheme = getClientTheme(params.clientId);
  if (!clientTheme) notFound();

  const action = createTicketAction.bind(null, params.clientId);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Nueva solicitud"
        subtitle={`Registra una nueva solicitud de implementación para ${clientTheme.name}.`}
      />

      <Card>
        <form action={action} className="space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="title" className={LABEL_CLASS}>
              Nombre de la solicitud
            </label>
            <input id="title" name="title" required className={INPUT_CLASS} placeholder="Ej. Automatización de recordatorio de pago" />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="requester" className={LABEL_CLASS}>
                Solicitante
              </label>
              <input id="requester" name="requester" required className={INPUT_CLASS} placeholder="Nombre y apellido" />
            </div>
            <div>
              <label htmlFor="area" className={LABEL_CLASS}>
                Área
              </label>
              <select id="area" name="area" required defaultValue="" className={INPUT_CLASS}>
                <option value="" disabled>
                  Selecciona un área
                </option>
                {REQUESTER_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className={LABEL_CLASS}>
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className={INPUT_CLASS}
              placeholder="Describe el problema, la necesidad o la mejora que buscas."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="workstream" className={LABEL_CLASS}>
                Frente
              </label>
              <select id="workstream" name="workstream" required defaultValue="" className={INPUT_CLASS}>
                <option value="" disabled>
                  Selecciona un frente
                </option>
                {WORKSTREAMS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="impact" className={LABEL_CLASS}>
                Impacto esperado
              </label>
              <select id="impact" name="impact" required defaultValue="" className={INPUT_CLASS}>
                <option value="" disabled>
                  Selecciona un impacto
                </option>
                {IMPACT_AREAS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="urgency" className={LABEL_CLASS}>
                Urgencia percibida
              </label>
              <select id="urgency" name="urgency" required defaultValue="" className={INPUT_CLASS}>
                <option value="" disabled>
                  Selecciona una urgencia
                </option>
                {URGENCY_LEVELS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="requestedDate" className={LABEL_CLASS}>
                Fecha requerida
              </label>
              <input id="requestedDate" name="requestedDate" type="date" className={INPUT_CLASS} />
            </div>
          </div>
          <p className="-mt-3 text-xs text-ink-faint">
            La fecha requerida representa la necesidad del solicitante. La fecha objetivo se definirá después del
            proceso de priorización.
          </p>

          <div>
            <label className={LABEL_CLASS}>Evidencia</label>
            <EvidenceUploadField />
          </div>

          <div className="flex justify-end border-t border-border pt-5">
            <button
              type="submit"
              className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Enviar solicitud
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
