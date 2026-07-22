"""Teacher dashboard WebSocket endpoint."""

import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.connection_manager import manager


router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/teacher")
async def teacher_websocket(websocket: WebSocket) -> None:
    await websocket.accept()
    registered = False

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json(
                    {"type": "error", "message": "Invalid JSON payload"}
                )
                continue
            if not isinstance(message, dict):
                await websocket.send_json(
                    {"type": "error", "message": "Payload must be a JSON object"}
                )
                continue

            msg_type = message.get("type")
            if msg_type == "register":
                raw_teacher_id = message.get("teacherId", message.get("teacher_id"))
                if not isinstance(raw_teacher_id, str) or not raw_teacher_id.strip():
                    await websocket.send_json(
                        {"type": "error", "message": "teacherId is required"}
                    )
                    continue
                if not registered:
                    await manager.connect_teacher(websocket, raw_teacher_id.strip())
                    registered = True
                await websocket.send_json(
                    {"type": "registered", "message": "Teacher Connected"}
                )
            elif msg_type in {"getStudents", "get_students"}:
                await websocket.send_json(
                    {"type": "studentList", "students": manager.get_students()}
                )
            elif msg_type in {"getFrames", "get_frames"}:
                await websocket.send_json(
                    {"type": "frames", "data": manager.get_frames()}
                )
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
            else:
                await websocket.send_json(
                    {"type": "error", "message": f"Unsupported message type: {msg_type}"}
                )
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("Teacher WebSocket handler failed")
    finally:
        manager.disconnect_teacher(websocket)
