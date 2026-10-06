"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PeriodKey } from "@/lib/deals";

const OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "all", label: "Todo" },
  { key: "this_month", label: "Este mes" },
  { key: "last_month", label: "Mes pasado" },
];

export function PeriodFilter({
  selected,
  isCustom,
  from,
  to,
}: {
  selected: PeriodKey;
  isCustom: boolean;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCustom, setShowCustom] = useState(isCustom);
  const [fromValue, setFromValue] = useState(from ?? "");
  const [toValue, setToValue] = useState(to ?? "");

  function go(period: PeriodKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    if (period === "all") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    const query = params.toString();
    router.push(`/comercial${query ? `?${query}` : ""}`);
  }

  function applyCustom() {
    if (!fromValue || !toValue) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("period");
    params.set("from", fromValue);
    params.set("to", toValue);
    router.push(`/comercial?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-0.5 text-sm shadow-sm">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => {
              setShowCustom(false);
              go(opt.key);
            }}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              !isCustom && selected === opt.key ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom((v) => !v)}
          className={`rounded-md px-3 py-1 font-medium transition-colors ${
            isCustom ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Fecha personalizada
        </button>
      </div>
      {showCustom && (
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white p-1.5 shadow-sm">
          <input
            type="date"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="rounded border border-slate-200 px-1.5 py-0.5 text-xs"
          />
          <span className="text-xs text-slate-400">a</span>
          <input
            type="date"
            value={toValue}
            onChange={(e) => setToValue(e.target.value)}
            className="rounded border border-slate-200 px-1.5 py-0.5 text-xs"
          />
          <button
            onClick={applyCustom}
            disabled={!fromValue || !toValue}
            className="rounded bg-brand-500 px-2 py-0.5 text-xs font-medium text-white disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
