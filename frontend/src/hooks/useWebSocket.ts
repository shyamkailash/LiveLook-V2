import { useContext } from "react";
import { WebSocketContext } from "@/contexts/websocket-context";

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("useWebSocket must be used inside WebSocketProvider");
  return context;
}
