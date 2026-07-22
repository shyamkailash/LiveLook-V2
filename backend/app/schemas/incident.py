from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class IncidentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    student_id: str = Field(min_length=1, max_length=100)
    session_id: str = Field(min_length=1, max_length=100)
    student_name: str = Field(min_length=1, max_length=200)
    pc: str = Field(min_length=1, max_length=200)
    incident_type: Literal["unauthorized_application"]
    severity: Literal["low", "medium", "high", "critical"] = "high"
    confidence: float | None = Field(default=None, ge=0, le=1)
    description: str = Field(min_length=1, max_length=1000)
    detected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source: Literal["automatic", "manual"] = "automatic"
    evidence_frame: str | None = None

    @field_validator("detected_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)


class IncidentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    resolved: bool


class ReportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    format: Literal["pdf", "csv"] = "pdf"
    session_id: str | None = Field(default=None, max_length=100)
    student_id: str | None = Field(default=None, max_length=100)
