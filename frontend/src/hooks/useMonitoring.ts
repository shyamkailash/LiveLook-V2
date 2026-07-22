import { useMonitoringStore } from "@/store/monitoringStore";

export function useMonitoring() {
  const students = useMonitoringStore((state) => state.students);
  return {
    data: students,
    isLoading: false,
    refetch: async () => ({ data: students }),
  };
}
