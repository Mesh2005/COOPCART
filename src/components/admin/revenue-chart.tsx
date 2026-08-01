"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { DailyRevenue, GradeRevenue, PaymentMethodSplit } from "@/lib/data/admin/reports";

const COLORS = ["#6F4A2E", "#F2B441", "#6B8E5A", "#C8956B", "#A8C5A0"];

function fmtLKR(v: number) {
  return `Rs. ${v.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

export function RevenueAreaChart({ data }: { data: DailyRevenue[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6F4A2E" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6F4A2E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip
          formatter={(v) => [fmtLKR(Number(v)), "Revenue"]}
          labelStyle={{ fontSize: 12 }}
          contentStyle={{ fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#6F4A2E"
          strokeWidth={2}
          fill="url(#rev)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GradeBarChart({ data }: { data: GradeRevenue[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
        <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip
          formatter={(v, name) => [
            name === "revenue" ? fmtLKR(Number(v)) : `${v} trays`,
            name === "revenue" ? "Revenue" : "Trays",
          ]}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="revenue" fill="#6F4A2E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PaymentPieChart({ data }: { data: PaymentMethodSplit[] }) {
  const formatted = data.map((d) => ({
    name: d.method === "bank_transfer" ? "Bank transfer" : "Cash on delivery",
    value: d.count,
    revenue: d.revenue,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={formatted}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={70}
          label={({ name, percent }) =>
            `${(name ?? "").split(" ")[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {formatted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
