import { apiGet } from "@/services/api";
import type { AlertItem } from "@/types/alert";

export function getAlerts() {
  return apiGet<AlertItem[]>("/alerts", []);
}
