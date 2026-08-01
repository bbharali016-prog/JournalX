"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-calendar/dist/Calendar.css";
import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";

import {
  CalendarDay,
  getCalendarData,
} from "@/services/api/dashboard";

const Calendar = dynamic(() => import("react-calendar"), {
  ssr: false,
});

function getDay(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

import { useActiveAccount } from "@/components/auth/AccountContext";

export default function TradingCalendar() {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [activeMonth, setActiveMonth] = useState(() => new Date());
  const { selectedAccountId } = useActiveAccount();
  const activeMonthKey = [
    activeMonth.getFullYear(),
    String(activeMonth.getMonth() + 1).padStart(2, "0"),
  ].join("-");
  const visibleDays = days.filter((day) => day.date.startsWith(activeMonthKey));
  const totalProfit = visibleDays.reduce((sum, day) => sum + day.profit, 0);
  const totalTrades = visibleDays.reduce((sum, day) => sum + day.trades, 0);
  const profitDays = visibleDays.filter((day) => day.profit > 0).length;
  const lossDays = visibleDays.filter((day) => day.profit < 0).length;

  function getDayData(date: Date) {
    return days.find((day) => day.date === getDay(date));
  }

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const data = await getCalendarData(token, selectedAccountId);
        setDays(data);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, [selectedAccountId]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Monthly Calendar</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Daily profit and loss
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            <CalendarDays className="h-4 w-4" />
            {totalTrades} trades
          </div>
        </div>

        <div className="trading-calendar">
          <Calendar
            onActiveStartDateChange={({ activeStartDate }) => {
              if (activeStartDate) {
                setActiveMonth(activeStartDate);
              }
            }}
            tileClassName={({ date }) => {
              const day = getDayData(date);

              if (!day) return "";

              if (day.profit > 0) {
                return "calendar-profit";
              }

              if (day.profit < 0) {
                return "calendar-loss";
              }

              return "";
            }}
            tileContent={({ date, view }) => {
              if (view !== "month") return null;

              const day = getDayData(date);

              if (!day || day.profit === 0) return null;

              return (
                <span
                  className={`calendar-pnl ${
                    day.profit > 0 ? "calendar-pnl-profit" : "calendar-pnl-loss"
                  }`}
                >
                  {day.profit > 0 ? "+" : "-"}${Math.abs(day.profit).toFixed(0)}
                </span>
              );
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Profit day</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="text-slate-300">Loss day</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
          <p className="text-sm text-slate-400">Month P&L</p>
          <p
            className={`mt-2 text-4xl font-semibold ${
              totalProfit >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {totalProfit >= 0 ? "+" : "-"}${Math.abs(totalProfit).toFixed(2)}
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
              <TrendingUp className="mb-3 h-5 w-5 text-emerald-300" />
              <p className="text-2xl font-semibold text-white">{profitDays}</p>
              <p className="text-xs text-slate-400">Profit days</p>
            </div>

            <div className="rounded-2xl border border-rose-400/15 bg-rose-400/10 p-4">
              <TrendingDown className="mb-3 h-5 w-5 text-rose-300" />
              <p className="text-2xl font-semibold text-white">{lossDays}</p>
              <p className="text-xs text-slate-400">Loss days</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-violet-500/15 via-white/[0.03] to-cyan-500/10 p-6 shadow-xl shadow-black/15">
          <p className="text-sm text-slate-400">Trading days</p>
          <p className="mt-2 text-3xl font-semibold text-white">{visibleDays.length}</p>
          <p className="mt-2 text-sm text-slate-400">
            Calendar shows one daily total from all trades closed on that date.
          </p>
        </div>
      </div>
    </div>
  );
}
