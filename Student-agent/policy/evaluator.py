import json
from pathlib import Path


POLICY_PATH = Path(__file__).resolve().parent.parent / "mock_policy.json"


def load_policy():
    with POLICY_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def evaluate_activity(activity, policy):
    process_name = activity.get("process_name", "").lower()
    window_title = activity.get("window_title", "").lower()

    blocked_processes = {
        item.lower() for item in policy.get("blocked_processes", [])
    }

    allowed_processes = {
        item.lower() for item in policy.get("allowed_processes", [])
    }

    blocked_keywords = [
        item.lower()
        for item in policy.get("blocked_window_keywords", [])
    ]

    if process_name in blocked_processes:
        return {
            "status": "blocked",
            "reason": f"Blocked application detected: {process_name}",
        }

    for keyword in blocked_keywords:
        if keyword in window_title:
            return {
                "status": "blocked",
                "reason": f"Blocked window keyword detected: {keyword}",
            }

    if process_name in allowed_processes:
        return {
            "status": "allowed",
            "reason": f"Approved application: {process_name}",
        }

    return {
        "status": "warning",
        "reason": f"Application is not defined in policy: {process_name}",
    }