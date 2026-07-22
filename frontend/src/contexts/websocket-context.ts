import { createContext } from "react";

export interface WebSocketContextValue {
  connected: boolean;
  setConnected: (connected: boolean) => void;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null);
