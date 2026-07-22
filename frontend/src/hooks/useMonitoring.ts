import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudents } from "@/services/monitoring";
import { monitoringSocket } from "@/services/websocket";
import type { MonitoringStudent } from "@/types/monitoring";

export function useMonitoring() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = monitoringSocket.subscribe((student) => {
      queryClient.setQueryData<MonitoringStudent[]>(["students"], (current = []) => {
        const index = current.findIndex((item) => item.id === student.id);
        if (index === -1) return [student, ...current];

        return current.map((item) => item.id === student.id ? student : item);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
    refetchInterval: 8000,
  });
}
