import { cn } from "@/lib/utils/cn";

export function LoadingState({ label = "Cargando…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-16", className)}>
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-ink-soft" />
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl border border-border bg-surface", className)}
      aria-hidden
    >
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 rounded bg-zinc-100" />
        <div className="h-6 w-16 rounded bg-zinc-100" />
      </div>
    </div>
  );
}
