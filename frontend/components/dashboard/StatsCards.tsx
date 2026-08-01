"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
} from "lucide-react";

import StatCard from "./StatCard";

import { useActiveAccount } from "@/components/auth/AccountContext";
import {
  getAnalyticsOverview,
  AnalyticsOverview,
} from "@/services/api/analytics";

export default function StatsCards() {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const { selectedAccountId } = useActiveAccount();

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const data = await getAnalyticsOverview(token, selectedAccountId);
        setStats(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      }
    }

    loadAnalytics();
  }, [selectedAccountId]);

  if (!stats) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-slate-400">
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total P&L"
        value={`$${stats.net_profit}`}
        change={`${stats.win_rate}% win rate`}
        icon={DollarSign}
        sparkline={[12, 18, 16, 24, 20, 28, 32, 30, 36, 40]}
      />

      <StatCard
        title="Win Rate"
        value={`${stats.win_rate}%`}
        change="vs last 7 days"
        icon={Target}
        sparkline={[48, 52, 50, 56, 60, 58, 63, 61, 67, 69]}
        accentClassName="text-violet-300"
      />

      <StatCard
        title="Profit Factor"
        value={String(stats.profit_factor)}
        change="Healthy"
        icon={TrendingUp}
        sparkline={[1.2, 1.15, 1.25, 1.3, 1.35, 1.42, 1.38, 1.5, 1.62, 1.89]}
        accentClassName="text-sky-300"
      />

      <StatCard
        title="Expectancy"
        value={`$${stats.expectancy}`}
        change={`Avg RR ${stats.avg_rr}`}
        icon={BarChart3}
        sparkline={[8, 9, 8.8, 10, 10.5, 11, 10.7, 11.5, 12.2, 12.6]}
        accentClassName="text-amber-300"
      />
    </div>
  );
}
