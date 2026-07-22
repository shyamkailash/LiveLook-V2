from fastapi import APIRouter
from app.schemas.student_schema import StudentResponse


router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


@router.get("/")
def student_test():

    return {
        "message": "Student API Working"
    }



@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: str):

    return {
        "student_id": student_id,
        "name": "Rahul",
        "pc": "PC-07",
        "status": "online",
        "active_window": "Chrome"
    }