"use client";

import { api } from "@/lib/api";
import type { Strategy } from "@/lib/types";
import { FormEvent, useEffect, useState } from "react";

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Strategy | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.getStrategies().then(setStrategies);
  useEffect(() => { load(); }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      color: fd.get("color") as string,
      rules: fd.get("rules") as string,
    };

    try {
      if (editing) {
        await api.updateStrategy(editing.id, data);
      } else {
        await api.createStrategy(data);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Strategies</h1>
          <p className="text-slate-400">Define and track your trading strategies</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          + Add Strategy
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card space-y-5 p-6 animate-slide-down">
          <h3 className="text-lg font-semibold text-white">{editing ? "Edit" : "New"} Strategy</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Name *</label>
              <input name="name" required defaultValue={editing?.name} placeholder="ICT Silver Bullet" className="w-full" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Color</label>
              <input name="color" type="color" defaultValue={editing?.color || "#6366f1"} className="h-11 w-full rounded-xl bg-slate-900 border border-slate-700/50 p-1" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Description</label>
            <textarea name="description" rows={2} defaultValue={editing?.description} className="w-full" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Rules</label>
            <textarea name="rules" rows={3} defaultValue={editing?.rules} placeholder="Entry criteria, invalidation, targets..." className="w-full" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {strategies.map((s, i) => (
          <div
            key={s.id}
            className={`card p-5 animate-in stagger-${Math.min(i + 1, 6)} group cursor-pointer hover:-translate-y-0.5`}
          >
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-slate-900" style={{ backgroundColor: s.color, ringColor: s.color }} />
              <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{s.name}</h3>
            </div>
            {s.description && <p className="mt-3 text-sm text-slate-400 leading-relaxed">{s.description}</p>}
            <div className="mt-4 flex gap-4 text-sm">
              <span className="rounded-lg bg-slate-800/50 px-2.5 py-1 text-slate-400">{s.trade_count} trades</span>
              <span className={`rounded-lg px-2.5 py-1 ${s.win_rate >= 50 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                {s.win_rate}% WR
              </span>
            </div>
            <div className="mt-4 flex gap-3 border-t border-slate-800/40 pt-4">
              <button onClick={() => { setEditing(s); setShowForm(true); }} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
              <button onClick={async () => { if (confirm("Delete strategy?")) { await api.deleteStrategy(s.id); load(); } }} className="text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors">Delete</button>
            </div>
          </div>
        ))}
        {strategies.length === 0 && !showForm && (
          <div className="col-span-full card p-16 text-center">
            <p className="text-slate-500">No strategies yet. Create your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
