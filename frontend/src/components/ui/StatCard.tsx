import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({ label, value, sub, trend = "neutral" }: StatCardProps) {
  return (
    <div className={clsx(
      "group rounded-2xl border p-5 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
      trend === "up"
        ? "border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-slate-900/60 hover:border-emerald-500/30 hover:shadow-emerald-500/5"
        : trend === "down"
        ? "border-rose-500/20 bg-gradient-to-b from-rose-500/5 to-slate-900/60 hover:border-rose-500/30 hover:shadow-rose-500/5"
        : "border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-900/40 hover:border-slate-700/60"
    )}>
      <p className="text-sm text-slate-400">{label}</p>
      <p
        className={clsx("mt-1.5 text-2xl font-bold tracking-tight", {
          "text-emerald-400": trend === "up",
          "text-rose-400": trend === "down",
          "text-white": trend === "neutral",
        })}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
