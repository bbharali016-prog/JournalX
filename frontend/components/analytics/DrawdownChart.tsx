"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  AreaSeries,
  ColorType,
  Time,
} from "lightweight-charts";

import {
  getDrawdownSeries,
} from "@/services/api/analytics";
import { useActiveAccount } from "@/components/auth/AccountContext";

export default function DrawdownChart() {
  const chartContainerRef =
    useRef<HTMLDivElement | null>(null);
  const { selectedAccountId } = useActiveAccount();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: ReturnType<typeof createChart> | null =
      null;
    let cleanupResize: (() => void) | undefined;

    async function loadChart() {
      const token = localStorage.getItem("token");

      if (!token || !chartContainerRef.current) return;

      try {
        const data = await getDrawdownSeries(token, selectedAccountId);

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
          height: 320,
          layout: {
            background: {
              type: ColorType.Solid,
              color: "#0f172a",
            },
            textColor: "#cbd5e1",
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
            borderColor: "#334155",
          },
          timeScale: {
            borderColor: "#334155",
          },
        });

        const areaSeries = chart.addSeries(AreaSeries, {
          lineWidth: 2,
          lineColor: "#ef4444",
          topColor: "rgba(239,68,68,0.35)",
          bottomColor: "rgba(239,68,68,0.05)",
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

        cleanupResize = () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (error) {
        console.error("Drawdown chart error:", error);
      }
    }

    loadChart();

    return () => {
      cleanupResize?.();
      chart?.remove();
    };
  }, [selectedAccountId]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Drawdown
      </h2>

      <div
        ref={chartContainerRef}
        className="w-full"
      />
    </div>
  );
}
