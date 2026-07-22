import base64
import io

import mss
import pytest
from PIL import Image

from collectors.screen_capture import capture_frame


def _capture_or_skip(**kwargs):
    result = capture_frame(**kwargs)
    if result is None:
        pytest.skip("No monitor available")
    return result


class TestCaptureFrame:
    def test_returns_base64_string(self):
        result = _capture_or_skip(max_width=640, jpeg_quality=50)
        decoded = base64.b64decode(result)
        assert isinstance(result, str)
        assert len(decoded) > 0

    def test_output_is_jpeg(self):
        result = _capture_or_skip()
        image = Image.open(io.BytesIO(base64.b64decode(result)))
        assert image.format == "JPEG"

    def test_no_data_url_prefix(self):
        result = _capture_or_skip()
        assert not result.startswith("data:")

    def test_respected_max_width(self):
        result = _capture_or_skip(max_width=320)
        image = Image.open(io.BytesIO(base64.b64decode(result)))
        assert image.width <= 320
        assert image.height <= 320

    def test_different_quality_produces_different_sizes(self):
        low = _capture_or_skip(jpeg_quality=10)
        high = _capture_or_skip(jpeg_quality=95)
        assert len(base64.b64decode(low)) < len(base64.b64decode(high))

    def test_none_on_error_graceful(self, monkeypatch):
        def fail():
            raise RuntimeError("capture unavailable")

        monkeypatch.setattr(mss, "mss", fail)
        assert capture_frame() is None
