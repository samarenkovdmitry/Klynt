"""Достаёт последний CDP-скриншот из логов браузера и сохраняет PNG."""
import base64
import glob
import json
import os
import sys

LOGS = os.path.expanduser("~/.cursor/browser-logs")
out = sys.argv[1] if len(sys.argv) > 1 else "render/poster.png"

files = sorted(
    glob.glob(os.path.join(LOGS, "cdp-response-Page.captureScreenshot-*.json")),
    key=os.path.getmtime,
)
if not files:
    sys.exit("нет файлов скриншотов")

data = json.load(open(files[-1]))
while isinstance(data, dict) and "data" not in data:
    data = next(v for v in data.values() if isinstance(v, (dict, list)))
b64 = data["data"] if isinstance(data, dict) else data

os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
with open(out, "wb") as f:
    f.write(base64.b64decode(b64))

from PIL import Image

print(out, Image.open(out).size, os.path.getsize(out) // 1024, "KB")
