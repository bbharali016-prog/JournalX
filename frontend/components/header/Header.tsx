"use client";

import Link from "next/link";
import NotificationButton from "./NotificationButton";
import UserMenu from "./UserMenu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Crown, CalendarRange, Sparkles, Menu } from "lucide-react";
import { useCurrentUser } from "@/components/auth/UserContext";
import { useActiveAccount } from "@/components/auth/AccountContext";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user } = useCurrentUser();
  const { accounts, selectedAccountId, setSelectedAccountId } = useActiveAccount();
  const displayName = user?.full_name ?? "Trader";

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[#050b18]/80 px-4 py-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {/* Mobile hamburger menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="border border-white/10 text-slate-300 hover:bg-white/5 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden flex-col sm:flex">
            <p className="text-sm text-slate-400">Welcome back,</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {displayName} 👋
            </h1>
            <p className="text-sm text-slate-400">
              Track. Analyze. Improve. Become Profitable.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          {/* Account Switcher */}
          <div className="flex items-center gap-2">
            <select
              value={selectedAccountId === null ? "all" : selectedAccountId}
              onChange={(e) =>
                setSelectedAccountId(
                  e.target.value === "all" ? null : Number(e.target.value)
                )
              }
              className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-2 text-sm font-semibold text-slate-200 outline-none cursor-pointer focus:border-violet-500/50"
            >
              <option value="all" className="bg-[#0b1220] text-slate-200">
                All Accounts
              </option>
              {accounts.map((acc) => (
                <option
                  key={acc.id}
                  value={acc.id}
                  className="bg-[#0b1220] text-slate-200"
                >
                  {acc.name} ({acc.platform})
                </option>
              ))}
            </select>
          </div>

          {user?.plan?.toLowerCase() === "elite" ? (
            <Link
              href="/plans"
              className="hidden items-center rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/10 md:inline-flex"
            >
              <Sparkles className="mr-2 h-4 w-4 text-emerald-400" />
              Elite Active
            </Link>
          ) : user?.plan?.toLowerCase() === "pro" ? (
            <Link
              href="/plans"
              className="hidden items-center rounded-xl border border-violet-500/30 bg-violet-500/5 px-4 py-2 text-sm text-violet-300 transition hover:bg-violet-500/10 md:inline-flex"
            >
              <Crown className="mr-2 h-4 w-4 text-violet-400" />
              Pro Active
            </Link>
          ) : (
            <Link
              href="/plans"
              className="hidden items-center rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-sm text-amber-200 transition hover:bg-amber-500/10 md:inline-flex"
            >
              <Crown className="mr-2 h-4 w-4 text-amber-400" />
              Upgrade to Pro
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="hidden border border-white/10 text-slate-300 hover:bg-white/5 md:inline-flex"
          >
            <CalendarRange className="h-4 w-4" />
          </Button>

          <NotificationButton />

          <div>
            <UserMenu />
          </div>

          <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
            Jul 1 - Jul 7, 2025
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
