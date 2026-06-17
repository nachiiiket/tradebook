import Link from "next/link";
import { TrendingUp, BookOpen, BarChart3, Bot } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <h1 className="text-2xl font-bold text-white">
          Trade<span className="text-indigo-400">Book</span>
        </h1>
        <div className="flex gap-3">
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Journal every trade. Master your edge.
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            TradeBook is a dynamic trading journal with email sign-in, compressed chart screenshots,
            strategy tracking, deep analytics, and an AI coach to help you improve.
          </p>
          <Link href="/register" className="btn-primary mt-8 inline-block">
            Create free account
          </Link>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, title: "Rich journaling", desc: "Notes, confluences, RR, sessions, images" },
            { icon: TrendingUp, title: "Strategy tracking", desc: "Tag trades by strategy and compare performance" },
            { icon: BarChart3, title: "Analytics engine", desc: "Win rate, calendar P&L, weekly & monthly views" },
            { icon: Bot, title: "AI trade coach", desc: "Get personalized feedback on every trade" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <Icon className="text-indigo-400" size={28} />
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
