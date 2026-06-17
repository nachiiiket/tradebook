"use client";

import { api } from "@/lib/api";
import type { Trade } from "@/lib/types";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTrades(filter ? { result: filter } : undefined).then(setTrades).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
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
        {["", "win", "loss", "breakeven"].map((f) => (
          <button
            key={f || "all"}
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-sm capitalize",
              filter === f ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : trades.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">No trades found</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Strategy</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">RR</th>
                <th className="px-4 py-3 text-right">P&L</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/trades/${t.id}`} className="text-indigo-400 hover:underline">
                      {t.trade_date}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{t.symbol}</td>
                  <td className="px-4 py-3 capitalize text-slate-300">{t.direction}</td>
                  <td className="px-4 py-3">
                    {t.strategy_name ? (
                      <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: `${t.strategy_color ?? "#6366f1"}22`, color: t.strategy_color ?? undefined }}>
                        {t.strategy_name}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-400">{t.session?.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <span className={clsx("uppercase text-xs font-medium", t.result === "win" ? "text-emerald-400" : t.result === "loss" ? "text-rose-400" : "text-slate-400")}>
                      {t.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{t.rr_ratio || "—"}</td>
                  <td className={clsx("px-4 py-3 text-right font-medium", parseFloat(t.pnl) >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    ${parseFloat(t.pnl).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
