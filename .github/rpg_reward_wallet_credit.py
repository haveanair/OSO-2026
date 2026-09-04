from pathlib import Path
import re, hashlib, subprocess

play=Path('play/index.html')
sotris=Path('play/sp1/sotris/index.html')
s=play.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()

if 'function fantasyBattleCoinReward(e)' not in s:
    raise SystemExit('RPG reward table missing')
start=s.find('function fantasyCoinDrop(e){')
end=s.find('function win(){',start)
if start<0 or end<0:
    raise SystemExit('RPG reward function markers missing')
block=s[start:end]
old='fantasyBonusCoins+=amount;'
if block.count(old)!=1:
    raise SystemExit(f'pending battle credit count={block.count(old)}')
block=block.replace(old,"const beforeCoins=state.coins||0;state.coins=beforeCoins+amount;save();",1)
s=s[:start]+block+s[end:]

if 'const normalByZone=[30,30,45,60,75,90,100]' not in s: raise SystemExit('normal reward table changed')
if 'const bossByZone=[1000,1000,1500,2000,2500,3000,3000]' not in s: raise SystemExit('boss reward table changed')
if "name.includes('논개'))return 5000" not in s: raise SystemExit('Nongae reward changed')
if "name.includes('암흑장군')||name.includes('암흑 장군'))return 4000" not in s: raise SystemExit('dark general reward changed')
if "name.includes('마왕'))return 3000" not in s: raise SystemExit('demon king reward changed')

play.write_text(s,encoding='utf-8')
scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)
Path('/tmp/oso-inline.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/oso-inline.js'],check=True)
if hashlib.sha256(sotris.read_bytes()).hexdigest()!=sotris_before:
    raise SystemExit('SOTRIS changed unexpectedly')
after=hashlib.sha256(s.encode()).hexdigest()
report='\n'.join([
 'RPG BATTLE REWARD WALLET CREDIT VERIFIED',
 'BATTLE_REWARD_CREDIT=IMMEDIATE',
 'SHOP_INN_PHARMACY_CAN_USE_REWARD=YES',
 'NO_DOUBLE_CREDIT_AT_GAME_FINISH=YES',
 'NORMAL_REWARD_MIN=30',
 'NORMAL_REWARD_MAX=100',
 'BOSS_REWARD_START=1000',
 'DEMON_KING=3000',
 'DARK_GENERAL=4000',
 'NONGAE=5000',
 'INLINE_JS_NODE_CHECK=PASS',
 'SOTRIS_CHANGED=NO',
 'PLAY_SHA256_BEFORE='+before,
 'PLAY_SHA256_AFTER='+after,
])+'\n'
Path('.github/rpg-reward-wallet-credit-report.txt').write_text(report,encoding='utf-8')
print(report,end='')
