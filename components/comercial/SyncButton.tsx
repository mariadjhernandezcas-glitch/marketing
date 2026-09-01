"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        disabled={syncing || isPending}
        className="rounded-md bg-brand-500 text-white px-3 py-1.5 text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
      >
        {syncing || isPending ? "Sincronizando…" : "Sincronizar con Escala"}
      </button>
      {error && <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>}
    </div>
  );
}
