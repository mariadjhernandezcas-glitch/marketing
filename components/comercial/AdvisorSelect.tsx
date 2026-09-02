"use client";

import { useRouter } from "next/navigation";
import type { AdvisorOption } from "@/lib/deals";
import { IconUser } from "./icons";

export function AdvisorSelect({
  advisors,
  selected,
}: {
  advisors: AdvisorOption[];
  selected: string;
}) {
  const router = useRouter();

  return (
    <div className="relative flex items-center">
      <IconUser className="pointer-events-none absolute left-2.5 h-4 w-4 text-slate-400" />
      <select
        value={selected}
        onChange={(e) => router.push(`/comercial?advisor=${encodeURIComponent(e.target.value)}`)}
        aria-label="Asesora"
        className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-8 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        {!advisors.some((a) => a.email === selected) && (
          <option value={selected}>{selected}</option>
        )}
        {advisors.map((advisor) => (
          <option key={advisor.email} value={advisor.email}>
            {advisor.email} ({advisor.dealCount} negocios)
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
