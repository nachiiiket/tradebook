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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Trade Coach</h1>
        <p className="text-slate-400">
          Get portfolio-level insights and improvement suggestions powered by AI
        </p>
      </div>

      <div className="card p-8 text-center">
        <Bot className="mx-auto text-indigo-400" size={48} />
        <h2 className="mt-4 text-lg font-semibold text-white">Analyze your trading patterns</h2>
        <p className="mt-2 text-sm text-slate-400">
          The AI coach reviews your recent trades, win rate, confluences, and mistakes to suggest
          actionable improvements. Set <code className="text-indigo-300">OPENAI_API_KEY</code> on the backend for GPT-powered analysis.
        </p>
        <button onClick={runCoach} disabled={loading} className="btn-primary mt-6 inline-flex items-center gap-2">
          <Sparkles size={16} />
          {loading ? "Analyzing..." : "Run Portfolio Analysis"}
        </button>
      </div>

      {coach && (
        <div className="card space-y-4 p-6">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">Coach Report</h3>
            {coach.ai_powered && <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">GPT Powered</span>}
          </div>
          <p className="text-slate-300">{coach.summary}</p>

          {coach.top_patterns && coach.top_patterns.length > 0 && (
            <div>
              <p className="text-sm font-medium text-violet-400">Top Patterns</p>
              <ul className="mt-2 list-inside list-disc text-sm text-slate-400">
                {coach.top_patterns.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          {coach.recommendations.length > 0 && (
            <div>
              <p className="text-sm font-medium text-indigo-400">Recommendations</p>
              <ul className="mt-2 space-y-2">
                {coach.recommendations.map((r, i) => (
                  <li key={i} className="rounded-lg bg-slate-800/50 px-4 py-3 text-sm text-slate-300">{r}</li>
                ))}
              </ul>
            </div>
          )}

          {coach.focus_areas && coach.focus_areas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {coach.focus_areas.map((a) => (
                <span key={a} className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300">{a}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
