import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types/monitoring";

const toneByRisk: Record<RiskLevel, "success" | "warning" | "accent" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "accent",
  critical: "danger",
};

export function RiskBadge({ level, score }: { level: RiskLevel; score: number }) {
  return <Badge tone={toneByRisk[level]}>{score} risk</Badge>;
}
