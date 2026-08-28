"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WorkstreamDistributionItem } from "@/lib/services/ticket-metrics";

export function WorkstreamChart({ data }: { data: WorkstreamDistributionItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -12, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="workstream"
          tick={{ fontSize: 11, fill: "#71717a" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={54}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "#fafafa" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 12 }}
          formatter={(value: number) => [`${value} solicitudes`, ""]}
        />
        <Bar dataKey="count" fill="#18181b" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
