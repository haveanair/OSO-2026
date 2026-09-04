from pathlib import Path
import base64
import hashlib
import re
import shutil
import subprocess

play = Path('play/index.html')
asset = Path('play/assets/nongae-01.webp')
backup = Path('.github/nongae-01.webp.b64')
report_path = Path('.github/nongae-catalog-fix-report.txt')

s = play.read_text(encoding='utf-8')
before_html = hashlib.sha256(s.encode('utf-8')).hexdigest()
sotris = Path('play/sp1/sotris/index.html')
sotris_before = hashlib.sha256(sotris.read_bytes()).hexdigest()
old_asset_sha = hashlib.sha256(asset.read_bytes()).hexdigest() if asset.exists() else 'MISSING'

# 1) Restore Nongae 01 from the already-staged, user-selected existing asset backup.
#    No image generation and no new artwork.
raw_b64 = ''.join(backup.read_text(encoding='utf-8').split())
raw = base64.b64decode(raw_b64, validate=True)
if raw[:4] != b'RIFF' or raw[8:12] != b'WEBP':
    raise SystemExit('backup is not WEBP')
expected_len = int.from_bytes(raw[4:8], 'little') + 8
if expected_len != len(raw):
    raise SystemExit(f'WEBP RIFF size mismatch: header={expected_len} actual={len(raw)}')
asset.write_bytes(raw)

file_info = subprocess.run(['file', '--brief', str(asset)], capture_output=True, text=True, check=True).stdout.strip()
if 'Web/P' not in file_info and 'WebP' not in file_info:
    raise SystemExit('file(1) did not recognize restored Nongae 01 as WebP: ' + file_info)
if shutil.which('identify'):
    subprocess.run(['identify', str(asset)], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

# 2) Character-card badge: use plain "논개" like the other encyclopedia character labels.
old_badge = '"badge":"🌊 논개"'
if s.count(old_badge) != 2:
    raise SystemExit('unexpected Nongae badge count=' + str(s.count(old_badge)))
s = s.replace(old_badge, '"badge":"논개"')

# 3) Locked Nongae cards must not reveal the character artwork.
#    Keep the IMG element in layout, but make it completely invisible until RPG unlock.
old_img = '<img src="${s.src}" alt="${s.name}">'
new_img = '<img src="${s.src}" alt="${s.name}" style="${lockedGroup?\'visibility:hidden;filter:grayscale(1);opacity:0\':\'\'}">'
if s.count(old_img) != 1:
    raise SystemExit('unexpected shop image renderer count=' + str(s.count(old_img)))
s = s.replace(old_img, new_img, 1)

# 4) Bust the old cached Nongae asset URL after restoring Nongae 01.
s = s.replace('assets/nongae-01.webp?v=20260904-nongae2', 'assets/nongae-01.webp?v=20260904-nongae3')
s = s.replace('assets/nongae-02.webp?v=20260904-nongae2', 'assets/nongae-02.webp?v=20260904-nongae3')

# Guard the requested behavior and existing unlock lockout.
assert '"id":"nongae_jade"' in s
assert '"id":"nongae_resolve"' in s
assert s.count('"badge":"논개"') == 2
assert 'const lockedGroup=gr.id===\'nongae\'&&!state.nongaeUnlocked;' in s
assert "style=\"${lockedGroup?'visibility:hidden;filter:grayscale(1);opacity:0':''}\"" in s
assert "lockedGroup?'🔒 RPG 논개 클리어 후 해금'" in s
assert '"badge":"🌊 논개"' not in s

# Validate every inline JS block after the edit.
scripts = re.findall(r'<script[^>]*>(.*?)</script>', s, re.S)
Path('/tmp/oso-inline.js').write_text('\n'.join(scripts), encoding='utf-8')
subprocess.run(['node', '--check', '/tmp/oso-inline.js'], check=True)

play.write_text(s, encoding='utf-8')
new_asset_sha = hashlib.sha256(asset.read_bytes()).hexdigest()
after_html = hashlib.sha256(s.encode('utf-8')).hexdigest()
sotris_after = hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_before != sotris_after:
    raise SystemExit('Sotris changed unexpectedly')

report = '\n'.join([
    'NONGAE CATALOG DISPLAY FIX VERIFIED',
    'IMAGE_GENERATION=NO',
    'NONGAE_01_SOURCE=existing .github/nongae-01.webp.b64 backup',
    'LOCKED_ART=HIDDEN',
    'CARD_BADGE=논개',
    'CACHE_BUSTER=20260904-nongae3',
    'INLINE_JS_NODE_CHECK=PASS',
    'SOTRIS_CHANGED=NO',
    'NONGAE_01_FILE=' + file_info,
    'NONGAE_01_SIZE=' + str(len(raw)),
    'NONGAE_01_SHA256_BEFORE=' + old_asset_sha,
    'NONGAE_01_SHA256_AFTER=' + new_asset_sha,
    'PLAY_SHA256_BEFORE=' + before_html,
    'PLAY_SHA256_AFTER=' + after_html,
]) + '\n'
report_path.write_text(report, encoding='utf-8')
print(report, end='')
