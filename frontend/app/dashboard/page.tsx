import DashboardLayout from "@/components/layout/DashboardLayout";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import EquityChart from "@/components/dashboard/EquityChart";
import RecentTrades from "@/components/dashboard/RecentTrades";
import RightSidebar from "@/components/widgets/RightSidebar";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-12 gap-6">
        {/* Main */}
        <div className="col-span-9 space-y-6">
          <WelcomeBanner />

          <StatsCards />

          <EquityChart />

          <RecentTrades />
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3">
          <RightSidebar />
        </div>
      </div>
    </DashboardLayout>
  );
}