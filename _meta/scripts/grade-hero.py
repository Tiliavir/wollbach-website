"""Colour-grade the hero photo: less yellow, more green, more contrast.
usage: python3 -I grade-hero.py SRC DST [hue_shift saturation_green contrast]
static/img/top-hero.jpg was made with: grade-hero.py static/img/top.jpg static/img/top-hero.jpg 30 1.4 0.6"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
hue_shift = float(sys.argv[3]) if len(sys.argv) > 3 else 22.0   # degrees, yellow -> green
sat_green = float(sys.argv[4]) if len(sys.argv) > 4 else 1.35
contrast = float(sys.argv[5]) if len(sys.argv) > 5 else 0.55   # S-curve strength 0..1

im = Image.open(src).convert("RGB")
hsv = np.asarray(im.convert("HSV")).astype(np.float32)
h = hsv[..., 0] * 360 / 255
s = hsv[..., 1] / 255
v = hsv[..., 2] / 255

# 1) pull yellow/olive hues (30..75 deg) towards green, strongest around 55 deg
w_yellow = np.clip(1 - np.abs(h - 55) / 28, 0, 1)
h = h + hue_shift * w_yellow

# 2) boost saturation in the (now) green range 70..150 deg, not in sky/roofs
w_green = np.clip(1 - np.abs(h - 105) / 50, 0, 1)
s = np.clip(s * (1 + (sat_green - 1) * w_green), 0, 1)
# tame remaining warm browns a little
w_brown = np.clip(1 - np.abs(h - 30) / 20, 0, 1)
s = s * (1 - 0.15 * w_brown)

hsv2 = np.stack([h / 360 * 255 % 256, s * 255, v * 255], -1).astype(np.uint8)
rgb = np.asarray(Image.fromarray(hsv2, "HSV").convert("RGB")).astype(np.float32) / 255

# 3) cool the haze: reduce yellow cast in highlights (more blue, less red)
lum = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
hi = np.clip((lum - 0.55) / 0.45, 0, 1)[..., None]
rgb = rgb + hi * np.array([-0.03, 0.0, 0.05], dtype=np.float32)

# 4) contrast: blend with a smoothstep S-curve around the mean
mid = float(lum.mean())
x = np.clip(rgb, 0, 1)
t = np.clip((x - mid) / 0.9 + 0.5, 0, 1)
s_curve = mid + (t * t * (3 - 2 * t) - 0.5) * 0.9
rgb = np.clip(x * (1 - contrast) + s_curve * contrast, 0, 1)

out = Image.fromarray((rgb * 255 + 0.5).astype(np.uint8))
out = out.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
out.save(dst, quality=86, optimize=True, progressive=True)
print("saved", dst, out.size)
