"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Brain,
  Calculator,
  Clock,
  Command,
  Eye,
  Radar,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";

type ToolCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  status: "popular" | "live" | "new" | "coming";
};

const tools: ToolCard[] = [
  {
    title: "Position Size Calculator",
    description:
      "Calculate lot size using your account balance, risk %, and stop loss distance.",
    icon: Calculator,
    badge: "Popular",
    status: "popular",
  },
  {
    title: "Forex Market Hours",
    description:
      "Track active trading sessions and find the best times to trade forex pairs.",
    icon: Clock,
    badge: "Live",
    status: "live",
  },
  {
    title: "Trader POV",
    description:
      "View a trader's shared dashboard and deep-dive performance in read-only mode.",
    icon: Eye,
    badge: "New",
    status: "new",
  },
  {
    title: "AI Trade Analyser",
    description:
      "Get AI-powered analysis and detailed reports on your trading performance.",
    icon: Brain,
    status: "coming",
  },
  {
    title: "Demo Trading",
    description: "Practice trading strategies risk-free with virtual funds.",
    icon: Sparkles,
    status: "coming",
  },
  {
    title: "Trade Replay",
    description:
      "Replay chart setups and review your execution with a clean timeline.",
    icon: Command,
    status: "coming",
  },
];

const instrumentPipValues: Record<string, number> = {
  EURUSD: 10,
  GBPUSD: 10,
  XAUUSD: 10,
  USDJPY: 9.1,
  US30: 1,
  NAS100: 1,
  BTCUSD: 0.5,
};

const riskPresets = [0.5, 1, 2, 3, 5];

export default function ToolsPage() {
  const [showSocial, setShowSocial] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopLossPips, setStopLossPips] = useState(20);
  const [instrument, setInstrument] = useState("XAUUSD");
  const [useCustomPipValue, setUseCustomPipValue] = useState(false);
  const [customPipValue, setCustomPipValue] = useState(10);

  // Forex Market Hours state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPipValue = useCustomPipValue
    ? customPipValue || 10
    : instrumentPipValues[instrument] ?? 10;

  const riskAmount = useMemo(
    () => (accountBalance * riskPercent) / 100,
    [accountBalance, riskPercent]
  );

  const lotSize = useMemo(() => {
    const denominator = stopLossPips * currentPipValue;

    if (!denominator) return 0;

    return riskAmount / denominator;
  }, [riskAmount, stopLossPips, currentPipValue]);

  const roundedLotSize = Number.isFinite(lotSize) ? lotSize : 0;
  const selectedToolData = tools.find((tool) => tool.title === selectedTool) ?? null;

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/10 text-blue-400">
              <Wrench className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Trading Tools
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Professional calculators and utilities to enhance your trading workflow
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <SummaryBox value="3" label="AVAILABLE" />
            <SummaryBox value="4" label="COMING SOON" />
          </div>
        </div>

        <div className="border-t border-white/8" />

        {selectedTool !== null && (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/20">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/10 text-blue-500">
                    <Wrench className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">
                      {selectedToolData?.title ?? "Choose a tool"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {selectedToolData?.title === "Position Size Calculator"
                        ? "Interactive tool to calculate your optimal trading lot size."
                        : selectedToolData?.title === "Forex Market Hours"
                        ? "Track active trading sessions across the globe in real-time."
                        : "Click a tool card below to open the working panel."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                  title="Close tool"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selectedToolData?.title === "Forex Market Hours" ? (
                <ForexMarketHours currentTime={currentTime} timeFormat={timeFormat} setTimeFormat={setTimeFormat} />
              ) : selectedToolData?.title === "Position Size Calculator" ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <ControlCard title="Account Balance" icon={Calculator}>
                    <div className="flex items-center overflow-hidden rounded-2xl border border-white/8 bg-black/40">
                      <span className="border-r border-white/8 px-4 py-3 text-slate-500">
                        $
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={accountBalance}
                        onChange={(event) =>
                          setAccountBalance(Number(event.target.value))
                        }
                        className="w-full bg-transparent px-4 py-3 text-white outline-none"
                      />
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      Enter your trading account balance
                    </p>
                  </ControlCard>

                  <div className="rounded-[1.5rem] border border-white/8 bg-[#131313] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-blue-500">
                          <Radar className="h-4 w-4" />
                          <span className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                            RISK PERCENTAGE
                          </span>
                        </div>
                        <p className="mt-3 text-4xl font-bold text-blue-500">
                          {riskPercent.toFixed(1)}%
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-slate-400">
                        ${riskAmount.toFixed(2)}
                      </p>
                    </div>

                    <input
                      type="range"
                      min={0.1}
                      max={5}
                      step={0.1}
                      value={riskPercent}
                      onChange={(event) =>
                        setRiskPercent(Number(event.target.value))
                      }
                      className="risk-slider w-full"
                    />

                    <div className="mt-4 flex justify-between text-xs font-semibold tracking-[0.18em] text-slate-500">
                      <span className={riskPercent <= 1 ? "text-blue-500" : ""}>
                        CONSERVATIVE
                      </span>
                      <span
                        className={
                          riskPercent > 1 && riskPercent <= 3
                            ? "text-blue-500"
                            : ""
                        }
                      >
                        MODERATE
                      </span>
                      <span className={riskPercent > 3 ? "text-blue-500" : ""}>
                        AGGRESSIVE
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {riskPresets.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setRiskPercent(preset)}
                          className={`rounded-2xl border px-2 py-3 text-sm transition ${
                            riskPercent === preset
                              ? "border-blue-500/60 bg-blue-600/10 text-blue-400"
                              : "border-white/8 bg-black/40 text-slate-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <ControlCard title="Stop Loss Distance" icon={Radar}>
                    <div className="flex items-center overflow-hidden rounded-2xl border border-white/8 bg-black/40">
                      <input
                        type="number"
                        min={1}
                        value={stopLossPips}
                        onChange={(event) =>
                          setStopLossPips(Number(event.target.value))
                        }
                        className="w-full bg-transparent px-4 py-3 text-white outline-none"
                      />
                      <span className="border-l border-white/8 px-4 py-3 text-slate-500">
                        pips
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      Distance from entry to stop loss in pips
                    </p>
                  </ControlCard>

                  <ControlCard title="Trading Instrument" icon={Command}>
                    <select
                      value={instrument}
                      onChange={(event) => setInstrument(event.target.value)}
                      className="w-full rounded-2xl border border-white/8 bg-black/40 px-4 py-3 text-white outline-none"
                    >
                      <option value="XAUUSD">XAUUSD</option>
                      <option value="EURUSD">EURUSD</option>
                      <option value="GBPUSD">GBPUSD</option>
                      <option value="USDJPY">USDJPY</option>
                      <option value="US30">US30</option>
                      <option value="NAS100">NAS100</option>
                      <option value="BTCUSD">BTCUSD</option>
                    </select>

                    <div className="mt-4 rounded-2xl border border-blue-500/20 bg-[#0d1730] px-4 py-3 text-sm text-slate-300">
                      <div className="flex items-center justify-between gap-4">
                        <span>Pip Value: ${currentPipValue.toFixed(2)}/lot</span>
                        <span>Pip Size: 0.01</span>
                      </div>
                    </div>

                    <label className="mt-4 flex items-center gap-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={useCustomPipValue}
                        onChange={(event) =>
                          setUseCustomPipValue(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-white/20 bg-transparent"
                      />
                      Use custom pip value
                    </label>

                    {useCustomPipValue ? (
                      <div className="mt-3 flex items-center overflow-hidden rounded-2xl border border-white/8 bg-black/40">
                        <span className="border-r border-white/8 px-4 py-3 text-slate-500">
                          $
                        </span>
                        <input
                          type="number"
                          min={0.01}
                          step={0.01}
                          value={customPipValue}
                          onChange={(event) =>
                            setCustomPipValue(Number(event.target.value))
                          }
                          className="w-full bg-transparent px-4 py-3 text-white outline-none"
                        />
                      </div>
                    ) : null}
                  </ControlCard>
                </div>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 px-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-blue-500/20 bg-blue-600/10 text-blue-400">
                    {selectedToolData ? (
                      <selectedToolData.icon className="h-10 w-10" />
                    ) : (
                      <Calculator className="h-10 w-10" />
                    )}
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">
                    {selectedToolData
                      ? selectedToolData.title
                      : "Select a tool from the cards"}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                    {selectedToolData
                      ? selectedToolData.description
                      : "Click Position Size Calculator to open the full working calculator. Other tools will open here later."}
                  </p>
                  {selectedToolData?.status === "coming" ? (
                    <span className="mt-6 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
                      In Development
                    </span>
                  ) : null}
                </div>
              )}

              {selectedToolData?.title === "Position Size Calculator" ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="inline-flex flex-1 items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500">
                    Calculate Position Size
                  </button>
                  <button
                    onClick={() => {
                      setAccountBalance(10000);
                      setRiskPercent(1);
                      setStopLossPips(20);
                      setInstrument("XAUUSD");
                      setUseCustomPipValue(false);
                      setCustomPipValue(10);
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              ) : null}
            </section>

            <section className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/20">
              <div className="flex h-full flex-col justify-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-blue-500/20 bg-blue-600/10 text-blue-400">
                  <Calculator className="h-12 w-12" />
                </div>

                <h3 className="mt-8 text-center text-2xl font-semibold text-white">
                  Enter Your Parameters
                </h3>
                <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-6 text-slate-400">
                  Fill in your account balance, risk percentage, and stop loss
                  to calculate your optimal position size.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    "Most professionals risk 1–2% per trade",
                    "Always define your stop loss before entering",
                    "Position sizing is key to long-term survival",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/25 px-4 py-4 text-sm text-slate-300"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                        ✓
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-blue-500/20 bg-[#091525] p-5">
                  <p className="text-sm text-slate-400">Selected tool</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {selectedToolData?.title ?? "None selected"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {selectedToolData?.title === "Position Size Calculator"
                      ? `Based on a risk amount of $${riskAmount.toFixed(2)} and ${stopLossPips} pips.`
                      : selectedToolData
                        ? "Click another card to switch tools."
                        : "Nothing is open yet. Choose a tool to see it here."}
                  </p>
                  {selectedToolData?.title === "Position Size Calculator" ? (
                    <div className="mt-5 rounded-2xl border border-blue-500/20 bg-black/25 px-4 py-4">
                      <p className="text-sm text-slate-400">Estimated lot size</p>
                      <p className="mt-2 text-4xl font-semibold text-white">
                        {roundedLotSize.toFixed(2)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.title}
              tool={tool}
              active={selectedTool === tool.title}
              onClick={() => setSelectedTool(tool.title)}
            />
          ))}
        </div>
      </div>

      {showSocial ? (
        <div className="fixed bottom-6 right-6 z-50 w-[330px] overflow-hidden rounded-2xl border border-blue-500/25 bg-[#091019] shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white">
                TFB
              </div>
              <span className="text-lg font-semibold text-white">
                TradeFXBook
              </span>
            </div>
            <button
              onClick={() => setShowSocial(false)}
              className="rounded-full border border-white/10 p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 pb-4 pt-3">
            <div className="rounded-2xl bg-[linear-gradient(135deg,#0d1730_0%,#0a1020_100%)] px-5 py-6 shadow-inner shadow-black/20">
              <p className="text-2xl font-semibold leading-tight text-white">
                Follow us
                <br />
                on our Socials
              </p>
              <div className="mt-4 flex justify-end">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/80 text-white">
                  <ArrowRight className="h-7 w-7" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white">
                Instagram
              </button>
              <button className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900">
                Twitter / X
              </button>
            </div>

            <button
              onClick={() => setShowSocial(false)}
              className="mt-3 w-full text-center text-xs text-slate-500 transition hover:text-slate-300"
            >
              Do not show again
            </button>
          </div>
        </div>
      ) : null}

      <button className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 xl:right-6">
        <Wrench className="h-6 w-6" />
      </button>
    </DashboardLayout>
  );
}

function SummaryBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[130px] rounded-2xl border border-white/8 bg-white/[0.04] px-6 py-5 text-center">
      <p className="text-3xl font-semibold text-blue-500">{value}</p>
      <p className="mt-1 text-sm tracking-[0.2em] text-slate-500">{label}</p>
    </div>
  );
}

function ControlCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-[#131313] p-5">
      <div className="mb-4 flex items-center gap-2 text-blue-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold tracking-[0.2em] text-slate-500">
          {title.toUpperCase()}
        </span>
      </div>
      {children}
    </div>
  );
}

function ToolCard({
  tool,
  active,
  onClick,
}: {
  tool: ToolCard;
  active?: boolean;
  onClick?: () => void;
}) {
  const Icon = tool.icon;

  return (
    <button
      onClick={onClick}
      className={`group rounded-[2rem] border p-6 text-left shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-blue-500/20 hover:bg-white/[0.045] ${
        active
          ? "border-blue-500/35 bg-blue-500/10"
          : "border-white/8 bg-white/[0.03]"
      }`}
    >
      <div className="mb-8 flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/15 bg-blue-600/10 text-blue-500">
          <Icon className="h-7 w-7" />
        </div>
        <span className="rounded-full border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-500">
          {tool.badge ?? tool.status.toUpperCase()}
        </span>
      </div>

      <h3 className="text-2xl font-semibold text-white">{tool.title}</h3>
      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">
        {tool.description}
      </p>

      <div className="mt-7 border-t border-white/8 pt-5">
        {tool.status === "coming" ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-600" />
            In Development
          </div>
        ) : (
          <span className="inline-flex items-center gap-3 text-sm font-semibold text-blue-500 transition group-hover:text-blue-400">
            Open Tool
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Forex Market Hours Component ───────────────────────────────────────────

interface Session {
  name: string;
  flag: string;
  timezone: string;
  utcOffset: number;
  openHourUTC: number;
  closeHourUTC: number;
  color: string;
  barColor: string;
}

const SESSIONS: Session[] = [
  { name: "Sydney",   flag: "🇦🇺", timezone: "AEDT", utcOffset: 10, openHourUTC: 22, closeHourUTC: 7,  color: "text-emerald-400", barColor: "bg-emerald-500" },
  { name: "Tokyo",    flag: "🇯🇵", timezone: "JST",  utcOffset: 9,  openHourUTC: 0,  closeHourUTC: 9,  color: "text-pink-400",    barColor: "bg-pink-500"    },
  { name: "London",   flag: "🇬🇧", timezone: "GMT",  utcOffset: 0,  openHourUTC: 8,  closeHourUTC: 17, color: "text-blue-400",   barColor: "bg-blue-500"    },
  { name: "New York", flag: "🇺🇸", timezone: "EST",  utcOffset: -5, openHourUTC: 13, closeHourUTC: 22, color: "text-violet-400", barColor: "bg-violet-500"  },
];

function isSessionOpen(session: Session, nowUTC: number): boolean {
  const { openHourUTC: open, closeHourUTC: close } = session;
  if (open < close) return nowUTC >= open && nowUTC < close;
  return nowUTC >= open || nowUTC < close;
}

function getWrappedBars(session: Session): Array<{ left: string; width: string }> {
  const { openHourUTC: open, closeHourUTC: close } = session;
  const total = 24;
  if (open < close) {
    return [{ left: `${(open / total) * 100}%`, width: `${((close - open) / total) * 100}%` }];
  }
  return [
    { left: `${(open / total) * 100}%`, width: `${((24 - open) / total) * 100}%` },
    { left: "0%", width: `${(close / total) * 100}%` },
  ];
}

function ForexMarketHours({
  currentTime,
  timeFormat,
  setTimeFormat,
}: {
  currentTime: Date;
  timeFormat: "12h" | "24h";
  setTimeFormat: (f: "12h" | "24h") => void;
}) {
  const utcHour = currentTime.getUTCHours();
  const utcMin = currentTime.getUTCMinutes();
  const utcFrac = utcHour + utcMin / 60;
  const anyOpen = SESSIONS.some((s) => isSessionOpen(s, utcHour));
  const needleLeft = `${(utcFrac / 24) * 100}%`;
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][currentTime.getUTCDay()];

  const formatLocalTime = (session: Session) => {
    const localMs = currentTime.getTime() + session.utcOffset * 3600 * 1000;
    const d = new Date(localMs);
    const h = d.getUTCHours();
    const m = d.getUTCMinutes();
    if (timeFormat === "24h") return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const formatUTCClock = () => {
    const h = currentTime.getUTCHours();
    const m = currentTime.getUTCMinutes();
    const s = currentTime.getUTCSeconds();
    if (timeFormat === "24h") {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} ${ampm}`;
  };

  const hourLabels = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  return (
    <div className="space-y-6">
      {/* Status + controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold border ${
            anyOpen
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border-red-500/25"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${anyOpen ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
          {anyOpen ? "Market Open" : "Market Closed"}
        </span>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-black/40 border border-white/8 p-0.5">
            {(["12h", "24h"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setTimeFormat(fmt)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  timeFormat === fmt ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-blue-600/20 border border-blue-500/30 px-4 py-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-sm font-bold text-white tabular-nums">{formatUTCClock()}</span>
            <span className="text-xs text-blue-400 font-medium">{dayName}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-white/8 bg-black/30 px-5 pt-4 pb-6">
        {/* Hour labels */}
        <div className="relative mb-2 h-4">
          {hourLabels.map((h) => (
            <span
              key={h}
              className="absolute text-[10px] text-slate-600 font-mono -translate-x-1/2"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {h === 0 ? "0" : h === 24 ? "24" : h}
            </span>
          ))}
        </div>

        <div className="mt-2 space-y-4">
          {SESSIONS.map((session) => {
            const open = isSessionOpen(session, utcHour);
            const bars = getWrappedBars(session);
            return (
              <div key={session.name} className="flex items-center gap-3">
                <div className="w-28 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{session.flag}</span>
                    <span className="text-sm font-semibold text-white">{session.name}</span>
                  </div>
                  <div className={`text-xs font-mono mt-0.5 ${session.color}`}>
                    {formatLocalTime(session)}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    {open ? (
                      <span className={`font-semibold ${session.color}`}>● Open</span>
                    ) : (
                      <span className="text-slate-600">○ Closed</span>
                    )}
                  </div>
                </div>

                <div className="relative flex-1 h-7 rounded-full bg-white/[0.04]">
                  {bars.map((bar, i) => (
                    <div
                      key={i}
                      className={`absolute top-0 h-full rounded-full ${session.barColor} ${open ? "opacity-90" : "opacity-30"}`}
                      style={{ left: bar.left, width: bar.width }}
                    />
                  ))}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/80 z-10 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                    style={{ left: needleLeft }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Volume curve */}
        <div className="mt-6 relative h-14">
          <svg viewBox="0 0 480 56" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,52 C20,52 40,50 60,46 C80,42 100,40 120,38 C140,36 160,30 180,22 C200,14 220,8 240,6 C260,4 280,10 300,18 C320,26 340,36 360,40 C380,44 400,40 420,36 C440,32 460,34 480,52 Z"
              fill="url(#volGrad)"
            />
            <path
              d="M0,52 C20,52 40,50 60,46 C80,42 100,40 120,38 C140,36 160,30 180,22 C200,14 220,8 240,6 C260,4 280,10 300,18 C320,26 340,36 360,40 C380,44 400,40 420,36 C440,32 460,34 480,52"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
            />
          </svg>
          <div className="absolute top-0 h-full w-0.5 bg-white/40 z-10" style={{ left: needleLeft }} />
        </div>

        {!anyOpen && (
          <p className="mt-2 text-center text-xs text-slate-500 italic">
            Trading volume is usually low at this time.
          </p>
        )}
      </div>

      {/* Best times to trade */}
      <div>
        <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
          <span className="text-yellow-400">⭐</span> Best Times to Trade
        </h4>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              tag: "HIGHEST VOLUME",
              tagColor: "text-emerald-300 bg-emerald-500/15 border-emerald-500/25",
              overlap: "London + New York Overlap",
              time: "1:00 PM – 5:00 PM UTC",
              desc: "Maximum liquidity, tightest spreads. Best for EUR/USD, GBP/USD, USD/JPY.",
            },
            {
              tag: "LONDON OPEN",
              tagColor: "text-blue-300 bg-blue-500/15 border-blue-500/25",
              overlap: "High Volatility Window",
              time: "8:00 AM – 12:00 PM UTC",
              desc: "Day's first major expansion in volatility. Sets directional bias for EUR/GBP crosses.",
            },
            {
              tag: "TOKYO OPEN",
              tagColor: "text-yellow-300 bg-yellow-500/15 border-yellow-500/25",
              overlap: "Best Asia Window",
              time: "12:00 AM – 9:00 AM UTC",
              desc: "Strongest Asian session activity. Best for USD/JPY, EUR/JPY, AUD/USD pairs.",
            },
          ].map((card) => (
            <div key={card.tag} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${card.tagColor}`}>
                  {card.tag}
                </span>
                <span className="text-[10px] text-slate-500">{card.overlap}</span>
              </div>
              <p className="text-lg font-bold text-white">{card.time}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
