"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/format";
import { ChartTooltip } from "./chart-tooltip";
import { shortDay, type DayRow, type MethodRow } from "./report-data";

export const COLORS = {
  revenueLine: "#5B9BD5",
  expenseLine: "#E10600",
  revenueBar: "#16A34A",
  expenseBar: "#E10600",
  Tunai: "#22C55E",
  QRIS: "#F59E0B",
  Debit: "#0EA5E9",
} as const;

const axisTick = { fill: "var(--muted)", fontSize: 11 };

export type MainMode = "pendapatan" | "pengeluaran" | "perbandingan";

export function MainChart({ mode, days }: { mode: MainMode; days: DayRow[] }) {
  const data =
    mode === "pendapatan"
      ? days.filter((d) => d.revenue > 0)
      : mode === "pengeluaran"
        ? days.filter((d) => d.expense > 0)
        : days;

  const showRevenue = mode !== "pengeluaran";
  const showExpense = mode !== "pendapatan";

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={0}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" />
        <XAxis
          dataKey="date"
          tickFormatter={shortDay}
          tick={axisTick}
          stroke="var(--line)"
          padding={{ left: 12, right: 12 }}
        />
        <YAxis
          tickFormatter={formatNumber}
          tick={axisTick}
          stroke="var(--line)"
          width={72}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ stroke: "var(--line)", strokeDasharray: "4 4" }}
        />
        {showRevenue && (
          <Line
            type="monotone"
            dataKey="revenue"
            name="Pendapatan"
            stroke={COLORS.revenueLine}
            strokeWidth={2}
            dot={{ r: 4, stroke: "#1A4B9B", strokeWidth: 2, fill: "#FFFFFF" }}
            activeDot={{ r: 5 }}
            animationDuration={700}
          />
        )}
        {showExpense && (
          <Line
            type="monotone"
            dataKey="expense"
            name="Pengeluaran"
            stroke={COLORS.expenseLine}
            strokeWidth={2}
            dot={{
              r: 4,
              stroke: COLORS.expenseLine,
              strokeWidth: 2,
              fill: "#FFFFFF",
            }}
            activeDot={{ r: 5 }}
            animationDuration={700}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MethodDonut({ methods }: { methods: MethodRow[] }) {
  return (
    <ResponsiveContainer width={180} height={180} minWidth={0}>
      <PieChart>
        <Pie
          data={methods}
          dataKey="count"
          nameKey="method"
          innerRadius={48}
          outerRadius={90}
          startAngle={90}
          endAngle={-270}
          stroke="none"
          animationDuration={700}
        >
          {methods.map((m) => (
            <Cell key={m.method} fill={COLORS[m.method]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CompareBars({ days }: { days: DayRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={240} minWidth={0}>
      <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" />
        <XAxis
          dataKey="date"
          tickFormatter={shortDay}
          tick={axisTick}
          stroke="var(--line)"
        />
        <YAxis
          tickFormatter={formatNumber}
          tick={axisTick}
          stroke="var(--line)"
          width={72}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "var(--surface)", opacity: 0.6 }}
        />
        <Bar
          dataKey="revenue"
          name="Pendapatan"
          fill={COLORS.revenueBar}
          animationDuration={700}
        />
        <Bar
          dataKey="expense"
          name="Pengeluaran"
          fill={COLORS.expenseBar}
          animationDuration={700}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
