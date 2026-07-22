import { create } from "zustand";
import {
  parseTeacherEvent,
  reduceStudents,
  type LiveStudent,
  type TeacherEvent,
} from "@/services/monitoring-events";
import type { MonitoringStudent } from "@/types/monitoring";

export type TeacherSocketStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

function toMonitoringStudent(student: LiveStudent): MonitoringStudent {
  return {
    id: student.key,
    studentId: student.studentId,
    sessionId: student.sessionId,
    name: student.name,
    rollNumber: student.studentId,
    department: "",
    pcName: student.pcName,
    systemNumber: student.pcName,
    currentApp: student.activeWindow,
    cpu: 0,
    ram: 0,
    fps: student.frame ? 1 : 0,
    risk: 0,
    riskLevel: "low",
    status: student.status === "offline" ? "idle" : "focused",
    connection: student.status,
    reason: student.status === "offline" ? "Student Agent is offline." : "Live monitoring active.",
    lastSeen: student.lastSeen,
    mouseActivity: 0,
    keyboardActivity: 0,
    network: 0,
    processes: [],
    frame: student.frame,
    frameReceivedAt: student.lastFrameAt,
  };
}

interface MonitoringState {
  liveStudents: Record<string, LiveStudent>;
  students: MonitoringStudent[];
  socketStatus: TeacherSocketStatus;
  applyEvent: (event: TeacherEvent) => void;
  applyRawMessage: (raw: unknown) => void;
  clear: () => void;
  setSocketStatus: (status: TeacherSocketStatus) => void;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  liveStudents: {},
  students: [],
  socketStatus: "disconnected",
  applyEvent: (event) => set((state) => {
    const liveStudents = reduceStudents(state.liveStudents, event);
    if (liveStudents === state.liveStudents) return state;
    return { liveStudents, students: Object.values(liveStudents).map(toMonitoringStudent) };
  }),
  applyRawMessage: (raw) => set((state) => {
    const event = parseTeacherEvent(raw);
    const liveStudents = reduceStudents(state.liveStudents, event);
    if (liveStudents === state.liveStudents) return state;
    return { liveStudents, students: Object.values(liveStudents).map(toMonitoringStudent) };
  }),
  clear: () => set({ liveStudents: {}, students: [] }),
  setSocketStatus: (socketStatus) => set({ socketStatus }),
}));
