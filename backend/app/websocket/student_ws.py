"""Student Agent WebSocket endpoint."""

import json
import logging
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.connection_manager import manager


router = APIRouter()
logger = logging.getLogger(__name__)


def _field(message: dict[str, Any], camel: str, snake: str) -> Any:
    return message.get(camel, message.get(snake))


async def _send_error(websocket: WebSocket, message: str) -> None:
    await websocket.send_json({"type": "error", "message": message})


@router.websocket("/ws/student")
async def student_websocket(websocket: WebSocket) -> None:
    await websocket.accept()
    student_id: str | None = None

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                await _send_error(websocket, "Invalid JSON payload")
                continue
            if not isinstance(message, dict):
                await _send_error(websocket, "Payload must be a JSON object")
                continue

            msg_type = message.get("type")
            if msg_type == "register":
                raw_student_id = _field(message, "studentId", "student_id")
                name = _field(message, "name", "student_name")
                pc = _field(message, "pc", "pc_name")
                session_id = _field(message, "sessionId", "session_id") or ""
                if not all(
                    isinstance(value, str) and value.strip()
                    for value in (raw_student_id, name, pc)
                ):
                    await _send_error(
                        websocket, "studentId, name, and pc are required strings"
                    )
                    continue
                student_id = raw_student_id.strip()
                await manager.connect_student(
                    websocket=websocket,
                    student_id=student_id,
                    name=name.strip(),
                    pc=pc.strip(),
                    session_id=str(session_id).strip(),
                )
                await websocket.send_json(
                    {"type": "registered", "message": "Registration Successful"}
                )
            elif msg_type in {"heartbeat", "frame", "activity"} and not student_id:
                await _send_error(websocket, "Register before sending student data")
            elif msg_type in {"heartbeat", "frame", "activity"} and not (
                manager.is_current_student_connection(student_id, websocket)
            ):
                await _send_error(websocket, "Student connection has been replaced")
            elif msg_type == "heartbeat":
                manager.touch_student(student_id)
            elif msg_type == "frame":
                frame = message.get("frame")
                if not isinstance(frame, str) or not frame:
                    await _send_error(websocket, "frame must be a non-empty string")
                    continue
                manager.update_frame(student_id, frame)
                await manager.broadcast_frame(student_id)
            elif msg_type == "activity":
                active_window = _field(message, "activeWindow", "active_window")
                if isinstance(active_window, str):
                    manager.update_activity(student_id, active_window)
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
            else:
                await _send_error(websocket, f"Unsupported message type: {msg_type}")
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("Student WebSocket handler failed for %s", student_id)
    finally:
        if student_id:
            await manager.disconnect_student(student_id, websocket)
