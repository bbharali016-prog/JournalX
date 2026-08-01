"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import TradeForm from "@/components/trades/TradeForm";
import TradeTable from "@/components/trades/TradeTable";

import {
  getTrades,
  deleteTrade,
} from "@/services/api/trades";

import { Trade } from "@/types/trade";

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [search, setSearch] = useState("");
  const [sideFilter, setSideFilter] = useState("ALL");
  const [resultFilter, setResultFilter] = useState("ALL");

  async function loadTrades() {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const data = await getTrades(token);
      setTrades(data);
    } catch (err) {
      console.error("Failed to load trades:", err);
    }
  }

  useEffect(() => {
    void (async () => {
      await loadTrades();
    })();
  }, []);

  async function handleDelete(id: number) {
    const token = localStorage.getItem("token");

    if (!token) return;

    await deleteTrade(id, token);

    if (editingTrade && editingTrade.id === id) {
      setEditingTrade(null);
    }

    loadTrades();
  }

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.symbol
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesSide = sideFilter === "ALL" || trade.side === sideFilter;
    const matchesResult =
      resultFilter === "ALL" ||
      (resultFilter === "PROFIT" && trade.profit >= 0) ||
      (resultFilter === "LOSS" && trade.profit < 0);

    return matchesSearch && matchesSide && matchesResult;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
          <p className="text-sm text-slate-400">Trading Journal</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Log, review, and refine every trade
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Keep your entries, exits, notes, and screenshots in one clean workspace.
          </p>
        </div>

        <TradeForm
          key={editingTrade?.id ?? "new"}
          trade={editingTrade}
          onTradeAdded={() => {
            setEditingTrade(null);
            loadTrades();
          }}
          onCancelEdit={() => setEditingTrade(null)}
        />

        <div className="flex flex-wrap gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4 shadow-xl shadow-black/15">
          <input
            type="text"
            placeholder="Search Symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-48 rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white placeholder:text-slate-500"
          />

          <select
            value={sideFilter}
            onChange={(e) => setSideFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white"
          >
            <option value="ALL">All Sides</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white"
          >
            <option value="ALL">All Results</option>
            <option value="PROFIT">Profit</option>
            <option value="LOSS">Loss</option>
          </select>
        </div>

        <TradeTable
          trades={filteredTrades}
          onDelete={handleDelete}
          onEdit={setEditingTrade}
        />
      </div>
    </DashboardLayout>
  );
}
