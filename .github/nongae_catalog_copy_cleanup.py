from pathlib import Path
import hashlib, json, re, subprocess

play=Path('play/index.html')
s=play.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()
sotris=Path('play/sp1/sotris/index.html')
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()

phrase='해금조건 : 오소 환상대모험 이벤트 클리어'
if s.count(phrase)!=4:
    raise SystemExit(f'unexpected unlock phrase count before cleanup: {s.count(phrase)}')

# Keep the unlock condition only once in the Nongae collection header.
# Remove repeated condition text from the two individual character notes.
m=re.search(r'const OSO_SKINS=(\[.*?\]);\s*\n',s,re.S)
if not m:
    raise SystemExit('OSO_SKINS array not found')
skins=json.loads(m.group(1))
changed=[]
for skin in skins:
    if skin.get('id') in ('nongae_jade','nongae_resolve'):
        if skin.get('note')!=phrase:
            raise SystemExit(f"unexpected note for {skin.get('id')}: {skin.get('note')!r}")
        skin['note']=''
        changed.append(skin['id'])
if sorted(changed)!=['nongae_jade','nongae_resolve']:
    raise SystemExit(f'Nongae note cleanup mismatch: {changed}')
newarr=json.dumps(skins,ensure_ascii=False,separators=(',',':'))
s=s[:m.start(1)]+newarr+s[m.end(1):]

# Hide the empty note row when a skin intentionally has no note.
old_note='<b>${s.name}</b><small>${s.note}</small><button'
new_note="<b>${s.name}</b>${s.note?'<small>'+s.note+'</small>':''}<button"
if s.count(old_note)!=1:
    raise SystemExit(f'card note render pattern count={s.count(old_note)}')
s=s.replace(old_note,new_note,1)

# A lock icon is sufficient on the disabled purchase button.
old_btn="lockedGroup?'🔒 해금조건 : 오소 환상대모험 이벤트 클리어':selected?"
new_btn="lockedGroup?'🔒':selected?"
if s.count(old_btn)!=1:
    raise SystemExit(f'locked button pattern count={s.count(old_btn)}')
s=s.replace(old_btn,new_btn,1)

# The full condition should now appear once: in the Nongae collection header only.
if s.count(phrase)!=1:
    raise SystemExit(f'unlock phrase count after cleanup={s.count(phrase)}')
if f"sub:'{phrase} · 3,000 코인대'" not in s:
    raise SystemExit('Nongae collection header condition missing')
if "lockedGroup?'🔒':selected?" not in s:
    raise SystemExit('lock-only purchase button missing')

play.write_text(s,encoding='utf-8')

# Validate inline JavaScript syntax.
scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)
Path('/tmp/oso-inline.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/oso-inline.js'],check=True)

sotris_after=hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_after!=sotris_before:
    raise SystemExit('Sotris changed unexpectedly')

after=hashlib.sha256(s.encode()).hexdigest()
report='\n'.join([
    'NONGAE CATALOG COPY CLEANUP VERIFIED',
    'UNLOCK_CONDITION_OCCURRENCES=1',
    'UNLOCK_CONDITION='+phrase,
    'INDIVIDUAL_NONGAE_NOTES=REMOVED',
    'LOCKED_PURCHASE_BUTTON=🔒',
    'INLINE_JS_NODE_CHECK=PASS',
    'SOTRIS_CHANGED=NO',
    'PLAY_SHA256_BEFORE='+before,
    'PLAY_SHA256_AFTER='+after,
])+'\n'
Path('.github/nongae-catalog-copy-cleanup-report.txt').write_text(report,encoding='utf-8')
print(report,end='')
