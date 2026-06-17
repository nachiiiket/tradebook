"use client";

import { api } from "@/lib/api";
import type { Strategy } from "@/lib/types";
import { FormEvent, useEffect, useState } from "react";

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Strategy | null>(null);

  const load = () => api.getStrategies().then(setStrategies);
  useEffect(() => { load(); }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      color: fd.get("color") as string,
      rules: fd.get("rules") as string,
    };

    if (editing) {
      await api.updateStrategy(editing.id, data);
    } else {
      await api.createStrategy(data);
    }

    setShowForm(false);
    setEditing(null);
    load();
  }

  return (
    <div className="space-y-6">
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
        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <h3 className="font-semibold text-white">{editing ? "Edit" : "New"} Strategy</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Name *</label>
              <input name="name" required defaultValue={editing?.name} placeholder="ICT Silver Bullet" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Color</label>
              <input name="color" type="color" defaultValue={editing?.color || "#6366f1"} className="h-10 w-full" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Description</label>
            <textarea name="description" rows={2} defaultValue={editing?.description} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Rules</label>
            <textarea name="rules" rows={3} defaultValue={editing?.rules} placeholder="Entry criteria, invalidation, targets..." />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {strategies.map((s) => (
          <div key={s.id} className="card p-5">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
              <h3 className="font-semibold text-white">{s.name}</h3>
            </div>
            {s.description && <p className="mt-2 text-sm text-slate-400">{s.description}</p>}
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-slate-500">{s.trade_count} trades</span>
              <span className={s.win_rate >= 50 ? "text-emerald-400" : "text-rose-400"}>{s.win_rate}% WR</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setEditing(s); setShowForm(true); }} className="text-sm text-indigo-400 hover:underline">Edit</button>
              <button onClick={async () => { if (confirm("Delete strategy?")) { await api.deleteStrategy(s.id); load(); } }} className="text-sm text-rose-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
