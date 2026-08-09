"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  AreaSeries,
  ColorType,
  IChartApi,
  Time,
} from "lightweight-charts";
import { Info, TrendingUp } from "lucide-react";

import { getEquityCurve } from "@/services/api/dashboard";
import { useActiveAccount } from "@/components/auth/AccountContext";

const timeframeTabs = ["1D", "7D", "30D", "90D", "1Y", "All"] as const;
type Timeframe = (typeof timeframeTabs)[number];

export default function EquityChart() {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const { selectedAccountId, selectedAccount, accounts } = useActiveAccount();
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("All");
  const [rawData, setRawData] = useState<{ time: number; value: number }[]>([]);
  const [currentEquity, setCurrentEquity] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<number>(5000);

  // Fetch raw equity curve data on account change
  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await getEquityCurve(token, selectedAccountId);
        setRawData(data || []);
        if (data && data.length > 0) {
          const lastVal = data[data.length - 1].value;
          setCurrentEquity(lastVal);
          
          const baseSize = selectedAccount?.account_size || (accounts.length > 0 ? accounts[0].account_size : 5000);
          setTotalBalance(baseSize + lastVal);
        } else {
          setCurrentEquity(0);
          const baseSize = selectedAccount?.account_size || 5000;
          setTotalBalance(baseSize);
        }
      } catch (err) {
        console.error("Failed to fetch equity curve:", err);
      }
    }
    loadData();
  }, [selectedAccountId, selectedAccount, accounts]);

  // Filter data according to the selected timeframe
  const filteredData = useMemo(() => {
    if (!rawData.length) return [];

    const sorted = [...rawData].sort((a, b) => a.time - b.time);
    const seenTimes = new Set<number>();
    const unique = sorted.filter((point) => {
      if (seenTimes.has(point.time)) return false;
      seenTimes.add(point.time);
      return true;
    });

    if (selectedTimeframe === "All") return unique;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    let secondsAgo = 86400 * 30; // default 30D

    switch (selectedTimeframe) {
      case "1D":
        secondsAgo = 86400;
        break;
      case "7D":
        secondsAgo = 86400 * 7;
        break;
      case "30D":
        secondsAgo = 86400 * 30;
        break;
      case "90D":
        secondsAgo = 86400 * 90;
        break;
      case "1Y":
        secondsAgo = 86400 * 365;
        break;
    }

    const cutoff = nowInSeconds - secondsAgo;
    const filtered = unique.filter((p) => p.time >= cutoff);

    // If filtered data is empty or only 1 point, return at least 2 points for chart continuity
    if (filtered.length < 2 && unique.length >= 2) {
      return unique.slice(-Math.min(unique.length, selectedTimeframe === "1D" ? 3 : 7));
    }

    return filtered.length > 0 ? filtered : unique;
  }, [rawData, selectedTimeframe]);

  // Render TradingView lightweight chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: IChartApi | null = null;

    if (!filteredData.length) {
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = "";
      }
      return;
    }

    const chartData = filteredData.map((point) => ({
      time: point.time as Time,
      value: point.value,
    }));

    chartContainerRef.current.innerHTML = "";

    chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 380,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#09101d",
        },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: {
          color: "#162035",
        },
        horzLines: {
          color: "#162035",
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      leftPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        vertLine: {
          color: "#8b5cf6",
        },
        horzLine: {
          color: "#8b5cf6",
        },
      },
      handleScroll: false,
      handleScale: false,
    });

    const isPositive = currentEquity >= 0;
    const strokeColor = isPositive ? "#8b5cf6" : "#f43f5e";
    const topGradient = isPositive ? "rgba(139,92,246,0.38)" : "rgba(244,63,94,0.38)";
    const bottomGradient = isPositive ? "rgba(139,92,246,0.01)" : "rgba(244,63,94,0.01)";

    const areaSeries = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      lineColor: strokeColor,
      topColor: topGradient,
      bottomColor: bottomGradient,
      priceLineVisible: false,
      lastValueVisible: true,
      lastPriceAnimation: 1,
    });

    areaSeries.setData(chartData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (!chartContainerRef.current || !chart) return;
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart?.remove();
    };
  }, [filteredData, currentEquity]);

  return (
    <div className="h-full flex flex-col justify-between rounded-3xl border border-white/8 bg-[#0a1020] p-6 shadow-xl shadow-black/15">
      {/* Card Header */}
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white">Equity Curve</h2>
            <Info className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Track balance growth and P&L across trading sessions
          </p>
        </div>

        {/* Dynamic Timeframe Selector */}
        <div className="flex rounded-2xl border border-white/8 bg-[#0a1120] p-1 text-xs text-slate-300">
          {timeframeTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedTimeframe(tab)}
              className={`rounded-xl px-3 py-1.5 font-medium transition cursor-pointer ${
                selectedTimeframe === tab
                  ? "bg-violet-500/25 text-white font-bold shadow-sm shadow-violet-500/25 ring-1 ring-violet-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex-1 flex flex-col justify-center overflow-hidden rounded-2xl border border-white/8 bg-[#09101d] p-4 min-h-[380px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.06),transparent_30%)]" />
        
        <div className="relative w-full flex-1">
          <div
            ref={chartContainerRef}
            className="w-full h-full min-h-[380px]"
          />

          {/* Dynamic Live Balance Badge */}
          <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-xl bg-violet-600/90 border border-violet-400/30 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-violet-500/30 backdrop-blur-md">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
            <span>${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-violet-200 font-normal">
              ({currentEquity >= 0 ? "+" : ""}${currentEquity.toFixed(2)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

