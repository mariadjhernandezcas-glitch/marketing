"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { AdvisorOption } from "@/lib/deals";

export function AdvisorTabs({
  advisors,
  selected,
}: {
  advisors: AdvisorOption[];
  selected: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function go(email: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (email) {
      params.set("advisor", email);
    } else {
      params.delete("advisor");
    }
    const query = params.toString();
    router.push(`/comercial${query ? `?${query}` : ""}`);
  }

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
      <button
        onClick={() => go(null)}
        className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
          selected === null
            ? "border-brand-500 text-brand-600"
            : "border-transparent text-slate-500 hover:text-slate-700"
        }`}
      >
        Todas
      </button>
      {advisors.map((advisor) => (
        <button
          key={advisor.email}
          onClick={() => go(advisor.email)}
          className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            selected === advisor.email
              ? "border-brand-500 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          {advisor.email}
        </button>
      ))}
    </div>
  );
}
