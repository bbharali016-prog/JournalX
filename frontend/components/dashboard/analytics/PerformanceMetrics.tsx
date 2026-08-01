"use client";

import { useEffect, useState } from "react";

import {
  getAnalyticsOverview,
  AnalyticsOverview,
} from "@/services/api/analytics";

export default function PerformanceMetrics() {
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
        Loading performance...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">

      <h2 className="mb-5 text-xl font-semibold text-white">
        Performance Metrics
      </h2>

      <div className="space-y-4">

        <Metric
          label="Net Profit"
          value={`$${stats.net_profit}`}
          color="text-green-400"
        />

        <Metric
          label="Win Rate"
          value={`${stats.win_rate}%`}
          color="text-blue-400"
        />

        <Metric
          label="Profit Factor"
          value={stats.profit_factor}
          color="text-purple-400"
        />

        <Metric
          label="Expectancy"
          value={stats.expectancy}
          color="text-cyan-400"
        />

        <Metric
          label="Average Profit"
          value={`$${stats.average_profit}`}
          color="text-green-400"
        />

        <Metric
          label="Average Loss"
          value={`$${stats.average_loss}`}
          color="text-red-400"
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
