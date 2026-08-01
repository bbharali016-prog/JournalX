import DashboardLayout from "@/components/layout/DashboardLayout";
import TradingCalendar from "@/components/dashboard/TradingCalendar";

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.05] via-[#0d1630] to-cyan-500/10 p-6 shadow-xl shadow-black/15">
          <p className="text-sm text-slate-400">Calendar</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Monthly trading performance
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            See which dates made profit or loss and track your trading consistency month by month.
          </p>
        </div>

        <TradingCalendar />
      </div>
    </DashboardLayout>
  );
}
