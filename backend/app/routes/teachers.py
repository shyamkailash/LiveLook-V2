from fastapi import APIRouter
from app.schemas.teacher_schema import TeacherResponse


router = APIRouter(
    prefix="/teachers",
    tags=["Teachers"]
)


@router.get("/")
def teacher_test():

    return {
        "message": "Teacher API Working"
    }


@router.get("/{teacher_id}", response_model=TeacherResponse)
def get_teacher(teacher_id: str):

    return {
        "teacher_id": teacher_id,
        "name": "Faculty Admin",
        "status": "active"
    }


@router.get("/{teacher_id}/students")
def get_teacher_students(teacher_id: str):

    return {
        "teacher_id": teacher_id,
        "students": []
    }