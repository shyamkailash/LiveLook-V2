from pydantic import BaseModel
from typing import Optional



class ViolationResponse(BaseModel):

    student_id: str
    name: str
    type: str
    time: str



class MonitoringResponse(BaseModel):

    student_id: str
    status: str
    frame_available: bool