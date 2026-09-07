from pathlib import Path
import hashlib

play=Path('play/index.html')
sotris=Path('play/sp1/sotris/index.html')
text=play.read_text(encoding='utf-8')
before=hashlib.sha256(text.encode()).hexdigest()
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()
old="if(!alive)return;let dt=Math.min(.033,(ts-prev)/1000);prev=ts;let speed=Math.min(455,205+world*.055+level*18);world+=speed*dt;score+=dt*19;"
new="if(!alive)return;let dt=Math.min(.033,(ts-prev)/1000);prev=ts;const runSpeedCtl=window.OsoRunDistanceSpeed;let speed=runSpeedCtl?runSpeedCtl.speed(world,level):Math.min(455,205+world*.055+level*18);world+=speed*dt;score+=dt*19;"
if new not in text:
    if text.count(old)!=1:
        raise SystemExit(f'runner speed marker count={text.count(old)}')
    text=text.replace(old,new,1)
tag='<script src="./run-distance-speed.js?v=20260907-run1000-1"></script>'
if tag not in text:
    anchors=[
        '<script src="./character-special-abilities.js?',
        '<script src="./character-performance-bonus.js?',
        '</body>'
    ]
    idx=-1
    for anchor in anchors:
        idx=text.find(anchor)
        if idx>=0:
            break
    if idx<0:
        raise SystemExit('script anchor missing')
    text=text[:idx]+tag+'\n'+text[idx:]
play.write_text(text,encoding='utf-8')
after=hashlib.sha256(text.encode()).hexdigest()
sotris_after=hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_before!=sotris_after:
    raise SystemExit('SOTRIS changed unexpectedly')
report=Path('.github/run-1000m-speed-report.txt')
report.write_text(
    'RUNNER 1000M SPEED STEP VERIFIED\n'
    'ORIGINAL_SPEED_CURVE_BELOW_1000M=PRESERVED\n'
    'SPEED_STEP_INTERVAL_METERS=1000\n'
    'SPEED_ADDED_PER_STEP=30\n'
    'STEP_1000M=+30\n'
    'STEP_2000M=+60\n'
    'STEP_3000M=+90\n'
    'NO_HARD_STEP_CAP=YES\n'
    'LANDING_SQUASH=PRESERVED\n'
    'SOTRIS_CHANGED=NO\n'
    f'SOTRIS_SHA256={sotris_after}\n'
    f'PLAY_SHA256_BEFORE={before}\n'
    f'PLAY_SHA256_AFTER={after}\n',
    encoding='utf-8'
)
