import { Maximize2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RiskBadge } from "@/features/monitoring/RiskBadge";
import { routes } from "@/constants/routes";
import { getPriorityStudents } from "@/services/monitoring";

export function AIQueue() {
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ["priority-students"], queryFn: getPriorityStudents, refetchInterval: 7000 });

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Priority Panel</h2>
            <p className="mt-1 text-sm text-muted">Students requiring immediate faculty attention.</p>
          </div>
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted">{data.length} active</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {data.slice(0, 8).map((student) => (
            <div key={student.id} className="px-5 py-4">
              <div className="grid grid-cols-[1.2fr_.7fr_.7fr_1.4fr_1fr_auto] items-center gap-4 text-sm">
                <div>
                  <p className="font-semibold text-text">{student.name}</p>
                  <p className="text-xs text-muted">{student.rollNumber}</p>
                </div>
                <span className="text-muted">{student.systemNumber}</span>
                <RiskBadge level={student.riskLevel} score={student.risk} />
                <span className="text-muted">{student.reason}</span>
                <span className="text-text">{student.currentApp}</span>
                <Button variant="secondary" size="sm" onClick={() => navigate(routes.monitoring)}>
                  <Maximize2 className="h-4 w-4" />Open
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
