import DashboardLayout from "@/components/layout/DashboardLayout";
import RiskOverview from "@/components/widgets/RiskOverview";
import FundedAccountProgress from "@/components/dashboard/FundedAccountProgress";
import RiskMetrics from "@/components/dashboard/analytics/RiskMetrics";

export default function RiskPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
          <p className="text-sm text-slate-400">Risk Management</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Protect capital and monitor drawdown
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Keep daily loss, max drawdown, and challenge rules visible while you trade.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RiskOverview />
          <FundedAccountProgress />
        </div>

        <RiskMetrics />
      </div>
    </DashboardLayout>
  );
}
