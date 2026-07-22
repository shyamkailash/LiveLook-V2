import { create } from "zustand";
import type { MonitoringStudent } from "@/types/monitoring";

interface MonitoringState {
  selectedStudent: MonitoringStudent | null;
  setSelectedStudent: (selectedStudent: MonitoringStudent | null) => void;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  selectedStudent: null,
  setSelectedStudent: (selectedStudent) => set({ selectedStudent }),
}));
