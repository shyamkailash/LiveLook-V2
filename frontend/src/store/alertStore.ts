import { create } from "zustand";

interface AlertState {
  filter: "all" | "critical" | "high" | "medium" | "low";
  setFilter: (filter: AlertState["filter"]) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  filter: "all",
  setFilter: (filter) => set({ filter }),
}));
