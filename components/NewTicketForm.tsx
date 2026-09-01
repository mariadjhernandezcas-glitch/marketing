"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRIORIDADES, TIPOS } from "@/lib/types";

export function NewTicketForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "No se pudo crear el ticket.");
        return;
      }
      setSuccess(`Ticket ${json.ticket.folio} creado correctamente.`);
      form.reset();
      setTimeout(() => router.push(`/tickets/${json.ticket.id}`), 900);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h1 className="text-xl font-semibold mb-1">Nueva solicitud</h1>
      <p className="text-sm text-slate-500 mb-6">
        Registra un ajuste de automatización de Escala u otra solicitud del proceso. El equipo
        recibirá una notificación y te iremos avisando por correo conforme avance el ticket.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input
            name="titulo"
            required
            maxLength={140}
            placeholder="Ej. Ajustar horario de disparo de campaña X en Escala"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            required
            rows={5}
            placeholder="Describe el ajuste o la solicitud con el mayor detalle posible."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de solicitud</label>
          <select
            name="tipo"
            required
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {TIPOS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
          <select
            name="prioridad"
            defaultValue="media"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {PRIORIDADES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tu nombre</label>
          <input
            name="solicitante_nombre"
            required
            maxLength={120}
            placeholder="Nombre y apellido"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tu correo</label>
          <input
            type="email"
            name="solicitante_email"
            required
            placeholder="nombre@hommik.com"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Área / equipo <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <input
            name="area"
            maxLength={120}
            placeholder="Ej. Marketing, CRM, Operaciones"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2">
          {success}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2"
        >
          {submitting ? "Enviando..." : "Enviar solicitud"}
        </button>
      </div>
    </form>
  );
}
