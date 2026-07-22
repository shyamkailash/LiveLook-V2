export interface SessionPolicy {
  allowedApps: string[];
  blockedApps: string[];
  screenshotFrequency: number;
  aiSensitivity: number;
  idleTimeout: number;
}

export interface ClassroomSession {
  id: string;
  name: string;
  type: string;
  department: string;
  lab: string;
  startedAt: string;
  durationMinutes: number;
  connectedSystems: number;
  status: "running" | "scheduled" | "completed";
  policy: SessionPolicy;
}
