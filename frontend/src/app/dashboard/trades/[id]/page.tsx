"use client";

import { api } from "@/lib/api";
import type { Trade, TradeAnalysis } from "@/lib/types";
import clsx from "clsx";
import { Bot, Trash2, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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

  if (!trade) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-64 skeleton" />
      <div className="grid gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton" />)}
      </div>
      <div className="h-64 skeleton" />
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/trades" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {trade.symbol}{" "}
              <span className="text-lg font-normal capitalize text-slate-400">({trade.direction})</span>
            </h1>
            <p className="text-slate-400 text-sm">
              {trade.trade_date}
              {trade.strategy_name && (
                <span
                  className="ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${trade.strategy_color ?? "#6366f1"}22`, color: trade.strategy_color ?? "#6366f1" }}
                >
                  {trade.strategy_name}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary flex items-center gap-2">
            <Bot size={16} />
            {analyzing ? "Analyzing..." : "AI Analyze"}
          </button>
          <button onClick={handleDelete} className="rounded-xl border border-rose-500/20 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-all duration-200">
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
          <div key={label} className="card p-5">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={clsx("mt-1.5 text-lg font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-5 p-6">
          <h3 className="font-semibold text-white">Trade Details</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["Entry", trade.entry_price],
              ["Exit", trade.exit_price],
              ["Stop Loss", trade.stop_loss],
              ["Take Profit", trade.take_profit],
              ["Position Size", trade.position_size],
              ["Timeframe", trade.timeframe],
              ["Planned RR", trade.planned_rr],
              ["Emotion", trade.emotional_state],
            ].map(([label, value]) => (
              <>
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-slate-200 font-medium">{value || "—"}</dd>
              </>
            ))}
          </dl>

          {trade.confluences?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Confluences</p>
              <div className="flex flex-wrap gap-2">
                {trade.confluences.map((c) => (
                  <span key={c} className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 border border-indigo-500/20">{c}</span>
                ))}
              </div>
            </div>
          )}

          {trade.timeframe_confluences?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">TF Confluences</p>
              <div className="flex flex-wrap gap-2">
                {trade.timeframe_confluences.map((c) => (
                  <span key={c} className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300 border border-violet-500/20">{c}</span>
                ))}
              </div>
            </div>
          )}

          {trade.notes && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{trade.notes}</p>
            </div>
          )}

          {trade.mistakes && (
            <div>
              <p className="text-xs font-medium text-rose-400 mb-1">Mistakes</p>
              <p className="text-sm text-slate-300">{trade.mistakes}</p>
            </div>
          )}

          {trade.lessons_learned && (
            <div>
              <p className="text-xs font-medium text-emerald-400 mb-1">Lessons</p>
              <p className="text-sm text-slate-300">{trade.lessons_learned}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {trade.images && trade.images.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4">Chart Screenshots</h3>
              <div className="grid gap-4">
                {trade.images.map((img) => (
                  <div key={img.id}>
                    <img
                      src={`data:${img.mime_type};base64,${img.image_base64}`}
                      alt={img.caption || "Trade chart"}
                      className="rounded-xl border border-slate-700/50 w-full"
                    />
                    {img.caption && <p className="mt-1.5 text-xs text-slate-500">{img.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis && (
            <div className="card p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15">
                  <Bot className="text-indigo-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Analysis</h3>
                  {analysis.ai_powered && (
                    <span className="inline-block rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-300">GPT</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>

              {analysis.strengths?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-emerald-400 mb-2">Strengths</p>
                  <div className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.improvements?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-indigo-400 mb-2">Improvements</p>
                  <div className="space-y-1">
                    {analysis.improvements.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.pattern_insight && (
                <p className="mt-4 text-sm italic text-slate-500 border-t border-slate-800/40 pt-4">{analysis.pattern_insight}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
