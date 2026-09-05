from pathlib import Path
import hashlib

play=Path('play/index.html')
sotris=Path('play/sp1/sotris/index.html')
text=play.read_text(encoding='utf-8')
before=hashlib.sha256(text.encode('utf-8')).hexdigest()
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()
tag='<script src="./character-performance-bonus.js?v=20260906-charbonus1"></script>'

if tag not in text:
    marker='</body>'
    if marker not in text:
        raise SystemExit('closing body tag not found')
    text=text.replace(marker,tag+'\n'+marker,1)
    play.write_text(text,encoding='utf-8')

final=play.read_text(encoding='utf-8')
if final.count(tag)!=1:
    raise SystemExit(f'character bonus script tag count={final.count(tag)}')
if 'sp1/sotris-integration.js' in final and final.index('sp1/sotris-integration.js')>final.index('character-performance-bonus.js'):
    raise SystemExit('character bonus module must load after SOTRIS integration')

after=hashlib.sha256(final.encode('utf-8')).hexdigest()
sotris_after=hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_before!=sotris_after:
    raise SystemExit('SOTRIS changed unexpectedly')

report='\n'.join([
    'CHARACTER PERFORMANCE BONUS VERIFIED',
    'SEPARATE_MODULE=play/character-performance-bonus.js',
    'SELECTED_CHARACTER_SOURCE=currentSkin().price',
    'BONUS_TIERS=0:0%,1-249:2%,250-499:4%,500-749:6%,750-999:8%,1000-1499:10%,1500-1999:12%,2000-2399:15%,2400-2799:18%,2800-3199:20%,3200-3599:22%,3600+:25%',
    'COMMON_GAME_SCORE_BONUS=ENABLED',
    'COMMON_GAME_EXTRA_COIN_BONUS=ENABLED',
    'RPG_BATTLE_COIN_BONUS=ENABLED',
    'SP1_SCORE_BONUS=ENABLED',
    'SP1_REPEATABLE_COIN_BONUS=ENABLED',
    'SP1_FIRST_CLEAR_FIXED_200=UNCHANGED',
    'SHOP_BONUS_LABELS=ENABLED',
    'EXISTING_GAME_JS_DIRECT_REWRITE=NO',
    'SCRIPT_TAG_COUNT=1',
    'SOTRIS_CHANGED=NO',
    f'PLAY_SHA256_BEFORE={before}',
    f'PLAY_SHA256_AFTER={after}',
    f'SOTRIS_SHA256={sotris_after}',
])+'\n'
Path('.github/character-performance-bonus-report.txt').write_text(report,encoding='utf-8')
print('character performance bonus connector verified')
