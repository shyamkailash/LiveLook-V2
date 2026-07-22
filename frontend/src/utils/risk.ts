import type { RiskLevel } from "@/types/monitoring";

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 85) return "critical";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function getRiskTone() {
  return "text-muted bg-surface border-border";
}
