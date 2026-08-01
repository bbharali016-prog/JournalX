"use client";

import { useEffect, useState } from "react";
import { useActiveAccount } from "@/components/auth/AccountContext";
import { getTodaysSummary, TodaysSummary as TodaysSummaryType } from "@/services/api/analytics";

export default function TodaysSummary() {
  const [data, setData] = useState<TodaysSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedAccountId } = useActiveAccount();

  useEffect(() => {
    async function fetchSummary() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        setLoading(true);
        const summary = await getTodaysSummary(token, selectedAccountId);
        setData(summary);
      } catch (error) {
        console.error("Failed to load today's summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [selectedAccountId]);

  if (loading || !data) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm text-slate-400 shadow-xl shadow-black/15">
        Loading today's summary...
      </div>
    );
  }

  const isProfit = data.total_pnl >= 0;

  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 shadow-xl shadow-black/15">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Today&apos;s Summary</h3>
        <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2 py-1 text-xs text-violet-200">
          Live
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span>Trades</span>
          <span className="text-white">{data.trades}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Winning Trades</span>
          <span className="text-emerald-400">{data.winning_trades}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Losing Trades</span>
          <span className="text-rose-400">{data.losing_trades}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Win Rate</span>
          <span className="text-white">{data.win_rate.toFixed(2)}%</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Total P&amp;L</span>
          <span className={`font-semibold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
            {isProfit ? "+" : ""}${data.total_pnl.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
