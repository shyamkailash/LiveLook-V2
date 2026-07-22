"""WebSocket transport for registration, frames, and heartbeats."""

import json
import logging
import signal
import threading
from typing import Callable, Optional

import websocket

from config import AgentConfig


logger = logging.getLogger(__name__)


def _registration_payload(cfg: AgentConfig) -> dict:
    return {
        "type": "register",
        "studentId": cfg.student_id,
        "name": cfg.name,
        "pc": cfg.pc,
        "sessionId": cfg.session_id,
    }


def _frame_payload(b64_jpeg: str) -> dict:
    return {"type": "frame", "frame": b64_jpeg}


def _heartbeat_payload() -> dict:
    return {"type": "heartbeat"}


class StudentWebSocketClient:
    def __init__(
        self,
        config: AgentConfig,
        capture_fn: Callable[[], Optional[str]],
    ) -> None:
        self._cfg = config
        self._capture_fn = capture_fn
        self._ws: Optional[websocket.WebSocketApp] = None
        self._registered = False
        self._stop_event = threading.Event()
        self._connect_lock = threading.Lock()
        self._registration_lock = threading.Lock()
        self._attempt = 0

    def run(self) -> None:
        original_handlers = {}
        try:
            for sig in (signal.SIGINT, signal.SIGTERM):
                original_handlers[sig] = signal.getsignal(sig)
                signal.signal(sig, lambda _signum, _frame: self._stop_event.set())
            self._connect_loop()
        finally:
            for sig, handler in original_handlers.items():
                signal.signal(sig, handler)

    def stop(self) -> None:
        self._stop_event.set()
        self._registered = False
        ws = self._ws
        if ws is not None:
            try:
                ws.close()
            except Exception as exc:
                if "already closed" not in str(exc).lower():
                    logger.warning("WebSocket close during shutdown failed: %s", exc)

    def _connect_loop(self) -> None:
        while not self._stop_event.is_set():
            if not self._connect_lock.acquire(blocking=False):
                self._stop_event.wait(timeout=1.0)
                continue

            try:
                self._attempt += 1
                logger.info("WebSocket connection attempt %d", self._attempt)
                self._registered = False
                ws = websocket.WebSocketApp(
                    self._cfg.ws_url,
                    on_open=self._on_open,
                    on_message=self._on_message,
                    on_error=self._on_error,
                    on_close=self._on_close,
                )
                self._ws = ws
                ws.run_forever()
            except Exception:
                logger.exception("WebSocket connection failed")
            finally:
                self._ws = None
                self._connect_lock.release()

            if (
                self._cfg.reconnect_max_attempts > 0
                and self._attempt >= self._cfg.reconnect_max_attempts
            ):
                logger.error("Maximum reconnect attempts reached")
                break

            delay = min(
                self._cfg.reconnect_base_delay * (2 ** (self._attempt - 1)),
                self._cfg.reconnect_max_delay,
            )
            logger.info("Reconnecting in %.1f seconds", delay)
            self._stop_event.wait(timeout=delay)

    def _on_open(self, ws) -> None:
        ws.send(json.dumps(_registration_payload(self._cfg)))

    def _on_message(self, ws, message: str) -> None:
        try:
            payload = json.loads(message)
        except (json.JSONDecodeError, TypeError):
            logger.warning("Received invalid WebSocket message")
            return

        message_type = payload.get("type")
        if message_type in {"registered", "register_ack"}:
            with self._registration_lock:
                if self._registered:
                    logger.debug("Ignoring duplicate registration acknowledgement")
                    return
                self._registered = True
                self._attempt = 0
            logger.info("Student Agent registered successfully")
            self._start_frame_loop()
            self._start_heartbeat_loop()
        elif message_type == "error":
            logger.error("Server error: %s", payload.get("message", "unknown error"))
            self._registered = False
        else:
            logger.debug("Unhandled WebSocket message type: %s", message_type)

    def _on_error(self, ws, error) -> None:
        if "Connection is already closed" in str(error):
            return
        logger.error("WebSocket error: %s", error)

    def _on_close(self, ws, close_status_code, close_msg) -> None:
        self._registered = False
        logger.info("WebSocket closed (code=%s, message=%s)", close_status_code, close_msg)

    def _start_frame_loop(self) -> None:
        threading.Thread(
            target=self._frame_loop,
            name="frame-sender",
            daemon=True,
        ).start()

    def _frame_loop(self) -> None:
        while not self._stop_event.is_set() and self._registered:
            frame = self._capture_fn()
            ws = self._ws
            if frame is not None and ws is not None and self._registered:
                ws.send(json.dumps(_frame_payload(frame)))
                logger.debug("Sent frame (%d base64 characters)", len(frame))
            self._stop_event.wait(timeout=self._cfg.capture_interval)

    def _start_heartbeat_loop(self) -> None:
        threading.Thread(
            target=self._heartbeat_loop,
            name="heartbeat-sender",
            daemon=True,
        ).start()

    def _heartbeat_loop(self) -> None:
        while not self._stop_event.is_set() and self._registered:
            ws = self._ws
            if ws is not None and self._registered:
                ws.send(json.dumps(_heartbeat_payload()))
                logger.debug("Sent heartbeat")
            self._stop_event.wait(timeout=self._cfg.heartbeat_interval)
