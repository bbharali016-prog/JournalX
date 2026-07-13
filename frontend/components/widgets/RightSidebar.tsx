import MT5Accounts from "./MT5Accounts";
import AICoach from "./AICoach";
import TodaysSummary from "./TodaysSummary";
import RiskOverview from "./RiskOverview";

export default function RightSidebar() {
  return (
    <div className="space-y-6">
      <MT5Accounts />
      <AICoach />
      <TodaysSummary />
      <RiskOverview />
    </div>
  );
}