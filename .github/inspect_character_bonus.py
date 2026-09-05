from pathlib import Path
import re

s=Path('play/index.html').read_text(encoding='utf-8')
out=[]
out.append('CHARACTER BONUS INSPECTION')
out.append(f'INDEX_LEN={len(s)}')

def add_context(label, pattern, max_hits=8, radius=420):
    out.append('\n## '+label)
    hits=list(re.finditer(pattern,s,re.I|re.S))[:max_hits]
    out.append(f'HITS={len(hits)}')
    for i,m in enumerate(hits,1):
        a=max(0,m.start()-radius);b=min(len(s),m.end()+radius)
        txt=s[a:b].replace('\n',' ')
        out.append(f'-- {i} --')
        out.append(txt)

add_context('CHARACTER PRICE OBJECTS', r'[^{}]{0,120}(?:price|cost)\s*:\s*\d+[^{}]{0,220}', 20, 120)
add_context('NONGAE IDS', r'nongae_[a-zA-Z0-9_]+', 12, 500)
add_context('SKIN CATALOG DECLARATIONS', r'(?:const|let|var)\s+[A-Za-z_$][\w$]*(?:SKIN|skin|CHAR|char|catalog|CATALOG)[\w$]*\s*=\s*[\[{]', 20, 700)
add_context('SELECTED CHARACTER STATE', r'(?:selectedSkin|skinId|currentSkin|activeSkin|selectedChar|characterId|state\.skin|state\.character)', 20, 500)
add_context('COMMON FINISH', r'function\s+finish\s*\(', 4, 1600)
add_context('FINISH CALLS', r'finish\s*\(\s*[\'\"][a-zA-Z0-9_-]+[\'\"]', 40, 500)
add_context('SCORE WRITES', r'(?:state\.)?(?:score|dailyScore|totalScore)\s*[+\-*/]?=', 30, 350)
add_context('COIN WRITES', r'state\.coins\s*[+\-*/]?=', 30, 450)
add_context('SKIN PURCHASE', r'(?:buySkin|purchaseSkin|skin.*price|price.*skin)', 20, 700)

Path('.github/character-bonus-inspection.txt').write_text('\n'.join(out)+'\n',encoding='utf-8')
print('inspection report written')
