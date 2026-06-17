"use client";

import { api } from "@/lib/api";
import type { Trade } from "@/lib/types";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";

const FILTERS = [
  { value: "", label: "All" },
  { value: "win", label: "Wins" },
  { value: "loss", label: "Losses" },
  { value: "breakeven", label: "BE" },
];

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTrades(filter ? { result: filter } : undefined).then(setTrades).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade Journal</h1>
          <p className="text-slate-400">All your logged trades</p>
        </div>
        <Link href="/dashboard/trades/new" className="btn-primary">
          + New Trade
        </Link>
      </div>

      <div className="flex gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={clsx(
              "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              filter === value
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/30"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 skeleton rounded-xl" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-slate-500">No trades found</p>
          <Link href="/dashboard/trades/new" className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Log your first trade
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden border-slate-800/40">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/60">
                  <th className="px-4 py-3.5 text-left font-medium text-slate-400">Date</th>
                  <th className="px-4 py-3.5 text-left font-medium text-slate-400">Symbol</th>
                  <th className="px-4 py-3.5 text-left font-medium text-slate-400">Direction</th>
                  <th className="px-4 py-3.5 text-left font-medium text-slate-400">Strategy</th>
                  <th className="px-4 py-3.5 text-left font-medium text-slate-400">Session</th>
                  <th className="px-4 py-3.5 text-left font-medium text-slate-400">Result</th>
                  <th className="px-4 py-3.5 text-left font-medium text-slate-400">RR</th>
                  <th className="px-4 py-3.5 text-right font-medium text-slate-400">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr
                    key={t.id}
                    className={clsx(
                      "border-b border-slate-800/30 transition-all duration-150 hover:bg-slate-800/40 group cursor-pointer",
                      i === trades.length - 1 && "border-b-0"
                    )}
                    onClick={() => window.location.href = `/dashboard/trades/${t.id}`}
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-slate-300 group-hover:text-white transition-colors">{t.trade_date}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-white">{t.symbol}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={clsx(
                        "text-xs font-medium uppercase tracking-wider",
                        t.direction === "long" ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {t.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {t.strategy_name ? (
                        <span
                          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: `${t.strategy_color ?? "#6366f1"}22`, color: t.strategy_color ?? "#6366f1" }}
                        >
                          {t.strategy_name}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-400 capitalize">{t.session?.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider",
                        t.result === "win" ? "text-emerald-400" : t.result === "loss" ? "text-rose-400" : "text-slate-400"
                      )}>
                        <span className={clsx(
                          "h-1.5 w-1.5 rounded-full",
                          t.result === "win" ? "bg-emerald-400" : t.result === "loss" ? "bg-rose-400" : "bg-slate-400"
                        )} />
                        {t.result}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">{t.rr_ratio || "—"}</td>
                    <td className={clsx(
                      "px-4 py-3.5 text-right font-mono font-semibold",
                      parseFloat(t.pnl) >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {parseFloat(t.pnl) >= 0 ? "+" : ""}${parseFloat(t.pnl).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
