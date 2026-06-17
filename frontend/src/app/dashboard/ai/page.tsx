"use client";

import { api } from "@/lib/api";
import type { PortfolioCoach } from "@/lib/types";
import { Bot, Sparkles } from "lucide-react";
import { useState } from "react";

export default function AICoachPage() {
  const [coach, setCoach] = useState<PortfolioCoach | null>(null);
  const [loading, setLoading] = useState(false);

  async function runCoach() {
    setLoading(true);
    try {
      const result = await api.portfolioCoach();
      setCoach(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Trade Coach</h1>
        <p className="text-slate-400">
          Get portfolio-level insights and improvement suggestions powered by AI
        </p>
      </div>

      <div className="card p-10 text-center animate-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-1 ring-indigo-500/20">
          <Bot className="text-indigo-400" size={32} />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-white">Analyze your trading patterns</h2>
        <p className="mt-3 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          The AI coach reviews your recent trades, win rate, confluences, and mistakes to suggest
          actionable improvements. Set <code className="rounded bg-slate-800 px-2 py-0.5 text-indigo-300 text-xs">OPENAI_API_KEY</code> on the backend for GPT-powered analysis.
        </p>
        <button onClick={runCoach} disabled={loading} className="btn-primary mt-8 inline-flex items-center gap-2">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Analyzing...
            </span>
          ) : (
            <>
              <Sparkles size={16} />
              Run Portfolio Analysis
            </>
          )}
        </button>
      </div>

      {coach && (
        <div className="card space-y-5 p-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15">
              <Bot className="text-indigo-400" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Coach Report</h3>
              {coach.ai_powered && (
                <span className="inline-block rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
                  GPT Powered
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed">{coach.summary}</p>

          {coach.top_patterns && coach.top_patterns.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-violet-400 mb-2">Top Patterns</p>
              <div className="space-y-1.5">
                {coach.top_patterns.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {coach.recommendations.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-indigo-400 mb-2">Recommendations</p>
              <div className="space-y-2">
                {coach.recommendations.map((r, i) => (
                  <div key={i} className="rounded-xl bg-slate-800/40 px-4 py-3 text-sm text-slate-300 border border-slate-700/30">
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {coach.focus_areas && coach.focus_areas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {coach.focus_areas.map((a) => (
                <span key={a} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 border border-amber-500/20">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
