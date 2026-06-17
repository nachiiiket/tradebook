"use client";

import { api } from "@/lib/api";
import type { Strategy } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const SESSIONS = ["asia", "london", "new_york", "overlap", "other"];
const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1H", "4H", "D", "W"];

function TagInput({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };

  return (
    <div>
      <label className="mb-1 block text-sm text-slate-400">{label}</label>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder="Type and press Enter" className="flex-1" />
        <button type="button" onClick={add} className="btn-secondary">Add</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:text-white">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function NewTradePage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [confluences, setConfluences] = useState<string[]>([]);
  const [tfConfluences, setTfConfluences] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getStrategies().then(setStrategies);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    try {
      const trade = await api.createTrade({
        symbol: fd.get("symbol") as string,
        direction: fd.get("direction") as "long" | "short",
        result: fd.get("result") as "win" | "loss" | "breakeven",
        strategy: fd.get("strategy") ? Number(fd.get("strategy")) : null,
        entry_price: fd.get("entry_price") as string,
        exit_price: fd.get("exit_price") as string,
        stop_loss: fd.get("stop_loss") as string,
        take_profit: fd.get("take_profit") as string,
        position_size: fd.get("position_size") as string,
        rr_ratio: fd.get("rr_ratio") as string,
        planned_rr: fd.get("planned_rr") as string,
        pnl: fd.get("pnl") as string,
        trade_date: fd.get("trade_date") as string,
        trade_time: (fd.get("trade_time") as string) || undefined,
        session: fd.get("session") as string,
        timeframe: fd.get("timeframe") as string,
        notes: fd.get("notes") as string,
        emotional_state: fd.get("emotional_state") as string,
        mistakes: fd.get("mistakes") as string,
        lessons_learned: fd.get("lessons_learned") as string,
        confluences,
        timeframe_confluences: tfConfluences,
      });

      for (const file of images) {
        await api.uploadTradeImage(trade.id, file);
      }

      router.push(`/dashboard/trades/${trade.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save trade");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Log New Trade</h1>
        <p className="text-slate-400">Record your trade with full context</p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Symbol *</label>
            <input name="symbol" required placeholder="EURUSD, NQ, BTC..." />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Strategy</label>
            <select name="strategy" defaultValue="">
              <option value="">No strategy</option>
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Direction *</label>
            <select name="direction" required>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Result *</label>
            <select name="result" required>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="breakeven">Breakeven</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Trade Date *</label>
            <input name="trade_date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Trade Time</label>
            <input name="trade_time" type="time" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Session</label>
            <select name="session" defaultValue="other">
              {SESSIONS.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Timeframe</label>
            <select name="timeframe" defaultValue="15m">
              {TIMEFRAMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Entry Price</label>
            <input name="entry_price" type="number" step="any" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Exit Price</label>
            <input name="exit_price" type="number" step="any" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Position Size</label>
            <input name="position_size" type="number" step="any" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Stop Loss</label>
            <input name="stop_loss" type="number" step="any" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Take Profit</label>
            <input name="take_profit" type="number" step="any" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">P&L ($) *</label>
            <input name="pnl" type="number" step="any" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">RR Ratio</label>
            <input name="rr_ratio" type="number" step="any" placeholder="e.g. 2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Planned RR</label>
            <input name="planned_rr" type="number" step="any" />
          </div>
        </div>

        <TagInput label="Confluences" values={confluences} onChange={setConfluences} />
        <TagInput label="Timeframe Confluences" values={tfConfluences} onChange={setTfConfluences} />

        <div>
          <label className="mb-1 block text-sm text-slate-400">Notes</label>
          <textarea name="notes" rows={4} placeholder="Trade thesis, execution notes..." />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Emotional State</label>
            <input name="emotional_state" placeholder="Calm, FOMO, revenge..." />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Mistakes</label>
            <input name="mistakes" placeholder="What went wrong?" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Lessons Learned</label>
          <textarea name="lessons_learned" rows={2} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Chart Screenshots</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full"
          />
          <p className="mt-1 text-xs text-slate-500">Images are compressed and stored in the database</p>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Trade"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
