import { apiGet, apiPatch } from "@/services/api";
import type { AlertItem } from "@/types/alert";

type IncidentRecord = Record<string, unknown>;

export function mapIncident(value: unknown): AlertItem | null {
  if (!value || typeof value !== "object") return null;
  const incident = value as IncidentRecord;
  const id = String(incident.incident_id ?? "").trim();
  if (!id) return null;
  const severity = String(incident.severity ?? "high");
  const level = (["low", "medium", "high", "critical"].includes(severity)
    ? severity : "high") as AlertItem["level"];
  return {
    id,
    time: String(incident.detected_at ?? ""),
    student: String(incident.student_name ?? incident.student_id ?? "Unknown student"),
    systemNumber: String(incident.pc ?? "Unknown PC"),
    level,
    reason: String(incident.description ?? "Unauthorized application detected"),
    action: incident.resolved ? "Resolved by invigilator" : "Review required",
    resolved: Boolean(incident.resolved),
  };
}

export async function getAlerts() {
  const incidents = await apiGet<unknown[]>("/api/incidents", []);
  return incidents.map(mapIncident).filter((item): item is AlertItem => item !== null);
}

export function resolveAlert(incidentId: string, resolved = true) {
  return apiPatch(`/api/incidents/${encodeURIComponent(incidentId)}`, { resolved }, null);
}
