import io
import os
import sys
from pathlib import Path

import pytest
from PIL import Image
from starlette.datastructures import UploadFile

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.utils import image_handler


pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend():
    return "asyncio"


async def test_save_uploaded_file_creates_image_and_thumbnail(tmp_path, monkeypatch):
    """A small PNG upload should be saved and converted to JPEG with a thumbnail."""

    upload_dir = tmp_path / "uploads"
    thumb_dir = upload_dir / "thumbnails"

    # Redirect image handler paths into the test temp directory
    monkeypatch.setattr(image_handler, "UPLOAD_DIR", str(upload_dir))
    monkeypatch.setattr(image_handler, "THUMBNAIL_DIR", str(thumb_dir))

    image_handler.create_upload_dir()

    # Build a simple in-memory PNG for upload
    img_bytes = io.BytesIO()
    with Image.new("RGB", (640, 480), color="red") as img:
        img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    upload = UploadFile(
        filename="test.png",
        file=img_bytes,
        headers={"content-type": "image/png"},
    )

    result = await image_handler.save_uploaded_file(upload)

    saved_path = image_handler.get_image_path(result["filename"])
    thumb_path = image_handler.get_thumbnail_path(result["filename"])

    assert os.path.exists(saved_path)
    assert os.path.exists(thumb_path)
    assert result["content_type"] == "image/jpeg"
    assert result["original_filename"] == "test.png"
