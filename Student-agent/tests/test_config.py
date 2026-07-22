import json

import pytest

from config import AgentConfig


VALID = {
    "student_id": "22CS101",
    "name": "Shyam Kailash",
    "pc": "STUDENT-PC-01",
    "session_id": "HACKSPRINT-DEMO",
    "ws_url": "ws://127.0.0.1:8000/ws/student",
    "capture_interval": 2.0,
    "max_frame_width": 1280,
    "jpeg_quality": 60,
    "heartbeat_interval": 15.0,
    "reconnect_base_delay": 1.0,
    "reconnect_max_delay": 60.0,
    "reconnect_max_attempts": 0,
}


def _write_config(data, tmp_path):
    path = tmp_path / "agent_config.json"
    path.write_text(json.dumps(data), encoding="utf-8")
    return path


class TestValidConfig:
    def test_from_dict(self):
        cfg = AgentConfig(**VALID)
        assert cfg.student_id == "22CS101"
        assert cfg.ws_url == VALID["ws_url"]

    def test_from_json_file(self, tmp_path):
        cfg = AgentConfig.from_json_file(_write_config(VALID, tmp_path))
        assert cfg.name == "Shyam Kailash"
        assert cfg.session_id == "HACKSPRINT-DEMO"

    def test_frozen(self):
        cfg = AgentConfig(**VALID)
        with pytest.raises(AttributeError):
            cfg.student_id = "changed"


class TestMissingFields:
    def test_missing_student_id(self, tmp_path, capsys):
        data = {**VALID, "student_id": ""}
        with pytest.raises(SystemExit):
            AgentConfig.from_json_file(_write_config(data, tmp_path))
        assert "student_id" in capsys.readouterr().out

    def test_missing_name(self, tmp_path, capsys):
        data = {**VALID, "name": " "}
        with pytest.raises(SystemExit):
            AgentConfig.from_json_file(_write_config(data, tmp_path))
        assert "name" in capsys.readouterr().out

    def test_missing_ws_url(self, tmp_path, capsys):
        data = VALID.copy()
        data.pop("ws_url")
        with pytest.raises(SystemExit):
            AgentConfig.from_json_file(_write_config(data, tmp_path))
        assert "ws_url" in capsys.readouterr().out

    def test_file_not_found(self, capsys):
        with pytest.raises(SystemExit):
            AgentConfig.from_json_file("/nonexistent/path.json")
        assert "not found" in capsys.readouterr().out

    def test_invalid_json(self, tmp_path, capsys):
        path = tmp_path / "bad.json"
        path.write_text("{bad json", encoding="utf-8")
        with pytest.raises(SystemExit):
            AgentConfig.from_json_file(path)
        assert "invalid JSON" in capsys.readouterr().out


class TestRangeValidation:
    def _assert_file_range_error(self, field, value, tmp_path, capsys):
        with pytest.raises(SystemExit):
            AgentConfig.from_json_file(_write_config({**VALID, field: value}, tmp_path))
        assert field in capsys.readouterr().out

    def test_capture_interval_too_low(self, tmp_path, capsys):
        self._assert_file_range_error("capture_interval", 0.01, tmp_path, capsys)

    def test_jpeg_quality_too_high(self, tmp_path, capsys):
        self._assert_file_range_error("jpeg_quality", 101, tmp_path, capsys)

    def test_max_frame_width_zero(self, tmp_path, capsys):
        self._assert_file_range_error("max_frame_width", 0, tmp_path, capsys)

    def test_heartbeat_negative(self):
        with pytest.raises(ValueError):
            AgentConfig(**{**VALID, "heartbeat_interval": -1.0})

    def test_reconnect_max_attempts_ok(self):
        cfg = AgentConfig(**{**VALID, "reconnect_max_attempts": 50})
        assert cfg.reconnect_max_attempts == 50

    def test_boundary_values_ok(self):
        cfg = AgentConfig(
            **{
                **VALID,
                "capture_interval": 0.1,
                "max_frame_width": 3840,
                "jpeg_quality": 100,
                "reconnect_max_attempts": 0,
            }
        )
        assert cfg.capture_interval == 0.1
