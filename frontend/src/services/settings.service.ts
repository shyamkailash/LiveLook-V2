import { apiPost } from "@/services/api";

export function saveSettings(payload: Record<string, unknown>) {
  return apiPost("/settings", payload, { ok: false });
}
