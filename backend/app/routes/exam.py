from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import verify_token
from app.schemas.exam_schema import (
    ExamCreate,
    ExamResponse,
    ExamDetail,
    JoinExam,
    LeaveExam
)
from app.services.exam_service import exam_service


router = APIRouter(
    prefix="/exam",
    tags=["Exam"],
    dependencies=[Depends(verify_token)]
)


# ==========================
# Exam API Test
# ==========================

@router.get("/")
def exam_test():

    return {
        "message": "Exam API Working"
    }


# ==========================
# Create Exam
# ==========================

@router.post(
    "/create",
    response_model=ExamResponse
)
def create_exam(data: ExamCreate):
    return exam_service.create_exam(
        title=data.title,
        subject=data.subject,
        teacher=data.teacher,
        duration=data.duration,
        allowed_apps=data.allowed_apps
    )
    

# ==========================
# Get All Exams
# ==========================

@router.get(
    "/all",
    response_model=list[ExamResponse]
)
def get_all_exams():

    return exam_service.get_all_exams()


# ==========================
# Get Exam By ID
# ==========================

@router.get(
    "/{exam_id}",
    response_model=ExamDetail
)
def get_exam(exam_id: str):

    exam = exam_service.get_exam(exam_id)

    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    return exam
# ==========================
# Get Allowed Applications
# ==========================

@router.get("/{exam_id}/allowed-apps")
def get_allowed_apps(exam_id: str):

    exam = exam_service.get_exam(exam_id)

    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    return {
        "exam_id": exam_id,
        "allowed_apps": exam["allowed_apps"]
    }

# ==========================
# Start Exam
# ==========================

@router.post("/{exam_id}/start")
def start_exam(exam_id: str):

    exam = exam_service.start_exam(exam_id)

    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    return {
        "message": "Exam started",
        "exam": exam
    }


# ==========================
# End Exam
# ==========================

@router.post("/{exam_id}/end")
def end_exam(exam_id: str):

    exam = exam_service.end_exam(exam_id)

    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    return {
        "message": "Exam ended",
        "exam": exam
    }


# ==========================
# Join Exam
# ==========================

@router.post("/{exam_id}/join")
def join_exam(
    exam_id: str,
    data: JoinExam
):

    exam = exam_service.join_exam(
        exam_id,
        data.student_id
    )

    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    return {
        "message": "Student joined exam",
        "exam": exam
    }


# ==========================
# Leave Exam
# ==========================

@router.post("/{exam_id}/leave")
def leave_exam(
    exam_id: str,
    data: LeaveExam
):

    exam = exam_service.leave_exam(
        exam_id,
        data.student_id
    )

    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    return {
        "message": "Student left exam",
        "exam": exam
    }