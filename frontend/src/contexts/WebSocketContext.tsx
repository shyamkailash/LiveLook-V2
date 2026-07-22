import { useEffect, useMemo, useState } from "react";
import { WebSocketContext } from "@/contexts/websocket-context";
import { useAuth } from "@/hooks/useAuth";
import { monitoringSocket } from "@/services/websocket";
import {
  useMonitoringStore,
  type TeacherSocketStatus,
} from "@/store/monitoringStore";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<TeacherSocketStatus>("disconnected");

  useEffect(() => {
    const handleStatus = (nextStatus: TeacherSocketStatus) => {
      setStatus(nextStatus);
      useMonitoringStore.getState().setSocketStatus(nextStatus);
    };
    const unsubscribeStatus = monitoringSocket.subscribeStatus(handleStatus);
    const unsubscribeMessages = monitoringSocket.subscribe((message) => {
      useMonitoringStore.getState().applyRawMessage(message);
    });
    monitoringSocket.connect(user?.uid || "development-teacher");

    return () => {
      unsubscribeMessages();
      unsubscribeStatus();
      monitoringSocket.disconnect();
    };
  }, [user?.uid]);

  const value = useMemo(
    () => ({ connected: status === "connected", status }),
    [status],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}
