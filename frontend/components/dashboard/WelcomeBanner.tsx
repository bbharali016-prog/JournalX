"use client";

import { useCurrentUser } from "@/components/auth/UserContext";

export default function WelcomeBanner() {
  const { user } = useCurrentUser();
  const displayName = user?.full_name ?? "Trader";

  return (
    <div className="rounded-3xl border border-white/8 bg-gradient-to-r from-[#0b1430] via-[#0c1730] to-[#111936] p-6 shadow-2xl shadow-black/20 lg:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-slate-400">Welcome back,</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white lg:text-4xl">
            {displayName} 👋
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 lg:text-base">
            Track. Analyze. Improve. Become Profitable.
          </p>
        </div>

        <div className="hidden rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-right text-sm text-emerald-200 lg:block">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
            Today&apos;s Goal
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            Stay green
          </p>
        </div>
      </div>
    </div>
  );
}
