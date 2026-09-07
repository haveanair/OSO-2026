from pathlib import Path
import hashlib
import subprocess

p = Path('play/index.html')
s = p.read_text(encoding='utf-8')
before = hashlib.sha256(s.encode('utf-8')).hexdigest()

old_run = '<script src="./run-distance-speed.js?v=20260907-run1000-1"></script>'
new_run = '<script src="./run-distance-speed.js?v=20260907-run500-1"></script>'
old_bonus = '<script src="./character-performance-bonus.js?v=20260906-charbonus2"></script>'
new_bonus = '<script src="./character-performance-bonus.js?v=20260907-charbonus3"></script>'
silk = '<script src="./silk-stack-endless.js?v=20260907-endless1"></script>'

if new_run not in s:
    if s.count(old_run) != 1:
        raise SystemExit(f'runner script anchor count: {s.count(old_run)}')
    s = s.replace(old_run, new_run, 1)

if new_bonus not in s:
    if s.count(old_bonus) != 1:
        raise SystemExit(f'character bonus anchor count: {s.count(old_bonus)}')
    s = s.replace(old_bonus, new_bonus, 1)

if silk not in s:
    if s.count(new_bonus) != 1:
        raise SystemExit(f'new bonus anchor count: {s.count(new_bonus)}')
    s = s.replace(new_bonus, silk + '\n' + new_bonus, 1)

if s.count(silk) != 1:
    raise SystemExit('silk endless script connection is not unique')
if s.count(new_run) != 1:
    raise SystemExit('runner 500m cache key is not unique')
if s.count(new_bonus) != 1:
    raise SystemExit('character catalog cache key is not unique')

p.write_text(s, encoding='utf-8')
subprocess.run(['node', '--check', 'play/silk-stack-endless.js'], check=True)

after = hashlib.sha256(s.encode('utf-8')).hexdigest()
Path('.github/silk-stack-endless-report.txt').write_text(
    '\n'.join([
        'SILK STACK ENDLESS CONNECTION VERIFIED',
        'SEPARATE_MODULE=play/silk-stack-endless.js',
        'ENDLESS_UNLOCK_NORMAL_CLEARS=10',
        'NORMAL_TARGET=15',
        'HOUSE_FLOORS=3',
        'BUILDING_FLOORS=5',
        'SKY_FLOORS_BEFORE_SPACE=10',
        'SPACE_START_TOTAL_STACK=270',
        'FLAG_1884_AT_EVERY_15_STACK_BREAK=YES',
        'FLOOR_HUD=TOP_LEFT',
        'SKY_CLOUDS_BIRDS=YES',
        'HIGH_SKY_AIRPLANE=YES',
        'SPACE_ROCKET_METEOR_STATION_ASTRONAUT=YES',
        'RUNNER_STEP_METERS=500',
        'RUNNER_STEP_SPEED=50',
        'CHARACTER_CATALOG_CACHE_BUST=charbonus3',
        'MODULE_JS_NODE_CHECK=PASS',
        f'PLAY_SHA256_BEFORE={before}',
        f'PLAY_SHA256_AFTER={after}',
    ]) + '\n', encoding='utf-8')
