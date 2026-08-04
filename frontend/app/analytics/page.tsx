"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Users,
  Globe2,
  ShieldCheck,
  Star,
  Activity,
  Zap,
  Award,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Cpu,
} from "lucide-react";

export default function AnalyticsPage() {
  const [billingPeriod, setBillingPeriod] = useState("daily");

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
              Jul 1 — Jul 31, 2025
            </span>
            <button className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 transition">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              Filters
            </button>
          </div>
        </div>

        {/* Grid 1: Metrics Row (8 columns) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          <MetricCard
            title="Net Profit"
            value="$2,854.32"
            change="+12.45%"
            positive={true}
            chartData={[10, 15, 8, 22, 18, 30, 25, 35]}
            color="text-emerald-400"
          />
          <MetricCard
            title="Total Trades"
            value="128"
            type="bar"
            chartData={[5, 12, 8, 15, 6, 10, 14, 9]}
            color="text-blue-400"
          />
          <MetricCard
            title="Win Rate"
            value="64.06%"
            change="+5.22%"
            positive={true}
            chartData={[55, 58, 62, 59, 61, 63, 60, 64]}
            color="text-emerald-400"
          />
          <MetricCard
            title="Profit Factor"
            value="2.35"
            change="+0.85"
            positive={true}
            chartData={[1.8, 1.9, 2.1, 2.0, 2.2, 2.1, 2.3, 2.35]}
            color="text-violet-400"
          />
          <MetricCard
            title="Expectancy"
            value="$22.30"
            change="+4.32"
            positive={true}
            chartData={[15, 18, 14, 20, 17, 21, 19, 22.3]}
            color="text-emerald-400"
          />
          <MetricCard
            title="Avg RR"
            value="1.91"
            change="+0.43"
            positive={true}
            chartData={[1.5, 1.6, 1.8, 1.7, 1.75, 1.9, 1.85, 1.91]}
            color="text-cyan-400"
          />
          <MetricCard
            title="Max Drawdown"
            value="8.42%"
            change="-1.24%"
            positive={false} // drawdown is lower (good)
            chartData={[12, 10, 11, 9, 8.5, 9.2, 8.7, 8.42]}
            color="text-rose-400"
          />
          <MetricCard
            title="Win Streak"
            value="7"
            chartData={[3, 4, 3, 5, 2, 6, 4, 7]}
            color="text-violet-400"
          />
        </div>

        {/* Grid 2: Core Performance Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Equity Curve Chart */}
          <GlassPanel className="p-5 flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Equity Curve</h3>
                <div className="flex items-center gap-3 mt-1.5">
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
              <select
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                className="rounded-lg border border-white/8 bg-black/40 px-2.5 py-1 text-xs text-slate-300 outline-none cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            {/* SVG Line Chart */}
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
                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                {/* Balance Area & Line */}
                <path d="M0 135 L50 120 L100 125 L150 95 L200 100 L250 75 L300 85 L350 55 L400 35 L400 160 L0 160 Z" fill="url(#balanceGrad)" />
                <path d="M0 135 L50 120 L100 125 L150 95 L200 100 L250 75 L300 85 L350 55 L400 35" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Equity Area & Line */}
                <path d="M0 140 L50 115 L100 130 L150 90 L200 110 L250 70 L300 80 L350 45 L400 30 L400 160 L0 160 Z" fill="url(#equityGrad)" />
                <path d="M0 140 L50 115 L100 130 L150 90 L200 110 L250 70 L300 80 L350 45 L400 30" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
              </svg>
              {/* Date axis labels */}
              <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-medium">
                <span>Jul 1</span>
                <span>Jul 8</span>
                <span>Jul 15</span>
                <span>Jul 22</span>
                <span>Jul 31</span>
              </div>
            </div>
          </GlassPanel>

          {/* Daily P&L Bar Chart */}
          <GlassPanel className="p-5 flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Daily P&L</h3>
              <select className="rounded-lg border border-white/8 bg-black/40 px-2.5 py-1 text-xs text-slate-300 outline-none cursor-pointer">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="relative flex-1 flex items-end gap-1.5 h-44 mt-2">
              {/* Vertical center axis line */}
              <div className="absolute w-full h-[1px] bg-white/10 top-1/2 left-0" />
              
              {/* Mock P&L bars */}
              {[
                { val: 40, p: true },
                { val: -15, p: false },
                { val: 65, p: true },
                { val: -30, p: false },
                { val: 50, p: true },
                { val: 20, p: true },
                { val: -45, p: false },
                { val: 80, p: true },
                { val: -10, p: false },
                { val: 55, p: true },
                { val: -60, p: false },
                { val: 95, p: true },
                { val: -25, p: false },
                { val: 45, p: true },
                { val: 70, p: true },
              ].map((bar, idx) => {
                const heightPercent = Math.abs(bar.val) * 0.9;
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
              })}
            </div>
            {/* Date axis labels */}
            <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-medium">
              <span>Jul 1</span>
              <span>Jul 11</span>
              <span>Jul 16</span>
              <span>Jul 26</span>
              <span>Jul 31</span>
            </div>
          </GlassPanel>

          {/* Drawdown Area Chart */}
          <GlassPanel className="p-5 flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Drawdown</h3>
              <select className="rounded-lg border border-white/8 bg-black/40 px-2.5 py-1 text-xs text-slate-300 outline-none cursor-pointer">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="relative flex-1 h-44 mt-2">
              <svg className="w-full h-full animate-pulse-slow" viewBox="0 0 400 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="drawdownGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
                {/* Top zero baseline */}
                <line x1="0" y1="10" x2="400" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                
                {/* Drawdown Area & Line */}
                <path d="M0 10 L40 10 L80 40 L120 15 L160 55 L200 80 L240 30 L280 95 L320 110 L360 45 L400 15 L400 10 L0 10 Z" fill="url(#drawdownGrad)" />
                <path d="M0 10 L40 10 L80 40 L120 15 L160 55 L200 80 L240 30 L280 95 L320 110 L360 45 L400 15" fill="none" stroke="#ef4444" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-medium">
                <span>0% (Peak)</span>
                <span>-5%</span>
                <span>-10%</span>
                <span>-15%</span>
                <span>-20% (Max)</span>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Grid 3: Mid Section (Calendar Heatmap, Session Analysis, Pair Performance) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar Heatmap */}
          <GlassPanel className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Calendar Heatmap</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Jul 2025</span>
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
            {/* Calendar Grid */}
            <div className="space-y-1.5 flex-1">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 pb-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
              {/* Heatmap Squares */}
              <div className="grid grid-cols-7 gap-1 text-[11px] text-center">
                {/* Off-month days */}
                <span className="p-1.5 rounded text-slate-700 bg-transparent">30</span>
                <CalendarDay day={1} status="profit" />
                <CalendarDay day={2} status="profit" />
                <CalendarDay day={3} status="profit" />
                <CalendarDay day={4} status="none" />
                <CalendarDay day={5} status="none" />
                <CalendarDay day={6} status="none" />

                <CalendarDay day={7} status="profit" />
                <CalendarDay day={8} status="profit" />
                <CalendarDay day={9} status="profit" />
                <CalendarDay day={10} status="profit" />
                <CalendarDay day={11} status="profit" />
                <CalendarDay day={12} status="none" />
                <CalendarDay day={13} status="none" />

                <CalendarDay day={14} status="profit" />
                <CalendarDay day={15} status="loss" />
                <CalendarDay day={16} status="profit" />
                <CalendarDay day={17} status="loss" />
                <CalendarDay day={18} status="loss" />
                <CalendarDay day={19} status="none" />
                <CalendarDay day={20} status="none" />

                <CalendarDay day={21} status="loss" />
                <CalendarDay day={22} status="profit" />
                <CalendarDay day={23} status="profit" />
                <CalendarDay day={24} status="profit" />
                <CalendarDay day={25} status="profit" />
                <CalendarDay day={26} status="none" />
                <CalendarDay day={27} status="none" />

                <CalendarDay day={28} status="profit" />
                <CalendarDay day={29} status="profit" />
                <CalendarDay day={30} status="loss" />
                <CalendarDay day={31} status="profit" />
                <span className="p-1.5 rounded text-slate-700 bg-transparent">1</span>
                <span className="p-1.5 rounded text-slate-700 bg-transparent">2</span>
                <span className="p-1.5 rounded text-slate-700 bg-transparent">3</span>
              </div>
            </div>
            {/* Heatmap Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 mt-4 border-t border-white/5 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-emerald-500/80" />
                <span>Profit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-rose-500/80" />
                <span>Loss</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-slate-700" />
                <span>Breakeven</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-white/[0.04]" />
                <span>No Trade</span>
              </div>
            </div>
          </GlassPanel>

          {/* Session Analysis */}
          <GlassPanel className="p-5 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Session Analysis</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
              {/* Radial Donut chart */}
              <div className="relative h-28 w-28 shrink-0">
                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                  {/* Outer circle track */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                  
                  {/* London: 44.1% (stroke-dasharray="110.8 251.2", offset 0) */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2dd4bf" strokeWidth="12"
                    strokeDasharray="110.8 251.2" strokeDashoffset="0" />
                  
                  {/* New York: 36.0% (stroke-dasharray="90.4 251.2", offset -110.8) */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12"
                    strokeDasharray="90.4 251.2" strokeDashoffset="-110.8" />
                  
                  {/* Tokyo: 11.4% (stroke-dasharray="28.6 251.2", offset -201.2) */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" strokeWidth="12"
                    strokeDasharray="28.6 251.2" strokeDashoffset="-201.2" />
                  
                  {/* Sydney: 8.5% (stroke-dasharray="21.4 251.2", offset -229.8) */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12"
                    strokeDasharray="21.4 251.2" strokeDashoffset="-229.8" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Total Profit</p>
                  <p className="text-sm font-bold text-white mt-0.5">$2,854.32</p>
                </div>
              </div>

              {/* Session list table */}
              <div className="flex-1 w-full space-y-2 text-xs">
                <SessionRow dotColor="bg-teal-400" name="London" profit="$1,258.75" percent="44.1%" trades="72" winRate="66.67%" />
                <SessionRow dotColor="bg-violet-500" name="New York" profit="$1,028.32" percent="36.0%" trades="40" winRate="62.50%" />
                <SessionRow dotColor="bg-rose-500" name="Tokyo" profit="$325.45" percent="11.4%" trades="10" winRate="60.00%" />
                <SessionRow dotColor="bg-emerald-500" name="Sydney" profit="$241.80" percent="8.5%" trades="6" winRate="50.00%" />
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
                    <th className="py-2 text-right">RR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  <PairRow pair="EURUSD" trades={45} winRate="71.11%" profit="+$812.40" rr="2.12" profitColor="text-emerald-400" />
                  <PairRow pair="GBPUSD" trades={28} winRate="67.86%" profit="+$540.25" rr="1.89" profitColor="text-emerald-400" />
                  <PairRow pair="XAUUSD" trades={25} winRate="64.00%" profit="+$987.30" rr="2.45" profitColor="text-emerald-400" />
                  <PairRow pair="USDJPY" trades={12} winRate="58.33%" profit="+$210.45" rr="1.70" profitColor="text-emerald-400" />
                  <PairRow pair="USDCAD" trades={10} winRate="60.00%" profit="+$125.15" rr="1.60" profitColor="text-emerald-400" />
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-center border-t border-white/5 pt-3">
              <button className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 transition">
                View full report &rarr;
              </button>
            </div>
          </GlassPanel>
        </div>

        {/* Grid 4: Bottom-Mid Section (Buy vs Sell, Best Trading Hour, Trade Duration, Risk metrics, AI Insights) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Buy vs Sell */}
          <GlassPanel className="p-5 lg:col-span-3 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Buy vs Sell</h3>
            <div className="flex items-center justify-around flex-1 gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                  {/* Buy: 56.25% (stroke-dasharray="141.3 251.2") */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10"
                    strokeDasharray="141.3 251.2" strokeDashoffset="0" />
                  {/* Sell: 43.75% (stroke-dasharray="109.9 251.2") */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="10"
                    strokeDasharray="109.9 251.2" strokeDashoffset="-141.3" />
                </svg>
              </div>
              <div className="space-y-3 text-xs flex-1">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span className="font-semibold text-white">Buy Trades</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">72 (56.25%) | Profit: $1,678.45</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-white">Sell Trades</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">56 (43.75%) | Profit: $1,175.87</p>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Best Trading Time (Hour) Heatmap */}
          <GlassPanel className="p-5 lg:col-span-3 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Best Trading Time (Hour)</h3>
            <div className="space-y-1.5 flex-1">
              {/* Hour scale headers */}
              <div className="flex text-[9px] font-semibold text-slate-500 pb-1 justify-between pl-6 pr-1">
                <span>0</span>
                <span>4</span>
                <span>8</span>
                <span>12</span>
                <span>16</span>
                <span>20</span>
              </div>
              {/* Mon-Sun grid lines */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                <div key={day} className="flex items-center gap-2 text-[10px]">
                  <span className="w-5 text-slate-500 font-semibold text-left">{day}</span>
                  <div className="flex-1 grid grid-cols-6 gap-1">
                    {Array.from({ length: 6 }).map((_, hIdx) => {
                      // Intensities to match mockup styling
                      let cellBg = "bg-white/[0.03]";
                      if ((idx === 0 && hIdx === 3) || (idx === 1 && hIdx === 4) || (idx === 2 && hIdx === 3)) {
                        cellBg = "bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
                      } else if ((idx === 2 && hIdx === 2) || (idx === 3 && hIdx === 4) || (idx === 4 && hIdx === 3)) {
                        cellBg = "bg-emerald-500/50";
                      } else if ((idx === 0 && hIdx === 1) || (idx === 4 && hIdx === 5)) {
                        cellBg = "bg-rose-500/60 shadow-[0_0_8px_rgba(239,68,68,0.2)]";
                      } else if ((idx === 1 && hIdx === 1) || (idx === 3 && hIdx === 2)) {
                        cellBg = "bg-amber-500/50";
                      }
                      return <div key={hIdx} className={`h-3 rounded-sm ${cellBg} transition hover:scale-110`} />;
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
                  {/* Scalping: 43.75% (stroke-dasharray="109.9 251.2") */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="10"
                    strokeDasharray="109.9 251.2" strokeDashoffset="0" />
                  {/* Intraday: 45.31% (stroke-dasharray="113.8 251.2") */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10"
                    strokeDasharray="113.8 251.2" strokeDashoffset="-109.9" />
                  {/* Swing: 10.94% (stroke-dasharray="27.5 251.2") */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2dd4bf" strokeWidth="10"
                    strokeDasharray="27.5 251.2" strokeDashoffset="-223.7" />
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-400 mt-4 text-center w-full">
                <div>
                  <span className="text-violet-400 font-bold block">Scalping</span>
                  <span className="text-[10px] text-white font-medium">43.75%</span>
                </div>
                <div>
                  <span className="text-blue-400 font-bold block">Intraday</span>
                  <span className="text-[10px] text-white font-medium">45.31%</span>
                </div>
                <div>
                  <span className="text-teal-400 font-bold block">Swing</span>
                  <span className="text-[10px] text-white font-medium">10.94%</span>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Risk Management progress cards */}
          <GlassPanel className="p-5 lg:col-span-2 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Risk Management</h3>
            <div className="space-y-3 flex-1 justify-center flex flex-col">
              <RiskProgressRow label="Average Risk" value="0.83%" percent={40} color="bg-emerald-500" />
              <RiskProgressRow label="Max Risk" value="1.98%" percent={85} color="bg-amber-500" />
              <RiskProgressRow label="Avg Position Size" value="0.65 Lots" percent={50} color="bg-blue-500" />
              <RiskProgressRow label="Best Risk Reward" value="1 : 2.45" percent={75} color="bg-violet-500" />
            </div>
          </GlassPanel>

          {/* AI Insights */}
          <GlassPanel className="p-5 lg:col-span-2 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-violet-500/12 to-transparent border-violet-500/20 ring-1 ring-violet-500/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
                AI Insights
              </h3>
              <span className="bg-violet-500/20 text-violet-300 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">New</span>
            </div>
            <div className="space-y-3 text-[11px] text-slate-300 leading-relaxed flex-1 flex flex-col justify-center">
              <div className="flex items-start gap-2">
                <Cpu className="h-3.5 w-3.5 shrink-0 text-violet-400 mt-0.5" />
                <p>Your best performance comes from London session trades.</p>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-violet-400 mt-0.5" />
                <p>Avoid trading after 7 PM, your win rate drops by 18%.</p>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="h-3.5 w-3.5 shrink-0 text-violet-400 mt-0.5" />
                <p>XAUUSD is your most profitable pair with 2.45 average RR.</p>
              </div>
            </div>
            <div className="mt-3 border-t border-white/5 pt-2.5 text-center">
              <button className="text-[9px] font-bold text-violet-400 hover:text-violet-300 transition">
                View all insights &rarr;
              </button>
            </div>
          </GlassPanel>
        </div>

        {/* Grid 5: Footer Tables (Winning, Losing, Goal Tracker) */}
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
                    <th className="py-2 text-right">RR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  <TradeRecordRow pair="XAUUSD" type="Buy" entry="2,321.45" exit="2,358.80" profit="+$354.85" rr="1:3.21" />
                  <TradeRecordRow pair="EURUSD" type="Buy" entry="1.0812" exit="1.0895" profit="+$249.00" rr="1:2.45" />
                  <TradeRecordRow pair="GBPUSD" type="Sell" entry="1.2765" exit="1.2680" profit="+$212.50" rr="1:2.12" />
                </tbody>
              </table>
            </div>
            <div className="mt-3 border-t border-white/5 pt-3 text-center">
              <button className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 transition">
                View all winning trades &rarr;
              </button>
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
                    <th className="py-2 text-right">RR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  <TradeRecordRow pair="EURUSD" type="Sell" entry="1.0943" exit="1.0982" profit="-$112.40" rr="1:0.65" profitColor="text-rose-400" />
                  <TradeRecordRow pair="GBPUSD" type="Buy" entry="1.2856" exit="1.2898" profit="-$98.70" rr="1:0.88" profitColor="text-rose-400" />
                  <TradeRecordRow pair="USDJPY" type="Buy" entry="156.45" exit="156.89" profit="-$75.20" rr="1:0.55" profitColor="text-rose-400" />
                </tbody>
              </table>
            </div>
            <div className="mt-3 border-t border-white/5 pt-3 text-center">
              <button className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 transition">
                View all losing trades &rarr;
              </button>
            </div>
          </GlassPanel>

          {/* Goal Tracker */}
          <GlassPanel className="p-5 lg:col-span-2 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-4">Goal Tracker</h3>
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-400">Monthly Profit Goal</span>
                  <span className="text-white">57%</span>
                </div>
                <div className="flex items-baseline gap-1 text-sm font-bold text-white">
                  $2,854 <span className="text-xs text-slate-500 font-normal">/ $5,000</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 mt-2.5 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "57%" }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Trading Days</span>
                  <span className="text-base font-bold text-white mt-1 block">23 / 31</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Consistency</span>
                  <span className="text-base font-bold text-white mt-1 block">78%</span>
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

      {/* Mini line/bar chart */}
      <div className="h-6 w-full mt-3">
        {type === "line" ? (
          <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path
              d={`M ${chartData
                .map((val, idx) => `${(idx / (chartData.length - 1)) * 100} ${30 - val}`)
                .join(" L ")}`}
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
                style={{ height: `${(val / Math.max(...chartData)) * 100}%` }}
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
      <div className="text-right">
        <span className="font-bold text-white">{profit}</span>
        <span className="text-[10px] text-slate-500 ml-1.5">({percent} | {trades}t | {winRate} WR)</span>
      </div>
    </div>
  );
}

function PairRow({
  pair,
  trades,
  winRate,
  profit,
  rr,
  profitColor = "text-white",
}: {
  pair: string;
  trades: number;
  winRate: string;
  profit: string;
  rr: string;
  profitColor?: string;
}) {
  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="py-2.5 font-bold text-white">{pair}</td>
      <td className="py-2.5 text-center text-slate-300">{trades}</td>
      <td className="py-2.5 text-center text-slate-300">{winRate}</td>
      <td className={`py-2.5 text-right font-semibold ${profitColor}`}>{profit}</td>
      <td className="py-2.5 text-right text-slate-300">{rr}</td>
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

function TradeRecordRow({
  pair,
  type,
  entry,
  exit,
  profit,
  rr,
  profitColor = "text-emerald-400",
}: {
  pair: string;
  type: string;
  entry: string;
  exit: string;
  profit: string;
  rr: string;
  profitColor?: string;
}) {
  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="py-2 font-bold text-white">{pair}</td>
      <td className={`py-2 text-center font-medium ${type === "Buy" ? "text-blue-400" : "text-rose-400"}`}>{type}</td>
      <td className="py-2 text-right text-slate-300">{entry}</td>
      <td className="py-2 text-right text-slate-300">{exit}</td>
      <td className={`py-2 text-right font-bold ${profitColor}`}>{profit}</td>
      <td className="py-2 text-right text-slate-300 font-semibold">{rr}</td>
    </tr>
  );
}
