import requests

from config import AgentConfig


def get_allowed_apps(cfg: AgentConfig, exam_id: str):
    # Convert ws://... to http://...
    backend_url = cfg.ws_url.replace("ws://", "http://").replace(
        "/ws/student", ""
    )

    try:
        response = requests.get(
            f"{backend_url}/exam/{exam_id}/allowed-apps"
        )

        if response.status_code == 200:
            return response.json()["allowed_apps"]

    except Exception as e:
        print("Failed to fetch allowed apps:", e)

    return []