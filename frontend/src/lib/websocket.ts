import type { TeacherSocketStatus } from "@/store/monitoringStore";

export type SocketListener = (payload: unknown) => void;
export type SocketStatusListener = (status: TeacherSocketStatus) => void;

const PING_INTERVAL_MS = 10_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export class TeacherLiveSocket {
  private socket?: WebSocket;
  private reconnectTimer?: number;
  private pingTimer?: number;
  private reconnectAttempt = 0;
  private shouldReconnect = false;
  private teacherId = "development-teacher";
  private listeners = new Set<SocketListener>();
  private statusListeners = new Set<SocketStatusListener>();

  constructor(private readonly url: string) {}

  connect(teacherId?: string) {
    if (teacherId?.trim()) this.teacherId = teacherId.trim();
    this.shouldReconnect = true;
    if (!this.url || this.socket || this.reconnectTimer) return;
    this.open(false);
  }

  disconnect() {
    this.shouldReconnect = false;
    this.clearTimers();
    const socket = this.socket;
    this.socket = undefined;
    socket?.close();
    this.setStatus("disconnected");
  }

  subscribe(listener: SocketListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeStatus(listener: SocketStatusListener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private open(reconnecting: boolean) {
    if (!this.shouldReconnect || this.socket) return;
    this.setStatus(reconnecting ? "reconnecting" : "connecting");
    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.addEventListener("open", () => {
      if (this.socket !== socket) return;
      this.reconnectAttempt = 0;
      this.setStatus("connected");
      this.send({ type: "register", teacherId: this.teacherId });
      this.send({ type: "getStudents" });
      this.send({ type: "getFrames" });
      this.pingTimer = window.setInterval(() => {
        this.send({ type: "ping" });
        this.send({ type: "getStudents" });
      }, PING_INTERVAL_MS);
    });
    socket.addEventListener("message", (event) => {
      if (this.socket !== socket) return;
      try {
        const payload: unknown = JSON.parse(String(event.data));
        this.listeners.forEach((listener) => listener(payload));
      } catch {
        // Malformed messages are ignored; frame payloads are never logged.
      }
    });
    socket.addEventListener("error", () => {
      if (this.socket === socket) this.setStatus("reconnecting");
    });
    socket.addEventListener("close", () => {
      if (this.socket !== socket) return;
      this.socket = undefined;
      this.clearPing();
      if (this.shouldReconnect) this.scheduleReconnect();
      else this.setStatus("disconnected");
    });
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect || this.reconnectTimer) return;
    const delay = Math.min(
      MAX_RECONNECT_DELAY_MS,
      1_000 * (2 ** this.reconnectAttempt),
    );
    this.reconnectAttempt += 1;
    this.setStatus("reconnecting");
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      this.open(true);
    }, delay);
  }

  private send(message: Record<string, unknown>) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private clearPing() {
    if (this.pingTimer !== undefined) window.clearInterval(this.pingTimer);
    this.pingTimer = undefined;
  }

  private clearTimers() {
    this.clearPing();
    if (this.reconnectTimer !== undefined) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
  }

  private setStatus(status: TeacherSocketStatus) {
    this.statusListeners.forEach((listener) => listener(status));
  }
}
