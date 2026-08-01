import DashboardLayout from "@/components/layout/DashboardLayout";
import CoachDashboard from "@/components/ai/CoachDashboard";

export default function AIPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
          <p className="text-sm text-slate-400">AI Coach</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Personalized trade review and coaching
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            This coach studies your performance, drawdown, and trade habits to give you practical next steps.
          </p>
          <p className="mt-3 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
            Free plan: text only, 10 requests per day
          </p>
        </div>

        <CoachDashboard />
      </div>
    </DashboardLayout>
  );
}
