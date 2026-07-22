export type TeacherEvent =
  | { type: "batch"; events: TeacherEvent[] }
  | { type: "snapshot"; students: LiveStudentPatch[] }
  | { type: "upsert"; student: LiveStudentPatch }
  | { type: "frame"; student: LiveStudentPatch; frame: string }
  | { type: "disconnect"; studentId: string; sessionId: string; timestamp: string }
  | { type: "noop" };

export type LiveStudentPatch = {
  studentId: string;
  sessionId: string;
  name?: string;
  pcName?: string;
  status?: "online" | "offline";
  lastSeen?: string;
  lastFrameAt?: string;
  activeWindow?: string;
};

export type LiveStudent = LiveStudentPatch & {
  key: string;
  name: string;
  pcName: string;
  status: "online" | "offline";
  lastSeen: string;
  lastFrameAt: string;
  activeWindow: string;
  frame: string | null;
};

type UnknownRecord = Record<string, unknown>;

const record = (value: unknown): UnknownRecord | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : null;

const text = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const field = (value: UnknownRecord, camel: string, snake: string) =>
  value[camel] ?? value[snake];

export function studentKey(studentId: string, sessionId: string) {
  return `${sessionId}::${studentId}`;
}

export function normalizeFrameDataUrl(frame: unknown): string | null {
  if (typeof frame !== "string" || !frame.trim()) return null;
  const trimmed = frame.trim();
  if (/^data:image\/jpe?g;base64,/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("data:")) return null;
  const compact = trimmed.replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(compact)) return null;
  return `data:image/jpeg;base64,${compact}`;
}

export function mapStudent(value: unknown): LiveStudentPatch | null {
  const source = record(value);
  if (!source) return null;
  const studentId = text(field(source, "studentId", "student_id")).trim();
  if (!studentId) return null;
  const status = text(source.status).toLowerCase() === "offline" ? "offline" : "online";
  return {
    studentId,
    sessionId: text(field(source, "sessionId", "session_id")).trim(),
    name: text(source.name ?? field(source, "studentName", "student_name")),
    pcName: text(source.pc ?? field(source, "pcName", "pc_name")),
    status,
    lastSeen: text(field(source, "lastSeen", "last_seen")),
    lastFrameAt: text(field(source, "lastFrameAt", "last_frame_at")),
    activeWindow: text(field(source, "activeWindow", "active_window")),
  };
}

export function parseTeacherEvent(raw: unknown): TeacherEvent {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { type: "noop" };
    }
  }
  const message = record(parsed);
  if (!message) return { type: "noop" };
  const type = text(message.type ?? message.messageType ?? message.message_type);

  if (["studentList", "student_list", "students"].includes(type)) {
    const values = Array.isArray(message.students)
      ? message.students
      : Array.isArray(message.data) ? message.data : [];
    return {
      type: "snapshot",
      students: values.map(mapStudent).filter((item): item is LiveStudentPatch => item !== null),
    };
  }
  if (type === "student_joined" || type === "student_updated") {
    const student = mapStudent(message.student ?? message.data ?? message);
    return student ? { type: "upsert", student } : { type: "noop" };
  }
  if (type === "frame") {
    const student = mapStudent(message);
    const frame = normalizeFrameDataUrl(message.frame);
    if (student) {
      const timestamp = text(message.timestamp);
      if (timestamp) {
        student.lastFrameAt = timestamp;
        student.lastSeen = timestamp;
      }
    }
    return student && frame ? { type: "frame", student, frame } : { type: "noop" };
  }
  if (type === "frames") {
    const values = Array.isArray(message.data)
      ? message.data
      : Array.isArray(message.frames) ? message.frames : [];
    return {
      type: "batch",
      events: values.map((value) => {
        const frameMessage = record(value);
        return parseTeacherEvent(frameMessage ? { ...frameMessage, type: "frame" } : null);
      }),
    };
  }
  if (type === "student_disconnected") {
    const studentId = text(field(message, "studentId", "student_id")).trim();
    if (!studentId) return { type: "noop" };
    return {
      type: "disconnect",
      studentId,
      sessionId: text(field(message, "sessionId", "session_id")).trim(),
      timestamp: text(message.timestamp, new Date().toISOString()),
    };
  }
  return { type: "noop" };
}

function mergeStudent(current: LiveStudent | undefined, patch: LiveStudentPatch): LiveStudent {
  const key = studentKey(patch.studentId, patch.sessionId);
  return {
    key,
    studentId: patch.studentId,
    sessionId: patch.sessionId,
    name: patch.name || current?.name || "Unknown student",
    pcName: patch.pcName || current?.pcName || "Unknown PC",
    status: patch.status ?? current?.status ?? "online",
    lastSeen: patch.lastSeen || current?.lastSeen || "",
    lastFrameAt: patch.lastFrameAt || current?.lastFrameAt || "",
    activeWindow: patch.activeWindow || current?.activeWindow || "Unknown",
    frame: current?.frame ?? null,
  };
}

export function reduceStudents(
  current: Record<string, LiveStudent>,
  event: TeacherEvent,
): Record<string, LiveStudent> {
  if (event.type === "noop") return current;
  if (event.type === "batch") {
    return event.events.reduce(reduceStudents, current);
  }
  if (event.type === "snapshot") {
    const next = { ...current };
    event.students.forEach((student) => {
      const key = studentKey(student.studentId, student.sessionId);
      next[key] = mergeStudent(next[key], student);
    });
    return next;
  }
  if (event.type === "upsert") {
    const key = studentKey(event.student.studentId, event.student.sessionId);
    return { ...current, [key]: mergeStudent(current[key], event.student) };
  }
  if (event.type === "frame") {
    const key = studentKey(event.student.studentId, event.student.sessionId);
    const student = mergeStudent(current[key], {
      ...event.student,
      status: "online",
      lastSeen: event.student.lastSeen || event.student.lastFrameAt,
    });
    return { ...current, [key]: { ...student, frame: event.frame } };
  }
  const key = studentKey(event.studentId, event.sessionId);
  const existing = current[key];
  if (!existing) return current;
  return {
    ...current,
    [key]: { ...existing, status: "offline", lastSeen: event.timestamp },
  };
}
