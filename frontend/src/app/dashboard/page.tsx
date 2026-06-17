"use client";

import PnlCalendar from "@/components/analytics/PnlCalendar";
import StatCard from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import type { AnalyticsData, Trade } from "@/lib/types";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-48 skeleton" />
        <div className="mt-2 h-4 w-72 skeleton" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 skeleton" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 skeleton" />
        <div className="h-80 skeleton" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [a, t] = await Promise.all([
          api.getAnalytics({ year: String(calYear), month: String(calMonth) }),
          api.getTrades(),
        ]);
        setAnalytics(a);
        setTrades(t.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [calYear, calMonth]);

  if (loading) return <LoadingSkeleton />;
  if (!analytics) return <p className="text-rose-400">Failed to load analytics</p>;

  const { overview, calendar } = analytics;

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Your trading performance at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-1">
        <div className="animate-in stagger-1">
          <StatCard label="Total P&L" value={`$${overview.total_pnl.toFixed(2)}`} trend={overview.total_pnl >= 0 ? "up" : "down"} />
        </div>
        <div className="animate-in stagger-2">
          <StatCard label="Win Rate" value={`${overview.win_rate}%`} sub={`${overview.wins}W / ${overview.losses}L`} trend={overview.win_rate >= 50 ? "up" : "down"} />
        </div>
        <div className="animate-in stagger-3">
          <StatCard label="Profit Factor" value={overview.profit_factor} sub={`Avg RR: ${overview.avg_rr.toFixed(2)}`} />
        </div>
        <div className="animate-in stagger-4">
          <StatCard
            label="Current Streak"
            value={overview.current_streak.count}
            sub={overview.current_streak.type ? `${overview.current_streak.type}s` : "—"}
            trend={overview.current_streak.type === "win" ? "up" : overview.current_streak.type === "loss" ? "down" : "neutral"}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="animate-in stagger-3">
          <PnlCalendar
            year={calYear}
            month={calMonth}
            days={calendar.days}
            monthPnl={calendar.month_pnl}
            onMonthChange={(y, m) => {
              setCalYear(y);
              setCalMonth(m);
            }}
          />
        </div>

        <div className="card p-5 animate-in stagger-4">
          <h3 className="font-semibold text-white">Recent Trades</h3>
          <div className="mt-4 space-y-2">
            {trades.length === 0 ? (
              <p className="text-sm text-slate-500">No trades yet. <Link href="/dashboard/trades/new" className="text-indigo-400 hover:text-indigo-300 transition-colors">Add your first trade</Link></p>
            ) : (
              trades.map((t) => (
                <Link
                  key={t.id}
                  href={`/dashboard/trades/${t.id}`}
                  className="group flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3 hover:bg-slate-800/60 transition-all duration-200 border border-transparent hover:border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white group-hover:text-indigo-300 transition-colors">{t.symbol}</span>
                    <span className="text-xs text-slate-500">{t.trade_date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={clsx("text-xs font-medium uppercase tracking-wider", t.result === "win" ? "text-emerald-400" : t.result === "loss" ? "text-rose-400" : "text-slate-400")}>
                      {t.result}
                    </span>
                    <span className={clsx("font-mono font-medium", parseFloat(t.pnl) >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {parseFloat(t.pnl) >= 0 ? "+" : ""}${parseFloat(t.pnl).toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
