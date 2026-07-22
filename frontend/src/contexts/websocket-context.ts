import { createContext } from "react";
import type { TeacherSocketStatus } from "@/store/monitoringStore";

export interface WebSocketContextValue {
  connected: boolean;
  status: TeacherSocketStatus;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null);
