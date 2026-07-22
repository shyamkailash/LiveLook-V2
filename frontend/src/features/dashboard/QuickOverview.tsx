import { Server, Signal, ShieldCheck, Wifi } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDashboardStats } from "@/services/dashboard.service";

export function QuickOverview() {
  const { data } = useQuery({ queryKey: ["dashboard-stats"], queryFn: getDashboardStats });
  const overview = [
    { label: "Server Status", value: data?.serverStatus ?? "Offline", icon: Server },
    { label: "Bandwidth Usage", value: data?.bandwidthUsage ?? "0 Mbps", icon: Signal },
    { label: "Policy Mode", value: data?.runningSession ?? "No active session", icon: ShieldCheck },
    { label: "Agent Network", value: data?.connectedSystems ? `${data.connectedSystems} online` : "No agents", icon: Wifi },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Quick Overview</h2>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {overview.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-surface p-4">
            <item.icon className="mb-3 h-5 w-5 text-accent" />
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-1 font-semibold text-text">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
