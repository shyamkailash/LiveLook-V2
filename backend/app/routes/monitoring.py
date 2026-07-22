from fastapi import APIRouter, Depends

from app.dependencies.auth import verify_token
from app.services.connection_manager import manager
from app.schemas.monitoring_schema import (
    MonitoringResponse,
    ViolationResponse
)


router = APIRouter(
    prefix="/monitoring",
    tags=["Monitoring"],
    dependencies=[Depends(verify_token)]
)


# ==========================
# Monitoring API Test
# ==========================

@router.get("/")
def monitoring_test():

    return {
        "message": "Monitoring API Working"
    }


# ==========================
# Get All Live Students
# ==========================

@router.get("/students")
def live_students():

    return {
        "students": manager.get_students()
    }


# ==========================
# Get One Student
# ==========================

@router.get(
    "/student/{student_id}",
    response_model=MonitoringResponse
)
def student_monitor(student_id: str):

    if student_id not in manager.students:

        return {
            "student_id": student_id,
            "status": "offline",
            "frame_available": False
        }

    student = manager.students[student_id]

    return {

        "student_id": student["student_id"],
        "status": student["status"],
        "frame_available": student["frame"] is not None

    }


# ==========================
# Get All Violations
# ==========================

@router.get(
    "/violations",
    response_model=list[ViolationResponse]
)
def get_violations():

    return manager.violations