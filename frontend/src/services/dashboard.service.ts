import { apiGet } from "@/services/api";

export interface DashboardStatsResponse {
  averageRisk: number;
  bandwidthUsage: string;
  connectedSystems: number;
  criticalAlerts: number;
  liveFps: number;
  offlineSystems: number;
  runningSession: string;
  runningSessions: number;
  serverStatus: string;
}

const emptyDashboardStats: DashboardStatsResponse = {
  averageRisk: 0,
  bandwidthUsage: "0 Mbps",
  connectedSystems: 0,
  criticalAlerts: 0,
  liveFps: 0,
  offlineSystems: 0,
  runningSession: "No active session",
  runningSessions: 0,
  serverStatus: "Offline",
};

export function getDashboardStats() {
  return apiGet<DashboardStatsResponse>("/dashboard", emptyDashboardStats);
}
