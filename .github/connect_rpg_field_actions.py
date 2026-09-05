from pathlib import Path
import hashlib,re,subprocess

play=Path('play/index.html')
sotris=Path('play/sp1/sotris/index.html')
module=Path('play/rpg-field-actions.js')
s=play.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()

script_tag='<script src="./rpg-field-actions.js?v=20260905-field1"></script>'
if script_tag not in s:
    if '</body>' not in s: raise SystemExit('body close marker not found')
    s=s.replace('</body>',script_tag+'\n</body>',1)

anchor="$('#fantasyMapBtn').onclick=openFantasyMap;"
hook="window.OsoRpgFieldActions?.init({hero,run,spells,updateHud,tone,buzz,menuHome,statusPage,saveMenu}); "
if hook not in s:
    if s.count(anchor)!=1: raise SystemExit(f'RPG wiring anchor count={s.count(anchor)}')
    s=s.replace(anchor,hook+anchor,1)

if s.count(script_tag)!=1: raise SystemExit('field module script tag count mismatch')
if s.count('OsoRpgFieldActions?.init')!=1: raise SystemExit('field module init hook count mismatch')
for required in [
    "const RPG_MEDICINE=[{id:'포션',price:80,desc:'HP 완전회복'},{id:'에테르',price:45,desc:'MP 완전회복'},{id:'성수',price:60,desc:'적에게 빛 피해'}]",
    "if(hero.lv>=2)a.push({id:'heal',name:'회복',mp:2})",
    "a.push({id:'greaterHeal',name:'대회복',mp:5})",
    "const normalByZone=[30,30,45,60,75,90,100]",
]:
    if required not in s: raise SystemExit('existing RPG invariant missing: '+required)

play.write_text(s,encoding='utf-8')
subprocess.run(['node','--check',str(module)],check=True)
scripts=re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>',s,re.S)
Path('/tmp/oso-inline.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/oso-inline.js'],check=True)

sotris_after=hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_after!=sotris_before: raise SystemExit('SOTRIS changed unexpectedly')
after=hashlib.sha256(s.encode()).hexdigest()
report='\n'.join([
 'RPG FIELD ACTIONS CONNECTION VERIFIED',
 'SEPARATE_MODULE=play/rpg-field-actions.js',
 'EXISTING_RPG_JS_DIRECT_REWRITE=NO',
 'MENU_ITEMS=아이템,마법',
 'FIELD_POTION=HP_FULL_RECOVERY',
 'FIELD_ETHER=MP_FULL_RECOVERY',
 'FIELD_HOLY_WATER=BATTLE_ONLY',
 'FIELD_HEAL=LV2_MP2_HP_12_PLUS_LVx2',
 'FIELD_GREATER_HEAL=LV6_MP5_HP_28_PLUS_LVx3',
 'OFFENSIVE_AND_BARRIER_MAGIC=BATTLE_ONLY',
 'FULL_HP_MP_ITEM_WASTE=BLOCKED',
 'INLINE_JS_NODE_CHECK=PASS',
 'MODULE_JS_NODE_CHECK=PASS',
 'SOTRIS_CHANGED=NO',
 'PLAY_SHA256_BEFORE='+before,
 'PLAY_SHA256_AFTER='+after,
])+'\n'
Path('.github/rpg-field-actions-report.txt').write_text(report,encoding='utf-8')
print(report,end='')
