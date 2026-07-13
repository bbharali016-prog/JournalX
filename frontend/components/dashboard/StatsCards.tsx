import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
} from "lucide-react";

import StatCard from "./StatCard";

export default function StatsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Account Balance"
        value="$12,540"
        change="+4.8%"
        icon={DollarSign}
      />

      <StatCard
        title="Today's P/L"
        value="+$245"
        change="+1.9%"
        icon={TrendingUp}
      />

      <StatCard
        title="Win Rate"
        value="72%"
        change="+3%"
        icon={Target}
      />

      <StatCard
        title="Profit Factor"
        value="2.31"
        change="+0.12"
        icon={BarChart3}
      />
    </div>
  );
}