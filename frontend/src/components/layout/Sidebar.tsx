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
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Trade<span className="text-indigo-400">Book</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500">Trading journal & analytics</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <p className="truncate text-sm text-slate-300">{user?.name || user?.email || "..."}</p>
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 text-sm text-slate-500 hover:text-rose-400"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
