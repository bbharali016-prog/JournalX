"use client";

import { useEffect, useState } from "react";
import TradeForm from "@/components/trades/TradeForm";
import TradeTable from "@/components/trades/TradeTable";
import { getTrades } from "@/services/api/trades";
import { Trade } from "@/types/trade";

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);

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
    loadTrades();
  }, []);

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Trading Journal</h1>

      <TradeForm onTradeAdded={loadTrades} />

      <TradeTable trades={trades} />
    </main>
  );
}