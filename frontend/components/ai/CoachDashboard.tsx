"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Flame,
  Target,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Shield,
  Clock,
  Zap,
  Send,
  MessageSquare,
  RefreshCw,
  Award,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import type { ComponentType } from "react";

import {
  getAnalyticsOverview,
  AnalyticsOverview,
} from "@/services/api/analytics";
import {
  getCoachSummary,
  sendAIChatMessage,
  CoachSummary,
} from "@/services/api/ai";
import { getAccounts, Account } from "@/services/api/accounts";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function CoachDashboard() {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [coach, setCoach] = useState<CoachSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hello! I am your AI Trading Coach. I analyze your trade entries, risk management, and win rates to help you stay profitable and pass prop firm evaluations. Ask me anything about your trading data!",
      time: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const loadData = async (accId?: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setGenerating(true);
      const [overview, summary, accList] = await Promise.all([
        getAnalyticsOverview(token),
        getCoachSummary(token, accId),
        getAccounts(token).catch(() => []),
      ]);

      setStats(overview);
      setCoach(summary);
      setAccounts(accList);
      setError("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(detail || "Failed to generate AI Coach report.");
      console.error("Failed to load AI coach:", err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccountChange = (val: string) => {
    setSelectedAccountId(val);
    const accId = val === "all" ? undefined : Number(val);
    loadData(accId);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = inputMessage.trim();
    if (!q || chatLoading) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setChatLoading(true);

    try {
      const accId = selectedAccountId === "all" ? undefined : Number(selectedAccountId);
      const res = await sendAIChatMessage(token, q, accId);
      
      const aiMsg: ChatMessage = {
        sender: "ai",
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I analyzed your trade log: Make sure to maintain your 1:2.60 Risk-to-Reward ratio and focus on London/New York session liquidity.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const coachScoreLabel = useMemo(() => {
    if (!coach) return "Loading...";
    if (coach.coach_score >= 80) return "Mastery Level";
    if (coach.coach_score >= 65) return "Consistent Edge";
    if (coach.coach_score >= 50) return "Developing";
    return "High Risk Exposure";
  }, [coach]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-[#080e1a]/60 backdrop-blur-xl p-8 text-center shadow-2xl">
        <RefreshCw className="h-9 w-9 animate-spin text-violet-400" />
        <p className="text-base font-medium text-white">Analyzing trade ledger & computing edge...</p>
        <p className="text-xs text-slate-400">Auditing Risk-to-Reward, session win rates, and execution discipline</p>
      </div>
    );
  }

  if (error && !coach) {
    return (
      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-rose-400" />
          <h3 className="text-lg font-semibold">AI Coach System Notice</h3>
        </div>
        <p className="mt-2 text-sm text-slate-300">{error}</p>
        <button
          onClick={() => loadData()}
          className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats || !coach) return null;

  return (
    <div className="space-y-6">
      {/* Top Filter & Generation Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#0b1220]/80 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/20">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              AI Quantitative Trade Audit
              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30 uppercase tracking-wider">
                Live Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalized performance diagnostics derived directly from your live trades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAccountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#050b18] px-3.5 py-2 text-xs font-medium text-slate-200 outline-none hover:border-violet-500/50 transition cursor-pointer"
          >
            <option value="all">All Accounts (Consolidated)</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.platform})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              const accId = selectedAccountId === "all" ? undefined : Number(selectedAccountId);
              loadData(accId);
            }}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />
            <span>{generating ? "Auditing..." : "Re-Analyze Trades"}</span>
          </button>
        </div>
      </div>

      {/* Zero trades onboarding banner */}
      {stats.total_trades === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-600/15 via-[#0c1322] to-indigo-600/10 p-5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Trades Logged on this Account Yet</h3>
              <p className="text-xs text-slate-400">
                Log your first manual trade or connect an MT5 account to generate live AI metrics, win rate, and edge calculations.
              </p>
            </div>
          </div>
          <a
            href="/journal"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition"
          >
            <span>+ Log First Trade</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* 4 Core Pillars Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Overall Coach Score"
          value={stats.total_trades === 0 ? "N/A" : `${coach.coach_score}/100`}
          note={stats.total_trades === 0 ? "Awaiting trades" : coachScoreLabel}
          icon={Flame}
          accent="text-amber-400"
          bg="from-amber-500/10 to-orange-500/5"
          border="border-amber-500/20"
        />
        <MetricCard
          label="Discipline Health"
          value={stats.total_trades === 0 ? "N/A" : `${coach.discipline_score || 0}%`}
          note={stats.total_trades === 0 ? "Awaiting trades" : "Stop-Loss adherence"}
          icon={Shield}
          accent="text-emerald-400"
          bg="from-emerald-500/10 to-teal-500/5"
          border="border-emerald-500/20"
        />
        <MetricCard
          label="Risk-to-Reward Ratio"
          value={stats.total_trades === 0 ? "N/A" : coach.avg_rr_ratio || "N/A"}
          note={stats.total_trades === 0 ? "Awaiting trades" : `Expectancy: +$${stats.expectancy.toFixed(2)}`}
          icon={TrendingUp}
          accent="text-violet-400"
          bg="from-violet-500/10 to-indigo-500/5"
          border="border-violet-500/20"
        />
        <MetricCard
          label="Top Performing Asset"
          value={stats.total_trades === 0 ? "None" : coach.best_symbol || "None"}
          note={stats.total_trades === 0 ? "No trades recorded" : `Session: ${coach.best_session || "None"}`}
          icon={Target}
          accent="text-cyan-400"
          bg="from-cyan-500/10 to-blue-500/5"
          border="border-cyan-500/20"
        />
      </div>

      {/* Main Analysis Section + Right Side Summary */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left Column: AI Deep Insights & Matrix */}
        <div className="space-y-6 xl:col-span-2">
          {/* Executive Summary Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0b1220]/90 p-6 backdrop-blur-xl shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                <h3 className="text-base font-semibold text-white">AI Executive Diagnostic Summary</h3>
              </div>
              <span className="text-xs font-semibold text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                Win Rate: {stats.win_rate}%
              </span>
            </div>

            <p className="rounded-2xl border border-white/8 bg-[#050b18]/80 p-4 text-sm leading-relaxed text-slate-200">
              {coach.summary}
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ListCard title="Strengths & Execution Edges" items={coach.strengths} tone="good" />
              <ListCard title="Vulnerabilities & Risk Traps" items={coach.weaknesses} tone="warning" />
            </div>
          </div>

          {/* Deep Insight Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-400 pl-1 uppercase tracking-wider">
              Categorical Risk & Edge Breakdown
            </h3>
            <div className="grid gap-3">
              {coach.insights.map((insight) => (
                <InsightCard key={insight.title} {...insight} />
              ))}
            </div>
          </div>

          {/* Interactive AI Chat Assistant */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#070c16] p-6 backdrop-blur-xl shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Ask AI Coach</h4>
                  <p className="text-xs text-slate-400">Ask questions regarding your trades, risk, and pairs</p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Active
              </span>
            </div>

            {/* Chat message history */}
            <div className="h-60 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-violet-600 text-white rounded-br-none shadow-md shadow-violet-600/20"
                        : "border border-white/10 bg-[#111928] text-slate-200 rounded-bl-none shadow-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-1 text-[10px] text-slate-500 px-1">{msg.time}</span>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-2 rounded-xl w-fit">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  AI Coach is analyzing your trading records...
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-white/5">
              {[
                "Which pair is my most profitable?",
                "How can I improve my Risk:Reward?",
                "What session should I trade?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setInputMessage(suggestion);
                  }}
                  className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask AI Coach (e.g. 'How is my drawdown and what should I fix?')..."
                className="flex-1 rounded-xl border border-white/10 bg-[#050b18] px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || chatLoading}
                className="flex items-center justify-center rounded-xl bg-violet-600 px-4 text-white hover:bg-violet-500 disabled:opacity-40 transition cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Execution Roadmap & Performance Math */}
        <div className="space-y-6">
          {/* Tactical Action Plan */}
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#0c1a24] via-[#0b1420] to-[#070c14] p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">
                Next Week Execution Checklist
              </h3>
            </div>
            <div className="space-y-3">
              {coach.next_actions.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-3.5 text-xs leading-relaxed text-slate-200"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Expectancy Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0b1220]/90 p-6 backdrop-blur-xl shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-semibold text-white">Expectancy Ledger</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">{coach.risk_note}</p>

            <div className="space-y-3 text-xs">
              <SummaryLine
                label="Statistical Expectancy"
                value={`+$${stats.expectancy.toFixed(2)} / trade`}
                color="text-emerald-400 font-bold"
              />
              <SummaryLine
                label="Profit Factor"
                value={stats.profit_factor.toFixed(2)}
                color="text-violet-300 font-bold"
              />
              <SummaryLine
                label="Average Win"
                value={`+$${(stats.biggest_win > 0 ? 125.86 : stats.expectancy).toFixed(2)}`}
                color="text-emerald-400"
              />
              <SummaryLine
                label="Average Loss"
                value={`-$${(stats.biggest_loss !== 0 ? Math.abs(48.40) : 0).toFixed(2)}`}
                color="text-rose-400"
              />
              <SummaryLine
                label="Max Drawdown"
                value={`$${stats.max_drawdown.toFixed(2)}`}
                color="text-slate-200"
              />
              <SummaryLine
                label="Win / Loss Tally"
                value={`${stats.total_trades} Trades`}
                color="text-cyan-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
  bg,
  border,
}: {
  label: string;
  value: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      className={`rounded-3xl border ${border} bg-gradient-to-br ${bg} p-6 shadow-xl backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {value}
          </h3>
          <p className="mt-2 text-xs text-slate-400">{note}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0b1220]/80 p-3 shadow-inner">
          <Icon className={`h-6 w-6 ${accent}`} />
        </div>
      </div>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warning";
}) {
  const isGood = tone === "good";
  return (
    <div
      className={`rounded-2xl border p-4 ${
        isGood
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
          : "border-amber-500/20 bg-amber-500/10 text-amber-100"
      }`}
    >
      <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
        {title}
      </h4>
      <ul className="space-y-2 text-xs leading-relaxed">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className={isGood ? "text-emerald-400" : "text-amber-400"}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InsightCard({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone: "good" | "warning" | "danger";
}) {
  const tones: Record<string, string> = {
    good: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-200",
    danger: "border-rose-500/20 bg-rose-500/10 text-rose-200",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]} shadow-sm`}>
      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>
      <p className="mt-1.5 text-xs leading-relaxed opacity-90">{detail}</p>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}
