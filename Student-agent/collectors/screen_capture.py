"""Primary-monitor screen capture and JPEG encoding."""

import base64
import io
import logging
from typing import Optional

import mss
from PIL import Image


logger = logging.getLogger(__name__)


def capture_frame(max_width: int = 1280, jpeg_quality: int = 60) -> Optional[str]:
    screen = None
    try:
        screen = mss.mss()
        if len(screen.monitors) < 2:
            logger.warning("No primary physical monitor available")
            return None

        raw = screen.grab(screen.monitors[1])
        image = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")

        width, height = image.size
        if width > max_width or height > max_width:
            ratio = min(max_width / width, max_width / height)
            resized_size = (max(1, int(width * ratio)), max(1, int(height * ratio)))
            image = image.resize(resized_size, Image.Resampling.LANCZOS)

        output = io.BytesIO()
        image.save(output, format="JPEG", quality=jpeg_quality)
        return base64.b64encode(output.getvalue()).decode("ascii")
    except Exception:
        logger.exception("Screen capture failed")
        return None
    finally:
        if screen is not None:
            try:
                screen.close()
            except Exception:
                logger.exception("Screen capture cleanup failed")
