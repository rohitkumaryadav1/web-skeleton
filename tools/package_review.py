"""Package the review build with Python's standard library; no runtime build step."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parents[1]
baseline = json.loads((root / 'review/original-homepage-hashes.json').read_text())
original = Path('G:/webskeleton')
for name, expected in baseline.items():
    assert hashlib.sha256((original / name).read_bytes()).hexdigest() == expected, name

files = [root / name for name in ['index.html', 'README.md', 'CREDITS.md']]
files.extend(path for path in (root / 'assets').rglob('*') if path.is_file())
files.extend(path for path in (root / 'tools').glob('*.py'))
for name in ['QA.md', 'desktop-preview.jpg', 'mobile-preview.jpg', 'tablet-preview.jpg',
             'featured-work.jpg', 'scroll-transition.jpg', 'industry-checks.json',
             'layout-checks.json', 'original-homepage-hashes.json']:
    files.append(root / 'review' / name)

destination = root / 'web-skeleton-display-room-prototype.zip'
with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in files:
        assert path.is_file(), path
        archive.write(path, path.relative_to(root))
with zipfile.ZipFile(destination) as archive:
    assert archive.testzip() is None
    print(f'ZIP verified: {len(archive.namelist())} files, {destination.stat().st_size} bytes')
print('Original homepage hashes unchanged.')
