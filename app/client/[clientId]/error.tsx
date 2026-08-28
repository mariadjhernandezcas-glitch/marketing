"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function ClientError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      className="py-24"
      action={
        <button
          onClick={reset}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Reintentar
        </button>
      }
    />
  );
}
