from io import BytesIO

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.incident import ReportRequest
from app.services.incident_store import incident_store
from app.services.report_generator import generate_csv, generate_pdf


router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("/generate")
def generate_report(payload: ReportRequest):
    incidents = incident_store.filtered(payload.session_id, payload.student_id)
    if payload.format == "csv":
        content = generate_csv(incidents)
        media_type = "text/csv; charset=utf-8"
    else:
        content = generate_pdf(incidents)
        media_type = "application/pdf"
    filename = f"livelook-incidents.{payload.format}"
    return StreamingResponse(
        BytesIO(content),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
