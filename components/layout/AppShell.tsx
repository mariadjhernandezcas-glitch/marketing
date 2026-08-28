"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { ClientTheme } from "@/types/client";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ clientId, onNavigate }: { clientId: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const href = item.href(clientId);
        const active = isActive(pathname, href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-zinc-100 text-ink" : "text-ink-soft hover:bg-zinc-50 hover:text-ink"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BrandFooter({ clientTheme }: { clientTheme: ClientTheme }) {
  return (
    <div className="space-y-2 border-t border-border px-3 py-4">
      <div className="flex items-center gap-2.5 rounded-lg bg-zinc-50 px-2.5 py-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-white"
          style={{ backgroundColor: clientTheme.primaryColor }}
        >
          {clientTheme.logoInitials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink">{clientTheme.name}</p>
          <p className="text-[11px] text-ink-faint">Cliente actual</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-2.5 py-1">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand-600 text-[10px] font-bold text-white">
          T
        </div>
        <p className="text-[11px] font-medium text-ink-soft">Triario</p>
      </div>
    </div>
  );
}

export function AppShell({
  clientId,
  clientTheme,
  children,
}: {
  clientId: string;
  clientTheme: ClientTheme;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="px-4 py-5">
          <p className="text-sm font-semibold tracking-tight text-ink">Triario</p>
          <p className="text-xs text-ink-faint">Implementation Portal</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <NavLinks clientId={clientId} />
        </div>
        <BrandFooter clientTheme={clientTheme} />
      </aside>

      {/* Mobile topbar */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div>
          <p className="text-sm font-semibold tracking-tight text-ink">Triario</p>
          <p className="text-[11px] text-ink-faint">{clientTheme.name}</p>
        </div>
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-soft"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-popover">
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm font-semibold tracking-tight text-ink">Triario</p>
                <p className="text-xs text-ink-faint">Implementation Portal</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-zinc-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3">
              <NavLinks clientId={clientId} onNavigate={() => setMobileOpen(false)} />
            </div>
            <BrandFooter clientTheme={clientTheme} />
          </div>
        </div>
      ) : null}

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
