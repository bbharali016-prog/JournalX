"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Shield,
  Wallet,
  Settings,
  CalendarDays,
  BadgeDollarSign,
  Brain,
  ChevronLeft,
  ChevronRight,
  Crown,
  Wrench,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { useCurrentUser } from "@/components/auth/UserContext";
import { getBackendUrl } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Risk", href: "/risk", icon: Shield },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Reports", href: "/reports", icon: BadgeDollarSign },
  { name: "AI Coach", href: "/ai", icon: Brain },
  { name: "Backtesting", href: "/backtesting", icon: FlaskConical },
  { name: "Tools", href: "/tools", icon: Wrench },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminMenu = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useCurrentUser();
  const displayName = user?.full_name ?? "JournalX Trader";
  const initials =
    user?.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") ?? "JX";

  const backendUrl = getBackendUrl();
  const avatarSrc = user?.profile_image_url
    ? (user.profile_image_url.startsWith("http")
        ? user.profile_image_url
        : (backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl) + user.profile_image_url)
    : undefined;

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        className={`${
          collapsed ? "lg:w-20" : "lg:w-64"
        } fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-[#081122]/90 backdrop-blur-xl transition-all duration-300 lg:sticky lg:z-0 lg:flex
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-5">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg shadow-violet-500/20">
                <Image
                  src="/brand/journalfx-logo.png"
                  alt="JournalFX"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  JournalFX
                </h1>
                <p className="text-xs text-slate-400">
                  All-in-One Trading Journal
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg shadow-violet-500/20">
              <Image
                src="/brand/journalfx-logo.png"
                alt="JournalFX"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
              />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:block hidden"
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {(user?.is_admin ? adminMenu : menu).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen?.(false)}
                className={`mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all
                  ${
                    active
                      ? "border border-violet-400/20 bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-white shadow-lg shadow-violet-500/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon size={18} />

                {(mobileOpen || !collapsed) && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>


      {!collapsed && !user?.is_admin && (
        <div className="px-4 pb-4">
          {user?.plan?.toLowerCase() === "elite" ? (
            <div className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 via-[#0a1826] to-[#040912] p-5 shadow-2xl shadow-emerald-950/20">
              <div className="mb-4 flex items-center gap-2 text-emerald-300">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-medium">Elite Plan Active</span>
              </div>
              <p className="text-xs leading-5 text-slate-300">
                All features unlocked! You have full access to Backtesting chat, advanced risk settings, and live coach.
              </p>
              <Link
                href="/plans"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:opacity-95"
              >
                Manage Subscription
              </Link>
            </div>
          ) : user?.plan?.toLowerCase() === "pro" ? (
            <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 via-[#13102c] to-[#080514] p-5 shadow-2xl shadow-violet-950/20">
              <div className="mb-4 flex items-center gap-2 text-violet-300">
                <Crown className="h-5 w-5 text-violet-400" />
                <span className="text-sm font-medium">Pro Plan Active</span>
              </div>
              <p className="text-xs leading-5 text-slate-300">
                Advanced features unlocked. Upgrade to Elite for TradingView chat and collaborative sandbox tools.
              </p>
              <Link
                href="/plans"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-95"
              >
                Upgrade to Elite
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 via-[#151c3a] to-[#0b1020] p-5 shadow-2xl shadow-violet-950/30">
              <div className="mb-4 flex items-center gap-2 text-amber-300">
                <Crown className="h-5 w-5" />
                <span className="text-sm font-medium">Upgrade to Pro</span>
              </div>
              <p className="text-xs leading-5 text-slate-300">
                Unlock advanced analytics, AI insights, and funded account tracking.
              </p>
              <Link
                href="/plans"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-95"
              >
                Upgrade Now
              </Link>
            </div>
          )}
        </div>
      )}

      {!collapsed && (
        <div className="border-t border-white/5 px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
            <Avatar className="h-11 w-11 rounded-xl">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} className="object-cover rounded-xl" />}
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold rounded-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-400">
                Signed in user
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}
