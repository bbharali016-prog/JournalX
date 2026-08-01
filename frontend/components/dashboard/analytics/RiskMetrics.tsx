"use client";

import { useEffect, useState } from "react";

import {
  getAnalyticsOverview,
  AnalyticsOverview,
} from "@/services/api/analytics";

export default function RiskMetrics() {
  const [stats, setStats] =
    useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const data =
          await getAnalyticsOverview(token);

        setStats(data);
      } catch (error) {
        console.error(error);
      }
    }

    load();
  }, []);

  if (!stats) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 text-slate-400 shadow-xl shadow-black/15">
        Loading risk metrics...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">

      <h2 className="mb-5 text-xl font-semibold text-white">
        Risk Metrics
      </h2>

      <div className="space-y-4">

        <Metric
          label="Max Drawdown"
          value={`$${stats.max_drawdown}`}
          color="text-red-400"
        />

        <Metric
          label="Average RR"
          value={stats.avg_rr}
          color="text-yellow-400"
        />

        <Metric
          label="Win Streak"
          value={stats.win_streak}
          color="text-green-400"
        />

        <Metric
          label="Loss Streak"
          value={stats.loss_streak}
          color="text-red-400"
        />

        <Metric
          label="Biggest Win"
          value={`$${stats.biggest_win}`}
          color="text-emerald-400"
        />

        <Metric
          label="Biggest Loss"
          value={`$${stats.biggest_loss}`}
          color="text-rose-400"
        />

      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-2">
      <span className="text-slate-400">
        {label}
      </span>

      <span className={`font-semibold ${color}`}>
        {value}
      </span>
    </div>
  );
}
