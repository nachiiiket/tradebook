"use client";

import { api } from "@/lib/api";
import type { Trade, TradeAnalysis } from "@/lib/types";
import clsx from "clsx";
import { Bot, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TradeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    api.getTrade(Number(id)).then(setTrade);
  }, [id]);

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const result = await api.analyzeTrade(Number(id));
      setAnalysis(result);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this trade?")) return;
    await api.deleteTrade(Number(id));
    router.push("/dashboard/trades");
  }

  if (!trade) return <p className="text-slate-400">Loading trade...</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {trade.symbol}{" "}
            <span className="text-lg font-normal capitalize text-slate-400">({trade.direction})</span>
          </h1>
          <p className="text-slate-400">
            {trade.trade_date}
            {trade.strategy_name && (
              <span className="ml-2 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: `${trade.strategy_color}22`, color: trade.strategy_color }}>
                {trade.strategy_name}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary flex items-center gap-2">
            <Bot size={16} />
            {analyzing ? "Analyzing..." : "AI Analyze"}
          </button>
          <button onClick={handleDelete} className="btn-secondary text-rose-400">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Result", value: trade.result.toUpperCase(), color: trade.result === "win" ? "text-emerald-400" : trade.result === "loss" ? "text-rose-400" : "text-slate-400" },
          { label: "P&L", value: `$${parseFloat(trade.pnl).toFixed(2)}`, color: parseFloat(trade.pnl) >= 0 ? "text-emerald-400" : "text-rose-400" },
          { label: "RR Ratio", value: trade.rr_ratio || "—", color: "text-white" },
          { label: "Session", value: trade.session?.replace("_", " ") || "—", color: "text-white" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={clsx("mt-1 text-lg font-semibold capitalize", color)}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-5">
          <h3 className="font-semibold text-white">Trade Details</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-slate-500">Entry</dt><dd className="text-slate-200">{trade.entry_price || "—"}</dd>
            <dt className="text-slate-500">Exit</dt><dd className="text-slate-200">{trade.exit_price || "—"}</dd>
            <dt className="text-slate-500">Stop Loss</dt><dd className="text-slate-200">{trade.stop_loss || "—"}</dd>
            <dt className="text-slate-500">Take Profit</dt><dd className="text-slate-200">{trade.take_profit || "—"}</dd>
            <dt className="text-slate-500">Timeframe</dt><dd className="text-slate-200">{trade.timeframe || "—"}</dd>
            <dt className="text-slate-500">Planned RR</dt><dd className="text-slate-200">{trade.planned_rr || "—"}</dd>
            <dt className="text-slate-500">Emotion</dt><dd className="text-slate-200">{trade.emotional_state || "—"}</dd>
          </dl>

          {trade.confluences?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500">Confluences</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {trade.confluences.map((c) => (
                  <span key={c} className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">{c}</span>
                ))}
              </div>
            </div>
          )}

          {trade.timeframe_confluences?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500">TF Confluences</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {trade.timeframe_confluences.map((c) => (
                  <span key={c} className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">{c}</span>
                ))}
              </div>
            </div>
          )}

          {trade.notes && (
            <div>
              <p className="text-xs text-slate-500">Notes</p>
              <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{trade.notes}</p>
            </div>
          )}

          {trade.mistakes && (
            <div>
              <p className="text-xs text-rose-400">Mistakes</p>
              <p className="mt-1 text-sm text-slate-300">{trade.mistakes}</p>
            </div>
          )}

          {trade.lessons_learned && (
            <div>
              <p className="text-xs text-emerald-400">Lessons</p>
              <p className="mt-1 text-sm text-slate-300">{trade.lessons_learned}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {trade.images && trade.images.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-white">Chart Screenshots</h3>
              <div className="mt-4 grid gap-3">
                {trade.images.map((img) => (
                  <div key={img.id}>
                    <img
                      src={`data:${img.mime_type};base64,${img.image_base64}`}
                      alt={img.caption || "Trade chart"}
                      className="rounded-lg border border-slate-700"
                    />
                    {img.caption && <p className="mt-1 text-xs text-slate-500">{img.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis && (
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <Bot className="text-indigo-400" size={20} />
                <h3 className="font-semibold text-white">AI Analysis</h3>
                {analysis.ai_powered && <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">GPT</span>}
              </div>
              <p className="mt-3 text-sm text-slate-300">{analysis.summary}</p>

              {analysis.strengths?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-emerald-400">Strengths</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-slate-400">
                    {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {analysis.improvements?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-indigo-400">Improvements</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-slate-400">
                    {analysis.improvements.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {analysis.pattern_insight && (
                <p className="mt-4 text-sm italic text-slate-500">{analysis.pattern_insight}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
