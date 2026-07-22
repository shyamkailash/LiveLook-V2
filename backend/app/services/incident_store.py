"""Small local persistence fallback for the hackathon MVP."""

from __future__ import annotations

import base64
import binascii
import json
import os
import threading
from pathlib import Path
from typing import Any
from uuid import uuid4

from app.schemas.incident import IncidentCreate


MAX_EVIDENCE_BYTES = 2 * 1024 * 1024
DATA_DIR = Path(
    os.getenv(
        "LIVELOOK_DATA_DIR",
        Path(__file__).resolve().parents[2] / "data",
    )
)


class IncidentStore:
    def __init__(self, data_dir: Path = DATA_DIR) -> None:
        self.data_dir = data_dir
        self.incidents_path = data_dir / "incidents.json"
        self.evidence_dir = data_dir / "evidence"
        self._lock = threading.Lock()

    @property
    def backend_name(self) -> str:
        return "local_json_development_fallback"

    def list(self) -> list[dict[str, Any]]:
        with self._lock:
            return [self._public(item) for item in self._read()]

    def create(self, payload: IncidentCreate) -> dict[str, Any]:
        incident_id = str(uuid4())
        incident = payload.model_dump(mode="json", exclude={"evidence_frame"})
        incident.update(
            {
                "incident_id": incident_id,
                "resolved": False,
                "evidence_available": False,
                "storage_backend": self.backend_name,
            }
        )
        if payload.evidence_frame:
            evidence_path = self._save_evidence(incident_id, payload.evidence_frame)
            incident["evidence_path"] = str(evidence_path)
            incident["evidence_available"] = True

        with self._lock:
            incidents = self._read()
            incidents.append(incident)
            self._write(incidents)
        return self._public(incident)

    def update(self, incident_id: str, resolved: bool) -> dict[str, Any] | None:
        with self._lock:
            incidents = self._read()
            for incident in incidents:
                if incident.get("incident_id") == incident_id:
                    incident["resolved"] = resolved
                    self._write(incidents)
                    return self._public(incident)
        return None

    def filtered(
        self,
        session_id: str | None = None,
        student_id: str | None = None,
    ) -> list[dict[str, Any]]:
        return [
            incident
            for incident in self.list()
            if (not session_id or incident["session_id"] == session_id)
            and (not student_id or incident["student_id"] == student_id)
        ]

    def _read(self) -> list[dict[str, Any]]:
        if not self.incidents_path.exists():
            return []
        try:
            value = json.loads(self.incidents_path.read_text(encoding="utf-8"))
            return value if isinstance(value, list) else []
        except (json.JSONDecodeError, OSError):
            return []

    def _write(self, incidents: list[dict[str, Any]]) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)
        temporary = self.incidents_path.with_suffix(".tmp")
        temporary.write_text(
            json.dumps(incidents, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temporary.replace(self.incidents_path)

    def _save_evidence(self, incident_id: str, encoded: str) -> Path:
        payload = encoded.split(",", 1)[1] if encoded.startswith("data:") else encoded
        try:
            content = base64.b64decode(payload, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise ValueError("evidence_frame must be valid Base64 JPEG data") from exc
        if len(content) > MAX_EVIDENCE_BYTES:
            raise ValueError("evidence_frame exceeds the 2 MiB limit")
        if not content.startswith(b"\xff\xd8"):
            raise ValueError("evidence_frame must contain a JPEG image")
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        path = self.evidence_dir / f"{incident_id}.jpg"
        path.write_bytes(content)
        return path

    @staticmethod
    def _public(incident: dict[str, Any]) -> dict[str, Any]:
        return {key: value for key, value in incident.items() if key != "evidence_path"}


incident_store = IncidentStore()
