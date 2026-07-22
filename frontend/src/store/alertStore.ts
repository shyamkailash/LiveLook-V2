import { create } from "zustand";
import type { AlertItem } from "@/types/alert";

interface AlertState {
  filter: "all" | "critical" | "high" | "medium" | "low";
  setFilter: (filter: AlertState["filter"]) => void;
  liveAlerts: AlertItem[];
  upsertAlert: (alert: AlertItem) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  filter: "all",
  setFilter: (filter) => set({ filter }),
  liveAlerts: [],
  upsertAlert: (alert) => set((state) => ({
    liveAlerts: [alert, ...state.liveAlerts.filter((item) => item.id !== alert.id)],
  })),
}));
