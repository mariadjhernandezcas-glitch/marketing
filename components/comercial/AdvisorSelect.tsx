"use client";

import { useRouter } from "next/navigation";
import type { AdvisorOption } from "@/lib/deals";

export function AdvisorSelect({
  advisors,
  selected,
}: {
  advisors: AdvisorOption[];
  selected: string;
}) {
  const router = useRouter();

  return (
    <select
      value={selected}
      onChange={(e) => router.push(`/comercial?advisor=${encodeURIComponent(e.target.value)}`)}
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
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
  );
}
