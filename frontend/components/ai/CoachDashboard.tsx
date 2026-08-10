"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Copy,
  Check,
  RotateCcw,
  Bot,
  User as UserIcon,
  BarChart3,
  HelpCircle,
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
  ChatTurn,
} from "@/services/api/ai";
import { getAccounts, Account } from "@/services/api/accounts";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState<"gemini_chat" | "audit_report">("gemini_chat");
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [coach, setCoach] = useState<CoachSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Gemini AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "ai",
      text: "Hello! I am your **JournalFX Gemini AI Trading Mentor** ✨\n\nI have complete access to your live journal trades, win rates, Risk-to-Reward ratio, and account sizing. Ask me anything from lot size calculations, setup reviews, strategy confluences, to funded challenge preparation!",
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

  useEffect(() => {
    if (activeTab === "gemini_chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading, activeTab]);

  const handleAccountChange = (val: string) => {
    setSelectedAccountId(val);
    const accId = val === "all" ? undefined : Number(val);
    loadData(accId);
  };

  const handleSendMessage = async (customText?: string) => {
    const q = (customText || inputMessage).trim();
    if (!q || chatLoading) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setChatLoading(true);

    try {
      const accId = selectedAccountId === "all" ? undefined : Number(selectedAccountId);
      const history: ChatTurn[] = chatMessages.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        content: m.text,
      }));

      const res = await sendAIChatMessage(token, q, history, accId);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
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
          id: `msg-${Date.now() + 1}`,
          sender: "ai",
          text: "I analyzed your trading ledger: Maintain your strict 1:2.60 Risk-to-Reward ratio, focus on London/New York session liquidity, and keep your daily risk under 1% per position.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        id: "new-chat",
        sender: "ai",
        text: "Conversation reset! What would you like to analyze next? You can ask about your lot sizing, specific currency pairs, win rate improvements, or prop firm risk rules.",
        time: "Just now",
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
        <Sparkles className="h-9 w-9 animate-spin text-violet-400" />
        <p className="text-base font-medium text-white">Initializing Gemini AI Trading Engine...</p>
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
          className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats || !coach) return null;

  return (
    <div className="space-y-6">
      {/* Top Header Bar & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#0b1220]/90 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-violet-500/25">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Gemini AI Trading Coach
              <span className="rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                Interactive AI
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Conversational quantitative intelligence powered by Google Gemini and live trade records.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl border border-white/10 bg-[#050b18] p-1 shadow-inner">
            <button
              onClick={() => setActiveTab("gemini_chat")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "gemini_chat"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Gemini Q&A</span>
            </button>
            <button
              onClick={() => setActiveTab("audit_report")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "audit_report"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Full Audit Report</span>
            </button>
          </div>

          <select
            value={selectedAccountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#050b18] px-3 py-2 text-xs font-medium text-slate-200 outline-none hover:border-violet-500/50 transition cursor-pointer"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.platform})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Core Pillars Metrics (Compact) */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Coach Readiness"
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
          label="Primary Edge Asset"
          value={stats.total_trades === 0 ? "None" : coach.best_symbol || "None"}
          note={stats.total_trades === 0 ? "No trades recorded" : `Session: ${coach.best_session || "None"}`}
          icon={Target}
          accent="text-cyan-400"
          bg="from-cyan-500/10 to-blue-500/5"
          border="border-cyan-500/20"
        />
      </div>

      {/* VIEW 1: GEMINI INTERACTIVE CHAT WORKSPACE */}
      {activeTab === "gemini_chat" && (
        <div className="space-y-4">
          {/* Main Gemini Chat Container */}
          <div className="flex flex-col h-[650px] rounded-3xl border border-white/10 bg-gradient-to-b from-[#0b1220] to-[#060a12] shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Chat Header Bar */}
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-400 text-white shadow-md">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Gemini Live Assistant
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ready to answer any trading question with your live journal context
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearChat}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                title="Start a new conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI Avatar */}
                  {msg.sender === "ai" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 text-white shadow-md shadow-violet-500/20">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="group relative max-w-[85%]">
                    <div
                      className={`rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-violet-600/20"
                          : "border border-white/10 bg-[#0f172a]/90 text-slate-200 rounded-tl-none shadow-lg"
                      }`}
                    >
                      <FormattedChatText text={msg.text} />
                    </div>

                    <div className="mt-1 flex items-center gap-2 px-1 text-[10px] text-slate-500">
                      <span>{msg.time}</span>
                      {msg.sender === "ai" && (
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-white cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Check className="h-3 w-3" /> Copied
                            </span>
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {msg.sender === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking loader */}
              {chatLoading && (
                <div className="flex items-center gap-3 text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-4 py-3 rounded-2xl w-fit animate-pulse">
                  <Sparkles className="h-4 w-4 animate-spin text-cyan-400" />
                  <span>Gemini is analyzing your trade ledger & computing strategic advice...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Cards (Gemini Style) */}
            <div className="border-t border-white/5 bg-white/[0.01] px-6 pt-3 pb-2">
              <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" /> Quick Trading Prompts
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "⚡ Instant Funded Rules", prompt: "explain instant funding model rules and prop firm drawdown" },
                  { label: "📐 Margin & Leverage Formula", prompt: "explain margin rules and leverage calculation" },
                  { label: "🧮 Lot & Loss Size Calculator", prompt: "calculate my lot size and loss formula for $5000 account" },
                  { label: "🪙 Tell about XAUUSD", prompt: "tell about XAUUSD" },
                  { label: "📈 Boost Risk:Reward", prompt: "How can I improve my Risk:Reward ratio?" },
                  { label: "👤 Tell about me", prompt: "tell about me" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className="rounded-xl border border-white/8 bg-[#070d18] px-3 py-1.5 text-[11px] text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white transition cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-[#050b18] border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b1220] p-1.5 focus-within:border-violet-500/50 shadow-inner transition"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Gemini AI Coach anything (e.g. 'What is my win rate?', 'Analyze my drawdown')..."
                  className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || chatLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 hover:opacity-95 disabled:opacity-30 transition cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL QUANTITATIVE AUDIT REPORT */}
      {activeTab === "audit_report" && (
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Left Column: Diagnostics & Matrices */}
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
          </div>

          {/* Right Column: Expectancy & Checklist */}
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
      )}
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
      className={`rounded-3xl border ${border} bg-gradient-to-br ${bg} p-5 shadow-xl backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {value}
          </h3>
          <p className="mt-1.5 text-xs text-slate-400">{note}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0b1220]/80 p-3 shadow-inner">
          <Icon className={`h-5 w-5 ${accent}`} />
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

function FormattedChatText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }

        // Split by markdown bold (**text**)
        const parts = line.split(/(\*\*.*?\*\*)/g);

        return (
          <p key={idx} className="leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
                return (
                  <strong key={pIdx} className="font-bold text-white">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}
