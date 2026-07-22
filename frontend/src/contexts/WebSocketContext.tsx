import { useEffect, useMemo, useState } from "react";
import { WebSocketContext } from "@/contexts/websocket-context";
import { monitoringSocket } from "@/services/websocket";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = monitoringSocket.subscribeStatus(setConnected);
    monitoringSocket.connect();

    return () => {
      unsubscribe();
      monitoringSocket.disconnect();
    };
  }, []);

  const value = useMemo(() => ({ connected, setConnected }), [connected]);

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}
