import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Search } from "@/components/common/Search";
import { Button } from "@/components/ui/button";
import { AlertTimeline } from "@/features/alerts/AlertTimeline";
import { useAlertStore } from "@/store/alertStore";
import { getAlerts } from "@/services/alerts.service";

const filters = ["all", "critical", "high", "medium", "low"] as const;

export function AlertsPage() {
  const { data = [] } = useQuery({ queryKey: ["alerts"], queryFn: getAlerts, refetchInterval: 9000 });
  const { filter, setFilter } = useAlertStore();
  const [query, setQuery] = useState("");

  const alerts = useMemo(() => data.filter((alert) => {
    const matchesFilter = filter === "all" || alert.level === filter;
    const matchesQuery = [alert.student, alert.systemNumber, alert.reason].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  }), [data, filter, query]);

  return (
    <div>
      <SectionHeader eyebrow="Events" title="Unified Event Timeline" />
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {filters.map((item) => (
            <Button key={item} variant={filter === item ? "primary" : "secondary"} size="sm" onClick={() => setFilter(item)}>
              {item}
            </Button>
          ))}
        </div>
        <Search placeholder="Search events, devices, applications" value={query} onChange={setQuery} />
      </div>
      <AlertTimeline alerts={alerts} />
    </div>
  );
}
