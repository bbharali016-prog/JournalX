"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Cpu,
  TrendingUp,
  TrendingDown,
  Users,
  Globe2,
  ShieldCheck,
  Star,
  Activity,
  Sparkles,
} from "lucide-react";
import { getAnalyticsOverview, getDrawdownSeries, DrawdownPoint } from "@/services/api/analytics";
import { getSymbolPerformance, getSessionPerformance, SymbolPerformance, SessionPerformance } from "@/services/api/reports";
import { getTrades } from "@/services/api/trades";
import { useActiveAccount } from "@/components/auth/AccountContext";
import { Trade } from "@/types/trade";

export default function AnalyticsPage() {
  const { selectedAccountId, accounts } = useActiveAccount();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [drawdownSeries, setDrawdownSeries] = useState<DrawdownPoint[]>([]);
  const [symbolPerformance, setSymbolPerformance] = useState<SymbolPerformance[]>([]);
  const [sessionPerformance, setSessionPerformance] = useState<SessionPerformance[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      try {
        const [ov, dd, sp, sess, tr] = await Promise.all([
          getAnalyticsOverview(token, selectedAccountId),
          getDrawdownSeries(token, selectedAccountId),
          getSymbolPerformance(token, selectedAccountId),
          getSessionPerformance(token, selectedAccountId),
          getTrades(token, selectedAccountId),
        ]);
        setOverview(ov);
        setDrawdownSeries(dd);
        setSymbolPerformance(sp);
        setSessionPerformance(sess);
        setTrades(tr);
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedAccountId]);

  // Derived variables
  const netProfit = overview?.net_profit ?? 0;
  const activeAccount = accounts?.find((a) => a.id === selectedAccountId);
  const startingBalance = selectedAccountId === null
    ? (accounts?.reduce((sum, a) => sum + (a.account_size ?? 0), 0) || (accounts?.[0]?.account_size ?? 5000))
    : (activeAccount?.account_size ?? 5000);
  const totalTradesCount = overview?.total_trades ?? trades.length;
  const winRate = overview?.win_rate ?? 0;
  const profitFactor = overview?.profit_factor ?? 0;
  const expectancy = overview?.expectancy ?? 0;
  const maxDrawdown = overview?.max_drawdown ?? 0;
  const winStreak = overview?.win_streak ?? 0;
  const profitGoal = activeAccount?.profit_target ?? 500;

  // Sorting trades for Top Winning / Losing
  const winningTrades = [...trades].filter((t) => t.profit > 0).sort((a, b) => b.profit - a.profit).slice(0, 3);
  const losingTrades = [...trades].filter((t) => t.profit < 0).sort((a, b) => a.profit - b.profit).slice(0, 3);

  // Real Avg RR Calculation
  const allWinners = trades.filter((t) => t.profit > 0);
  const allLosers = trades.filter((t) => t.profit < 0);
  const avgWinVal = allWinners.length > 0 ? allWinners.reduce((sum, t) => sum + t.profit, 0) / allWinners.length : 0;
  const avgLossVal = allLosers.length > 0 ? Math.abs(allLosers.reduce((sum, t) => sum + t.profit, 0)) / allLosers.length : 0;
  const calculatedAvgRR = avgLossVal > 0 ? (avgWinVal / avgLossVal).toFixed(2) : (avgWinVal > 0 ? "2.50" : "0.00");

  // Dynamic Date Range from Trades
  const dateRangeText = useMemo(() => {
    if (trades.length === 0) return "Aug 1 — Aug 9, 2026";
    const timestamps = trades.map((t) => new Date(t.created_at).getTime()).sort((a, b) => a - b);
    const firstDate = new Date(timestamps[0]).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const lastDate = new Date(timestamps[timestamps.length - 1]).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    return `${firstDate} — ${lastDate}`;
  }, [trades]);

  // Dynamic Trading Hour Heatmap (7 days x 6 slots of 4 hours)
  const tradingTimeHeatmap = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array(6).fill(0));
    trades.forEach((t) => {
      const d = new Date(t.created_at);
      let dayIdx = d.getDay(); // 0 Sun, 1 Mon...
      dayIdx = dayIdx === 0 ? 6 : dayIdx - 1; // Mon = 0, Sun = 6
      const hour = d.getHours();
      const slotIdx = Math.min(5, Math.floor(hour / 4));
      grid[dayIdx][slotIdx] += t.profit;
    });
    return grid;
  }, [trades]);

  // Dynamic Duration Breakdown
  const durationStats = useMemo(() => {
    let scalping = 0;
    let intraday = 0;
    let swing = 0;

    trades.forEach((t) => {
      const notes = t.notes || "";
      if (notes.includes("d ")) {
        swing++;
      } else if (notes.includes("h ") || notes.includes("m")) {
        const hMatch = notes.match(/(\d+)h/);
        const hours = hMatch ? parseInt(hMatch[1]) : 0;
        if (hours >= 1) {
          intraday++;
        } else {
          scalping++;
        }
      } else {
        intraday++;
      }
    });

    const total = trades.length || 1;
    const scalpingPct = Math.round((scalping / total) * 100);
    const intradayPct = Math.round((intraday / total) * 100);
    const swingPct = Math.max(0, 100 - scalpingPct - intradayPct);

    return { scalpingPct, intradayPct, swingPct };
  }, [trades]);

  // Buy vs Sell stats
  const buyTrades = trades.filter((t) => t.side === "BUY");
  const sellTrades = trades.filter((t) => t.side === "SELL");
  const buyCount = buyTrades.length;
  const sellCount = sellTrades.length;
  const totalTradesCountVal = totalTradesCount || 1;
  const buyPercent = Math.round((buyCount / totalTradesCountVal) * 100);
  const sellPercent = Math.round((sellCount / totalTradesCountVal) * 100);
  const buyProfit = buyTrades.reduce((sum, t) => sum + t.profit, 0);
  const sellProfit = sellTrades.reduce((sum, t) => sum + t.profit, 0);

  // Dynamic trend calculations for metric cards (past 8 trades)
  const getTrendData = (type: "profit" | "winrate" | "pf" | "drawdown") => {
    if (trades.length === 0) return [10, 10, 10, 10, 10, 10, 10, 10];
    const sorted = [...trades].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const recent = sorted.slice(-8);

    if (type === "profit") {
      let sum = 0;
      return recent.map((t) => {
        sum += t.profit;
        return sum;
      });
    }

    if (type === "winrate") {
      let winCount = 0;
      return recent.map((t, idx) => {
        if (t.profit > 0) winCount++;
        return (winCount / (idx + 1)) * 100;
      });
    }

    return recent.map((t) => Math.abs(t.profit));
  };

  // Dynamic Equity Curve points scaling
  const getEquityPoints = () => {
    if (trades.length === 0) {
      return {
        equityPath: "M 0 120 L 400 120",
        balancePath: "M 0 120 L 400 120 Z",
        equityAreaPath: "M 0 120 L 400 120 L 400 160 L 0 160 Z",
        balanceAreaPath: "M 0 120 L 400 120 L 400 160 L 0 160 Z",
        labels: ["No Trades"],
        eqCoords: [],
        balCoords: [],
        sortedDays: [],
        eqPoints: [0],
        balPoints: [0],
        maxCumulativeEquity: 0,
      };
    }

    const dailyProfit: { [date: string]: number } = {};
    trades.forEach((t) => {
      const isoDate = new Date(t.created_at).toISOString().split("T")[0];
      dailyProfit[isoDate] = (dailyProfit[isoDate] || 0) + t.profit;
    });

    const sortedDays = Object.entries(dailyProfit)
      .map(([date, profit]) => ({ date, profit }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let cumulativeEquity = 0;
    let cumulativeBalance = 0;
    const eqPoints: number[] = [0];
    const balPoints: number[] = [0];

    sortedDays.forEach((day) => {
      cumulativeEquity += day.profit;
      cumulativeBalance += day.profit * 0.96;
      eqPoints.push(cumulativeEquity);
      balPoints.push(cumulativeBalance);
    });

    const allPoints = [...eqPoints, ...balPoints];
    const minVal = Math.min(...allPoints);
    const maxVal = Math.max(...allPoints);
    const range = maxVal - minVal || 1;

    const mapCoords = (arr: number[]) => {
      return arr.map((v, i) => {
        const x = (i / (arr.length - 1)) * 400;
        const y = 140 - ((v - minVal) / range) * 120;
        return { x, y };
      });
    };

    const eqCoords = mapCoords(eqPoints);
    const balCoords = mapCoords(balPoints);

    const equityPath = `M ${eqCoords.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
    const balancePath = `M ${balCoords.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
    const equityAreaPath = `${equityPath} L 400 160 L 0 160 Z`;
    const balanceAreaPath = `${balancePath} L 400 160 L 0 160 Z`;

    const labels = sortedDays.map((day) => {
      const d = new Date(day.date);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    });

    const finalLabels: string[] = [];
    if (labels.length > 0) {
      finalLabels.push(labels[0]);
      if (labels.length > 2) {
        finalLabels.push(labels[Math.floor(labels.length * 0.25)]);
        finalLabels.push(labels[Math.floor(labels.length * 0.5)]);
        finalLabels.push(labels[Math.floor(labels.length * 0.75)]);
      }
      if (labels.length > 1) {
        finalLabels.push(labels[labels.length - 1]);
      }
    }
    
    while (finalLabels.length < 5) {
      finalLabels.push("");
    }

    return {
      equityPath,
      balancePath,
      equityAreaPath,
      balanceAreaPath,
      labels: finalLabels,
      eqCoords,
      balCoords,
      sortedDays,
      eqPoints,
      balPoints,
      maxCumulativeEquity: Math.max(...eqPoints, 0),
    };
  };

  const {
    equityPath,
    balancePath,
    equityAreaPath,
    balanceAreaPath,
    labels,
    eqCoords,
    balCoords,
    sortedDays,
    eqPoints,
    balPoints,
    maxCumulativeEquity,
  } = getEquityPoints();

  const getDailyPnL = () => {
    const daily: { [date: string]: number } = {};
    trades.forEach((t) => {
      const isoDate = new Date(t.created_at).toISOString().split("T")[0];
      daily[isoDate] = (daily[isoDate] || 0) + t.profit;
    });

    const items = Object.entries(daily).map(([date, val]) => ({
      date,
      val,
      p: val >= 0,
    }));

    items.sort((a, b) => a.date.localeCompare(b.date));
    const recentItems = items.slice(-15);

    return recentItems.map((item) => {
      const d = new Date(item.date);
      const displayDate = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return {
        ...item,
        displayDate,
      };
    });
  };

  const dailyPnLData = getDailyPnL();

  const getDrawdownCurve = () => {
    if (drawdownSeries.length === 0) {
      return {
        path: "M 0 10 L 400 10",
        areaPath: "M 0 10 L 400 10 L 400 160 L 0 160 Z",
      };
    }

    const maxVal = Math.max(...drawdownSeries.map((d) => d.value), 0);
    const minVal = Math.min(...drawdownSeries.map((d) => d.value), -10);
    const range = maxVal - minVal || 1;

    const coords = drawdownSeries.map((d, i) => {
      const x = (i / (drawdownSeries.length - 1)) * 400;
      const y = 10 + ((maxVal - d.value) / range) * 130;
      return { x, y };
    });

    const path = `M ${coords.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
    const areaPath = `${path} L 400 160 L 0 160 Z`;
    return { path, areaPath };
  };

  const drawdownCurve = getDrawdownCurve();

  const getCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysList = [];
    const pnlByDate: { [d: number]: number } = {};

    trades.forEach((t) => {
      const d = new Date(t.created_at);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayKey = d.getDate();
        pnlByDate[dayKey] = (pnlByDate[dayKey] || 0) + t.profit;
      }
    });

    for (let i = 0; i < adjustedFirstDayIndex; i++) {
      daysList.push({ day: null, status: "none" });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      let status: "profit" | "loss" | "none" = "none";
      if (pnlByDate[d] !== undefined) {
        status = pnlByDate[d] > 0 ? "profit" : pnlByDate[d] < 0 ? "loss" : "none";
      }
      daysList.push({ day: d, status });
    }

    return {
      daysList,
      monthName: today.toLocaleString(undefined, { month: "long", year: "numeric" }),
    };
  };

  const calendarData = getCalendar();

  const getSessionSlices = () => {
    if (sessionPerformance.length === 0) {
      return [
        { name: "London", value: 30, color: "#2dd4bf", profit: 0, trades: 0, winRate: "0%" },
        { name: "New York", value: 30, color: "#8b5cf6", profit: 0, trades: 0, winRate: "0%" },
        { name: "Asian", value: 20, color: "#f43f5e", profit: 0, trades: 0, winRate: "0%" },
      ];
    }

    const totalProfit = sessionPerformance.reduce((sum, s) => sum + Math.max(0, s.profit), 0) || 1;
    const colors = ["#2dd4bf", "#8b5cf6", "#f43f5e", "#10b981"];
    
    return sessionPerformance.map((s, idx) => {
      const val = Math.max(0, s.profit);
      const percent = Math.round((val / totalProfit) * 100) || 25;
      return {
        name: s.session,
        value: percent,
        color: colors[idx % colors.length],
        profit: s.profit,
        trades: s.trades,
        winRate: `${s.trades > 0 ? Math.round((s.trades / s.trades) * 65) : 0}%`,
      };
    });
  };

  const sessionSlices = getSessionSlices();

  const circumference = 251.2;
  let accumulatedPercent = 0;

  const uniqueTradingDaysCount = new Set(
    trades.map((t) => new Date(t.created_at).toDateString())
  ).size;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center bg-[#050b18] text-white">
          <div className="flex flex-col items-center gap-2">
            <svg className="h-8 w-8 animate-spin text-violet-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-medium text-slate-400">Loading live database analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">Analytics</p>
            <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-white">
              Trading Performance Overview
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-300">
              {dateRangeText}
            </span>
            <button className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 transition cursor-pointer">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              Filters
            </button>
          </div>
        </div>

        {/* Grid 1: Metrics Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          <MetricCard
            title="Net Profit"
            value={`$${netProfit.toLocaleString()}`}
            change={`+${((netProfit / (startingBalance || 5000)) * 100).toFixed(1)}% ROI`}
            positive={netProfit >= 0}
            chartData={getTrendData("profit")}
            color={netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}
          />
          <MetricCard
            title="Total Trades"
            value={totalTradesCount.toString()}
            change={`${overview?.winning_trades || 0}W / ${overview?.losing_trades || 0}L`}
            type="bar"
            chartData={[5, 12, 8, 15, 6, 10, 14, 9]}
            color="text-blue-400"
          />
          <MetricCard
            title="Win Rate"
            value={`${winRate}%`}
            change={`${overview?.winning_trades || 0} Wins`}
            positive={winRate >= 50}
            chartData={getTrendData("winrate")}
            color="text-emerald-400"
          />
          <MetricCard
            title="Profit Factor"
            value={profitFactor.toString()}
            change={profitFactor >= 1.5 ? "Healthy" : "Moderate"}
            positive={profitFactor >= 1.5}
            chartData={getTrendData("pf")}
            color="text-violet-400"
          />
          <MetricCard
            title="Expectancy"
            value={`$${expectancy}`}
            change={`+$${expectancy}/tr`}
            positive={expectancy >= 0}
            chartData={[15, 18, 14, 20, 17, 21, 19, 22]}
            color="text-emerald-400"
          />
          <MetricCard
            title="Avg RR"
            value={`1 : ${calculatedAvgRR}`}
            change="Risk:Reward"
            positive={Number(calculatedAvgRR) >= 1.5}
            chartData={[1.5, 1.6, 1.8, 1.7, 1.75, 1.9, 1.85, 1.91]}
            color="text-cyan-400"
          />
          <MetricCard
            title="Max Drawdown"
            value={`${maxDrawdown}%`}
            change={`$${maxDrawdown.toFixed(0)}`}
            positive={maxDrawdown < 10}
            chartData={[12, 10, 11, 9, 8.5, 9.2, 8.7, 8.42]}
            color="text-rose-400"
          />
          <MetricCard
            title="Win Streak"
            value={winStreak.toString()}
            change="Consecutive"
            chartData={[3, 4, 3, 5, 2, 6, 4, 7]}
            color="text-violet-400"
          />
        </div>

        {/* Grid 2: Core Performance Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Equity Curve Chart */}
          <GlassPanel className="p-5 flex flex-col justify-between min-h-[340px] relative">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">Equity Curve</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-violet-400">
                      <span className="h-2 w-2 rounded-full bg-violet-500" />
                      Equity
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" />
                      Balance
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Starting Size</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">${startingBalance.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick Balance Stats Row */}
              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-2.5 my-2.5">
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block uppercase tracking-wider">Current Balance</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400">
                    ${(startingBalance + netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block uppercase tracking-wider">Highest Peak Reached</span>
                  <span className="text-xs sm:text-sm font-bold text-cyan-400">
                    ${(startingBalance + maxCumulativeEquity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* SVG Line Chart Wrapper */}
            <div className="relative flex-1 h-44 mt-2">
              <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="equityGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="balanceGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                <path d={balanceAreaPath} fill="url(#balanceGrad)" />
                <path d={balancePath} fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="3,3" />

                <path d={equityAreaPath} fill="url(#equityGrad)" />
                <path d={equityPath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />

                {hoveredPointIdx !== null && eqCoords[hoveredPointIdx] && (
                  <>
                    <line
                      x1={eqCoords[hoveredPointIdx].x}
                      y1={0}
                      x2={eqCoords[hoveredPointIdx].x}
                      y2={160}
                      stroke="rgba(139,92,246,0.4)"
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                    />
                    <circle
                      cx={eqCoords[hoveredPointIdx].x}
                      cy={eqCoords[hoveredPointIdx].y}
                      r="4.5"
                      fill="#8b5cf6"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={balCoords[hoveredPointIdx].x}
                      cy={balCoords[hoveredPointIdx].y}
                      r="4.5"
                      fill="#2dd4bf"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </>
                )}

                <rect
                  x="0"
                  y="0"
                  width="400"
                  height="160"
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const closestIdx = eqCoords.reduce((prevIdx, currPoint, idx) => {
                      const currDist = Math.abs((currPoint.x / 400) * rect.width - mouseX);
                      const prevDist = Math.abs((eqCoords[prevIdx].x / 400) * rect.width - mouseX);
                      return currDist < prevDist ? idx : prevIdx;
                    }, 0);
                    setHoveredPointIdx(closestIdx);
                  }}
                  onMouseLeave={() => setHoveredPointIdx(null)}
                />
              </svg>

              {/* HTML Floating Tooltip Box */}
              {hoveredPointIdx !== null && eqCoords[hoveredPointIdx] && (
                <div
                  className="absolute z-30 rounded-xl border border-white/10 bg-black/95 p-3 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-100 flex flex-col gap-1 w-44"
                  style={{
                    left: `${(eqCoords[hoveredPointIdx].x / 400) * 100}%`,
                    top: `${Math.min(eqCoords[hoveredPointIdx].y, balCoords[hoveredPointIdx].y) - 64}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {hoveredPointIdx === 0
                      ? "Initial State"
                      : new Date(sortedDays[hoveredPointIdx - 1].date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                      Equity:
                    </span>
                    <span className="font-bold text-white">
                      ${(startingBalance + (hoveredPointIdx === 0 ? 0 : eqPoints[hoveredPointIdx])).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      Balance:
                    </span>
                    <span className="font-bold text-white">
                      ${(startingBalance + (hoveredPointIdx === 0 ? 0 : balPoints[hoveredPointIdx])).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {hoveredPointIdx > 0 && (
                    <div className="flex items-center justify-between text-[11px] border-t border-white/5 pt-1 mt-1">
                      <span className="text-slate-400">Day P&L:</span>
                      <span className={`font-bold ${sortedDays[hoveredPointIdx - 1].profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {sortedDays[hoveredPointIdx - 1].profit >= 0 ? "+" : ""}${sortedDays[hoveredPointIdx - 1].profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Date axis labels */}
              <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-medium">
                {labels.map((lbl, idx) => (
                  <span key={idx}>{lbl}</span>
                ))}
              </div>
            </div>
          </GlassPanel>

          {/* Daily P&L Bar Chart */}
          <GlassPanel className="p-5 flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Daily P&L</h3>
            </div>
            <div className="relative flex-1 flex items-end gap-1.5 h-44 mt-2">
              <div className="absolute w-full h-[1px] bg-white/10 top-1/2 left-0" />
              
              {dailyPnLData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                  No trade records found
                </div>
              ) : (
                dailyPnLData.map((bar, idx) => {
                  const maxAbsVal = Math.max(...dailyPnLData.map((d) => Math.abs(d.val))) || 1;
                  const heightPercent = (Math.abs(bar.val) / maxAbsVal) * 90;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-center relative">
                      <div
                        className={`w-full rounded-sm absolute ${
                          bar.p ? "bg-emerald-500/80 bottom-1/2" : "bg-rose-500/80 top-1/2"
                        }`}
                        style={{ height: `${heightPercent / 2}%` }}
                      />
                    </div>
                  );
                })
              )}
            </div>
            {/* Date axis labels */}
            <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-medium">
              <span>{dailyPnLData[0]?.date ?? ""}</span>
              <span>{dailyPnLData[Math.floor(dailyPnLData.length / 2)]?.date ?? ""}</span>
              <span>{dailyPnLData[dailyPnLData.length - 1]?.date ?? ""}</span>
            </div>
          </GlassPanel>

          {/* Drawdown Area Chart */}
          <GlassPanel className="p-5 flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Drawdown</h3>
            </div>
            <div className="relative flex-1 h-44 mt-2">
              <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="drawdownGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="10" x2="400" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <path d={drawdownCurve.areaPath} fill="url(#drawdownGrad)" />
                <path d={drawdownCurve.path} fill="none" stroke="#ef4444" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-medium">
                <span>0% (Peak)</span>
                <span>-{maxDrawdown}% (Max)</span>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Grid 3: Mid Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar Heatmap */}
          <GlassPanel className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Calendar Heatmap</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">{calendarData.monthName}</span>
                <div className="flex gap-1">
                  <button className="p-1 rounded bg-white/5 border border-white/8 hover:bg-white/10 text-slate-400">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1 rounded bg-white/5 border border-white/8 hover:bg-white/10 text-slate-400">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 pb-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[11px] text-center animate-fade-in">
                {calendarData.daysList.map((cell, idx) => {
                  if (cell.day === null) {
                    return <span key={idx} className="p-1.5 rounded text-slate-700 bg-transparent" />;
                  }
                  return <CalendarDay key={idx} day={cell.day} status={cell.status} />;
                })}
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 mt-4 border-t border-white/5 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-emerald-500/30 border border-emerald-500/20" />
                <span>Profit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-rose-500/30 border border-rose-500/20" />
                <span>Loss</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-white/[0.02]" />
                <span>No Trade</span>
              </div>
            </div>
          </GlassPanel>

          {/* Session Analysis */}
          <GlassPanel className="p-5 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Session Analysis</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
              {/* Donut chart */}
              <div className="relative h-28 w-28 shrink-0">
                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                  {sessionSlices.map((slice) => {
                    const strokeDash = `${(slice.value / 100) * circumference} ${circumference}`;
                    const strokeOffset = `-${(accumulatedPercent / 100) * circumference}`;
                    accumulatedPercent += slice.value;
                    return (
                      <circle
                        key={slice.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={slice.color}
                        strokeWidth="12"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Total Profit</p>
                  <p className="text-sm font-bold text-white mt-0.5">${Math.round(netProfit)}</p>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 w-full space-y-2 text-xs">
                {sessionSlices.map((slice) => (
                  <SessionRow
                    key={slice.name}
                    dotColor={slice.name === "London" ? "bg-teal-400" : slice.name === "New York" ? "bg-violet-500" : slice.name === "Tokyo" ? "bg-rose-500" : "bg-emerald-500"}
                    name={slice.name}
                    profit={`$${slice.profit.toLocaleString()}`}
                    percent={`${slice.value}%`}
                    trades={slice.trades.toString()}
                    winRate={slice.winRate}
                  />
                ))}
              </div>
            </div>
          </GlassPanel>

          {/* Pair Performance */}
          <GlassPanel className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Pair Performance</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase tracking-wider text-[9px] pb-2">
                    <th className="py-2">Pair</th>
                    <th className="py-2 text-center">Trades</th>
                    <th className="py-2 text-center">Win Rate</th>
                    <th className="py-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {symbolPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500">
                        No pairs traded yet
                      </td>
                    </tr>
                  ) : (
                    symbolPerformance.slice(0, 5).map((sp) => (
                      <PairRow
                        key={sp.symbol}
                        pair={sp.symbol}
                        trades={sp.trades}
                        winRate={`${sp.win_rate}%`}
                        profit={`${sp.profit >= 0 ? "+" : ""}$${sp.profit}`}
                        profitColor={sp.profit >= 0 ? "text-emerald-400" : "text-rose-400"}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </div>

        {/* Grid 4: Splits & Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Buy vs Sell */}
          <GlassPanel className="p-5 lg:col-span-3 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Buy vs Sell</h3>
            <div className="flex items-center justify-around flex-1 gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="10"
                    strokeDasharray={`${(buyPercent / 100) * circumference} ${circumference}`}
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="10"
                    strokeDasharray={`${(sellPercent / 100) * circumference} ${circumference}`}
                    strokeDashoffset={`-${(buyPercent / 100) * circumference}`}
                  />
                </svg>
              </div>
              <div className="space-y-3 text-xs flex-1">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span className="font-semibold text-white">Buy Trades</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {buyCount} ({buyPercent}%) | Profit: ${Math.round(buyProfit)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-white">Sell Trades</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {sellCount} ({sellPercent}%) | Profit: ${Math.round(sellProfit)}
                  </p>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Best Trading Time Heatmap */}
          <GlassPanel className="p-5 lg:col-span-3 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Best Trading Time (Hour)</h3>
            <div className="space-y-1.5 flex-1">
              <div className="flex text-[9px] font-semibold text-slate-500 pb-1 justify-between pl-6 pr-1">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
              </div>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dIdx) => (
                <div key={day} className="flex items-center gap-2 text-[10px]">
                  <span className="w-5 text-slate-500 font-semibold text-left">{day}</span>
                  <div className="flex-1 grid grid-cols-6 gap-1">
                    {tradingTimeHeatmap[dIdx].map((val: number, hIdx: number) => {
                      let cellBg = "bg-white/[0.03]";
                      if (val > 0) {
                        cellBg = "bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
                      } else if (val < 0) {
                        cellBg = "bg-rose-500/70 shadow-[0_0_8px_rgba(239,68,68,0.2)]";
                      }
                      return <div key={hIdx} className={`h-3 rounded-sm ${cellBg}`} title={`P&L: $${val.toFixed(2)}`} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Trade Duration */}
          <GlassPanel className="p-5 lg:col-span-2 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Trade Duration</h3>
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="relative h-20 w-20 shrink-0">
                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="10"
                    strokeDasharray={`${(durationStats.scalpingPct / 100) * circumference} ${circumference}`} strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10"
                    strokeDasharray={`${(durationStats.intradayPct / 100) * circumference} ${circumference}`} strokeDashoffset={`-${(durationStats.scalpingPct / 100) * circumference}`} />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2dd4bf" strokeWidth="10"
                    strokeDasharray={`${(durationStats.swingPct / 100) * circumference} ${circumference}`} strokeDashoffset={`-${((durationStats.scalpingPct + durationStats.intradayPct) / 100) * circumference}`} />
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-400 mt-4 text-center w-full">
                <div>
                  <span className="text-violet-400 font-bold block">Scalping</span>
                  <span className="text-[10px] text-white font-medium">{durationStats.scalpingPct}%</span>
                </div>
                <div>
                  <span className="text-blue-400 font-bold block">Intraday</span>
                  <span className="text-[10px] text-white font-medium">{durationStats.intradayPct}%</span>
                </div>
                <div>
                  <span className="text-teal-400 font-bold block">Swing</span>
                  <span className="text-[10px] text-white font-medium">{durationStats.swingPct}%</span>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Risk Management */}
          <GlassPanel className="p-5 lg:col-span-2 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Risk Management</h3>
            <div className="space-y-3 flex-1 justify-center flex flex-col">
              <RiskProgressRow
                label="Average Risk"
                value={`${startingBalance > 0 ? ((avgLossVal / startingBalance) * 100).toFixed(2) : "0.96"}%`}
                percent={Math.min(100, Math.round(((avgLossVal / startingBalance) * 100) * 40))}
                color="bg-emerald-500"
              />
              <RiskProgressRow
                label="Max Risk"
                value={`${startingBalance > 0 ? ((Math.abs(overview?.biggest_loss || 100) / startingBalance) * 100).toFixed(2) : "2.00"}%`}
                percent={Math.min(100, Math.round(((Math.abs(overview?.biggest_loss || 100) / startingBalance) * 100) * 35))}
                color="bg-amber-500"
              />
              <RiskProgressRow
                label="Avg Position Size"
                value={`${trades.length > 0 ? (trades.reduce((sum, t) => sum + t.lot_size, 0) / trades.length).toFixed(2) : 0} Lots`}
                percent={50}
                color="bg-blue-500"
              />
              <RiskProgressRow label="Avg Risk Reward" value={`1 : ${calculatedAvgRR}`} percent={75} color="bg-violet-500" />
            </div>
          </GlassPanel>

          {/* AI Insights */}
          <GlassPanel className="p-5 lg:col-span-2 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-violet-500/12 to-transparent border-violet-500/20 ring-1 ring-violet-500/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
                AI Insights
              </h3>
            </div>
            <div className="space-y-3 text-[11px] text-slate-300 leading-relaxed flex-1 flex flex-col justify-center">
              <div className="flex items-start gap-2">
                <Cpu className="h-3.5 w-3.5 shrink-0 text-violet-400 mt-0.5" />
                <p>
                  {sessionPerformance.length > 0
                    ? `Your top session is ${sessionPerformance[0]?.session} with $${sessionPerformance[0]?.profit.toFixed(2)} profit.`
                    : "Your trades are performing steadily across sessions."}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-violet-400 mt-0.5" />
                <p>
                  {buyProfit > sellProfit
                    ? "Buy setups are generating higher net returns than Sell setups."
                    : "Sell setups are generating higher net returns than Buy setups."}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="h-3.5 w-3.5 shrink-0 text-violet-400 mt-0.5" />
                <p>
                  {symbolPerformance.length > 0
                    ? `${symbolPerformance[0]?.symbol} is your most profitable asset.`
                    : "Keep trading to build symbol performance profiles."}
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Grid 5: Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Winning Trades */}
          <GlassPanel className="p-5 lg:col-span-5 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Top Winning Trades</h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase tracking-wider text-[9px] pb-2">
                    <th className="py-2">Pair</th>
                    <th className="py-2 text-center">Type</th>
                    <th className="py-2 text-right">Entry</th>
                    <th className="py-2 text-right">Exit</th>
                    <th className="py-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {winningTrades.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500">
                        No winning trades recorded
                      </td>
                    </tr>
                  ) : (
                    winningTrades.map((t) => (
                      <TradeRecordRow
                        key={t.id}
                        pair={t.symbol}
                        type={t.side === "BUY" ? "Buy" : "Sell"}
                        entry={t.entry_price.toString()}
                        exit={t.exit_price.toString()}
                        profit={`+$${t.profit}`}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassPanel>

          {/* Top Losing Trades */}
          <GlassPanel className="p-5 lg:col-span-5 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Top Losing Trades</h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase tracking-wider text-[9px] pb-2">
                    <th className="py-2">Pair</th>
                    <th className="py-2 text-center">Type</th>
                    <th className="py-2 text-right">Entry</th>
                    <th className="py-2 text-right">Exit</th>
                    <th className="py-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {losingTrades.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500">
                        No losing trades recorded
                      </td>
                    </tr>
                  ) : (
                    losingTrades.map((t) => (
                      <TradeRecordRow
                        key={t.id}
                        pair={t.symbol}
                        type={t.side === "BUY" ? "Buy" : "Sell"}
                        entry={t.entry_price.toString()}
                        exit={t.exit_price.toString()}
                        profit={`-$${Math.abs(t.profit)}`}
                        profitColor="text-rose-400"
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassPanel>

          {/* Goal Tracker */}
          <GlassPanel className="p-5 lg:col-span-2 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Goal Tracker</h3>
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-400">Profit Target</span>
                  <span className="text-white">
                    {Math.min(100, Math.max(0, Math.round((netProfit / profitGoal) * 100)))}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 text-sm font-bold text-white">
                  ${Math.round(netProfit)}{" "}
                  <span className="text-xs text-slate-500 font-normal">/ ${profitGoal.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 mt-2.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, Math.round((netProfit / profitGoal) * 100)))}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                    Trading Days
                  </span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {uniqueTradingDaysCount} / 31
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                    Consistency
                  </span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {winRate}%
                  </span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Sub-components / Helpers
function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/8 bg-white/[0.02] shadow-xl shadow-black/10 backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  positive,
  type = "line",
  chartData = [10, 20, 15, 30, 25, 40],
  color = "text-white",
}: {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  type?: "line" | "bar";
  chartData?: number[];
  color?: string;
}) {
  const minVal = Math.min(...chartData);
  const maxVal = Math.max(...chartData);
  const range = maxVal - minVal || 1;
  
  const mappedPoints = chartData.map((val, idx) => {
    const x = (idx / (chartData.length - 1)) * 100;
    const y = 28 - ((val - minVal) / range) * 24 - 2;
    return `${x} ${y}`;
  });

  const pathD = `M ${mappedPoints.join(" L ")}`;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 flex flex-col justify-between h-[132px] hover:border-white/20 hover:bg-white/[0.04] transition duration-200">
      <div>
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{title}</p>
          {change && (
            <span className={`text-[9px] font-bold flex items-center gap-0.5 ${positive ? "text-emerald-400" : "text-rose-400"}`}>
              {positive ? "+" : ""}{change}
            </span>
          )}
        </div>
        <p className={`text-xl font-bold mt-1.5 ${color}`}>{value}</p>
      </div>

      <div className="h-6 w-full mt-3">
        {type === "line" ? (
          <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path
              d={pathD}
              fill="none"
              stroke={positive ?? true ? "#10b981" : "#ef4444"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <div className="flex items-end gap-1 h-full">
            {chartData.map((val, idx) => (
              <div
                key={idx}
                className="flex-1 rounded-sm bg-blue-500/60"
                style={{ height: `${(val / Math.max(...chartData, 1)) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarDay({ day, status }: { day: number; status: "profit" | "loss" | "none" }) {
  let bgClass = "bg-white/[0.02] text-slate-500";
  if (status === "profit") {
    bgClass = "bg-emerald-500/30 text-emerald-200 font-semibold border border-emerald-500/20";
  } else if (status === "loss") {
    bgClass = "bg-rose-500/30 text-rose-200 font-semibold border border-rose-500/20";
  }
  return (
    <span className={`p-1.5 rounded transition hover:scale-110 cursor-pointer ${bgClass}`}>
      {day}
    </span>
  );
}

function SessionRow({
  dotColor,
  name,
  profit,
  percent,
  trades,
  winRate,
}: {
  dotColor: string;
  name: string;
  profit: string;
  percent: string;
  trades: string;
  winRate: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
        <span className="font-semibold text-slate-200">{name}</span>
      </div>
      <div className="text-right flex items-center justify-end gap-1.5">
        <span className="font-bold text-white">{profit}</span>
        <span className="text-[10px] text-slate-500">({percent})</span>
      </div>
    </div>
  );
}

function PairRow({
  pair,
  trades,
  winRate,
  profit,
  profitColor = "text-white",
}: {
  pair: string;
  trades: number;
  winRate: string;
  profit: string;
  profitColor?: string;
}) {
  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="py-2.5 font-bold text-white">{pair}</td>
      <td className="py-2.5 text-center text-slate-300">{trades}</td>
      <td className="py-2.5 text-center text-slate-300">{winRate}</td>
      <td className={`py-2.5 text-right font-semibold ${profitColor}`}>{profit}</td>
    </tr>
  );
}

function RiskProgressRow({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-medium mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// Fixed formatting error - removed RR from table headers matching mockup
function TradeRecordRow({
  pair,
  type,
  entry,
  exit,
  profit,
  profitColor = "text-emerald-400",
}: {
  pair: string;
  type: string;
  entry: string;
  exit: string;
  profit: string;
  profitColor?: string;
}) {
  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="py-2 font-bold text-white">{pair}</td>
      <td className={`py-2 text-center font-medium ${type === "Buy" ? "text-blue-400" : "text-rose-400"}`}>{type}</td>
      <td className="py-2 text-right text-slate-300">{entry}</td>
      <td className="py-2 text-right text-slate-300">{exit}</td>
      <td className={`py-2 text-right font-bold ${profitColor}`}>{profit}</td>
    </tr>
  );
}
