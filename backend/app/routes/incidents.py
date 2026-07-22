from fastapi import APIRouter, HTTPException

from app.schemas.incident import IncidentCreate, IncidentUpdate
from app.services.connection_manager import manager
from app.services.incident_store import incident_store


router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.get("")
def list_incidents():
    return incident_store.list()


@router.post("", status_code=201)
async def create_incident(payload: IncidentCreate):
    try:
        incident = incident_store.create(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    await manager.broadcast({"type": "incident", "incident": incident})
    return incident


@router.patch("/{incident_id}")
def update_incident(incident_id: str, payload: IncidentUpdate):
    incident = incident_store.update(incident_id, payload.resolved)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident
