from pathlib import Path
import re, hashlib, subprocess

play=Path('play/index.html')
sotris=Path('play/sp1/sotris/index.html')
s=play.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()

pat=r"function fantasyCoinDrop\(e\)\{.*?return amount \} function win\(\)\{"
m=re.search(pat,s,re.S)
if not m:
    raise SystemExit('fantasyCoinDrop/win block not found')

new="""function fantasyBattleCoinReward(e){
 const name=String((e&&e.name)||'');
 if(name.includes('논개'))return 5000;
 if(name.includes('암흑장군')||name.includes('암흑 장군'))return 4000;
 if((e&&e.finalBoss)||name.includes('마왕'))return 3000;
 if(e&&e.boss){const bossByZone=[1000,1000,1500,2000,2500,3000,3000];return bossByZone[Math.max(0,Math.min(bossByZone.length-1,zone))]||1000}
 const normalByZone=[30,30,45,60,75,90,100];
 return normalByZone[Math.max(0,Math.min(normalByZone.length-1,zone))]||30
}
function fantasyCoinDrop(e){
 const amount=fantasyBattleCoinReward(e);
 if(!amount)return 0;
 fantasyBonusCoins+=amount;
 const fx=document.createElement('div');fx.className='fantasyCoinDropFx';fx.textContent=`🪙 +${amount.toLocaleString('ko-KR')}`;battleFx.appendChild(fx);setTimeout(()=>fx.remove(),1300);
 tone('coin');buzz(amount>=3000?[28,10,45,10,70]:amount>=1000?[20,8,34]:[12,6,22]);
 log(`${e.name} 격파 보상! 🪙 +${amount.toLocaleString('ko-KR')}`);updateHud();return amount
} function win(){"""
s=s[:m.start()]+new+s[m.end():]

checks=[
    "name.includes('논개'))return 5000",
    "name.includes('암흑장군')||name.includes('암흑 장군'))return 4000",
    "name.includes('마왕'))return 3000",
    "const bossByZone=[1000,1000,1500,2000,2500,3000,3000]",
    "const normalByZone=[30,30,45,60,75,90,100]",
]
for x in checks:
    if x not in s: raise SystemExit('verification missing: '+x)
if s.count('function fantasyBattleCoinReward(e)')!=1:
    raise SystemExit('reward function count mismatch')
if 'if(e.boss){if(Math.random()<.62)' in s:
    raise SystemExit('old probabilistic RPG coin reward remains')

play.write_text(s,encoding='utf-8')
scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)
Path('/tmp/oso-inline.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/oso-inline.js'],check=True)

sotris_after=hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_after!=sotris_before:
    raise SystemExit('SOTRIS changed unexpectedly')
after=hashlib.sha256(s.encode()).hexdigest()
report='\n'.join([
    'RPG BATTLE COIN REWARD UPDATE VERIFIED',
    'NORMAL_ZONE_REWARDS=30,30,45,60,75,90,100',
    'BOSS_ZONE_REWARDS=1000,1000,1500,2000,2500,3000,3000',
    'DEMON_KING_REWARD=3000',
    'DARK_GENERAL_REWARD=4000',
    'NONGAE_REWARD=5000',
    'RANDOM_1_2_COIN_DROP=REMOVED',
    'EXP_AND_BATTLE_DIFFICULTY=UNCHANGED',
    'INLINE_JS_NODE_CHECK=PASS',
    'SOTRIS_CHANGED=NO',
    'PLAY_SHA256_BEFORE='+before,
    'PLAY_SHA256_AFTER='+after,
])+'\n'
Path('.github/rpg-battle-coin-reward-report.txt').write_text(report,encoding='utf-8')
print(report,end='')
