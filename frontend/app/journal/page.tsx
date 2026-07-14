"use client";

import { useEffect, useState } from "react";
import api from "@/services/api/client";

export default function JournalPage() {
  const [trades, setTrades] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState("BUY");
  const [lotSize, setLotSize] = useState("");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [profit, setProfit] = useState("");
  const [notes, setNotes] = useState("");

  async function loadTrades() {
    const token = localStorage.getItem("token");

    const res = await api.get("/api/v1/trades", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setTrades(res.data);
  }

  useEffect(() => {
    loadTrades();
  }, []);

  async function addTrade(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    await api.post(
      "/api/v1/trades",
      {
        symbol,
        side,
        lot_size: Number(lotSize),
        entry_price: Number(entry),
        exit_price: Number(exit),
        profit: Number(profit),
        notes,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    loadTrades();

    setSymbol("");
    setLotSize("");
    setEntry("");
    setExit("");
    setProfit("");
    setNotes("");
  }

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">
        Trading Journal
      </h1>

      <form
        onSubmit={addTrade}
        className="space-y-3"
      >
        <input
          placeholder="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />

        <select
          value={side}
          onChange={(e) => setSide(e.target.value)}
        >
          <option>BUY</option>
          <option>SELL</option>
        </select>

        <input
          placeholder="Lot Size"
          value={lotSize}
          onChange={(e) => setLotSize(e.target.value)}
        />

        <input
          placeholder="Entry"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        />

        <input
          placeholder="Exit"
          value={exit}
          onChange={(e) => setExit(e.target.value)}
        />

        <input
          placeholder="Profit"
          value={profit}
          onChange={(e) => setProfit(e.target.value)}
        />

        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button type="submit">
          Save Trade
        </button>
      </form>

      <hr />

      <h2 className="text-2xl font-bold">
        Trade History
      </h2>

      <pre>
        {JSON.stringify(trades, null, 2)}
      </pre>
    </main>
  );
}