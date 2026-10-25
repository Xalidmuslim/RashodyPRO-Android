#!/usr/bin/env python3
"""Install approved matte Rashody PRO launcher icons from the offline asset bundle."""
from pathlib import Path
import shutil
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
DEST = (Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT) / 'android/app/src/main/res'
BUNDLE = ROOT / 'assets/launcher-icons.zip'
DENSITIES = ('mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi')
REQUIRED = {
    *(f'mipmap-{density}/{name}' for density in DENSITIES
      for name in ('ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png')),
    'mipmap-anydpi-v26/ic_launcher.xml',
    'mipmap-anydpi-v26/ic_launcher_round.xml',
    'drawable/ic_launcher_monochrome.xml',
    'values/launcher_icon_colors.xml',
}

if not DEST.is_dir():
    raise SystemExit(f'Android resources directory not found: {DEST}. Run npx cap add android first.')
if not BUNDLE.is_file():
    raise SystemExit(f'Approved icon bundle not found: {BUNDLE}')

with zipfile.ZipFile(BUNDLE) as archive:
    found = {item.filename for item in archive.infolist() if not item.is_dir()}
    if found != REQUIRED or archive.testzip() is not None:
        raise SystemExit('Icon bundle is incomplete or corrupt. Refusing to modify resources.')
    for name in sorted(REQUIRED):
        target = DEST / name
        target.parent.mkdir(parents=True, exist_ok=True)
        with archive.open(name) as src, target.open('wb') as out:
            shutil.copyfileobj(src, out)
    print(f'Installed approved Rashody PRO launcher icons: {len(REQUIRED)} resources')

# Android adaptive masks often crop the edges of the original foreground.
# Use a reduced artwork layer, while making legacy icons truly rounded/transparent.
def refine_launcher_icons():
    from PIL import Image, ImageDraw
    from io import BytesIO
    for density in DENSITIES:
        folder = DEST / f'mipmap-{density}'
        foreground = folder / 'ic_launcher_foreground.png'
        legacy = folder / 'ic_launcher.png'
        round_icon = folder / 'ic_launcher_round.png'
        raw = Image.open(foreground).convert('RGB')
        # Existing foreground is a complete icon image, not an isolated logo.
        # Keep its design and set a 17% safe margin against launcher crops.
        edge = raw.size[0]
        composite = Image.new('RGB', (edge, edge), '#315D54')
        scaled_edge = round(edge * 0.78)
        artwork = raw.resize((scaled_edge, scaled_edge), Image.Resampling.LANCZOS)
        offset = (edge - scaled_edge) // 2
        composite.paste(artwork, (offset, offset))
        composite.save(foreground, 'PNG', optimize=True)
        side = Image.open(legacy).size[0]
        icon = composite.resize((side,side), Image.Resampling.LANCZOS).convert('RGBA')
        # Remove opaque rectangles beyond the actual rounded launcher silhouette.
        mask=Image.new('L',(side*4,side*4),0)
        draw=ImageDraw.Draw(mask)
        draw.rounded_rectangle((0,0,side*4-1,side*4-1),radius=side*4*0.22,fill=255)
        icon.putalpha(mask.resize((side,side),Image.Resampling.LANCZOS))
        icon.save(legacy,'PNG',optimize=True)
        mask=Image.new('L',(side*4,side*4),0)
        ImageDraw.Draw(mask).ellipse((0,0,side*4-1,side*4-1),fill=255)
        circular=composite.resize((side,side),Image.Resampling.LANCZOS).convert('RGBA')
        circular.putalpha(mask.resize((side,side),Image.Resampling.LANCZOS))
        circular.save(round_icon,'PNG',optimize=True)

refine_launcher_icons()
