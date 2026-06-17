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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [view, setView] = useState<"monthly" | "weekly" | "sessions" | "dow">("monthly");

  useEffect(() => {
    api.getAnalytics({ year: String(calYear), month: String(calMonth) }).then(setData);
  }, [calYear, calMonth]);

  if (!data) return <p className="text-slate-400">Loading analytics...</p>;

  const { overview, calendar, monthly, weekly, sessions, strategies, day_of_week } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400">Deep dive into your trading performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Trades" value={overview.total_trades} />
        <StatCard label="Win Rate" value={`${overview.win_rate}%`} trend={overview.win_rate >= 50 ? "up" : "down"} />
        <StatCard label="Total P&L" value={`$${overview.total_pnl.toFixed(2)}`} trend={overview.total_pnl >= 0 ? "up" : "down"} />
        <StatCard label="Avg P&L" value={`$${overview.avg_pnl.toFixed(2)}`} />
        <StatCard label="Profit Factor" value={overview.profit_factor} />
      </div>

      <PnlCalendar
        year={calYear}
        month={calMonth}
        days={calendar.days}
        monthPnl={calendar.month_pnl}
        onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m); }}
      />

      <div className="flex gap-2">
        {(["monthly", "weekly", "sessions", "dow"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${view === v ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            {v === "dow" ? "Day of Week" : v}
          </button>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-semibold text-white capitalize">{view === "dow" ? "Day of Week Analysis" : `${view} P&L`}</h3>
        <ResponsiveContainer width="100%" height={300}>
          {view === "monthly" ? (
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month_label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              <Bar dataKey="pnl" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : view === "weekly" ? (
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week_start" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              <Line type="monotone" dataKey="pnl" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} />
            </LineChart>
          ) : view === "sessions" ? (
            <BarChart data={sessions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="session" tick={{ fill: "#94a3b8" }} />
              <YAxis tick={{ fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              <Bar dataKey="pnl" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={day_of_week}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day_name" tick={{ fill: "#94a3b8" }} />
              <YAxis tick={{ fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              <Bar dataKey="pnl" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-white">Strategy Performance</h3>
          <div className="space-y-3">
            {strategies.map((s) => (
              <div key={s.strategy_id ?? "none"} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm text-white">{s.strategy_name}</span>
                </div>
                <div className="text-right text-sm">
                  <span className={s.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>${s.pnl.toFixed(2)}</span>
                  <span className="ml-3 text-slate-500">{s.win_rate}% · {s.trades} trades</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-white">RR Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={Object.entries(data.rr_distribution).map(([name, value]) => ({ name, value }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {Object.keys(data.rr_distribution).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
