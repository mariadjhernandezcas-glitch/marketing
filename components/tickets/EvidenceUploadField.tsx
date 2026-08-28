"use client";

import { useRef, useState } from "react";
import { Paperclip, UploadCloud } from "lucide-react";

/**
 * Simula la carga de evidencia mientras trabajamos con mocks: solo guarda
 * el nombre del archivo seleccionado en un input oculto (evidenceUrl). Al
 * conectar HubSpot / un storage real, este componente sube el archivo y
 * escribe la URL resultante en el mismo input oculto.
 */
export function EvidenceUploadField() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-zinc-50/50 px-4 py-6 text-center hover:bg-zinc-50"
      >
        <UploadCloud className="h-5 w-5 text-ink-faint" strokeWidth={1.5} />
        <p className="text-xs text-ink-soft">
          {fileName ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-ink">
              <Paperclip className="h-3.5 w-3.5" /> {fileName}
            </span>
          ) : (
            <>
              Haz clic para adjuntar evidencia <span className="text-ink-faint">(captura, PDF, enlace, etc.)</span>
            </>
          )}
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
      <input type="hidden" name="evidenceUrl" value={fileName ?? ""} />
    </div>
  );
}
