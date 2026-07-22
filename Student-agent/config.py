"""Configuration loading and validation for the Student Agent."""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, fields
from pathlib import Path
from typing import Any


def _range(name: str, value: int | float, lo: int | float, hi: int | float) -> None:
    if not lo <= value <= hi:
        raise ValueError(
            f"Configuration error: '{name}' must be between {lo} and {hi} "
            f"(got {value})."
        )


def _extract_missing_fields(exc: TypeError, cls: type) -> list[str]:
    """Extract missing dataclass constructor arguments from a TypeError."""
    message = str(exc)
    quoted_names = re.findall(r"['\"]([^'\"]+)['\"]", message)
    valid_names = {field.name for field in fields(cls)}
    return [name for name in quoted_names if name in valid_names]


@dataclass(frozen=True)
class AgentConfig:
    student_id: str
    name: str
    pc: str
    session_id: str
    ws_url: str
    capture_interval: float
    max_frame_width: int
    jpeg_quality: int
    heartbeat_interval: float
    reconnect_base_delay: float
    reconnect_max_delay: float
    reconnect_max_attempts: int

    def __post_init__(self) -> None:
        for name in ("student_id", "name", "pc", "session_id", "ws_url"):
            value = getattr(self, name)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(
                    f"Configuration error: '{name}' is required and must be non-empty."
                )

        _range("capture_interval", self.capture_interval, 0.1, 60.0)
        _range("max_frame_width", self.max_frame_width, 64, 3840)
        _range("jpeg_quality", self.jpeg_quality, 1, 100)
        _range("heartbeat_interval", self.heartbeat_interval, 1.0, 120.0)
        _range("reconnect_base_delay", self.reconnect_base_delay, 0.1, 30.0)
        _range("reconnect_max_delay", self.reconnect_max_delay, 1.0, 300.0)
        _range("reconnect_max_attempts", self.reconnect_max_attempts, 0, 100)

    @classmethod
    def from_json_file(cls, path: str | Path) -> AgentConfig:
        config_path = Path(path)
        if not config_path.exists():
            print(f"[CONFIG] Error: configuration file not found: {path}")
            sys.exit(1)

        try:
            with config_path.open("r", encoding="utf-8") as file:
                raw: dict[str, Any] = json.load(file)
        except json.JSONDecodeError as exc:
            print(f"[CONFIG] Error: invalid JSON in {path}: {exc}")
            sys.exit(1)

        try:
            return cls(**raw)
        except TypeError as exc:
            missing = _extract_missing_fields(exc, cls)
            print(f"[CONFIG] Error: {exc}")
            if missing:
                print(f"[CONFIG] Missing fields: {', '.join(missing)}")
            sys.exit(1)
        except ValueError as exc:
            print(exc)
            sys.exit(1)
