import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { getAlerts } from "@/services/alerts.service";

export function ActivityFeed() {
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ["activity-alerts"], queryFn: getAlerts });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold">Recent Events</h2>
          <Button variant="secondary" size="sm" onClick={() => navigate(routes.events)}>View all</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.slice(0, 5).map((alert) => (
          <button key={alert.id} className="block w-full rounded-xl px-3 py-3 text-left hover:bg-hover" onClick={() => navigate(routes.events)}>
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-bold">{alert.reason}</p>
              <Badge tone={alert.level === "critical" ? "danger" : alert.level === "high" ? "accent" : "warning"}>
                {alert.time}
              </Badge>
            </div>
            <p className="mt-1 text-[14px] text-muted">{alert.student} - {alert.systemNumber} - {alert.action}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
