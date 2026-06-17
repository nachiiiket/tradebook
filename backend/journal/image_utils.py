import base64
from io import BytesIO

from django.conf import settings
from PIL import Image


def compress_image(image_file, max_dimension=None, quality=None):
    max_dimension = max_dimension or settings.TRADE_IMAGE_MAX_DIMENSION
    quality = quality or settings.TRADE_IMAGE_QUALITY

    img = Image.open(image_file)
    width, height = img.size

    if max(width, height) > max_dimension:
        ratio = max_dimension / max(width, height)
        new_size = (int(width * ratio), int(height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        width, height = new_size

    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=quality, optimize=True)
    data = buffer.getvalue()

    return data, width, height, "image/jpeg"


def image_to_base64(image_bytes):
    return base64.b64encode(image_bytes).decode("utf-8")


def base64_to_image(b64_string):
    return base64.b64decode(b64_string)
