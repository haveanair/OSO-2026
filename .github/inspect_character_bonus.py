from pathlib import Path
import re

s=Path('play/index.html').read_text(encoding='utf-8')
out=['CHARACTER BONUS COMPACT INSPECTION',f'INDEX_LEN={len(s)}']

def one_line(x,limit=900):
    x=re.sub(r'\s+',' ',x).strip()
    return x[:limit]

def contexts(label,pattern,max_hits=12,radius=260):
    out.append('')
    out.append('## '+label)
    hits=list(re.finditer(pattern,s,re.I|re.S))[:max_hits]
    out.append(f'HITS={len(hits)}')
    for i,m in enumerate(hits,1):
        a=max(0,m.start()-radius);b=min(len(s),m.end()+radius)
        out.append(f'{i}='+one_line(s[a:b],650))

# Compact character/shop evidence around prices.
contexts('PRICE_CONTEXT',r'\b(?:price|cost)\s*:\s*\d+',24,240)
contexts('NONGAE_CONTEXT',r'nongae_(?:jade|resolve)',8,360)
contexts('SKIN_WORD_CONTEXT',r'\b(?:SKINS|skins|skinList|skinCatalog|CHARACTERS|characters|charList|catalog)\b',18,320)
contexts('SELECTED_CONTEXT',r'\b(?:selectedSkin|skinId|currentSkin|activeSkin|selectedChar|characterId|equippedSkin|state\.(?:skin|character|char|selectedSkin))\b',24,320)
contexts('OWNED_CONTEXT',r'\b(?:ownedSkins|skinsOwned|unlockedSkins|purchasedSkins|ownedCharacters|unlockedCharacters)\b',16,260)
contexts('FINISH_DEF',r'function\s+finish\s*\(',2,900)
contexts('FANTASY_REWARD',r'function\s+fantasy(?:BattleCoinReward|CoinDrop)\s*\(',4,700)

ids=sorted(set(re.findall(r"finish\(\s*['\"]([A-Za-z0-9_-]+)['\"]",s)))
out.append('')
out.append('## FINISH_GAME_IDS')
out.append('IDS='+','.join(ids))

# Short list of state keys mentioning skin/char.
keys=sorted(set(re.findall(r'\bstate\.([A-Za-z_$][\w$]*(?:skin|Skin|char|Char)[A-Za-z_$\w]*)',s)))
out.append('')
out.append('## CHARACTER_STATE_KEYS')
out.append('KEYS='+','.join(keys))

Path('.github/character-bonus-inspection.txt').write_text('\n'.join(out)+'\n',encoding='utf-8')
print('compact inspection report written')
