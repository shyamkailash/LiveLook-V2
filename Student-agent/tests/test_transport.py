import json
import threading
import time
from unittest.mock import MagicMock, patch

from config import AgentConfig
from transport.websocket_client import (
    StudentWebSocketClient,
    _frame_payload,
    _heartbeat_payload,
    _registration_payload,
)


VALID_DICT = {
    "student_id": "22CS101",
    "name": "Shyam Kailash",
    "pc": "STUDENT-PC-01",
    "session_id": "HACKSPRINT-DEMO",
    "ws_url": "ws://127.0.0.1:8000/ws/student",
    "capture_interval": 0.1,
    "max_frame_width": 1280,
    "jpeg_quality": 60,
    "heartbeat_interval": 1.0,
    "reconnect_base_delay": 0.1,
    "reconnect_max_delay": 1.0,
    "reconnect_max_attempts": 5,
}
CFG = AgentConfig(**VALID_DICT)
NOOP_CAPTURE = lambda: "FAKE_BASE64"


class TestPayloads:
    def test_registration_payload(self):
        assert _registration_payload(CFG) == {
            "type": "register", "studentId": "22CS101", "name": "Shyam Kailash",
            "pc": "STUDENT-PC-01", "sessionId": "HACKSPRINT-DEMO",
        }

    def test_frame_payload(self):
        assert _frame_payload("abc") == {"type": "frame", "frame": "abc"}

    def test_heartbeat_payload(self):
        assert _heartbeat_payload() == {"type": "heartbeat"}


class TestRegistrationFlow:
    def test_sends_register_on_open(self):
        client, ws = StudentWebSocketClient(CFG, NOOP_CAPTURE), MagicMock()
        client._on_open(ws)
        payload = json.loads(ws.send.call_args.args[0])
        assert payload["type"] == "register"
        assert payload["studentId"] == "22CS101"
        assert payload["sessionId"] == "HACKSPRINT-DEMO"

    def test_registered_flag_set_on_ack(self):
        client = StudentWebSocketClient(CFG, NOOP_CAPTURE)
        client._on_message(MagicMock(), '{"type":"registered"}')
        try:
            assert client._registered is True
        finally:
            client.stop()

    def test_registered_flag_set_on_register_ack(self):
        client = StudentWebSocketClient(CFG, NOOP_CAPTURE)
        client._on_message(MagicMock(), '{"type":"register_ack"}')
        try:
            assert client._registered is True
        finally:
            client.stop()

    def test_error_message_unsets_registered(self):
        client = StudentWebSocketClient(CFG, NOOP_CAPTURE)
        client._registered = True
        client._on_message(MagicMock(), '{"type":"error","message":"bad"}')
        assert client._registered is False


class TestFrameAndHeartbeat:
    def test_frame_sent_after_registration(self):
        event = threading.Event()
        cfg = AgentConfig(**{**VALID_DICT, "heartbeat_interval": 120.0})
        def capture():
            event.set()
            return "FAKEFRAME"
        client, ws = StudentWebSocketClient(cfg, capture), MagicMock()
        client._ws = ws
        client._on_open(ws)
        client._on_message(ws, '{"type":"registered"}')
        try:
            assert event.wait(1.0)
            assert any(json.loads(call.args[0]).get("frame") == "FAKEFRAME" for call in ws.send.call_args_list)
        finally:
            client.stop()

    def test_heartbeat_sent_after_registration(self):
        cfg = AgentConfig(**{**VALID_DICT, "capture_interval": 60.0, "heartbeat_interval": 1.0})
        client, ws = StudentWebSocketClient(cfg, NOOP_CAPTURE), MagicMock()
        client._ws = ws
        client._on_message(ws, '{"type":"registered"}')
        try:
            time.sleep(0.4)
            assert any(json.loads(call.args[0]).get("type") == "heartbeat" for call in ws.send.call_args_list)
        finally:
            client.stop()

    def test_no_frame_sent_before_registration(self):
        client, ws = StudentWebSocketClient(CFG, NOOP_CAPTURE), MagicMock()
        client._ws = ws
        client._on_open(ws)
        try:
            time.sleep(0.3)
            assert not any(json.loads(call.args[0]).get("type") == "frame" for call in ws.send.call_args_list)
        finally:
            client.stop()


class TestReconnection:
    def test_stops_after_max_attempts(self):
        cfg = AgentConfig(**{**VALID_DICT, "reconnect_max_attempts": 3})
        client = StudentWebSocketClient(cfg, NOOP_CAPTURE)
        instances = []
        def factory(*args, **kwargs):
            ws = MagicMock()
            ws.run_forever.side_effect = lambda: kwargs["on_close"](ws, 1000, "closed")
            instances.append(ws)
            return ws
        with patch("transport.websocket_client.websocket.WebSocketApp", side_effect=factory):
            client._connect_loop()
        assert len(instances) == 3

    def test_attempt_counter_resets_on_registration(self):
        client = StudentWebSocketClient(CFG, NOOP_CAPTURE)
        client._attempt = 5
        client._on_message(MagicMock(), '{"type":"registered"}')
        try:
            assert client._attempt == 0
        finally:
            client.stop()

    def test_no_concurrent_connections(self):
        client = StudentWebSocketClient(CFG, NOOP_CAPTURE)
        flag = threading.Event()
        client._connect_lock.acquire()
        thread = threading.Thread(target=client._connect_loop)
        try:
            with patch("transport.websocket_client.websocket.WebSocketApp") as app:
                app.return_value.run_forever.side_effect = flag.set
                thread.start()
                time.sleep(0.2)
                client.stop()
                thread.join(2.0)
                assert not flag.is_set()
        finally:
            if client._connect_lock.locked():
                client._connect_lock.release()


class TestShutdown:
    def test_stop_sets_event(self):
        client = StudentWebSocketClient(CFG, NOOP_CAPTURE)
        client.stop()
        assert client._stop_event.is_set()

    def test_on_close_unsets_registered(self):
        client = StudentWebSocketClient(CFG, NOOP_CAPTURE)
        client._registered = True
        client._on_close(MagicMock(), 1000, "closed")
        assert client._registered is False
