from pathlib import Path
import hashlib, re, subprocess

play=Path('play/index.html')
s=play.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()
sotris=Path('play/sp1/sotris/index.html')
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()

old="<b>${s.name}</b>${s.note?'<small>'+s.note+'</small>':''}<button"
new="<b>${s.name}</b>${s.note?'<small>'+s.note+'</small>':(['nongae_jade','nongae_resolve'].includes(s.id)?'<small aria-hidden=\"true\">&nbsp;</small>':'')}<button"
if s.count(old)!=1:
    raise SystemExit(f'card render pattern count={s.count(old)}')
s=s.replace(old,new,1)

# Keep the unlock copy only once in the collection header.
phrase='해금조건 : 오소 환상대모험 이벤트 클리어'
if s.count(phrase)!=1:
    raise SystemExit(f'unlock phrase count={s.count(phrase)}')
if "lockedGroup?'🔒':selected?" not in s:
    raise SystemExit('lock-only purchase button missing')

play.write_text(s,encoding='utf-8')

scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)
Path('/tmp/oso-inline.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/oso-inline.js'],check=True)

sotris_after=hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_after!=sotris_before:
    raise SystemExit('Sotris changed unexpectedly')

after=hashlib.sha256(s.encode()).hexdigest()
report='\n'.join([
    'NONGAE CARD SPACING FIX VERIFIED',
    'NONGAE_EMPTY_SUBTITLE_SPACER=ENABLED',
    'UNLOCK_CONDITION_OCCURRENCES=1',
    'LOCKED_PURCHASE_BUTTON=🔒',
    'INLINE_JS_NODE_CHECK=PASS',
    'SOTRIS_CHANGED=NO',
    'PLAY_SHA256_BEFORE='+before,
    'PLAY_SHA256_AFTER='+after,
])+'\n'
Path('.github/nongae-card-spacing-fix-report.txt').write_text(report,encoding='utf-8')
print(report,end='')
