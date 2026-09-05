from pathlib import Path
import hashlib

play=Path('play/index.html')
sotris=Path('play/sp1/sotris/index.html')
js=Path('play/nongae-unlock-wrap.js')
report=Path('.github/nongae-unlock-wrap-report.txt')

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

before=sha(play)
sotris_before=sha(sotris)
s=play.read_text(encoding='utf-8')
tag='<script src="./nongae-unlock-wrap.js?v=20260906-wrap1"></script>'
if tag not in s:
    marker='</body></html>'
    if marker not in s:
        raise SystemExit('closing body marker not found')
    s=s.replace(marker,tag+'\n'+marker,1)
    play.write_text(s,encoding='utf-8')

after=sha(play)
sotris_after=sha(sotris)
if not js.exists():
    raise SystemExit('wrap module missing')
if sotris_before!=sotris_after:
    raise SystemExit('SOTRIS changed unexpectedly')
text=play.read_text(encoding='utf-8')
if text.count(tag)!=1:
    raise SystemExit(f'unexpected script tag count: {text.count(tag)}')

report.write_text('\n'.join([
    'NONGAE UNLOCK TITLE WRAP VERIFIED',
    'TITLE_LINE_1=🌊 논개 캐릭터 2종',
    'TITLE_LINE_2=해금!',
    'SEPARATE_MODULE=play/nongae-unlock-wrap.js',
    'SCRIPT_TAG_COUNT=1',
    'SOTRIS_CHANGED=NO',
    f'PLAY_SHA256_BEFORE={before}',
    f'PLAY_SHA256_AFTER={after}',
]),encoding='utf-8')
print('connected Nongae unlock title wrap module')
