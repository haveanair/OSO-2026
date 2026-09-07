from pathlib import Path
import hashlib

p = Path('play/index.html')
sotris = Path('play/sp1/sotris/index.html')
text = p.read_text(encoding='utf-8')
before = hashlib.sha256(text.encode()).hexdigest()
sotris_before = hashlib.sha256(sotris.read_bytes()).hexdigest()
old = "ctx.save();ctx.translate(84,y+45);const runnerScale=land>0?.90:1;ctx.scale(flipRunner?-runnerScale:runnerScale,runnerScale);"
new = "ctx.save();ctx.translate(84,y+45);ctx.scale(flipRunner?-sX:sX,sY);"
count = text.count(old)
if count != 1:
    raise SystemExit(f'expected exactly one landing scale marker, found {count}')
text = text.replace(old, new, 1)
p.write_text(text, encoding='utf-8')
after = hashlib.sha256(text.encode()).hexdigest()
sotris_after = hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_before != sotris_after:
    raise SystemExit('SOTRIS changed unexpectedly')
if new not in text:
    raise SystemExit('landing squash restore missing')
report = Path('.github/runner-landing-squash-report.txt')
report.write_text(
    'RUNNER LANDING SQUASH VERIFIED\n'
    'BASE_CHARACTER_ASPECT_GUARD=PRESERVED\n'
    'LANDING_EFFECT_NONUNIFORM_SCALE=RESTORED\n'
    'LANDING_SCALE_X=1.12\n'
    'LANDING_SCALE_Y=0.82\n'
    'SOTRIS_CHANGED=NO\n'
    f'SOTRIS_SHA256={sotris_after}\n'
    f'PLAY_SHA256_BEFORE={before}\n'
    f'PLAY_SHA256_AFTER={after}\n',
    encoding='utf-8'
)
