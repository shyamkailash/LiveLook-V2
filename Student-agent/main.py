"""LiveLook V2 Student Agent entry point."""

import logging
import sys

from collectors.screen_capture import capture_frame
from collectors.active_window import get_active_window

from config import AgentConfig

from transport.websocket_client import StudentWebSocketClient
from transport.api_client import get_allowed_apps

from policy.evaluator import evaluate_activity


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

    config_path = (
        sys.argv[1]
        if len(sys.argv) > 1
        else "agent_config.json"
    )

    cfg = AgentConfig.from_json_file(config_path)

    # Fetch allowed applications from backend
    allowed_apps = get_allowed_apps(cfg, cfg.session_id)

    logger.info("Allowed Apps: %s", allowed_apps)

    # Check current active window
    activity = {
        "process_name": get_active_window(),
        "window_title": get_active_window(),
    }

    result = evaluate_activity(activity, allowed_apps)

    logger.info(result["reason"])

    logger.info(
        "Starting Student Agent: student_id=%s, name=%s, pc=%s, session_id=%s",
        cfg.student_id,
        cfg.name,
        cfg.pc,
        cfg.session_id,
    )

    def _capture():
        return capture_frame(
            max_width=cfg.max_frame_width,
            jpeg_quality=cfg.jpeg_quality,
        )

    client = StudentWebSocketClient(
        config=cfg,
        capture_fn=_capture,
    )

    try:
        client.run()

    except KeyboardInterrupt:
        pass

    finally:
        client.stop()
        logger.info("Student Agent shutdown complete")


if __name__ == "__main__":
    main()