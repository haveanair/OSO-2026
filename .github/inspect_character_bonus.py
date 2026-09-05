from pathlib import Path
import re

s=Path('play/index.html').read_text(encoding='utf-8')
out=['CHARACTER BONUS EXACT INSPECTION',f'INDEX_LEN={len(s)}']

# Extract compact catalog records without embedded image/base64 payloads.
records=[]
for m in re.finditer(r'\{["\']id["\']\s*:\s*["\']([^"\']+)["\'][^{}]{0,160}?["\']name["\']\s*:\s*["\']([^"\']+)["\'][^{}]{0,220}?["\']price["\']\s*:\s*(\d+)',s):
    sid,name,price=m.group(1),m.group(2),int(m.group(3))
    if sid not in {r[0] for r in records}: records.append((sid,name,price))
# Also catch unquoted keys, if any.
for m in re.finditer(r'\{\s*id\s*:\s*["\']([^"\']+)["\'][^{}]{0,160}?name\s*:\s*["\']([^"\']+)["\'][^{}]{0,220}?price\s*:\s*(\d+)',s):
    sid,name,price=m.group(1),m.group(2),int(m.group(3))
    if sid not in {r[0] for r in records}: records.append((sid,name,price))
out.append('')
out.append('## CHARACTER_CATALOG')
out.append(f'COUNT={len(records)}')
for sid,name,price in sorted(records,key=lambda r:(r[2],r[0])):
    out.append(f'{sid}|{name}|{price}')

# Exact current-skin helpers.
for needle in ['function currentSkin()','function currentOsoSrc()']:
    p=s.find(needle)
    if p>=0: out += ['', '## '+needle, re.sub(r'\s+',' ',s[p:p+500]).strip()]

# Central finish logic, split into short lines so connector can return it reliably.
p=s.find('function finish(')
out.append('')
out.append('## FINISH_EXACT')
out.append(f'POS={p}')
if p>=0:
    txt=re.sub(r'\s+',' ',s[p:p+4200]).strip()
    for i in range(0,len(txt),240): out.append(f'F{i//240:02d}={txt[i:i+240]}')

# RPG battle reward functions.
for needle in ['function fantasyBattleCoinReward(','function fantasyCoinDrop(']:
    p=s.find(needle)
    out.append('')
    out.append('## '+needle)
    out.append(f'POS={p}')
    if p>=0:
        txt=re.sub(r'\s+',' ',s[p:p+1800]).strip()
        for i in range(0,len(txt),240): out.append(f'R{i//240:02d}={txt[i:i+240]}')

# State and game IDs.
ids=sorted(set(re.findall(r"finish\(\s*['\"]([A-Za-z0-9_-]+)['\"]",s)))
out += ['', '## FINISH_GAME_IDS', 'IDS='+','.join(ids)]
out += ['', '## STATE', 'SELECTED=state.selectedSkin', 'OWNED=state.ownedSkins']

Path('.github/character-bonus-inspection.txt').write_text('\n'.join(out)+'\n',encoding='utf-8')
print('exact inspection report written')
