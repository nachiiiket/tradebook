"use client";

import type { CalendarDay } from "@/lib/types";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  year: number;
  month: number;
  days: CalendarDay[];
  monthPnl: number;
  onMonthChange: (year: number, month: number) => void;
}

export default function PnlCalendar({ year, month, days, monthPnl, onMonthChange }: Props) {
  const firstDay = new Date(year, month - 1, 1).getDay();

  const prev = () => {
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    onMonthChange(y, m);
  };

  const next = () => {
    const m = month === 12 ? 1 : month + 1;
    const y = month === 12 ? year + 1 : year;
    onMonthChange(y, m);
  };

  const dayMap = Object.fromEntries(days.map((d) => [d.day, d]));
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const cells = Array.from({ length: days.length }, (_, i) => i + 1);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={prev} className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h3 className="font-semibold text-white">
            {new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          <p className={clsx("text-sm", monthPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
            Month P&L: {monthPnl >= 0 ? "+" : ""}
            {monthPnl.toFixed(2)}
          </p>
        </div>
        <button onClick={next} className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
        {blanks.map((b) => (
          <div key={`blank-${b}`} />
        ))}
        {cells.map((day) => {
          const data = dayMap[day];
          const pnl = data?.pnl ?? 0;
          const hasTrades = (data?.trades ?? 0) > 0;
          return (
            <div
              key={day}
              className={clsx(
                "rounded-lg p-2 min-h-[52px] border",
                hasTrades
                  ? pnl >= 0
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-rose-500/30 bg-rose-500/10"
                  : "border-transparent bg-slate-800/30"
              )}
            >
              <div className="text-slate-300">{day}</div>
              {hasTrades && (
                <div className={clsx("text-[10px] font-medium", pnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {pnl >= 0 ? "+" : ""}
                  {pnl.toFixed(0)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
