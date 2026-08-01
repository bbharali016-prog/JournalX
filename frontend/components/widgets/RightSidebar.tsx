import MT5Accounts from "./MT5Accounts";
import AICoach from "./AICoach";
import TodaysSummary from "./TodaysSummary";
import RiskOverview from "./RiskOverview";

export default function RightSidebar() {
  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      <MT5Accounts />
      <AICoach />
      <TodaysSummary />
      <RiskOverview />
    </div>
  );
}
