import { TeacherLiveSocket } from "@/lib/websocket";

const teacherSocketUrl =
  (import.meta.env.VITE_WS_TEACHER_URL as string | undefined)?.trim()
  || "ws://localhost:8000/ws/teacher";

export const monitoringSocket = new TeacherLiveSocket(teacherSocketUrl);
