"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  AreaSeries,
  ColorType,
  IChartApi,
  Time,
} from "lightweight-charts";
import { Info } from "lucide-react";

import { getEquityCurve } from "@/services/api/dashboard";
import { useActiveAccount } from "@/components/auth/AccountContext";

const timeframeTabs = ["1D", "7D", "30D", "90D", "1Y", "All"];

export default function EquityChart() {
  const chartContainerRef =
    useRef<HTMLDivElement | null>(null);
  const { selectedAccountId } = useActiveAccount();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: IChartApi | null = null;

    async function loadChart() {
      const token = localStorage.getItem("token");

      if (!token || !chartContainerRef.current) return;

      try {
        const data = await getEquityCurve(token, selectedAccountId);

        if (!data.length) {
          return;
        }

        const seenTimes = new Set<number>();
        const chartData = data
          .sort((a, b) => a.time - b.time)
          .filter((point) => {
            if (seenTimes.has(point.time)) {
              return false;
            }
            seenTimes.add(point.time);
            return true;
          })
          .map((point) => ({
            time: point.time as Time,
            value: point.value,
          }));

        chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 300,
          layout: {
            background: {
              type: ColorType.Solid,
              color: "#0b1220",
            },
            textColor: "#94a3b8",
          },
          grid: {
            vertLines: {
              color: "#1e293b",
            },
            horzLines: {
              color: "#1e293b",
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

        const areaSeries = chart.addSeries(AreaSeries, {
          lineWidth: 2,
          lineColor: "#8b5cf6",
          topColor: "rgba(139,92,246,0.34)",
          bottomColor: "rgba(139,92,246,0.02)",
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
      } catch (err) {
        console.error(err);
      }
    }

    let cleanup: (() => void) | undefined;

    loadChart().then((fn) => {
      cleanup = fn;
    });

    return () => {
      if (cleanup) cleanup();
      else if (chart) chart.remove();
    };
  }, [selectedAccountId]);

  return (
    <div className="rounded-3xl border border-white/8 bg-[#0a1020] p-6 shadow-xl shadow-black/15">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white">
              Equity Curve
            </h2>
            <Info className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Track balance growth across recent sessions
          </p>
        </div>

        <div className="flex rounded-2xl border border-white/8 bg-[#0a1120] p-1 text-xs text-slate-300">
          {timeframeTabs.map((tab, index) => (
            <button
              key={tab}
              className={`rounded-xl px-3 py-1.5 transition ${
                index === 1
                  ? "bg-violet-500/20 text-white shadow-sm shadow-violet-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#09101d] p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.06),transparent_30%)]" />
        <div className="relative">
          <div
            ref={chartContainerRef}
            className="w-full"
            style={{ height: 320 }}
          />
          <div className="pointer-events-none absolute right-2 top-3 rounded-md bg-violet-500 px-2 py-1 text-xs font-semibold text-white shadow-lg shadow-violet-500/30">
            $5,425.67
          </div>
        </div>
      </div>
    </div>
  );
}
