import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "@/components/common/SectionHeader";
import { DeviceChart } from "@/features/analytics/DeviceChart";
import { RiskChart } from "@/features/analytics/RiskChart";
import { UsageChart } from "@/features/analytics/UsageChart";
import { getAnalytics } from "@/services/analytics.service";

export function Analytics() {
  const { data } = useQuery({ queryKey: ["analytics"], queryFn: getAnalytics });

  return (
    <div>
      <SectionHeader eyebrow="Analytics" title="Classroom Intelligence" />
      {data ? (
        <div className="grid grid-cols-2 gap-5">
          <RiskChart data={data.trend} />
          <UsageChart data={data.usage} />
          <DeviceChart data={data.distribution} />
        </div>
      ) : null}
    </div>
  );
}
