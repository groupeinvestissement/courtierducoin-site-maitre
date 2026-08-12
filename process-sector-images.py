from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare generated sector images as 1600x900 WebP files.")
    parser.add_argument("--mapping", action="append", required=True, help="SOURCE=DESTINATION")
    parser.add_argument("--quality", type=int, default=86)
    args = parser.parse_args()

    for item in args.mapping:
        source_text, destination_text = item.split("=", 1)
        source = Path(source_text)
        destination = Path(destination_text)
        destination.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            prepared = ImageOps.fit(image, (1600, 900), method=Image.Resampling.LANCZOS)
            prepared.save(destination, "WEBP", quality=args.quality, method=6)
        print(f"Prepared {destination}")


if __name__ == "__main__":
    main()
