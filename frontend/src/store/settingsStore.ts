import { create } from "zustand";

interface SettingsState {
  compactDensity: boolean;
  aiSensitivity: number;
  setCompactDensity: (compactDensity: boolean) => void;
  setAiSensitivity: (aiSensitivity: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  compactDensity: false,
  aiSensitivity: 82,
  setCompactDensity: (compactDensity) => set({ compactDensity }),
  setAiSensitivity: (aiSensitivity) => set({ aiSensitivity }),
}));
