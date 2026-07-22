import { SectionHeader } from "@/components/common/SectionHeader";
import { ActivityFeed } from "@/features/dashboard/ActivityFeed";
import { AIQueue } from "@/features/dashboard/AIQueue";
import { DashboardStats } from "@/features/dashboard/DashboardStats";
import { QuickOverview } from "@/features/dashboard/QuickOverview";
import { RecentSessions } from "@/features/dashboard/RecentSessions";

export function Dashboard() {
  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="Overview of your classroom monitoring system" title="Dashboard" />
      <DashboardStats />
      <div className="grid grid-cols-[360px_1fr] gap-5">
        <QuickOverview />
        <AIQueue />
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-5">
        <RecentSessions />
        <ActivityFeed />
      </div>
    </div>
  );
}
