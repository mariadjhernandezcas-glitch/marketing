import Link from "next/link";
import { DEFAULT_CLIENT_ID } from "@/config/clients";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
      <p className="text-sm font-medium text-ink">Página no encontrada</p>
      <p className="max-w-sm text-sm text-ink-soft">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href={`/client/${DEFAULT_CLIENT_ID}`}
        className="mt-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Ir al dashboard
      </Link>
    </div>
  );
}
