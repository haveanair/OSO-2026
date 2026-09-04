from pathlib import Path
import hashlib,re,subprocess

play=Path('play/index.html')
s=play.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()
sotris=Path('play/sp1/sotris/index.html')
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()

old='RPG 논개 클리어 후 해금'
new='해금조건 : 오소 환상대모험 이벤트 클리어'
count=s.count(old)
if count < 1:
    raise SystemExit('target copy not found: '+old)
s=s.replace(old,new)
play.write_text(s,encoding='utf-8')

# Syntax check inline scripts.
scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)
Path('/tmp/oso-inline.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/oso-inline.js'],check=True)

sotris_after=hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_before!=sotris_after:
    raise SystemExit('Sotris changed unexpectedly')

report=Path('.github/nongae-unlock-copy-report.txt')
report.write_text('\n'.join([
 'NONGAE UNLOCK COPY UPDATE VERIFIED',
 f'REPLACEMENTS={count}',
 f'NEW_COPY={new}',
 'INLINE_JS_NODE_CHECK=PASS',
 'SOTRIS_CHANGED=NO',
 f'PLAY_SHA256_BEFORE={before}',
 f'PLAY_SHA256_AFTER={hashlib.sha256(s.encode()).hexdigest()}',
])+'\n',encoding='utf-8')
print('OK replacements=',count)
