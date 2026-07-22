"""LiveLook V2 Student Agent entry point."""

import logging
import sys

from collectors.screen_capture import capture_frame
from config import AgentConfig
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
    try:
        client.run()
    except KeyboardInterrupt:
        pass
    finally:
        client.stop()
        logger.info("Student Agent shutdown complete")


if __name__ == "__main__":
    main()
