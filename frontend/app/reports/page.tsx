"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useActiveAccount } from "@/components/auth/AccountContext";
import {
  getSymbolPerformance,
  getSessionPerformance,
  downloadTradesReportCSV,
  SymbolPerformance,
  SessionPerformance,
} from "@/services/api/reports";
import {
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Globe,
  Loader2,
} from "lucide-react";

export default function ReportsPage() {
  const { selectedAccountId } = useActiveAccount();
  const [symbols, setSymbols] = useState<SymbolPerformance[]>([]);
  const [sessions, setSessions] = useState<SessionPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReportsData() {
      const token = localStorage.getItem("token");
      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        if (active) setLoading(true);
        const [symbolData, sessionData] = await Promise.all([
          getSymbolPerformance(token, selectedAccountId),
          getSessionPerformance(token, selectedAccountId),
        ]);
        if (active) {
          setSymbols(symbolData || []);
          setSessions(sessionData || []);
        }
      } catch (error) {
        console.error("Failed to load reports data:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReportsData();

    return () => {
      active = false;
    };
  }, [selectedAccountId]);

  const handleCsvExport = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      await downloadTradesReportCSV(token, selectedAccountId);
    } catch (error) {
      console.error("Failed to download CSV report:", error);
    } finally {
      setDownloading(false);
    }
  };

  const mockReportsList = [
    {
      name: "Weekly Market Outlook - Current",
      type: "PDF",
      size: "2.4 MB",
      date: "Aug 7-13, 2026",
      action: "Download",
      icon: FileText,
      color: "text-rose-400 border-rose-500/10 bg-rose-500/5",
    },
    {
      name: "Monthly Trading Performance - Historical Log",
      type: "CSV",
      size: "1.8 MB",
      date: "July, 2026",
      action: "Download",
      icon: FileSpreadsheet,
      color: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5",
      realAction: handleCsvExport,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      </DashboardLayout>
    );
  }

  // Get dynamic session times
  const sessionHours: Record<string, string> = {
    London: "13:00 - 21:00 IST",
    "New York": "21:00 - 05:00 IST",
    Asian: "05:00 - 13:00 IST",
  };

  // Find max profit value for session scaling bars
  const maxSessionProfit = Math.max(
    ...sessions.map((s) => Math.abs(s.profit)),
    1.0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Reports Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
          <div>
            <p className="text-sm text-slate-400">Reports</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
              Trading Reports Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Download trading logs, view symbol statistics, and analyze session performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCsvExport}
              disabled={downloading}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Trades (CSV)
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 xl:grid-cols-12">
          {/* Left Column: Reports List & Symbol Stats */}
          <div className="space-y-6 xl:col-span-8">
            
            {/* Weekly & Monthly Reports List */}
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
              <h2 className="text-xl font-semibold text-white mb-4">
                Weekly & Monthly Reports
              </h2>
              <div className="divide-y divide-white/5 space-y-4">
                {mockReportsList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl border p-2.5 ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{item.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.date} • {item.type} • {item.size}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={item.realAction || handleCsvExport}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    >
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance by Symbol */}
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Performance by Symbol
                </h2>
                <TrendingUp className="h-5 w-5 text-slate-400" />
              </div>

              {symbols.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No trading statistics found for this account.</p>
              ) : (
                <div className="space-y-4">
                  {symbols.map((sym, idx) => {
                    const isProfit = sym.profit >= 0;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-white/5 bg-[#0b1220] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-violet-400" />
                            <span className="font-semibold text-white text-base">{sym.symbol}</span>
                          </div>
                          <div className="mt-2 flex gap-4 text-xs text-slate-400">
                            <span>Trades: <strong className="text-white">{sym.trades}</strong></span>
                            <span>Win Rate: <strong className="text-white">{sym.win_rate.toFixed(1)}%</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-8">
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Total Profit</p>
                            <p className={`font-semibold text-base mt-1 ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                              {isProfit ? "+" : ""}${sym.profit.toFixed(2)}
                            </p>
                          </div>

                          <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200">
                            {sym.win_rate >= 50 ? "Profitable" : "Needs Review"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Trading Sessions */}
          <div className="space-y-6 xl:col-span-4">
            
            {/* Trading Session Analysis */}
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Trading Session Analysis
                </h2>
                <Globe className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Performance divided by session hours based on trade closure time (UTC).
              </p>

              <div className="space-y-5">
                {sessions.map((sess, idx) => {
                  const isProfit = sess.profit >= 0;
                  const absProfit = Math.abs(sess.profit);
                  const percentage = Math.min((absProfit / maxSessionProfit) * 100, 100);

                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-white">{sess.session} Session</p>
                          <p className="text-xs text-slate-500 mt-0.5">{sessionHours[sess.session] || ""}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                            {isProfit ? "+" : "-"}${absProfit.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{sess.trades} trades</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                            isProfit
                              ? "from-emerald-500/50 to-emerald-400"
                              : "from-rose-500/50 to-rose-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
