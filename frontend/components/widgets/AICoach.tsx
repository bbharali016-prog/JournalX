import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AICoach() {
  return (
    <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-[#15163a] to-[#0c1222] p-5 shadow-xl shadow-black/15">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-300" />
          <h3 className="font-semibold text-white">AI Coach</h3>
        </div>
        <span className="rounded-full bg-violet-500/20 px-2 py-1 text-xs text-violet-200">
          Live
        </span>
      </div>

      <p className="text-sm leading-6 text-slate-300">
        Review your win rate, drawdown, and habits with data-driven coaching.
      </p>

      <Link
        href="/ai"
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
      >
        Open AI Coach
      </Link>
    </div>
  );
}
