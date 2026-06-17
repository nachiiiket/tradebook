"use client";

import PnlCalendar from "@/components/analytics/PnlCalendar";
import StatCard from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import type { AnalyticsData } from "@/lib/types";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f43f5e", "#f59e0b", "#8b5cf6", "#06b6d4"];

const CUSTOM_TOOLTIP = {
  contentStyle: { background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "13px" },
  labelStyle: { color: "#94a3b8" },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [view, setView] = useState<"monthly" | "weekly" | "sessions" | "dow">("monthly");

  useEffect(() => {
    api.getAnalytics({ year: String(calYear), month: String(calMonth) }).then(setData);
  }, [calYear, calMonth]);

  if (!data) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 skeleton" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => <div key={i} className="h-24 skeleton" />)}
      </div>
      <div className="h-96 skeleton" />
    </div>
  );

  const { overview, calendar, monthly, weekly, sessions, strategies, day_of_week } = data;

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400">Deep dive into your trading performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total Trades", value: overview.total_trades },
          { label: "Win Rate", value: `${overview.win_rate}%`, trend: overview.win_rate >= 50 ? "up" as const : "down" as const },
          { label: "Total P&L", value: `$${overview.total_pnl.toFixed(2)}`, trend: overview.total_pnl >= 0 ? "up" as const : "down" as const },
          { label: "Avg P&L", value: `$${overview.avg_pnl.toFixed(2)}` },
          { label: "Profit Factor", value: overview.profit_factor },
        ].map((s, i) => (
          <div key={s.label} className={`animate-in stagger-${i + 1}`}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      <div className="animate-in stagger-3">
        <PnlCalendar
          year={calYear}
          month={calMonth}
          days={calendar.days}
          monthPnl={calendar.month_pnl}
          onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m); }}
        />
      </div>

      <div className="flex gap-2 animate-in stagger-4">
        {(["monthly", "weekly", "sessions", "dow"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              view === v ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/30"
            }`}
          >
            {v === "dow" ? "Day of Week" : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className="card p-6 animate-in stagger-5">
        <h3 className="mb-6 font-semibold text-white capitalize">{view === "dow" ? "Day of Week Analysis" : `${view} P&L`}</h3>
        <ResponsiveContainer width="100%" height={320}>
          {view === "monthly" ? (
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month_label" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip {...CUSTOM_TOOLTIP} />
              <Bar dataKey="pnl" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : view === "weekly" ? (
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week_start" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip {...CUSTOM_TOOLTIP} />
              <Line type="monotone" dataKey="pnl" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} />
            </LineChart>
          ) : view === "sessions" ? (
            <BarChart data={sessions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="session" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip {...CUSTOM_TOOLTIP} />
              <Bar dataKey="pnl" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={day_of_week}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day_name" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip {...CUSTOM_TOOLTIP} />
              <Bar dataKey="pnl" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6 animate-in stagger-5">
          <h3 className="mb-4 font-semibold text-white">Strategy Performance</h3>
          <div className="space-y-2">
            {strategies.map((s) => (
              <div key={s.strategy_id ?? "none"} className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3 hover:bg-slate-800/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm font-medium text-white">{s.strategy_name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">{s.win_rate}%</span>
                  <span className="text-slate-500">{s.trades} trades</span>
                  <span className={s.pnl >= 0 ? "text-emerald-400 font-mono font-semibold" : "text-rose-400 font-mono font-semibold"}>
                    {s.pnl >= 0 ? "+" : ""}${s.pnl.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 animate-in stagger-6">
          <h3 className="mb-4 font-semibold text-white">RR Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={Object.entries(data.rr_distribution).map(([name, value]) => ({ name, value }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                labelLine={false}
                label={({ name, percent }) => `${(name ?? "").replace(/_/g, " ")} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              >
                {Object.keys(data.rr_distribution).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...CUSTOM_TOOLTIP} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
