#!/usr/bin/env python3
"""Build OSO app icons directly from the approved character artwork in play/index.html.

Usage: python tools/build_oso_icons.py
Requires: Pillow (pip install pillow)
No new character artwork is generated or substituted.
"""
from __future__ import annotations

import base64
import io
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "play" / "index.html"
ICONS = ROOT / "play" / "icons"
SIGNATURE = re.compile(
    r'<img class="cleanChar cleanOso" src="data:image/webp;base64,([^"]+)"'
)


def source_image() -> Image.Image:
    markup = HTML.read_text(encoding="utf-8")
    match = SIGNATURE.search(markup)
    if match is None:
        raise RuntimeError("Approved OSO source image was not found in play/index.html")
    raw = base64.b64decode(match.group(1), validate=True)
    return Image.open(io.BytesIO(raw)).convert("RGBA")


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ]
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def icon(source: Image.Image, *, maskable: bool = False) -> Image.Image:
    size = 512
    out = Image.new("RGBA", (size, size), "#f4b833")
    draw = ImageDraw.Draw(out)
    draw.rounded_rectangle((0, 0, 511, 511), radius=108, fill="#ffd354")
    # Maskable icons keep the character and title in the central safe area.
    if maskable:
        circle = (104, 83, 408, 387)
        image_area = (132, 111, 380, 350)
        title_y, text_size = 374, 39
    else:
        circle = (62, 46, 450, 430)
        image_area = (94, 58, 418, 407)
        title_y, text_size = 427, 56
    draw.ellipse(circle, fill="#fff1c8", outline="#75462d", width=9)
    left, top, right, bottom = image_area
    character = source.copy()
    character.thumbnail((right-left, bottom-top), Image.Resampling.LANCZOS)
    x = (left+right-character.width)//2
    y = bottom-character.height
    out.alpha_composite(character, (x, y))
    box = ((512 - (276 if maskable else 362)) // 2, title_y, (512 + (276 if maskable else 362)) // 2, title_y + (62 if maskable else 74))
    draw.rounded_rectangle(box, radius=29, fill="#69452b")
    face = font(text_size)
    bounds = draw.textbbox((0, 0), "OSO!", font=face, stroke_width=0)
    w = bounds[2] - bounds[0]
    h = bounds[3] - bounds[1]
    draw.text((256-w/2, title_y + (box[3]-box[1]-h)/2 - bounds[1]), "OSO!", font=face, fill="#fff8de")
    return out


def main() -> None:
    source = source_image()
    ICONS.mkdir(parents=True, exist_ok=True)
    normal = icon(source)
    normal.resize((192, 192), Image.Resampling.LANCZOS).convert("RGB").save(ICONS / "oso-192.png", "PNG", optimize=True)
    normal.convert("RGB").save(ICONS / "oso-512.png", "PNG", optimize=True)
    icon(source, maskable=True).convert("RGB").save(ICONS / "oso-maskable-512.png", "PNG", optimize=True)
    for name in ("oso-192.png", "oso-512.png", "oso-maskable-512.png"):
        file = ICONS / name
        with Image.open(file) as im:
            im.verify()
        print(f"{name}: {file.stat().st_size} bytes")


if __name__ == "__main__":
    main()
