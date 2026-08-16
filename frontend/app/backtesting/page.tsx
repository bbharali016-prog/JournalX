"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/components/auth/UserContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Lock,
  Send,
  FlaskConical,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  Trash2,
  RefreshCw,
  Plus,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  username: string;
  avatar?: string;
  message: string;
  time: string;
  plan: string;
}

interface SimulatedTrade {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  entry: number;
  stopLoss: number;
  takeProfit: number;
  lots: number;
  result: "WIN" | "LOSS" | "OPEN";
  pnl: number;
  notes?: string;
  timestamp: string;
}

const initialMessages: ChatMessage[] = [
  {
    username: "Alexander_FX",
    message: "XAU/USD is testing the weekly resistance zone at 1980. Looking for short setups.",
    time: "3 mins ago",
    plan: "Elite",
  },
  {
    username: "PipHunter_99",
    message: "EUR/USD has formed a neat double bottom on the 4H chart. Bullish continuation is likely.",
    time: "1 min ago",
    plan: "Elite",
  },
];

const AVAILABLE_SYMBOLS = [
  { value: "FX:EURUSD", label: "EUR/USD (Euro / US Dollar)" },
  { value: "FX:GBPUSD", label: "GBP/USD (Great British Pound / US Dollar)" },
  { value: "OANDA:XAUUSD", label: "XAU/USD (Gold / US Dollar)" },
  { value: "FX:USDCAD", label: "USD/CAD (US Dollar / Canadian Dollar)" },
  { value: "BINANCE:BTCUSDT", label: "BTC/USDT (Bitcoin / Tether)" },
  { value: "OANDA:US30USD", label: "US30 (Dow Jones Index)" },
  { value: "OANDA:NAS100USD", label: "NAS100 (Nasdaq 100 Index)" },
];

function BacktestingContent() {
  const { user } = useCurrentUser();
  const isElite = user?.plan?.toLowerCase()?.trim() === "elite";

  // Simulated Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(true);

  // Active view tab on the right side
  const [rightPanelTab, setRightPanelTab] = useState<"simulator" | "chat">("simulator");

  // Backtesting Sandbox State
  const [selectedSymbol, setSelectedSymbol] = useState("FX:EURUSD");
  const [startingBalance, setStartingBalance] = useState<number>(50000);
  const [simulatedTrades, setSimulatedTrades] = useState<SimulatedTrade[]>([]);

  // Simulator Form State
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [lots, setLots] = useState("1.0");
  const [tradeResult, setTradeResult] = useState<"WIN" | "LOSS" | "OPEN">("WIN");
  const [customPnL, setCustomPnL] = useState("");
  const [tradeNotes, setTradeNotes] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingChat(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Safe client-side localstorage retrieval for session trades
  useEffect(() => {
    const saved = localStorage.getItem("simulated_trades");
    if (saved) {
      try {
        setSimulatedTrades(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved simulated trades:", e);
      }
    }
  }, []);

  const saveTrades = (updated: SimulatedTrade[]) => {
    setSimulatedTrades(updated);
    localStorage.setItem("simulated_trades", JSON.stringify(updated));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      username: user?.full_name ?? "Trader",
      avatar: user?.profile_image_url,
      message: inputMessage,
      time: "Just now",
      plan: "Elite",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
  };

  // Add Simulated Trade
  const handleAddSimulatedTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryPrice || !lots) return;

    const entryNum = parseFloat(entryPrice);
    const slNum = stopLoss ? parseFloat(stopLoss) : 0;
    const tpNum = takeProfit ? parseFloat(takeProfit) : 0;
    const lotNum = parseFloat(lots);

    // Auto-calculate realistic P&L if not manually specified
    let calculatedPnL = 0;
    if (customPnL) {
      calculatedPnL = parseFloat(customPnL);
    } else if (tradeResult !== "OPEN") {
      const pipMultiplier = selectedSymbol.includes("JPY") ? 100 : selectedSymbol.includes("XAU") ? 1 : 10000;
      const pointDifference = tradeResult === "WIN"
        ? Math.abs(tpNum - entryNum)
        : -Math.abs(entryNum - slNum);

      calculatedPnL = parseFloat((pointDifference * pipMultiplier * 10 * lotNum).toFixed(2));
    }

    const newTrade: SimulatedTrade = {
      id: `sim-${Date.now()}`,
      symbol: selectedSymbol,
      type: tradeType,
      entry: entryNum,
      stopLoss: slNum,
      takeProfit: tpNum,
      lots: lotNum,
      result: tradeResult,
      pnl: calculatedPnL,
      notes: tradeNotes,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [newTrade, ...simulatedTrades];
    saveTrades(updated);

    // Reset Form fields
    setEntryPrice("");
    setStopLoss("");
    setTakeProfit("");
    setCustomPnL("");
    setTradeNotes("");
  };

  const handleDeleteTrade = (id: string) => {
    const updated = simulatedTrades.filter((t) => t.id !== id);
    saveTrades(updated);
  };

  const handleRestartSession = () => {
    if (window.confirm("Are you sure you want to reset your simulated backtesting session and ledger?")) {
      saveTrades([]);
    }
  };

  // Calculate stats
  const totalPnL = simulatedTrades.reduce((acc, t) => acc + t.pnl, 0);
  const closedTrades = simulatedTrades.filter((t) => t.result !== "OPEN");
  const winningTrades = closedTrades.filter((t) => t.result === "WIN");
  const winRate = closedTrades.length > 0
    ? Math.round((winningTrades.length / closedTrades.length) * 100)
    : 0;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div className="space-y-6">
      
      {/* Backtesting Header with Control & Restart */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-600/10 text-violet-400">
            <FlaskConical className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Tools</p>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Backtesting Sandbox
              <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30 uppercase tracking-wider">
                Simulator Engine
              </span>
            </h1>
          </div>
        </div>

        {/* Session Summary Stats */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Simulated Balance</p>
            <p className={`text-base font-bold ${totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              ${(startingBalance + totalPnL).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Net Session P&L</p>
            <p className={`text-base font-bold ${totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Sim Win Rate</p>
            <p className="text-base font-bold text-white">{winRate}% ({winningTrades.length}/{closedTrades.length})</p>
          </div>
          
          <button
            onClick={handleRestartSession}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Ledger</span>
          </button>
        </div>
      </div>

      {/* Backtesting Content Layout */}
      <div className="grid gap-6 xl:grid-cols-12">
        
        {/* LEFT PANEL: Chart Embed & Simulation Trade Ledger (8 Cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* TradingView Chart with Instrument Switcher */}
          <div className="rounded-3xl border border-white/8 bg-black/40 overflow-hidden shadow-2xl relative flex flex-col">
            {/* Instrument Selection Bar */}
            <div className="border-b border-white/5 bg-white/[0.02] px-4 py-3 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-400">Select Sandbox Asset:</span>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-1.5 text-xs font-medium text-slate-200 outline-none hover:border-violet-500/50 transition cursor-pointer"
              >
                {AVAILABLE_SYMBOLS.map((sym) => (
                  <option key={sym.value} value={sym.value}>
                    {sym.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Chart Iframe */}
            <div className="relative min-h-[460px] h-[460px] w-full">
              <iframe
                key={selectedSymbol}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(
                  selectedSymbol
                )}&interval=60&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=121212&studies=%5B%5D&theme=dark&style=1&timezone=exchange`}
                style={{ width: "100%", height: "100%", border: "none" }}
                allowFullScreen
              />
            </div>
          </div>

          {/* Simulation Trade Ledger (Table) */}
          <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5 shadow-2xl relative">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-violet-400" />
              Simulated Session Trade Ledger
              <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] text-slate-400 font-semibold border border-white/5">
                {simulatedTrades.length} Trades
              </span>
            </h3>

            {simulatedTrades.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-[#050b18]/60 p-8 text-center">
                <Play className="h-6 w-6 text-slate-500 mx-auto mb-2.5 animate-pulse" />
                <p className="text-xs font-medium text-slate-400">No simulated trades recorded yet in this session.</p>
                <p className="text-[10px] text-slate-500 mt-1">Use the right-hand panel to place your first test trade.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#050b18]/45">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-semibold">
                      <th className="p-3.5">Asset</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Entry / SL / TP</th>
                      <th className="p-3.5">Lots</th>
                      <th className="p-3.5 text-right">Result</th>
                      <th className="p-3.5 text-right">Profit/Loss</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {simulatedTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-white/[0.02] transition">
                        <td className="p-3.5 font-medium text-white">{trade.symbol.split(":")[1] || trade.symbol}</td>
                        <td className="p-3.5">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            trade.type === "BUY" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="p-3.5 leading-relaxed font-mono">
                          <div>Ent: {trade.entry}</div>
                          <div className="text-[10px] text-slate-400">SL: {trade.stopLoss || "None"} | TP: {trade.takeProfit || "None"}</div>
                        </td>
                        <td className="p-3.5 font-mono">{trade.lots}</td>
                        <td className="p-3.5 text-right">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            trade.result === "WIN" ? "text-emerald-400" : trade.result === "LOSS" ? "text-rose-400" : "text-amber-400"
                          }`}>
                            {trade.result === "WIN" ? <CheckCircle className="h-3 w-3" /> : trade.result === "LOSS" ? <XCircle className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
                            {trade.result}
                          </span>
                        </td>
                        <td className={`p-3.5 text-right font-bold font-mono ${trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleDeleteTrade(trade.id)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
                            title="Delete trade"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT PANEL: Tab Switcher (Simulator Form vs Chat Window) (4 Cols) */}
        <div className="xl:col-span-4 rounded-3xl border border-white/8 bg-white/[0.03] flex flex-col min-h-[600px] shadow-2xl overflow-hidden relative">
          
          {/* Right Panel Tabs */}
          <div className="border-b border-white/5 bg-white/[0.01] p-1 flex">
            <button
              onClick={() => setRightPanelTab("simulator")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded-2xl transition cursor-pointer ${
                rightPanelTab === "simulator"
                  ? "bg-[#0b1220] border border-white/8 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Trade Simulator</span>
            </button>
            <button
              onClick={() => setRightPanelTab("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded-2xl transition cursor-pointer ${
                rightPanelTab === "chat"
                  ? "bg-[#0b1220] border border-white/8 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Trading Chat</span>
            </button>
          </div>

          {/* TAB CONTENT 1: BACKTEST TRADE SIMULATOR */}
          {rightPanelTab === "simulator" && (
            <div className="flex-1 p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Play className="h-3 w-3 text-violet-400" />
                  Place Simulated Trade
                </h3>
                <p className="text-[11px] text-slate-500">Record a mock trade on the current asset to backtest your execution model.</p>
              </div>

              <form onSubmit={handleAddSimulatedTrade} className="space-y-4 text-xs">
                {/* Buy / Sell Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTradeType("BUY")}
                    className={`py-2.5 rounded-xl font-bold border transition cursor-pointer ${
                      tradeType === "BUY"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5"
                        : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    BUY / LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType("SELL")}
                    className={`py-2.5 rounded-xl font-bold border transition cursor-pointer ${
                      tradeType === "SELL"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-md shadow-rose-500/5"
                        : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    SELL / SHORT
                  </button>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Entry Price</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 1.0854"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Stop Loss</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 1.0820"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Take Profit</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 1.0920"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Lot Size</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={lots}
                        onChange={(e) => setLots(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Trade Result</label>
                      <select
                        value={tradeResult}
                        onChange={(e) => setTradeResult(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3 py-2.5 text-white outline-none focus:border-violet-500 transition cursor-pointer"
                      >
                        <option value="WIN">WIN / TAKE PROFIT</option>
                        <option value="LOSS">LOSS / STOP LOSS</option>
                        <option value="OPEN">RUNNING / OPEN</option>
                      </select>
                    </div>
                  </div>

                  {/* Manual P&L override */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase flex items-center justify-between">
                      <span>Custom Profit / Loss ($)</span>
                      <span className="text-[9px] text-slate-500 font-normal">Optional Override</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 250.00 or -120.00"
                      value={customPnL}
                      onChange={(e) => setCustomPnL(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Trade Notes / Confluences</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. swept key liquidity, FVG mitigation..."
                      value={tradeNotes}
                      onChange={(e) => setTradeNotes(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 transition resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-violet-600/20 hover:opacity-95 active:scale-[0.99] transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Session Ledger</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB CONTENT 2: TRADINGVIEW CHAT */}
          {rightPanelTab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Chat Messages Log */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[380px] min-h-[380px] scrollbar-thin">
                {messages.map((msg, idx) => {
                  const msgInitials =
                    msg.username
                      ?.split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("") ?? "JX";

                  const msgAvatarSrc = msg.avatar
                    ? (msg.avatar.startsWith("http")
                        ? msg.avatar
                        : (backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl) + msg.avatar)
                    : undefined;

                  return (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Avatar className="h-8 w-8 rounded-lg shrink-0">
                        {msgAvatarSrc && <AvatarImage src={msgAvatarSrc} alt={msg.username} className="object-cover rounded-lg" />}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold rounded-lg text-xs">
                          {msgInitials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-indigo-300 truncate">{msg.username}</span>
                          <span className="text-[10px] text-slate-500">{msg.time}</span>
                        </div>
                        <p className="text-sm text-slate-200 mt-1 leading-5 break-words bg-white/5 rounded-2xl px-3 py-2">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Send Input Form */}
              <form onSubmit={handleSendMessage} className="border-t border-white/5 p-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your trading comments..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={!isElite}
                  className="flex-1 rounded-xl border border-white/10 bg-[#0b1220] px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isElite}
                  className="rounded-xl bg-violet-600 p-3 text-white transition hover:bg-violet-500 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              {/* Blurred Overlay lock for Non-Elite Members */}
              {loadingChat ? (
                <div className="absolute inset-0 bg-[#060b13]/85 backdrop-blur-[4px] flex flex-col items-center justify-center p-6 text-center z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                  <p className="mt-4 text-sm text-slate-400">Loading chat room...</p>
                </div>
              ) : !isElite ? (
                <div className="absolute inset-0 bg-[#060b13]/85 backdrop-blur-[4px] flex flex-col items-center justify-center p-6 text-center z-10">
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-amber-400 mb-4 animate-bounce">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                    Elite Plan Required
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400 max-w-xs">
                    TradingView collaborative chat is restricted to **Elite Plan** members. Upgrade your plan to participate in real-time chart discussions.
                  </p>
                  <Link
                    href="/settings"
                    className="mt-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:opacity-95 active:scale-[0.98]"
                  >
                    Upgrade to Elite Plan
                  </Link>
                </div>
              ) : null}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function BacktestingPage() {
  return (
    <DashboardLayout>
      <BacktestingContent />
    </DashboardLayout>
  );
}
