import DashboardLayout from "@/components/layout/DashboardLayout";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import EquityChart from "@/components/dashboard/EquityChart";
import RecentTrades from "@/components/dashboard/RecentTrades";
import RightSidebar from "@/components/widgets/RightSidebar";
import MonthlyPerformanceChart from "@/components/dashboard/MonthlyPerformance";
import FundedAccountProgress from "@/components/dashboard/FundedAccountProgress";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-9">
          <WelcomeBanner />
          <StatsCards />

          <div className="grid gap-6 xl:grid-cols-12 items-stretch">
            <div className="xl:col-span-7 flex flex-col">
              <EquityChart />
            </div>
            <div className="xl:col-span-5 space-y-6 flex flex-col justify-between">
              <FundedAccountProgress />
              <MonthlyPerformanceChart />
            </div>
          </div>

          <RecentTrades />
        </div>

        <div className="xl:col-span-3">
          <RightSidebar />
        </div>
      </div>
    </DashboardLayout>
  );
}
