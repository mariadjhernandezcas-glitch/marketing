"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StatusDistributionItem } from "@/lib/services/ticket-metrics";

const STATUS_COLOR: Record<string, string> = {
  identified: "#a1a1aa",
  to_prioritize: "#d97706",
  prioritized: "#6366f1",
  in_progress: "#2563eb",
  triario_qa: "#7c3aed",
  cosmo_validation: "#0d9488",
  blocked: "#dc2626",
  completed: "#059669",
};

export function StatusDistributionChart({ data }: { data: StatusDistributionItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 12, right: 20, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={120}
          tick={{ fontSize: 12, fill: "#3f3f46" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "#fafafa" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 12 }}
          formatter={(value: number) => [`${value} solicitudes`, ""]}
          labelFormatter={() => ""}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16} isAnimationActive={false}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLOR[entry.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
