from pathlib import Path
import re
s=Path('play/index.html').read_text(encoding='utf-8')
terms=[
 'function openFantasyMenu','function closeFantasyMenu','fantasyMenuBtn','fantasyMenuClose',
 'RPG_MEDICINE','function useItem','function useMedicine','function item','포션','에테르','성수',
 'function magic','function cast','function useMagic','MP ', 'healFx','magicHealFx',
 'function openFantasyStatus','function saveFantasy','const hero=','const run={'
]
out=['RPG FIELD ACTION INSPECTION']
for term in terms:
    poss=[m.start() for m in re.finditer(re.escape(term),s)]
    out.append(f'\n===== {term} COUNT={len(poss)} =====')
    for p in poss[:6]:
        a=max(0,p-650); b=min(len(s),p+1700)
        out.append(s[a:b].replace('\n',' '))
Path('.github/rpg-field-action-inspect.txt').write_text('\n'.join(out),encoding='utf-8')
print('wrote inspection report')