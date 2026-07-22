from datetime import timedelta
from unittest import IsolatedAsyncioTestCase

from app.services.connection_manager import ConnectionManager, utc_now


class FakeWebSocket:
    def __init__(self) -> None:
        self.messages = []

    async def send_json(self, message) -> None:
        self.messages.append(message)


class TestConnectionManager(IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.manager = ConnectionManager()
        self.teacher = FakeWebSocket()
        await self.manager.connect_teacher(self.teacher, "teacher-1")

    async def test_multiple_students_remain_isolated(self) -> None:
        first = FakeWebSocket()
        second = FakeWebSocket()
        await self.manager.connect_student(first, "S-1", "One", "PC-1", "EXAM")
        await self.manager.connect_student(second, "S-2", "Two", "PC-2", "EXAM")

        self.manager.update_frame("S-1", "FRAME-ONE")

        students = {item["student_id"]: item for item in self.manager.get_students()}
        self.assertEqual(set(students), {"S-1", "S-2"})
        self.assertEqual(self.manager.students["S-1"]["frame"], "FRAME-ONE")
        self.assertIsNone(self.manager.students["S-2"]["frame"])

    async def test_heartbeat_updates_last_seen_with_utc_datetime(self) -> None:
        socket = FakeWebSocket()
        await self.manager.connect_student(socket, "S-1", "One", "PC-1", "EXAM")
        previous = self.manager.students["S-1"]["last_seen"]

        self.assertTrue(self.manager.touch_student("S-1"))

        updated = self.manager.students["S-1"]["last_seen"]
        self.assertIsNotNone(updated)
        self.assertIsNotNone(updated.tzinfo)
        self.assertGreaterEqual(updated, previous)

    async def test_frame_broadcast_has_identity_session_and_timestamp(self) -> None:
        socket = FakeWebSocket()
        await self.manager.connect_student(socket, "S-1", "One", "PC-1", "EXAM")
        self.teacher.messages.clear()
        self.manager.update_frame("S-1", "FRAME")

        await self.manager.broadcast_frame("S-1")

        message = self.teacher.messages[-1]
        self.assertEqual(message["type"], "frame")
        self.assertEqual(message["student_id"], "S-1")
        self.assertEqual(message["session_id"], "EXAM")
        self.assertEqual(message["frame"], "FRAME")
        self.assertTrue(message["timestamp"].endswith("+00:00"))

    async def test_student_is_offline_after_timeout(self) -> None:
        socket = FakeWebSocket()
        await self.manager.connect_student(socket, "S-1", "One", "PC-1", "EXAM")
        self.manager.students["S-1"]["last_seen"] = utc_now() - timedelta(seconds=16)

        self.assertEqual(self.manager.get_students()[0]["status"], "offline")

    async def test_disconnect_marks_offline_and_broadcasts(self) -> None:
        socket = FakeWebSocket()
        await self.manager.connect_student(socket, "S-1", "One", "PC-1", "EXAM")
        self.teacher.messages.clear()

        await self.manager.disconnect_student("S-1", socket)

        self.assertEqual(self.manager.get_students()[0]["status"], "offline")
        self.assertEqual(self.teacher.messages[-1]["type"], "student_disconnected")

    async def test_old_socket_cannot_disconnect_replacement(self) -> None:
        old_socket = FakeWebSocket()
        new_socket = FakeWebSocket()
        await self.manager.connect_student(old_socket, "S-1", "One", "PC-1", "EXAM")
        await self.manager.connect_student(new_socket, "S-1", "One", "PC-1", "EXAM")

        await self.manager.disconnect_student("S-1", old_socket)

        student = self.manager.students["S-1"]
        self.assertIs(student["websocket"], new_socket)
        self.assertEqual(student["status"], "online")

    async def test_only_replacement_socket_is_current(self) -> None:
        old_socket = FakeWebSocket()
        new_socket = FakeWebSocket()
        await self.manager.connect_student(old_socket, "S-1", "One", "PC-1", "EXAM")
        await self.manager.connect_student(new_socket, "S-1", "One", "PC-1", "EXAM")

        self.assertFalse(
            self.manager.is_current_student_connection("S-1", old_socket)
        )
        self.assertTrue(
            self.manager.is_current_student_connection("S-1", new_socket)
        )

    async def test_multiple_teacher_connections_with_same_identity(self) -> None:
        second_teacher = FakeWebSocket()
        await self.manager.connect_teacher(second_teacher, "teacher-1")

        await self.manager.broadcast({"type": "pong"})

        self.assertEqual(self.teacher.messages[-1], {"type": "pong"})
        self.assertEqual(second_teacher.messages[-1], {"type": "pong"})
