"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconRefresh } from "./icons";

export function SyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = syncing || isPending;

  async function sync() {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/escala/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        setError(data.error || "No se pudo sincronizar con Escala.");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={sync}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600 disabled:opacity-50"
      >
        <IconRefresh className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
        {busy ? "Sincronizando…" : "Sincronizar con Escala"}
      </button>
      {error && <p className="max-w-xs text-right text-xs text-danger-600">{error}</p>}
    </div>
  );
}
