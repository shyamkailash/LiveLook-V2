import { apiGet, apiPost } from "@/services/api";

export interface ReportSummary {
  alertsGenerated: number;
  criticalEvents: number;
  screenshotsQueued: number;
  systemsReviewed: number;
}

const emptyReportSummary: ReportSummary = {
  alertsGenerated: 0,
  criticalEvents: 0,
  screenshotsQueued: 0,
  systemsReviewed: 0,
};

export function exportReport(format: "pdf" | "csv" | "xlsx") {
  return apiPost("/reports/export", { format }, { ok: false });
}

export function getReportSummary() {
  return apiGet<ReportSummary>("/reports/summary", emptyReportSummary);
}
