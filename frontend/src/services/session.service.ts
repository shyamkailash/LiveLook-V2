import { apiGet } from "@/services/api";
import type { ClassroomSession } from "@/types/session";

export function getSessions() {
  return apiGet<ClassroomSession[]>("/sessions", []);
}
