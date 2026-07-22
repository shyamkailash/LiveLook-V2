import { create } from "zustand";

interface SessionState {
  wizardStep: number;
  setWizardStep: (wizardStep: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  wizardStep: 1,
  setWizardStep: (wizardStep) => set({ wizardStep }),
}));
