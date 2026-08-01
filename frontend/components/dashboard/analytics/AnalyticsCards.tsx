"use client";

import { useEffect, useState } from "react";

import {
  getAnalyticsOverview,
  AnalyticsOverview,
} from "@/services/api/analytics";

export default function AnalyticsCards() {
  const [stats, setStats] =
    useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      const token =
        localStorage.getItem("token");

      if (!token) return;

      try {
        const data =
          await getAnalyticsOverview(token);

        setStats(data);
      } catch (error) {
        console.error(
          "Analytics fetch error:",
          error
        );
      }
    }

    loadAnalytics();
  }, []);

  if (!stats) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 text-slate-400 shadow-xl shadow-black/15">
        Loading analytics...
      </div>
    );
  }

  const cards = [
    {
      title: "Net Profit",
      value: `$${stats.net_profit}`,
      color: "text-green-400",
    },
    {
      title: "Total Trades",
      value: stats.total_trades,
      color: "text-white",
    },
    {
      title: "Win Rate",
      value: `${stats.win_rate}%`,
      color: "text-blue-400",
    },
    {
      title: "Profit Factor",
      value: stats.profit_factor,
      color: "text-purple-400",
    },
    {
      title: "Expectancy",
      value: stats.expectancy,
      color: "text-cyan-400",
    },
    {
      title: "Max Drawdown",
      value: `$${stats.max_drawdown}`,
      color: "text-red-400",
    },
    {
      title: "Avg RR",
      value: stats.avg_rr,
      color: "text-yellow-400",
    },
    {
      title: "Win Streak",
      value: stats.win_streak,
      color: "text-green-400",
    },
    {
      title: "Loss Streak",
      value: stats.loss_streak,
      color: "text-red-400",
    },
    {
      title: "Biggest Win",
      value: `$${stats.biggest_win}`,
      color: "text-emerald-400",
    },
    {
      title: "Biggest Loss",
      value: `$${stats.biggest_loss}`,
      color: "text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15"
        >
          <p className="text-sm text-slate-400">
            {card.title}
          </p>

          <h2
            className={`mt-3 text-3xl font-bold ${card.color}`}
          >
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}
