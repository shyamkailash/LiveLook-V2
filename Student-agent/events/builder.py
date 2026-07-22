from datetime import datetime, timezone
from uuid import uuid4


SEVERITY_MAP = {
    "blocked": "high",
    "warning": "medium",
    "allowed": "low",
}


def build_activity_event(activity, decision):
    status = decision.get("status", "warning")

    return {
        "event_id": str(uuid4()),
        "event_type": "policy_violation",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "severity": SEVERITY_MAP.get(status, "medium"),
        "process_name": activity.get("process_name", "unknown"),
        "window_title": activity.get("window_title", ""),
        "reason": decision.get("reason", "No reason provided"),
        "sync_status": "pending",
        "retry_count": 0,
    }