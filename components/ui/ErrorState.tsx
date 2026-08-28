import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = "No pudimos cargar esta información",
  description = "Intenta recargar la página. Si el problema persiste, contacta a Triario.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="max-w-sm text-xs text-ink-soft">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
