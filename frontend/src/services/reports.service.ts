import { apiDownload, apiGet } from "@/services/api";

export interface ReportSummary {
  alertsGenerated: number;
  criticalEvents: number;
  screenshotsQueued: number;
  systemsReviewed: number;
}

type Incident = {
  student_id?: string;
  severity?: string;
  evidence_available?: boolean;
};

export async function exportReport(format: "pdf" | "csv") {
  try {
    const { blob, filename } = await apiDownload("/api/reports/generate", { format });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function getReportSummary(): Promise<ReportSummary> {
  const incidents = await apiGet<Incident[]>("/api/incidents", []);
  return {
    alertsGenerated: incidents.length,
    criticalEvents: incidents.filter((item) => item.severity === "critical").length,
    screenshotsQueued: incidents.filter((item) => item.evidence_available).length,
    systemsReviewed: new Set(incidents.map((item) => item.student_id).filter(Boolean)).size,
  };
}
