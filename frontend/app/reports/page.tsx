"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useActiveAccount } from "@/components/auth/AccountContext";
import {
  downloadTradesReportCSV,
  getSessionPerformance,
  getSymbolPerformance,
  SessionPerformance,
  SymbolPerformance,
} from "@/services/api/reports";
import {
  Archive,
  BarChart3,
  CalendarClock,
  CalendarDays,
  Download,
  Eye,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Filter,
  Landmark,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

type Category = "All Reports" | "Performance" | "Trades" | "Risk" | "Tax" | "Custom";

const categories: Category[] = ["All Reports", "Performance", "Trades", "Risk", "Tax", "Custom"];

const reportTemplates = [
  {
    title: "Weekly Market Outlook - Current",
    category: "Performance" as Category,
    description: "Comprehensive weekly performance analysis with key metrics and insights.",
    period: "Current week",
    icon: FileBarChart,
    accent: "violet",
  },
  {
    title: "Monthly Trading Performance - Historical",
    category: "Performance" as Category,
    description: "A monthly performance breakdown with charts, statistics, and trading trends.",
    period: "Current month",
    icon: TrendingUp,
    accent: "emerald",
  },
  {
    title: "Trade Statistics Summary",
    category: "Trades" as Category,
    description: "A statistical breakdown of all trades, including winners, losers, and breakeven trades.",
    period: "Selected period",
    icon: FileSpreadsheet,
    accent: "amber",
  },
  {
    title: "Tax Report (Detailed)",
    category: "Tax" as Category,
    description: "A detailed tax-ready view of your trading activity and profit calculations.",
    period: "Year to date",
    icon: Landmark,
    accent: "rose",
  },
  {
    title: "Risk Analysis Report",
    category: "Risk" as Category,
    description: "Risk management analysis including drawdown, exposure, and trade quality.",
    period: "Selected period",
    icon: ShieldAlert,
    accent: "cyan",
  },
  {
    title: "Symbol Performance Report",
    category: "Performance" as Category,
    description: "Compare your trading performance across instruments and currency pairs.",
    period: "Selected period",
    icon: BarChart3,
    accent: "green",
  },
  {
    title: "Session Analysis Report",
    category: "Performance" as Category,
    description: "Review your performance across London, New York, and Asian sessions.",
    period: "Selected period",
    icon: CalendarClock,
    accent: "orange",
  },
  {
    title: "Custom Date Report",
    category: "Custom" as Category,
    description: "Build a report for a custom date range with the exact metrics you need.",
    period: "Custom range",
    icon: FileText,
    accent: "pink",
  },
];

const accentClasses: Record<string, string> = {
  violet: "border-violet-400/25 bg-violet-500/15 text-violet-300",
  emerald: "border-emerald-400/25 bg-emerald-500/15 text-emerald-300",
  amber: "border-amber-400/25 bg-amber-500/15 text-amber-300",
  rose: "border-rose-400/25 bg-rose-500/15 text-rose-300",
  cyan: "border-cyan-400/25 bg-cyan-500/15 text-cyan-300",
  green: "border-green-400/25 bg-green-500/15 text-green-300",
  orange: "border-orange-400/25 bg-orange-500/15 text-orange-300",
  pink: "border-pink-400/25 bg-pink-500/15 text-pink-300",
};

function Metric({ label, value, tone = "text-white" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.055] bg-black/10 px-3 py-2.5">
      <p className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 truncate text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

export default function ReportsPage() {
  const { selectedAccountId } = useActiveAccount();
  const [symbols, setSymbols] = useState<SymbolPerformance[]>([]);
  const [sessions, setSessions] = useState<SessionPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("All Reports");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const token = localStorage.getItem("token");
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        if (active) setLoading(true);
        const [symbolData, sessionData] = await Promise.all([
          getSymbolPerformance(token, selectedAccountId),
          getSessionPerformance(token, selectedAccountId),
        ]);
        if (active) {
          setSymbols(symbolData || []);
          setSessions(sessionData || []);
        }
      } catch (error) {
        console.error("Failed to load reports data:", error);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [selectedAccountId]);

  const handleExport = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setDownloading(true);
      await downloadTradesReportCSV(token, selectedAccountId);
    } catch (error) {
      console.error("Failed to download report:", error);
    } finally {
      setDownloading(false);
    }
  };

  const totals = useMemo(() => {
    const trades = symbols.reduce((total, item) => total + item.trades, 0);
    const profit = symbols.reduce((total, item) => total + item.profit, 0);
    const profitableSymbols = symbols.filter((item) => item.profit >= 0).length;
    const activeSessions = sessions.filter((item) => item.trades > 0).length;
    return { trades, profit, profitableSymbols, activeSessions };
  }, [symbols, sessions]);

  const reports = useMemo(() => reportTemplates.filter((report) => {
    const matchesCategory = activeCategory === "All Reports" || report.category === activeCategory;
    const searchable = `${report.title} ${report.category}`.toLowerCase();
    return matchesCategory && searchable.includes(query.toLowerCase());
  }), [activeCategory, query]);

  if (loading) {
    return <DashboardLayout><div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1600px] space-y-5 pb-5">
        <section className="flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Trading Reports</h1>
            <p className="mt-1.5 text-sm text-slate-400">Download, share, and analyze your trading performance with detailed reports.</p>
          </div>
          <button onClick={handleExport} disabled={downloading} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Export All Reports (CSV)
          </button>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <SummaryCard icon={FileText} label="Total Reports" value="8" note="Ready to generate" tone="violet" />
          <SummaryCard icon={Download} label="Most Downloaded" value="Trade Summary" note="Your report library" tone="violet" />
          <SummaryCard icon={Archive} label="Total Trades" value={String(totals.trades)} note="In selected account" tone="violet" />
          <SummaryCard icon={CalendarDays} label="Active Sessions" value={String(totals.activeSessions)} note="With recorded trades" tone="rose" />
          <SummaryCard icon={FileBarChart} label="Net P&L" value={`${totals.profit >= 0 ? "+" : ""}$${totals.profit.toFixed(2)}`} note="Across your symbols" tone="amber" />
          <SummaryCard icon={CalendarClock} label="Profitable Symbols" value={String(totals.profitableSymbols)} note="Ready for review" tone="blue" />
        </section>

        <section className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition ${activeCategory === category ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-md shadow-violet-900/30" : "border border-white/[0.07] bg-white/[0.025] text-slate-300 hover:bg-white/[0.07]"}`}>{category}</button>)}
          </div>
          <div className="flex gap-2">
            <label className="flex h-10 w-full items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 text-slate-500 xl:w-64"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reports..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" /></label>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 text-xs font-medium text-slate-300 hover:bg-white/[0.07]"><Filter className="h-4 w-4" />Filters</button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {reports.map((report) => {
            const Icon = report.icon;
            const isPerformance = report.title.includes("Symbol");
            const isSession = report.title.includes("Session");
            const isTrades = report.category === "Trades";
            const metrics = isPerformance
              ? [<Metric key="symbols" label="Symbols" value={String(symbols.length)} tone="text-emerald-300" />, <Metric key="good" label="Profitable" value={String(totals.profitableSymbols)} tone="text-emerald-300" />, <Metric key="trades" label="Trades" value={String(totals.trades)} />]
              : isSession
                ? [<Metric key="sessions" label="Sessions" value={String(totals.activeSessions)} tone="text-amber-300" />, <Metric key="trades" label="Trades" value={String(totals.trades)} />, <Metric key="pnl" label="Net P&L" value={`$${totals.profit.toFixed(0)}`} tone={totals.profit >= 0 ? "text-emerald-300" : "text-rose-300"} />]
                : isTrades
                  ? [<Metric key="trades" label="Total Trades" value={String(totals.trades)} tone="text-amber-300" />, <Metric key="symbols" label="Symbols" value={String(symbols.length)} />, <Metric key="sessions" label="Sessions" value={String(totals.activeSessions)} />]
                  : [<Metric key="trades" label="Trades" value={String(totals.trades)} />, <Metric key="pnl" label="Net P&L" value={`$${totals.profit.toFixed(2)}`} tone={totals.profit >= 0 ? "text-emerald-300" : "text-rose-300"} />, <Metric key="symbols" label="Symbols" value={String(symbols.length)} />];
            return <article key={report.title} className="group rounded-2xl border border-white/[0.075] bg-gradient-to-br from-[#101a2b]/90 to-[#091220]/90 p-4 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:border-violet-400/25">
              <div className="flex items-start justify-between gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accentClasses[report.accent]}`}><Icon className="h-5 w-5" /></div><button aria-label={`More options for ${report.title}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white"><MoreVertical className="h-4 w-4" /></button></div>
              <h2 className="mt-3 min-h-10 text-sm font-semibold leading-5 text-white">{report.title}</h2>
              <span className="mt-1 inline-flex rounded-md bg-white/[0.055] px-2 py-0.5 text-[10px] font-medium text-slate-400">{report.category}</span>
              <p className="mt-3 min-h-10 text-xs leading-5 text-slate-400">{report.description}</p>
              <p className="mt-2 text-xs text-violet-300">{report.period}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">{metrics}</div>
              <div className="mt-3 grid grid-cols-[1fr_1.15fr_auto] gap-2"><button className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.045] px-2 py-2 text-xs text-slate-200 hover:bg-white/[0.09]"><Eye className="h-3.5 w-3.5" />Preview</button><button onClick={handleExport} className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.045] px-2 py-2 text-xs text-slate-200 hover:bg-white/[0.09]"><Download className="h-3.5 w-3.5" />Download</button><button aria-label={`More actions for ${report.title}`} className="rounded-lg border border-white/[0.07] bg-white/[0.045] px-2 text-slate-300 hover:bg-white/[0.09]"><MoreVertical className="h-4 w-4" /></button></div>
            </article>;
          })}
        </section>

        {reports.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-slate-400">No reports match your search.</div>}

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.075] bg-[#0d1727]/80 p-5"><div className="flex items-start justify-between"><div><h2 className="text-base font-semibold text-white">Scheduled Reports</h2><p className="mt-1 text-xs text-slate-400">Automated reports generated and sent to your email.</p></div><button className="rounded-lg border border-white/[0.08] p-2 text-violet-300 hover:bg-white/[0.06]"><MoreVertical className="h-4 w-4" /></button></div><div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-violet-500/15 p-2.5 text-violet-300"><CalendarClock className="h-5 w-5" /></div><div><p className="text-sm font-medium text-white">Weekly Performance Report</p><p className="mt-1 text-xs text-violet-300">Every Monday at 9:00 AM</p></div></div><div className="flex items-center gap-3 text-xs text-slate-400">Next: Monday <span className="h-5 w-9 rounded-full bg-violet-500 p-0.5"><span className="block h-4 w-4 translate-x-4 rounded-full bg-white" /></span></div></div></div>
          <div className="rounded-2xl border border-white/[0.075] bg-[#0d1727]/80 p-5"><div className="flex items-start justify-between"><div><h2 className="text-base font-semibold text-white">Report Templates</h2><p className="mt-1 text-xs text-slate-400">Create reports tailored to the metrics you want to follow.</p></div><button className="text-xs font-medium text-violet-300 hover:text-violet-200">Manage schedule</button></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Template label="My Weekly Template" note="8 metrics included" /><Template label="Prop Firm Template" note="12 metrics included" /><Template label="Tax Season Template" note="15 metrics included" /><button className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-white/[0.14] text-slate-400 transition hover:border-violet-400/40 hover:bg-violet-500/[0.06] hover:text-violet-300"><Plus className="h-5 w-5" /></button></div></div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({ icon: Icon, label, value, note, tone }: { icon: typeof FileText; label: string; value: string; note: string; tone: "violet" | "rose" | "amber" | "blue" }) {
  const tones = { violet: "border-violet-400/20 bg-violet-500/10 text-violet-300", rose: "border-rose-400/20 bg-rose-500/10 text-rose-300", amber: "border-amber-400/20 bg-amber-500/10 text-amber-300", blue: "border-blue-400/20 bg-blue-500/10 text-blue-300" };
  return <div className="rounded-2xl border border-white/[0.075] bg-[#0e1828]/85 p-3.5"><div className="flex items-start gap-3"><div className={`rounded-xl border p-2 ${tones[tone]}`}><Icon className="h-4 w-4" /></div><div className="min-w-0"><p className="text-[11px] font-medium text-slate-400">{label}</p><p className="mt-1 truncate text-base font-semibold text-white">{value}</p><p className="mt-1 text-[10px] text-slate-500">{note}</p></div></div></div>;
}

function Template({ label, note }: { label: string; note: string }) {
  return <button className="min-h-20 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition hover:border-violet-400/25 hover:bg-white/[0.05]"><p className="text-xs font-medium leading-4 text-white">{label}</p><p className="mt-2 text-[10px] text-slate-400">{note}</p></button>;
}
