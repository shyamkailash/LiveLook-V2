from pydantic import BaseModel
from typing import Optional


class StudentBase(BaseModel):

    student_id: str
    name: str
    pc: Optional[str] = None


class StudentResponse(StudentBase):

    status: str
    active_window: Optional[str] = None