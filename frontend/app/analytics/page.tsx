import DashboardLayout from "@/components/layout/DashboardLayout";
import AnalyticsCards from "@/components/dashboard/analytics/AnalyticsCards";
import PerformanceMetrics from "@/components/dashboard/analytics/PerformanceMetrics";
import RiskMetrics from "@/components/dashboard/analytics/RiskMetrics";
import DrawdownChart from "@/components/analytics/DrawdownChart";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
          <p className="text-sm text-slate-400">Analytics</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Performance and risk analysis
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Review profitability, consistency, drawdown, and execution quality in one place.
          </p>
        </div>

        <AnalyticsCards />

        <DrawdownChart />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PerformanceMetrics />
          <RiskMetrics />
        </div>
      </div>
    </DashboardLayout>
  );
}
