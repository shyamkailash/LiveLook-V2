from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ExamCreate(BaseModel):

    title: str
    subject: str
    teacher: str
    duration: int
    allowed_apps: list[str]

class ExamResponse(BaseModel):
    exam_id: str
    title: str
    subject: str
    teacher: str
    duration: int
    allowed_apps: list[str]
    status: str


class ExamDetail(BaseModel):

    exam_id: str
    title: str
    subject: str
    teacher: str
    duration: int
    allowed_apps: list[str]
    status: str

    students: list[str]

    created_at: datetime

    started_at: Optional[datetime] = None

    ended_at: Optional[datetime] = None


class JoinExam(BaseModel):

    student_id: str


class LeaveExam(BaseModel):

    student_id: str