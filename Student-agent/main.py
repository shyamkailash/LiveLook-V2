"""LiveLook V2 Student Agent entry point."""

import logging
import sys
import threading
from datetime import datetime, timezone

from collectors.screen_capture import capture_frame
from config import AgentConfig
from collectors.active_window import get_active_window
from policy.evaluator import evaluate_activity, load_policy
from transport.websocket_client import StudentWebSocketClient


logger = logging.getLogger(__name__)


def _setup_logging() -> None:
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s [%(levelname)-7s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    for logger_name in ("websocket", "PIL", "mss"):
        logging.getLogger(logger_name).setLevel(logging.WARNING)


def main() -> None:
    _setup_logging()
    config_path = sys.argv[1] if len(sys.argv) > 1 else "agent_config.json"
    cfg = AgentConfig.from_json_file(config_path)

    logger.info(
        "Starting Student Agent: student_id=%s, name=%s, pc=%s, session_id=%s",
        cfg.student_id,
        cfg.name,
        cfg.pc,
        cfg.session_id,
    )
    logger.info(
        "Settings: ws_url=%s, capture_interval=%s, max_frame_width=%s, "
        "jpeg_quality=%s, heartbeat_interval=%s",
        cfg.ws_url,
        cfg.capture_interval,
        cfg.max_frame_width,
        cfg.jpeg_quality,
        cfg.heartbeat_interval,
    )

    def _capture():
        return capture_frame(
            max_width=cfg.max_frame_width,
            jpeg_quality=cfg.jpeg_quality,
        )

    client = StudentWebSocketClient(config=cfg, capture_fn=_capture)

    def _monitor_policy() -> None:
        policy = load_policy()
        last_reported = None
        while not client.wait(2.0):
            activity = get_active_window()
            decision = evaluate_activity(activity, policy)
            activity_key = (
                activity.get("process_name"),
                activity.get("window_title"),
            )
            if decision.get("status") != "blocked":
                last_reported = None
                continue
            if activity_key == last_reported:
                continue
            evidence_frame = _capture()
            incident = {
                "incident_type": "unauthorized_application",
                "severity": "high",
                "description": decision.get("reason", "Unauthorized application detected"),
                "detected_at": datetime.now(timezone.utc).isoformat(),
            }
            if evidence_frame:
                incident["evidence_frame"] = evidence_frame
            if client.send_incident(incident):
                last_reported = activity_key

    threading.Thread(
        target=_monitor_policy,
        name="policy-monitor",
        daemon=True,
    ).start()
    try:
        client.run()
    except KeyboardInterrupt:
        pass
    finally:
        client.stop()
        logger.info("Student Agent shutdown complete")


if __name__ == "__main__":
    main()
