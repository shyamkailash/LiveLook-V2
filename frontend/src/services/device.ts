import { apiGet } from "@/services/api";
import type { Device } from "@/types/device";

export function getDevices() {
  return apiGet<Device[]>("/devices", []);
}
