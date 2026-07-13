"use client";

import { useEffect, useRef } from "react";
import { createChart, AreaSeries } from "lightweight-charts";

export default function EquityChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 350,
      layout: {
        background: {
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
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#3b82f6",
      topColor: "rgba(59,130,246,0.4)",
      bottomColor: "rgba(59,130,246,0.05)",
    });

    areaSeries.setData([
      { time: "2026-01-01", value: 10000 },
      { time: "2026-01-05", value: 10250 },
      { time: "2026-01-10", value: 10120 },
      { time: "2026-01-15", value: 10750 },
      { time: "2026-01-20", value: 11150 },
      { time: "2026-01-25", value: 11000 },
      { time: "2026-01-30", value: 11600 },
    ]);

    const handleResize = () => {
      if (!chartContainerRef.current) return;

      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Equity Curve
      </h2>

      <div ref={chartContainerRef} />
    </div>
  );
}