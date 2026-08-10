"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";

import {
  createTrade,
  updateTrade,
  uploadTradeImage,
} from "@/services/api/trades";
import { getAccounts, Account } from "@/services/api/accounts";
import { Trade } from "@/types/trade";

interface TradeFormProps {
  trade: Trade | null;
  onTradeAdded: () => void;
  onCancelEdit: () => void;
}

const standardSymbols = ["XAU/USD", "GBP/USD", "BTC/USD", "USD/CAD", "GBP/JPY"];

export default function TradeForm({
  trade,
  onTradeAdded,
  onCancelEdit,
}: TradeFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedSymbolType, setSelectedSymbolType] = useState<string>("XAU/USD");

  const [form, setForm] = useState({
    trade_date: new Date().toISOString().slice(0, 10),
    symbol: "XAU/USD",
    side: "BUY",
    lot_size: "",
    entry_price: "",
    exit_price: "",
    profit: "",
    notes: "",
    image_url: "",
    session: "Asian",
  });

  useEffect(() => {
    if (!trade) return;

    // Determine session based on trade.created_at hour (in UTC)
    let sessionVal = "Asian";
    try {
      const dateObj = new Date(trade.created_at);
      const hour = dateObj.getUTCHours();
      if (7 <= hour && hour < 15) {
        sessionVal = "London";
      } else if (15 <= hour && hour < 23) {
        sessionVal = "New York";
      }
    } catch (e) {
      console.error("Error parsing trade date for session:", e);
    }

    // Determine symbol type (standard or custom)
    const isStandard = standardSymbols.includes(trade.symbol);
    setSelectedSymbolType(isStandard ? trade.symbol : "CUSTOM");

    setForm({
      trade_date: trade.created_at.slice(0, 10),
      symbol: trade.symbol,
      side: trade.side,
      lot_size: String(trade.lot_size),
      entry_price: String(trade.entry_price),
      exit_price: String(trade.exit_price),
      profit: String(trade.profit),
      notes: trade.notes ?? "",
      image_url: trade.image_url ?? "",
      session: sessionVal,
    });
  }, [trade]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getAccounts(token)
        .then((data) => {
          setAccounts(data);
          if (trade && trade.account_id) {
            setSelectedAccountId(String(trade.account_id));
          } else if (data.length > 0) {
            setSelectedAccountId(String(data[0].id));
          }
        })
        .catch(console.error);
    }
  }, [trade]);

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

    let imageUrl = form.image_url;
    if (imageFile) {
      try {
        imageUrl = await uploadTradeImage(imageFile, token);
      } catch (err) {
        console.error("Failed to upload screenshot:", err);
        alert("Image upload failed, saving trade without new image.");
      }
    }

    // Map session type to UTC time suffix
    let timeSuffix = "T00:00:00";
    if (form.session === "London") {
      timeSuffix = "T08:00:00";
    } else if (form.session === "New York") {
      timeSuffix = "T16:00:00";
    }

    const tradeData = {
      symbol: form.symbol,
      side: form.side as "BUY" | "SELL",
      lot_size: Number(form.lot_size),
      entry_price: Number(form.entry_price),
      exit_price: Number(form.exit_price),
      profit: Number(form.profit),
      notes: form.notes,
      image_url: imageUrl,
      account_id: selectedAccountId ? Number(selectedAccountId) : undefined,
      created_at: `${form.trade_date}${timeSuffix}`,
    };

    try {
      if (trade) {
        await updateTrade(trade.id, tradeData, token);
      } else {
        await createTrade(tradeData, token);
      }

      setForm({
        trade_date: new Date().toISOString().slice(0, 10),
        symbol: "XAU/USD",
        side: "BUY",
        lot_size: "",
        entry_price: "",
        exit_price: "",
        profit: "",
        notes: "",
        image_url: "",
        session: "Asian",
      });
      setSelectedSymbolType("XAU/USD");
      setImageFile(null);

      onTradeAdded();
      if (trade) {
        onCancelEdit();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save trade");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15"
    >
      <div className="col-span-2 flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-medium pl-1">Trading Account</label>
        <select
          className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-white w-full"
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
        >
          <option value="">No Account / General</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.platform})
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="pl-1 text-xs font-medium text-slate-400">Trade Date</label>
          <input
            type="date"
            className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-white placeholder:text-slate-500 w-full"
            value={form.trade_date}
            onChange={(e) => updateField("trade_date", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="pl-1 text-xs font-medium text-slate-400">Trading Session</label>
          <select
            className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-white w-full"
            value={form.session}
            onChange={(e) => updateField("session", e.target.value)}
          >
            <option value="London">London Session</option>
            <option value="New York">New York Session</option>
            <option value="Asian">Asian Session</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-medium pl-1">Symbol</label>
        <select
          className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-white"
          value={selectedSymbolType}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedSymbolType(val);
            if (val !== "CUSTOM") {
              updateField("symbol", val);
            } else {
              updateField("symbol", "");
            }
          }}
        >
          {standardSymbols.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
          <option value="CUSTOM">Custom Symbol...</option>
        </select>
        {selectedSymbolType === "CUSTOM" && (
          <input
            type="text"
            className="mt-1.5 rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-white placeholder:text-slate-500"
            placeholder="e.g. BTC/USD"
            value={form.symbol}
            onChange={(e) => updateField("symbol", e.target.value.toUpperCase())}
            required
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-medium pl-1">Side</label>
        <select
          className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-white w-full"
          value={form.side}
          onChange={(e) => updateField("side", e.target.value)}
        >
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-medium pl-1">Lot Size</label>
        <input
          type="number"
          step="any"
          className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-white placeholder:text-slate-500"
          placeholder="e.g. 0.05"
          value={form.lot_size}
          onChange={(e) => updateField("lot_size", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-medium pl-1">Entry Price</label>
        <input
          type="number"
          step="any"
          className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-white placeholder:text-slate-500"
          placeholder="e.g. 1950.50"
          value={form.entry_price}
          onChange={(e) => updateField("entry_price", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-medium pl-1">Exit Price</label>
        <input
          type="number"
          step="any"
          className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-white placeholder:text-slate-500"
          placeholder="e.g. 1955.20"
          value={form.exit_price}
          onChange={(e) => updateField("exit_price", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between pl-1">
          <label className="text-xs text-slate-400 font-medium">Profit / Loss ($)</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const val = form.profit.trim();
                if (val.startsWith("-")) {
                  updateField("profit", val.substring(1));
                }
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                !form.profit.startsWith("-") && form.profit !== ""
                  ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              + Profit
            </button>
            <button
              type="button"
              onClick={() => {
                const val = form.profit.trim();
                if (!val.startsWith("-") && val.length > 0) {
                  updateField("profit", `-${val}`);
                } else if (!val) {
                  updateField("profit", "-");
                }
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                form.profit.startsWith("-")
                  ? "bg-rose-500/25 text-rose-300 border border-rose-500/40"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              - Loss
            </button>
          </div>
        </div>
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => {
              const val = form.profit.trim();
              if (val.startsWith("-")) {
                updateField("profit", val.substring(1));
              } else if (val) {
                updateField("profit", `-${val}`);
              } else {
                updateField("profit", "-");
              }
            }}
            className={`absolute left-2.5 px-2 py-1 rounded-lg text-xs font-bold transition border cursor-pointer z-10 ${
              form.profit.startsWith("-")
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}
            title="Click to toggle +/-"
          >
            {form.profit.startsWith("-") ? "- (Loss)" : "+ (Win)"}
          </button>
          <input
            type="text"
            className="w-full rounded-2xl border border-white/10 bg-[#0b1220] p-3 pl-20 text-white placeholder:text-slate-500 focus:border-violet-400/40 outline-none"
            placeholder="e.g. 120.00 or -50.00"
            value={form.profit}
            onChange={(e) => {
              const val = e.target.value;
              // Allow numbers, decimal point, and leading minus
              if (/^-?\d*\.?\d*$/.test(val)) {
                updateField("profit", val);
              }
            }}
            required
          />
        </div>
      </div>

      <div className="col-span-2 flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-medium pl-1">Notes</label>
        <textarea
          rows={3}
          className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-white placeholder:text-slate-500 w-full"
          placeholder="Add trading notes, strategies, or emotions..."
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </div>

      <div className="col-span-2">
        <label className="text-xs text-slate-400 font-medium pl-1 mb-1.5 block">Trade Screenshot</label>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-5 hover:border-violet-500/50 hover:bg-white/[0.02] transition cursor-pointer">
          <Upload className="h-6 w-6 text-slate-400 mb-2 animate-pulse" />
          <span className="text-sm font-medium text-white text-center px-4 truncate max-w-xs">
            {imageFile ? imageFile.name : "Upload screenshot"}
          </span>
          <span className="text-xs text-slate-500 mt-1 text-center">
            {imageFile ? "Click to change image file" : "Drag & drop or click to upload trade screenshot (PNG, JPG)"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setImageFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </label>
      </div>

      <div className="col-span-2 flex gap-4 mt-2">
        <button
          type="submit"
          className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 p-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-95 cursor-pointer active:scale-[0.99]"
        >
          {trade ? "Update Trade" : "Save Trade"}
        </button>

        {trade && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10 cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
