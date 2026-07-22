import { apiGet } from "@/services/api";
import type { MonitoringStudent } from "@/types/monitoring";

export function getStudents() {
  return apiGet<MonitoringStudent[]>("/students", []);
}

export function getPriorityStudents() {
  return apiGet<MonitoringStudent[]>("/students/priority", []);
}
