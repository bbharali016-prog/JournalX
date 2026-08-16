"use client";

import { useState, useEffect, useRef } from "react";
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
  Trash2,
  RefreshCw,
  Plus,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  HelpCircle,
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
  { value: "FX:EURUSD", label: "EUR/USD (Euro / US Dollar)", basePrice: 1.0850, volatility: 0.0003 },
  { value: "FX:GBPUSD", label: "GBP/USD (Great British Pound / US Dollar)", basePrice: 1.2650, volatility: 0.0004 },
  { value: "OANDA:XAUUSD", label: "XAU/USD (Gold / US Dollar)", basePrice: 2350.00, volatility: 1.80 },
  { value: "FX:USDCAD", label: "USD/CAD (US Dollar / Canadian Dollar)", basePrice: 1.3620, volatility: 0.0003 },
  { value: "BINANCE:BTCUSDT", label: "BTC/USDT (Bitcoin / Tether)", basePrice: 67200.00, volatility: 85.00 },
  { value: "OANDA:US30USD", label: "US30 (Dow Jones Index)", basePrice: 39500.00, volatility: 25.00 },
  { value: "OANDA:NAS100USD", label: "NAS100 (Nasdaq 100 Index)", basePrice: 18500.00, volatility: 18.00 },
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

  // Bar Replay Simulator State
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [replayPrice, setReplayPrice] = useState(1.0850);
  const [replayTime, setReplayTime] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1500); // ms per step
  const [replayNotification, setReplayNotification] = useState<string | null>(null);

  const formatDateForInput = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

  // Sync replay price when asset symbol changes
  useEffect(() => {
    const asset = AVAILABLE_SYMBOLS.find((s) => s.value === selectedSymbol);
    if (asset) {
      setReplayPrice(asset.basePrice);
      if (isReplayMode) {
        setEntryPrice(asset.basePrice.toString());
      }
    }
  }, [selectedSymbol, isReplayMode]);

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

  // Start Bar Replay Session
  const handleToggleReplayMode = () => {
    if (!isReplayMode) {
      setIsReplayMode(true);
      const asset = AVAILABLE_SYMBOLS.find((s) => s.value === selectedSymbol);
      const currentAssetPrice = asset ? asset.basePrice : 1.0850;
      setReplayPrice(currentAssetPrice);
      setEntryPrice(currentAssetPrice.toString());
      setTradeResult("OPEN"); // Set default to RUNNING trade for simulation
      setReplayTime(new Date(Date.now() - 24 * 3600 * 1000 * 5)); // Start 5 days ago
      triggerNotification("Historical Bar Replay Active! Market is loaded 5 days in the past.");
    } else {
      setIsReplayMode(false);
      setIsPlaying(false);
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      setTradeResult("WIN");
      setEntryPrice("");
    }
  };

  const triggerNotification = (msg: string) => {
    setReplayNotification(msg);
    setTimeout(() => {
      setReplayNotification(null);
    }, 4500);
  };

  // Simulate 1 Step Forward (Next Historical Candle)
  const handleStepForward = () => {
    const asset = AVAILABLE_SYMBOLS.find((s) => s.value === selectedSymbol);
    if (!asset) return;

    // Calculate next simulated price using volatile random walk
    const changePercent = (Math.random() - 0.48) * 2; // slightly biased upwards to match standard charts
    const priceChange = changePercent * asset.volatility;
    const newPrice = parseFloat((replayPrice + priceChange).toFixed(selectedSymbol.includes("XAU") ? 2 : 5));
    
    // Advance simulated time by 1 Hour
    const newTime = new Date(replayTime.getTime() + 60 * 60 * 1000);

    setReplayPrice(newPrice);
    setReplayTime(newTime);

    // Pre-fill Entry Price with new Replay price if in form
    setEntryPrice(newPrice.toString());

    // Evaluate open trades
    const updatedTrades = simulatedTrades.map((trade) => {
      if (trade.result !== "OPEN" || trade.symbol !== selectedSymbol) return trade;

      let hitTarget = false;
      let hitStop = false;
      let finalPnL = 0;

      const pipMultiplier = selectedSymbol.includes("JPY") ? 100 : selectedSymbol.includes("XAU") ? 1 : 10000;

      if (trade.type === "BUY") {
        if (trade.takeProfit > 0 && newPrice >= trade.takeProfit) {
          hitTarget = true;
          finalPnL = parseFloat(((trade.takeProfit - trade.entry) * pipMultiplier * 10 * trade.lots).toFixed(2));
        } else if (trade.stopLoss > 0 && newPrice <= trade.stopLoss) {
          hitStop = true;
          finalPnL = parseFloat(((trade.stopLoss - trade.entry) * pipMultiplier * 10 * trade.lots).toFixed(2));
        }
      } else {
        // SELL Trade
        if (trade.takeProfit > 0 && newPrice <= trade.takeProfit) {
          hitTarget = true;
          finalPnL = parseFloat(((trade.entry - trade.takeProfit) * pipMultiplier * 10 * trade.lots).toFixed(2));
        } else if (trade.stopLoss > 0 && newPrice >= trade.stopLoss) {
          hitStop = true;
          finalPnL = parseFloat(((trade.entry - trade.stopLoss) * pipMultiplier * 10 * trade.lots).toFixed(2));
        }
      }

      if (hitTarget) {
        triggerNotification(`🏆 Take Profit Hit! ${trade.symbol.split(":")[1]} ${trade.type} hit target at $${trade.takeProfit}. Profit: +$${finalPnL}`);
        return { ...trade, result: "WIN", pnl: finalPnL } as SimulatedTrade;
      }
      if (hitStop) {
        triggerNotification(`🚨 Stop Loss Hit! ${trade.symbol.split(":")[1]} ${trade.type} hit stop at $${trade.stopLoss}. Loss: $${finalPnL}`);
        return { ...trade, result: "LOSS", pnl: finalPnL } as SimulatedTrade;
      }

      return trade;
    });

    // Check if any trade was updated/closed
    const tradeWasClosed = updatedTrades.some((t, i) => t.result !== simulatedTrades[i].result);
    if (tradeWasClosed) {
      saveTrades(updatedTrades);
    }
  };

  // Autoplay handler
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        handleStepForward();
      }, replaySpeed);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, replayPrice, replayTime, selectedSymbol, simulatedTrades, replaySpeed]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
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
      timestamp: isReplayMode
        ? replayTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [newTrade, ...simulatedTrades];
    saveTrades(updated);

    // Reset Form fields except Entry Price (if in replay)
    if (!isReplayMode) setEntryPrice("");
    setStopLoss("");
    setTakeProfit("");
    setCustomPnL("");
    setTradeNotes("");
    triggerNotification(`Simulated ${tradeType} Trade Added successfully!`);
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

      {/* Replay Notification Banner */}
      {replayNotification && (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-600/10 p-3.5 text-xs text-violet-300 font-semibold flex items-center justify-between animate-in slide-in-from-top duration-300">
          <span>{replayNotification}</span>
          <button onClick={() => setReplayNotification(null)} className="text-[10px] hover:text-white opacity-80 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Backtesting Content Layout */}
      <div className="grid gap-6 xl:grid-cols-12">
        
        {/* LEFT PANEL: Chart Embed & Simulation Trade Ledger (8 Cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* TradingView Chart with Instrument Switcher & Replay Panel */}
          <div className="rounded-3xl border border-white/8 bg-black/40 overflow-hidden shadow-2xl relative flex flex-col">
            {/* Instrument Selection & Replay Toggle Bar */}
            <div className="border-b border-white/5 bg-[#0b1220] px-5 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Sandbox Asset:</span>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2 text-xs font-semibold text-slate-200 outline-none hover:border-violet-500/50 transition cursor-pointer"
                >
                  {AVAILABLE_SYMBOLS.map((sym) => (
                    <option key={sym.value} value={sym.value}>
                      {sym.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bar Replay Session Toggle Button */}
              <button
                onClick={handleToggleReplayMode}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                  isReplayMode
                    ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/25 animate-pulse"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>{isReplayMode ? "Stop Bar Replay" : "Start Bar Replay"}</span>
              </button>
            </div>

            {/* BAR REPLAY SIMULATED CONTROL OVERLAY PANEL */}
            {isReplayMode && (
              <>
                <div className="bg-[#0f172a] border-b border-white/15 px-5 py-4 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Simulated Price</span>
                      <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                        ${replayPrice.toLocaleString("en-US", { minimumFractionDigits: selectedSymbol.includes("XAU") ? 2 : 5 })}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden sm:block" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Simulated Time</span>
                      <p className="text-xs font-semibold text-white mt-0.5">
                        {replayTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {replayTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden sm:block" />
                    {/* Cut Date & Time Picker */}
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Cut / Slice Date</span>
                      <input
                        type="datetime-local"
                        value={formatDateForInput(replayTime)}
                        onChange={(e) => {
                          if (e.target.value) {
                            const newDate = new Date(e.target.value);
                            setReplayTime(newDate);
                            // Set base price or offset price realistically
                            const asset = AVAILABLE_SYMBOLS.find((s) => s.value === selectedSymbol);
                            if (asset) {
                              // fluctuation mock
                              const seed = newDate.getTime() % 100;
                              const offset = (seed - 50) * (asset.volatility / 10);
                              setReplayPrice(parseFloat((asset.basePrice + offset).toFixed(selectedSymbol.includes("XAU") ? 2 : 5)));
                            }
                            triggerNotification(`Chart timeline cut! Set to: ${newDate.toLocaleDateString()}`);
                          }
                        }}
                        className="mt-0.5 rounded-lg border border-white/10 bg-[#050b18] px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-violet-500 transition cursor-pointer font-mono"
                      />
                    </div>
                  </div>

                  {/* Replay Controls */}
                  <div className="flex items-center gap-2">
                    {/* Play / Pause */}
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition shadow cursor-pointer"
                      title={isPlaying ? "Pause Playback" : "Autoplay Candles"}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                    </button>

                    {/* Step Forward (Next candle) */}
                    <button
                      type="button"
                      onClick={handleStepForward}
                      className="flex h-9 px-3 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      title="Advance 1 Candle (Step Forward)"
                    >
                      <span>Step</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <select
                      value={replaySpeed}
                      onChange={(e) => setReplaySpeed(Number(e.target.value))}
                      className="rounded-xl border border-white/10 bg-[#050b18] px-2.5 py-2 text-[10px] font-bold text-slate-300 outline-none cursor-pointer"
                    >
                      <option value={1000}>1.0s / Bar</option>
                      <option value={1500}>1.5s / Bar</option>
                      <option value={2500}>2.5s / Bar</option>
                      <option value={4000}>4.0s / Bar</option>
                    </select>
                  </div>
                </div>

                {/* Helpful Instruction Alert */}
                <div className="bg-[#1e293b]/75 border-b border-white/10 px-5 py-4 text-xs text-slate-300 leading-relaxed space-y-3">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="h-4.5 w-4.5 text-violet-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                        <span>How to Backtest on Old/Historical Charts:</span>
                      </p>
                      <ul className="list-decimal pl-4 space-y-1.5 text-slate-400 text-[11px]">
                        <li>
                          <strong>Load Past Chart Bars:</strong> Click on the chart widget and scroll (drag) to the right to go back in time. Alternatively, click the <span className="text-violet-300 font-semibold">Calendar icon</span> at the bottom of the chart to jump directly to any old date (e.g. 2023/2024).
                        </li>
                        <li>
                          <strong>Set Cut Date in Simulator:</strong> Select the same historical date/time in the <span className="text-violet-300 font-semibold">"Cut / Slice Date"</span> box above so your trade entry price automatically aligns.
                        </li>
                        <li>
                          <strong>Start Slicing:</strong> Click <span className="text-violet-300 font-semibold">"Step"</span> or <span className="text-violet-300 font-semibold">"Play"</span> to simulate candle-by-candle price movement from that exact historical point!
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1.5">
                    <Play className="h-3 w-3 text-violet-400" />
                    Place Simulated Trade
                  </h3>
                  <p className="text-[10px] text-slate-500">Record a mock trade in your session ledger.</p>
                </div>
                {isReplayMode && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider animate-pulse">
                    Live Simulator Price
                  </span>
                )}
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
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">
                      Entry Price {isReplayMode && "(Locked to Replay Price)"}
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      disabled={isReplayMode}
                      placeholder="e.g. 1.0854"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 disabled:opacity-70 transition font-mono"
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
                        className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 transition font-mono"
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
                        className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 transition font-mono"
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
                        className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 transition font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Trade Status</label>
                      <select
                        value={tradeResult}
                        disabled={isReplayMode}
                        onChange={(e) => setTradeResult(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3 py-2.5 text-white outline-none focus:border-violet-500 disabled:opacity-75 transition cursor-pointer"
                      >
                        {isReplayMode ? (
                          <option value="OPEN">RUNNING / SIMULATING</option>
                        ) : (
                          <>
                            <option value="WIN">WIN / TAKE PROFIT</option>
                            <option value="LOSS">LOSS / STOP LOSS</option>
                            <option value="OPEN">RUNNING / OPEN</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Manual P&L override */}
                  {!isReplayMode && (
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
                        className="w-full rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-violet-500 transition font-mono"
                      />
                    </div>
                  )}

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
                  <span>{isReplayMode ? "Add Simulated Trade" : "Add to Session Ledger"}</span>
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
