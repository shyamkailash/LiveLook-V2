import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateSession } from "@/features/sessions/CreateSession";
import { Policies } from "@/features/sessions/Policies";
import { getSessions } from "@/services/session.service";
import { formatDuration } from "@/utils/format";

export function Sessions() {
  const { data = [] } = useQuery({ queryKey: ["sessions"], queryFn: getSessions });

  return (
    <div>
      <SectionHeader
        eyebrow="Monitoring Sessions"
        title="Session Management"
        action={<Button onClick={() => toast.success("Session Started")}>Start Session</Button>}
      />
      <div className="grid grid-cols-[1fr_420px] gap-5">
        <div className="space-y-4">
          {data.map((session) => (
            <Card key={session.id}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{session.name}</h2>
                    <p className="text-sm text-muted">{session.department} - {session.lab}</p>
                  </div>
                  <Badge tone={session.status === "running" ? "success" : session.status === "scheduled" ? "warning" : "neutral"}>{session.status}</Badge>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3 text-sm text-muted">
                  <span>{session.type}</span>
                  <span>{session.startedAt}</span>
                  <span>{formatDuration(session.durationMinutes)}</span>
                  <span>{session.connectedSystems} systems</span>
                </div>
              </CardContent>
            </Card>
          ))}
          <Policies />
        </div>
        <CreateSession />
      </div>
    </div>
  );
}
