import { LiveSocket } from "@/lib/websocket";
import type { MonitoringStudent } from "@/types/monitoring";

export const monitoringSocket = new LiveSocket<MonitoringStudent>(
  import.meta.env.VITE_WS_URL ?? "ws://localhost:8080/monitoring",
);
