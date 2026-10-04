"""Подготовка логотипов: снятие чёрного фона в альфу + моно-версии."""
from PIL import Image, ImageChops, ImageMath
import os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logos")


def unblack(path, out):
    """Логотип на чёрном фоне -> RGBA с альфой (обратная операция screen)."""
    r, g, b = Image.open(path).convert("RGB").split()
    alpha = ImageChops.lighter(ImageChops.lighter(r, g), b)
    chans = [
        ImageMath.eval("convert(c * 255 / (a + 1), 'L')", c=c, a=alpha)
        for c in (r, g, b)
    ]
    Image.merge("RGBA", chans + [alpha]).save(out)
    return out


def mono(path, out, color):
    im = Image.open(path).convert("RGBA")
    alpha = im.split()[3]
    flat = Image.new("RGBA", im.size, color + (0,))
    flat.putalpha(alpha)
    flat.save(out)


def trim(path):
    im = Image.open(path).convert("RGBA")
    bbox = im.split()[3].getbbox()
    if bbox:
        im.crop(bbox).save(path)
    print(os.path.basename(path), Image.open(path).size)


p = os.path.join
unblack(p(BASE, "ktk-talent.png"), p(BASE, "ktk-talent-rgba.png"))
unblack(p(BASE, "ktk-white.png"), p(BASE, "ktk-white-rgba.png"))

mono(p(BASE, "ktk-talent-rgba.png"), p(BASE, "ktk-talent-white.png"), (255, 255, 255))
mono(p(BASE, "ktk-white-rgba.png"), p(BASE, "ktk-corp-navy.png"), (12, 27, 61))
mono(p(BASE, "ktk30-black.png"), p(BASE, "ktk30-white.png"), (255, 255, 255))
mono(p(BASE, "ktk30-black.png"), p(BASE, "ktk30-navy.png"), (12, 27, 61))

for f in [
    "ktk-talent-rgba.png",
    "ktk-talent-white.png",
    "ktk-white-rgba.png",
    "ktk-corp-navy.png",
    "ktk30-white.png",
    "ktk30-navy.png",
    "ktk30-color.png",
    "ktk30-black.png",
]:
    trim(p(BASE, f))
