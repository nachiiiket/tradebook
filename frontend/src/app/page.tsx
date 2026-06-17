import Link from "next/link";
import { TrendingUp, BookOpen, BarChart3, Bot, Sparkles, ArrowRight } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Rich journaling", desc: "Notes, confluences, RR, sessions, images — capture every edge", gradient: "from-indigo-500/20 to-indigo-600/10" },
  { icon: TrendingUp, title: "Strategy tracking", desc: "Tag trades by strategy, compare performance side by side", gradient: "from-emerald-500/20 to-emerald-600/10" },
  { icon: BarChart3, title: "Deep analytics", desc: "Win rate, calendar P&L, weekly trends, session breakdowns", gradient: "from-violet-500/20 to-violet-600/10" },
  { icon: Bot, title: "AI trade coach", desc: "GPT-powered feedback on every trade and portfolio-level insights", gradient: "from-cyan-500/20 to-cyan-600/10" },
];

const stats = [
  { value: "100%", label: "Free to use" },
  { value: "AI-driven", label: "Smart analysis" },
  { value: "Zero setup", label: "Start in seconds" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <h1 className="text-2xl font-bold text-white">
          Trade<span className="text-indigo-400">Book</span>
        </h1>
        <div className="flex gap-3">
          <Link href="/login" className="btn-secondary text-sm">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Get started
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <Sparkles size={14} />
            AI-Powered Trading Journal
          </div>
          <h2 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Journal every trade.
            <br />
            <span className="gradient-text">Master your edge.</span>
          </h2>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            TradeBook is a modern trading journal with email sign-in, compressed chart screenshots,
            strategy tracking, deep analytics, and an AI coach that helps you improve with every trade.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 hover:shadow-indigo-500/40 transition-all duration-200 active:scale-[0.98]"
            >
              Create free account
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3.5">
              Sign in
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 sm:gap-16">
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <p className="text-2xl font-bold gradient-text">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-24">
          <p className="text-center text-sm font-medium text-indigo-400 uppercase tracking-widest">Everything you need</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc, gradient }, i) => (
              <div
                key={title}
                className={`group relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-b ${gradient} to-slate-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-slate-700/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="inline-flex rounded-xl bg-indigo-500/10 p-3 ring-1 ring-indigo-500/20">
                    <Icon className="text-indigo-400" size={24} />
                  </div>
                  <h3 className="mt-5 font-semibold text-white text-lg">{title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative border-t border-slate-800/50 py-8 text-center text-sm text-slate-600">
        TradeBook &mdash; Built for traders who want to improve
      </footer>
    </div>
  );
}
