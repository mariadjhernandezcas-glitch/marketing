"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SprintEvolutionItem } from "@/lib/services/sprint-service";

const LEGEND_LABEL: Record<string, string> = {
  completed: "Completadas",
  inProgressOrOpen: "En curso / restante",
  carryOver: "Carry-over",
};

export function SprintEvolutionChart({ data }: { data: SprintEvolutionItem[] }) {
  const chartData = data.map((item) => ({
    sprintName: item.sprintName.replace("Sprint ", "S"),
    completed: item.completed,
    inProgressOrOpen: Math.max(item.committed - item.completed - item.carryOver, 0),
    carryOver: item.carryOver,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ left: -12, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="sprintName" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "#fafafa" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 12 }}
          formatter={(value: number, key: string) => [`${value}`, LEGEND_LABEL[key] ?? key]}
        />
        <Legend
          formatter={(value) => <span className="text-xs text-ink-soft">{LEGEND_LABEL[value] ?? value}</span>}
          iconSize={8}
          iconType="circle"
        />
        <Bar dataKey="completed" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        <Bar dataKey="inProgressOrOpen" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        <Bar dataKey="carryOver" stackId="a" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
