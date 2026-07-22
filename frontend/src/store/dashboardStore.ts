import { create } from "zustand";

interface DashboardState {
  selectedSession: string;
  setSelectedSession: (selectedSession: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedSession: "",
  setSelectedSession: (selectedSession) => set({ selectedSession }),
}));
