import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { routes } from "@/constants/routes";
import { getSessions } from "@/services/session.service";
import { formatDuration } from "@/utils/format";

export function RecentSessions() {
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ["dashboard-sessions"], queryFn: getSessions });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold">Active Sessions</h2>
          <Button variant="secondary" size="sm" onClick={() => navigate(routes.sessions)}>View all</Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable headers={["Session Name", "Lab", "Devices", "Duration", "Status"]}>
          {data.map((session) => (
            <tr key={session.id} className="cursor-pointer hover:bg-hover" onClick={() => navigate(routes.sessions)}>
              <td className="px-5 py-4 font-bold text-text">{session.name}</td>
              <td className="px-5 py-4 text-muted">{session.lab}</td>
              <td className="px-5 py-4 text-muted">{session.connectedSystems}</td>
              <td className="px-5 py-4 text-muted">{formatDuration(session.durationMinutes)}</td>
              <td className="px-5 py-4">
                <Badge tone={session.status === "running" ? "success" : session.status === "scheduled" ? "warning" : "neutral"}>{session.status}</Badge>
              </td>
            </tr>
          ))}
        </DataTable>
      </CardContent>
    </Card>
  );
}
