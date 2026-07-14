"use client";

import { useState } from "react";
import { createTrade } from "@/services/api/trades";

export default function TradeForm({
  onTradeAdded,
}: {
  onTradeAdded: () => void;
}) {
  const [form, setForm] = useState({
    symbol: "",
    side: "BUY",
    lot_size: "",
    entry_price: "",
    exit_price: "",
    profit: "",
    notes: "",
  });

  function updateField(name: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    await createTrade(
      {
        symbol: form.symbol,
        side: form.side as "BUY" | "SELL",
        lot_size: Number(form.lot_size),
        entry_price: Number(form.entry_price),
        exit_price: Number(form.exit_price),
        profit: Number(form.profit),
        notes: form.notes,
      },
      token
    );

    setForm({
      symbol: "",
      side: "BUY",
      lot_size: "",
      entry_price: "",
      exit_price: "",
      profit: "",
      notes: "",
    });

    onTradeAdded();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4 border rounded-lg p-6"
    >
      <input
        className="border p-2 rounded"
        placeholder="Symbol"
        value={form.symbol}
        onChange={(e) => updateField("symbol", e.target.value)}
      />

      <select
        className="border p-2 rounded"
        value={form.side}
        onChange={(e) => updateField("side", e.target.value)}
      >
        <option>BUY</option>
        <option>SELL</option>
      </select>

      <input
        className="border p-2 rounded"
        placeholder="Lot Size"
        value={form.lot_size}
        onChange={(e) => updateField("lot_size", e.target.value)}
      />

      <input
        className="border p-2 rounded"
        placeholder="Entry Price"
        value={form.entry_price}
        onChange={(e) => updateField("entry_price", e.target.value)}
      />

      <input
        className="border p-2 rounded"
        placeholder="Exit Price"
        value={form.exit_price}
        onChange={(e) => updateField("exit_price", e.target.value)}
      />

      <input
        className="border p-2 rounded"
        placeholder="Profit"
        value={form.profit}
        onChange={(e) => updateField("profit", e.target.value)}
      />

      <textarea
        className="border p-2 rounded col-span-2"
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => updateField("notes", e.target.value)}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white rounded p-3 col-span-2"
      >
        Save Trade
      </button>
    </form>
  );
}