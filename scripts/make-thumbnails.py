# -*- coding: utf-8 -*-
"""Render a preview image for every certificate PDF.

Run after scripts/sync-certificates.py, whenever a certificate is added or
replaced:

    pip install pymupdf pillow
    python scripts/make-thumbnails.py

WHY THESE EXIST. The certificate cards used to be a title and a subtitle on a
panel, and the only thing marking them as openable was a background shift on
hover. The hover preview shows the document itself, which needs no explaining.

WHY NOT THE PDF. A PDF in an iframe is the wrong tool for a preview twice over:
each of these is about 900 KB where the image is 13, and iOS Safari does not
reliably render one anyway. The image is 70x lighter and renders everywhere.

WHY 560px. The panel is 280 CSS pixels wide, so this is 2x for a retina screen.
Rendering at 1120 and downsampling with LANCZOS gives noticeably sharper text
than rendering straight to 560, and the file is small either way.

WHY BOTH LANGUAGES. The PT and EN certificates are different documents, not the
same document with a different label, so the preview follows the language the
visitor is reading, the same way the modal and the download links already do.
"""
import io
import os
import sys

try:
    import pymupdf
    from PIL import Image
except ImportError:
    sys.exit("pip install pymupdf pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "certificados")
WIDTH = 560
QUALITY = 72


def main():
    total = count = 0
    for lang in ("pt", "en"):
        src = os.path.join(SRC, lang)
        out = os.path.join(SRC, "thumbs", lang)
        if not os.path.isdir(src):
            sys.exit(f"missing {src} -- run scripts/sync-certificates.py first")
        os.makedirs(out, exist_ok=True)

        for name in sorted(os.listdir(src)):
            if not name.lower().endswith(".pdf"):
                continue
            slug = os.path.splitext(name)[0]
            doc = pymupdf.open(os.path.join(src, name))
            page = doc[0]
            zoom = (WIDTH * 2) / page.rect.width
            pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
            height = round(WIDTH * page.rect.height / page.rect.width)
            img = img.resize((WIDTH, height), Image.LANCZOS)
            dst = os.path.join(out, slug + ".webp")
            img.save(dst, "WEBP", quality=QUALITY, method=6)
            doc.close()
            total += os.path.getsize(dst)
            count += 1
            print(f"  {lang}/{slug}.webp  {os.path.getsize(dst) // 1024} KB")

    if not count:
        sys.exit("no PDFs found")
    print(f"\n{count} thumbnails, {total // 1024} KB total")


if __name__ == "__main__":
    main()
