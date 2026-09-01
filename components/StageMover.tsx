"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STAGES, StageKey, Ticket } from "@/lib/types";

export function StageMover({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const [toStage, setToStage] = useState<StageKey>(ticket.stage);
  const [changedBy, setChangedBy] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStage, changedBy, comment }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "No se pudo actualizar el ticket.");
        return;
      }
      setComment("");
      router.refresh();
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Actualizar etapa</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Nueva etapa</label>
          <select
            value={toStage}
            onChange={(e) => setToStage(e.target.value as StageKey)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Tu nombre (quién actualiza)</label>
          <input
            value={changedBy}
            onChange={(e) => setChangedBy(e.target.value)}
            placeholder="Equipo Hommik / Marketing"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Comentario para el solicitante <span className="text-slate-400 font-normal">(opcional, se incluye en el correo)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2"
        >
          {submitting ? "Actualizando..." : "Guardar y notificar por correo"}
        </button>
      </div>
    </form>
  );
}
