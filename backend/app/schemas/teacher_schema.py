from pydantic import BaseModel



class TeacherBase(BaseModel):

    teacher_id: str
    name: str



class TeacherResponse(TeacherBase):

    status: str