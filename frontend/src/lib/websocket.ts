export type SocketListener<T> = (payload: T) => void;
export type SocketStatusListener = (connected: boolean) => void;

export class LiveSocket<TPayload> {
  private socket?: WebSocket;
  private listeners = new Set<SocketListener<TPayload>>();
  private statusListeners = new Set<SocketStatusListener>();

  constructor(private readonly url: string) {}

  connect() {
    if (!this.url || this.socket) return;
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("open", () => this.setConnected(true));
    this.socket.addEventListener("close", () => {
      this.socket = undefined;
      this.setConnected(false);
    });
    this.socket.addEventListener("error", () => this.setConnected(false));
    this.socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data) as TPayload;
        this.listeners.forEach((listener) => listener(payload));
      } catch {
        this.setConnected(false);
      }
    });
  }

  disconnect() {
    this.socket?.close();
    this.socket = undefined;
    this.setConnected(false);
  }

  subscribe(listener: SocketListener<TPayload>) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeStatus(listener: SocketStatusListener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setConnected(connected: boolean) {
    this.statusListeners.forEach((listener) => listener(connected));
  }
}
