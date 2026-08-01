"use client";

import { useId } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  sparkline?: number[];
  accentClassName?: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  sparkline,
  accentClassName = "text-cyan-300",
}: StatCardProps) {
  return (
    <Card className="border border-white/8 bg-white/[0.03] shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.05]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
          <p className="text-sm text-slate-400">{title}</p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {value}
          </h2>

          {change && (
            <p className="mt-2 text-sm text-emerald-400">
              {change}
            </p>
          )}
          </div>

          <div className="rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 p-3">
            <Icon className={accentClassName} size={24} />
          </div>
        </div>

        {sparkline && sparkline.length > 1 && (
          <div className="mt-5">
            <Sparkline data={sparkline} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const gradientId = useId();
  const width = 240;
  const height = 54;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-full">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="#4ade80"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill={`url(#${gradientId})`}
        points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  );
}
