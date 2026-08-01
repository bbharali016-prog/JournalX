"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Flame,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { ComponentType } from "react";

import {
  getAnalyticsOverview,
  AnalyticsOverview,
} from "@/services/api/analytics";
import {
  getCoachSummary,
  CoachSummary,
} from "@/services/api/ai";

export default function CoachDashboard() {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [coach, setCoach] = useState<CoachSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const [overview, summary] = await Promise.all([
          getAnalyticsOverview(token),
          getCoachSummary(token),
        ]);

        setStats(overview);
        setCoach(summary);
      } catch (error) {
        const apiError = error as any;
        const detail = apiError.response?.data?.detail;
        if (detail) {
          setError(detail);
        } else {
          setError("Failed to load AI coach.");
        }
        console.error("Failed to load AI coach:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const coachScoreLabel = useMemo(() => {
    if (!coach) return "Loading...";

    if (coach.coach_score >= 80) return "Excellent";
    if (coach.coach_score >= 65) return "Solid";
    if (coach.coach_score >= 50) return "Needs work";
    return "High risk";
  }, [coach]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 text-slate-400 shadow-xl shadow-black/15">
        Loading AI coach...
      </div>
    );
  }

  if (error) {
    const isLimitError = error.toLowerCase().includes("limit");
    return (
      <div className="rounded-3xl border border-amber-400/15 bg-amber-500/10 p-6 text-amber-100 shadow-xl shadow-black/15">
        <h3 className="text-lg font-semibold text-white">
          {isLimitError ? "Free limit reached" : "AI Coach Status"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-amber-100/90">
          {error} {isLimitError && "The free plan allows 10 text coach requests per day."}
        </p>
      </div>
    );
  }

  if (!stats || !coach) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 text-slate-400 shadow-xl shadow-black/15">
        AI coach is not available right now.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Win Rate"
          value={`${stats.win_rate}%`}
          note="Current consistency"
          icon={Target}
          accent="text-emerald-300"
        />
        <MetricCard
          label="Profit Factor"
          value={stats.profit_factor.toFixed(2)}
          note="Efficiency of winners"
          icon={TrendingUp}
          accent="text-violet-300"
        />
        <MetricCard
          label="Max Drawdown"
          value={`$${stats.max_drawdown.toFixed(2)}`}
          note={`Risk signal: ${coach.risk_note}`}
          icon={TrendingDown}
          accent="text-rose-300"
        />
        <MetricCard
          label="Coach Score"
          value={`${coach.coach_score}/100`}
          note={coachScoreLabel}
          icon={Flame}
          accent="text-cyan-300"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15 xl:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-300" />
            <h2 className="text-xl font-semibold text-white">
              AI Coach Insights
            </h2>
          </div>

          <p className="rounded-2xl border border-white/8 bg-[#0b1220] p-4 text-sm leading-6 text-slate-200">
            {coach.summary}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ListCard title="Strengths" items={coach.strengths} tone="good" />
            <ListCard title="Weaknesses" items={coach.weaknesses} tone="warning" />
          </div>

          <div className="mt-5 space-y-4">
            {coach.insights.map((insight) => (
              <InsightCard key={insight.title} {...insight} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
            <h3 className="text-lg font-semibold text-white">
              Coach Summary
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {coach.risk_note}
            </p>

            <div className="mt-5 space-y-3 text-sm">
              <SummaryLine label="Expectancy" value={`$${stats.expectancy.toFixed(2)}`} />
              <SummaryLine label="Avg RR" value={stats.avg_rr.toFixed(2)} />
              <SummaryLine label="Best Win" value={`$${stats.biggest_win.toFixed(2)}`} />
              <SummaryLine label="Worst Loss" value={`$${stats.biggest_loss.toFixed(2)}`} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-[#15163a] to-[#0c1222] p-6 shadow-xl shadow-black/15">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <h3 className="text-lg font-semibold text-white">
                Next Actions
              </h3>
            </div>
            <div className="space-y-3">
              {coach.next_actions.map((action) => (
                <div
                  key={action}
                  className="rounded-2xl border border-white/8 bg-white/5 p-3 text-sm leading-6 text-slate-200"
                >
                  {action}
                </div>
              ))}
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
}: {
  label: string;
  value: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {value}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{note}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-[#0b1220] p-3">
          <Icon className={accent} />
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
  const toneClass =
    tone === "good"
      ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-200"
      : "border-amber-400/15 bg-amber-500/10 text-amber-200";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <h4 className="font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.map((item) => (
          <li key={item}>• {item}</li>
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
    good: "border-emerald-400/15 bg-emerald-500/10 text-emerald-200",
    warning: "border-amber-400/15 bg-amber-500/10 text-amber-200",
    danger: "border-rose-400/15 bg-rose-500/10 text-rose-200",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-6 opacity-90">{detail}</p>
    </div>
  );
}

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
