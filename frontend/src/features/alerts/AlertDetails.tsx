import { Badge } from "@/components/ui/badge";
import type { AlertItem } from "@/types/alert";

export function AlertDetails({ alert }: { alert: AlertItem }) {
  return (
    <div className="rounded-lg border border-border bg-secondary p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{alert.student}</p>
          <p className="text-sm text-muted">{alert.systemNumber} - {alert.time}</p>
        </div>
        <Badge tone={alert.level === "critical" ? "danger" : alert.level === "high" ? "accent" : "warning"}>{alert.level}</Badge>
      </div>
      <p className="mt-3 text-sm text-muted">{alert.reason}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted">
        <span className="rounded-md bg-card px-2 py-1">Application event</span>
        <span className="rounded-md bg-card px-2 py-1">Session active</span>
        <span className="rounded-md bg-card px-2 py-1">{alert.resolved ? "Resolved" : "Open"}</span>
      </div>
      <p className="mt-3 text-sm text-text">{alert.action}</p>
    </div>
  );
}
