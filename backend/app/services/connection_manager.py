"""In-memory WebSocket connection and presence management.

This is the local/demo transport store. Durable Firestore persistence is added in
a later integration phase; continuous frames intentionally remain memory-only.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import WebSocket


logger = logging.getLogger(__name__)
OFFLINE_AFTER = timedelta(seconds=15)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


class ConnectionManager:
    def __init__(self) -> None:
        self.students: dict[str, dict[str, Any]] = {}
        self.teachers: dict[int, dict[str, Any]] = {}

    async def connect_student(
        self,
        websocket: WebSocket,
        student_id: str,
        name: str,
        pc: str,
        session_id: str = "",
    ) -> None:
        now = utc_now()
        previous = self.students.get(student_id, {})
        self.students[student_id] = {
            "websocket": websocket,
            "student_id": student_id,
            "name": name,
            "pc": pc,
            "session_id": session_id,
            "status": "online",
            "last_seen": now,
            "last_frame_at": previous.get("last_frame_at"),
            "active_window": previous.get("active_window"),
            "frame": previous.get("frame"),
        }
        logger.info("Student connected: %s (%s)", name, student_id)
        await self.broadcast(
            {"type": "student_joined", "student": self._student_payload(student_id)}
        )

    def touch_student(self, student_id: str) -> bool:
        student = self.students.get(student_id)
        if student is None:
            return False
        student["last_seen"] = utc_now()
        student["status"] = "online"
        return True

    def is_current_student_connection(
        self,
        student_id: str,
        websocket: WebSocket,
    ) -> bool:
        student = self.students.get(student_id)
        return student is not None and student.get("websocket") is websocket

    def update_frame(self, student_id: str, frame: str) -> bool:
        student = self.students.get(student_id)
        if student is None:
            return False
        now = utc_now()
        student["frame"] = frame
        student["last_frame_at"] = now
        student["last_seen"] = now
        student["status"] = "online"
        return True

    def update_activity(self, student_id: str, active_window: str) -> bool:
        student = self.students.get(student_id)
        if student is None:
            return False
        student["active_window"] = active_window
        self.touch_student(student_id)
        return True

    async def broadcast_frame(self, student_id: str) -> None:
        student = self.students.get(student_id)
        if student is None or not student.get("frame"):
            return
        await self.broadcast(
            {
                "type": "frame",
                "student_id": student["student_id"],
                "session_id": student["session_id"],
                "name": student["name"],
                "pc": student["pc"],
                "status": self._status(student),
                "timestamp": _iso(student["last_frame_at"]),
                "frame": student["frame"],
            }
        )

    async def broadcast(self, message: dict[str, Any]) -> None:
        disconnected: list[int] = []
        for connection_id, teacher in list(self.teachers.items()):
            try:
                await teacher["websocket"].send_json(message)
            except Exception as exc:
                logger.warning(
                    "Teacher WebSocket send failed for %s: %s",
                    teacher["teacher_id"],
                    exc,
                )
                disconnected.append(connection_id)
        for connection_id in disconnected:
            self.teachers.pop(connection_id, None)

    async def connect_teacher(self, websocket: WebSocket, teacher_id: str) -> None:
        self.teachers[id(websocket)] = {
            "teacher_id": teacher_id,
            "websocket": websocket,
        }
        logger.info("Teacher connected: %s", teacher_id)

    async def disconnect_student(
        self,
        student_id: str,
        websocket: WebSocket | None = None,
    ) -> None:
        student = self.students.get(student_id)
        if student is None:
            return
        if websocket is not None and student.get("websocket") is not websocket:
            return
        student["websocket"] = None
        student["status"] = "offline"
        disconnected_at = utc_now()
        student["last_seen"] = disconnected_at
        logger.info("Student disconnected: %s", student_id)
        await self.broadcast(
            {
                "type": "student_disconnected",
                "student_id": student_id,
                "session_id": student["session_id"],
                "timestamp": _iso(disconnected_at),
            }
        )

    def disconnect_teacher(self, websocket: WebSocket) -> None:
        teacher = self.teachers.pop(id(websocket), None)
        if teacher is not None:
            logger.info("Teacher disconnected: %s", teacher["teacher_id"])

    def get_students(self) -> list[dict[str, Any]]:
        return [self._student_payload(student_id) for student_id in self.students]

    def get_frames(self) -> list[dict[str, Any]]:
        frames = []
        for student in self.students.values():
            if not student.get("frame"):
                continue
            frames.append(
                {
                    "student_id": student["student_id"],
                    "session_id": student["session_id"],
                    "name": student["name"],
                    "pc": student["pc"],
                    "status": self._status(student),
                    "timestamp": _iso(student["last_frame_at"]),
                    "frame": student["frame"],
                }
            )
        return frames

    def _status(self, student: dict[str, Any]) -> str:
        if student.get("status") == "offline" or student.get("websocket") is None:
            return "offline"
        last_seen = student.get("last_seen")
        if not isinstance(last_seen, datetime) or utc_now() - last_seen > OFFLINE_AFTER:
            student["status"] = "offline"
            return "offline"
        return "online"

    def _student_payload(self, student_id: str) -> dict[str, Any]:
        student = self.students[student_id]
        return {
            "student_id": student["student_id"],
            "name": student["name"],
            "pc": student["pc"],
            "session_id": student["session_id"],
            "status": self._status(student),
            "last_seen": _iso(student["last_seen"]),
            "last_frame_at": _iso(student["last_frame_at"]),
            "active_window": student["active_window"],
        }


manager = ConnectionManager()
