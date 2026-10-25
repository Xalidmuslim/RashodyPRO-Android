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
