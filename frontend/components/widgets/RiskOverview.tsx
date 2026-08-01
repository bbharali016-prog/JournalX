"use client";

import { useEffect, useState } from "react";

import { useActiveAccount } from "@/components/auth/AccountContext";
import {
  AnalyticsOverview,
  getAnalyticsOverview,
} from "@/services/api/analytics";

export default function RiskOverview() {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const { accounts, selectedAccount, selectedAccountId, loading } =
    useActiveAccount();

  useEffect(() => {
    async function loadRisk() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await getAnalyticsOverview(token, selectedAccountId);
        setStats(data);
      } catch (error) {
        console.error("Failed to load risk overview:", error);
      }
    }

    loadRisk();
  }, [selectedAccountId]);

  const riskAccount =
    selectedAccount ??
    accounts.find((account) => account.funded_firm === "Funded Account") ??
    accounts[0] ??
    null;

  const allowedDrawdown = riskAccount?.max_drawdown ?? 0;
  const usedDrawdown = stats ? Math.abs(stats.max_drawdown) : 0;
  const cappedUsedDrawdown = allowedDrawdown
    ? Math.min(usedDrawdown, allowedDrawdown)
    : usedDrawdown;
  const remainingDrawdown = allowedDrawdown
    ? Math.max(allowedDrawdown - cappedUsedDrawdown, 0)
    : 0;
  const usedPercent = allowedDrawdown
    ? Math.min((cappedUsedDrawdown / allowedDrawdown) * 100, 100)
    : 0;
  const circleStyle = {
    background: `conic-gradient(rgb(167 139 250) ${usedPercent}%, rgba(167, 139, 250, 0.18) 0)`,
  };

  if (loading || !stats) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm text-slate-400 shadow-xl shadow-black/15">
        Loading risk overview...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 shadow-xl shadow-black/15">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Risk Overview</h3>
        <span className="text-xs text-slate-400">
          {usedPercent.toFixed(0)}% used
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full p-2"
          style={circleStyle}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b1220]">
            <span className="text-2xl font-semibold text-white">
              {usedPercent.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-400">Allowed Drawdown</p>
            <p className="text-white">{formatMoney(allowedDrawdown)}</p>
          </div>
          <div>
            <p className="text-slate-400">Used Drawdown</p>
            <p className="text-rose-400">{formatMoney(cappedUsedDrawdown)}</p>
          </div>
          <div>
            <p className="text-slate-400">Remaining</p>
            <p className="text-emerald-400">{formatMoney(remainingDrawdown)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
