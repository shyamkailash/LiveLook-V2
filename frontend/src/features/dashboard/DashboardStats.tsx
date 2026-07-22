import { Activity, AlertTriangle, Gauge, MonitorCheck, MonitorOff, Server, Signal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MetricCard } from "@/components/cards/MetricCard";
import { routes } from "@/constants/routes";
import { getDashboardStats } from "@/services/dashboard.service";

export function DashboardStats() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["dashboard-stats"], queryFn: getDashboardStats });

  const stats = data;
  const serverOnline = stats?.serverStatus?.toLowerCase() === "online";

  return (
    <div className="grid grid-cols-4 gap-4 2xl:grid-cols-7">
      <MetricCard label="Connected Devices" value={stats?.connectedSystems ?? 0} helper="Agents online now" icon={MonitorCheck} tone="success" onClick={() => navigate(routes.devices)} />
      <MetricCard label="Offline Devices" value={stats?.offlineSystems ?? 0} helper="Needs lab attention" icon={MonitorOff} tone="danger" onClick={() => navigate(routes.devices)} />
      <MetricCard label="Running Sessions" value={stats?.runningSessions ?? 0} helper={stats?.runningSession ?? "No active session"} icon={Activity} tone="accent" onClick={() => navigate(routes.sessions)} />
      <MetricCard label="Server Status" value={stats?.serverStatus ?? "Offline"} helper={serverOnline ? "Control server healthy" : "Waiting for backend"} icon={Server} tone={serverOnline ? "success" : "neutral"} />
      <MetricCard label="Critical Events" value={stats?.criticalAlerts ?? 0} helper="Pinned for review" icon={AlertTriangle} tone="danger" onClick={() => navigate(routes.events)} />
      <MetricCard label="Average Risk" value={`${stats?.averageRisk ?? 0}%`} helper="Classroom risk posture" icon={Gauge} tone="warning" />
      <MetricCard label="Bandwidth Usage" value={stats?.bandwidthUsage ?? "0 Mbps"} helper="Realtime traffic" icon={Signal} tone="neutral" />
    </div>
  );
}
