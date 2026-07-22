import type { ConnectionState } from "@/types/monitoring";

export interface Device {
  id: string;
  pcName: string;
  lab: string;
  os: string;
  agentVersion: string;
  cpu: number;
  memory: number;
  storage: number;
  connection: ConnectionState;
  health: number;
}
