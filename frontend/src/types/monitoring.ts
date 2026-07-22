export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ConnectionState = "online" | "unstable" | "offline";

export interface MonitoringStudent {
  id: string;
  studentId: string;
  sessionId: string;
  name: string;
  rollNumber: string;
  department: string;
  pcName: string;
  systemNumber: string;
  currentApp: string;
  cpu: number;
  ram: number;
  fps: number;
  risk: number;
  riskLevel: RiskLevel;
  status: "focused" | "idle" | "warning" | "locked";
  connection: ConnectionState;
  reason: string;
  lastSeen: string;
  mouseActivity: number;
  keyboardActivity: number;
  network: number;
  processes: string[];
  frame: string | null;
  frameReceivedAt: string;
}
