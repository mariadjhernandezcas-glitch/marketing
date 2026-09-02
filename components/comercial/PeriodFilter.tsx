"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { PeriodKey } from "@/lib/deals";

const OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "all", label: "Todo" },
  { key: "this_month", label: "Este mes" },
  { key: "last_month", label: "Mes pasado" },
];

export function PeriodFilter({ selected }: { selected: PeriodKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function go(period: PeriodKey) {
    const params = new URLSearchParams(searchParams.toString());
    if (period === "all") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    const query = params.toString();
    router.push(`/comercial${query ? `?${query}` : ""}`);
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-0.5 text-sm shadow-sm">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => go(opt.key)}
          className={`rounded-md px-3 py-1 font-medium transition-colors ${
            selected === opt.key ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
