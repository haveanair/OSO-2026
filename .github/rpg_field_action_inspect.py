from pathlib import Path
import re
s=Path('play/index.html').read_text(encoding='utf-8')
terms=[
 'function openFantasyMenu','function closeFantasyMenu','fantasyMenuBtn','fantasyMenuClose',
 'RPG_MEDICINE','function useItem','function useMedicine','function item','포션','에테르','성수',
 'function magic','function cast','function useMagic','MP ', 'healFx','magicHealFx',
 'function openFantasyStatus','function saveFantasy','const hero=','const run={',
 "sub('magic')","sub('item')",'function sub(', 'function act(', "id==='회복'", "id==='대회복'",
 "id==='heal'", "id==='greaterHeal'", "hero.lv>=2", "hero.lv>=6", 'battle.busy=true',
 'const options=', 'data-sub', 'fantasySub', 'MP 부족', '회복! HP', '대회복! HP'
]
out=['RPG FIELD ACTION INSPECTION V2']
for term in terms:
    poss=[m.start() for m in re.finditer(re.escape(term),s)]
    out.append(f'\n===== {term} COUNT={len(poss)} =====')
    for p in poss[:10]:
        a=max(0,p-1200); b=min(len(s),p+3200)
        out.append(s[a:b].replace('\n',' '))
Path('.github/rpg-field-action-inspect.txt').write_text('\n'.join(out),encoding='utf-8')
print('wrote inspection report v2')