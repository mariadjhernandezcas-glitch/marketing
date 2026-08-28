import { CheckCircle2 } from "lucide-react";

export function CreatedBanner() {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
      <p className="text-sm text-emerald-800">
        Solicitud enviada correctamente. Quedó registrada en estado <strong>Identificado</strong> y será revisada
        para su priorización.
      </p>
    </div>
  );
}
