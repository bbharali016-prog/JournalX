"use client";

import { useEffect, useState } from "react";

import {
  getAnalyticsOverview,
  AnalyticsOverview,
} from "@/services/api/analytics";
import { useActiveAccount } from "@/components/auth/AccountContext";

export default function FundedAccountProgress() {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const { accounts, selectedAccount, selectedAccountId, loading } =
    useActiveAccount();

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const data = await getAnalyticsOverview(token, selectedAccountId);
        setStats(data);
      } catch (error) {
        console.error("Failed to load funded progress:", error);
      }
    }

    loadAnalytics();
  }, [selectedAccountId]);

  if (!stats || loading) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 text-slate-400 shadow-xl shadow-black/15">
        Loading funded account progress...
      </div>
    );
  }

  const progressAccount =
    selectedAccount ??
    accounts.find((account) => account.funded_firm === "Funded Account") ??
    accounts[0] ??
    null;

  if (!progressAccount) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 text-slate-400 shadow-xl shadow-black/15">
        Add a funded account to track target and drawdown progress.
      </div>
    );
  }

  const accountSize = progressAccount.account_size || 0;
  const profitTarget = progressAccount.profit_target || 0;
  const targetBalance = accountSize + profitTarget;
  const dailyLossLimit = progressAccount.daily_loss_limit || 0;
  const allowedDrawdown = progressAccount.max_drawdown || 0;
  const usedDrawdown = allowedDrawdown
    ? Math.min(Math.abs(stats.max_drawdown), allowedDrawdown)
    : Math.abs(stats.max_drawdown);
  const remainingDrawdown = allowedDrawdown
    ? Math.max(allowedDrawdown - usedDrawdown, 0)
    : 0;
  const accountProgress = Math.max(
    0,
    Math.min(profitTarget ? (stats.net_profit / profitTarget) * 100 : 0, 100)
  );

  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Funded Account Progress
          </h3>
          <p className="mt-1 text-sm text-slate-400">{progressAccount.name}</p>
        </div>

        <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
          {progressAccount.name}
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-400">Target Balance</p>
              <p className="text-lg font-medium text-white">
                {formatMoney(targetBalance)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatMoney(accountSize)} + {formatMoney(profitTarget)} target
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-400">Progress</p>
              <p className="text-lg font-semibold text-emerald-400">
                {formatMoney(stats.net_profit)}
              </p>
            </div>
          </div>

          <div className="h-3 rounded-full bg-white/8">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
              style={{ width: `${accountProgress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {accountProgress.toFixed(2)}% of the target completed
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Metric
            label="Daily Loss"
            value={`${formatMoney(stats.daily_loss)} / ${formatMoney(dailyLossLimit)}`}
            valueClassName="text-white"
          />
          <Metric
            label="Max Drawdown"
            value={`${formatMoney(usedDrawdown)} / ${formatMoney(allowedDrawdown)}`}
            valueClassName="text-rose-400"
          />
          <Metric
            label="Remaining Drawdown"
            value={formatMoney(remainingDrawdown)}
            valueClassName="text-emerald-400"
          />
          <Metric
            label="Days Remaining"
            value="23 Days"
            valueClassName="text-white"
          />
        </div>

        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          In Progress
        </div>
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function Metric({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0b1220] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-1 text-base font-semibold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}
