"use client";

import { useCurrentUser } from "@/components/auth/AuthGuard";
import clsx from "clsx";
import {
  BarChart3,
  BookOpen,
  Bot,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/trades", label: "Journal", icon: BookOpen },
  { href: "/dashboard/trades/new", label: "New Trade", icon: PlusCircle },
  { href: "/dashboard/strategies", label: "Strategies", icon: Target },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/ai", label: "AI Coach", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  function handleLogout() {
    api.logout();
    router.push("/login");
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="border-b border-slate-800/60 p-6">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Trade<span className="text-indigo-400">Book</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500">Trading journal & analytics</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-400" />
              )}
              <Icon size={18} className={clsx("transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/60 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/30 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">
            {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">{user?.name || user?.email || "..."}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
