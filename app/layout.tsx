import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tickets Hommik | Automatizaciones Escala",
  description:
    "Tablero de solicitudes y ajustes de automatización de Escala para el equipo Hommik.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold">
                  H
                </span>
                <div>
                  <p className="font-semibold leading-tight">Tickets Hommik</p>
                  <p className="text-xs text-slate-500 leading-tight">
                    Ajustes de automatización Escala &amp; proceso
                  </p>
                </div>
              </Link>
              <nav className="flex items-center gap-3 text-sm">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Pipeline
                </Link>
                <Link
                  href="/comercial"
                  className="px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Gestión comercial
                </Link>
                <Link
                  href="/nuevo"
                  className="px-3 py-1.5 rounded-md bg-brand-500 text-white hover:bg-brand-600 font-medium"
                >
                  + Nuevo ticket
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6">{children}</main>
          <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
            Trazabilidad de solicitudes · Equipo Hommik
          </footer>
        </div>
      </body>
    </html>
  );
}
