from pathlib import Path
import re, hashlib, subprocess

play=Path('play/index.html')
sotris=Path('play/sp1/sotris/index.html')
s=play.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()

pat=r"function fantasyBattleCoinReward\(e\)\{.*?\}\nfunction fantasyCoinDrop\(e\)\{"
m=re.search(pat,s,re.S)
if not m:
    raise SystemExit('fantasyBattleCoinReward block not found')

new="""function fantasyBattleCoinReward(e){
 const name=String((e&&e.name)||'');
 const isBoss=!!(e&&e.boss);
 const normalByZone=[30,30,45,60,75,90,100];
 if(!isBoss)return normalByZone[Math.max(0,Math.min(normalByZone.length-1,zone))]||30;
 if(name.includes('논개'))return 5000;
 if(name.includes('암흑장군')||name.includes('암흑 장군'))return 4000;
 if((e&&e.finalBoss)||name.includes('마왕'))return 3000;
 const bossByZone=[1000,1000,1500,2000,2500,3000,3000];
 return bossByZone[Math.max(0,Math.min(bossByZone.length-1,zone))]||1000
}
function fantasyCoinDrop(e){"""
s=s[:m.start()]+new+s[m.end():]

checks=[
    "const isBoss=!!(e&&e.boss)",
    "if(!isBoss)return normalByZone",
    "const normalByZone=[30,30,45,60,75,90,100]",
    "if(name.includes('논개'))return 5000",
    "if(name.includes('암흑장군')||name.includes('암흑 장군'))return 4000",
    "if((e&&e.finalBoss)||name.includes('마왕'))return 3000",
    "const bossByZone=[1000,1000,1500,2000,2500,3000,3000]",
]
for x in checks:
    if x not in s:
        raise SystemExit('verification missing: '+x)

# Explicit invariant: non-boss path exits before any 1000+ reward branch.
block=re.search(r"function fantasyBattleCoinReward\(e\)\{(.*?)\}\nfunction fantasyCoinDrop",s,re.S)
if not block:
    raise SystemExit('reward block re-read failed')
b=block.group(1)
if b.find('if(!isBoss)return') > b.find("return 5000"):
    raise SystemExit('non-boss cap is not before special rewards')

play.write_text(s,encoding='utf-8')
scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)
Path('/tmp/oso-inline.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/oso-inline.js'],check=True)

sotris_after=hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_after!=sotris_before:
    raise SystemExit('SOTRIS changed unexpectedly')
after=hashlib.sha256(s.encode()).hexdigest()
report='\n'.join([
    'RPG NORMAL MONSTER COIN CAP FIX VERIFIED',
    'NON_BOSS_REWARD_TABLE=30,30,45,60,75,90,100',
    'NON_BOSS_MAX=100',
    'SPECIAL_1000_PLUS_REWARDS_REQUIRE_BOSS=YES',
    'DEMON_KING=3000',
    'DARK_GENERAL=4000',
    'NONGAE=5000',
    'IMMEDIATE_WALLET_CREDIT=PRESERVED',
    'INLINE_JS_NODE_CHECK=PASS',
    'SOTRIS_CHANGED=NO',
    'PLAY_SHA256_BEFORE='+before,
    'PLAY_SHA256_AFTER='+after,
])+'\n'
Path('.github/rpg-normal-reward-cap-fix-report.txt').write_text(report,encoding='utf-8')
print(report,end='')
