import type { RiskLevel } from "@/types/monitoring";

export interface AlertItem {
  id: string;
  time: string;
  student: string;
  systemNumber: string;
  level: RiskLevel;
  reason: string;
  action: string;
  resolved: boolean;
}
