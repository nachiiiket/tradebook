import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({ label, value, sub, trend = "neutral" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
      <p className="text-sm text-slate-400">{label}</p>
      <p
        className={clsx("mt-1 text-2xl font-semibold", {
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
