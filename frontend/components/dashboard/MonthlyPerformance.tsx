"use client";

import { useEffect, useState } from "react";
import {
  getMonthlyPerformance,
  MonthlyPerformance,
} from "@/services/api/dashboard";

import { useActiveAccount } from "@/components/auth/AccountContext";

export default function MonthlyPerformanceChart() {
  const [data, setData] = useState<MonthlyPerformance[]>([]);
  const { selectedAccountId } = useActiveAccount();

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const result = await getMonthlyPerformance(token, selectedAccountId);
        setData(result);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, [selectedAccountId]);

  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Monthly Performance
      </h2>

      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={item.month}
            className="flex items-center justify-between border-b border-white/5 pb-2"
          >
            <span className="text-slate-200">{item.month}</span>

            <span
              className={
                item.profit >= 0
                  ? "font-semibold text-emerald-400"
                  : "font-semibold text-rose-400"
              }
            >
              ${item.profit}
            </span>
          </div>
        ))}

        {data.length === 0 && (
          <p className="text-slate-400">
            No trades available.
          </p>
        )}
      </div>
    </div>
  );
}
