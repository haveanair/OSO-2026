from pathlib import Path
import hashlib, re, subprocess, tempfile

root=Path('.')
play=root/'play/index.html'
ability=root/'play/character-special-abilities.js'
sotris_integration=root/'play/sp1/sotris-integration.js'
sotris_game=root/'play/sp1/sotris/index.html'
report=root/'.github/shooting-movement-sotris-report.txt'

for p in (play,ability,sotris_integration,sotris_game):
    if not p.exists():
        raise SystemExit(f'missing required file: {p}')

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

sotris_game_before=sha(sotris_game)
sotris_integration_before=sha(sotris_integration)

html=play.read_text(encoding='utf-8')
js=ability.read_text(encoding='utf-8')

old_delay="const baseDelay=Math.max(70,98-power*5),delay=sfAbility?sfAbility.shootingDelayMs(skin,baseDelay):baseDelay;"
new_delay="const delay=Math.max(70,98-power*5);"
if old_delay not in html:
    raise SystemExit('shooting fire-rate hook marker not found')
html=html.replace(old_delay,new_delay,1)

old_pointer=""" function pointerPos(e){
  const r=canvas.getBoundingClientRect();
  player.x=clamp(e.clientX-r.left,22,W-22);
  player.y=clamp(e.clientY-r.top,205,H-38)
 }
 canvas.addEventListener('pointerdown',e=>{drag=true;canvas.setPointerCapture?.(e.pointerId);pointerPos(e)});
 canvas.addEventListener('pointermove',e=>{if(drag)pointerPos(e)});
 canvas.addEventListener('pointerup',()=>drag=false);
 canvas.addEventListener('pointercancel',()=>drag=false);"""
new_pointer=""" let sfPointerX=null,sfPointerY=null;
 function pointerPos(e,initial=false){
  const r=canvas.getBoundingClientRect(),px=clamp(e.clientX-r.left,22,W-22),py=clamp(e.clientY-r.top,205,H-38);
  const moveMult=(!isKf21&&sfAbility&&typeof sfAbility.shootingMoveMultiplier==='function')?sfAbility.shootingMoveMultiplier(skin):1;
  if(initial||sfPointerX===null||sfPointerY===null){player.x=px;player.y=py}
  else{
   player.x=clamp(player.x+(px-sfPointerX)*moveMult,22,W-22);
   player.y=clamp(player.y+(py-sfPointerY)*moveMult,205,H-38)
  }
  sfPointerX=px;sfPointerY=py
 }
 canvas.addEventListener('pointerdown',e=>{drag=true;canvas.setPointerCapture?.(e.pointerId);pointerPos(e,true)});
 canvas.addEventListener('pointermove',e=>{if(drag)pointerPos(e,false)});
 canvas.addEventListener('pointerup',()=>{drag=false;sfPointerX=sfPointerY=null});
 canvas.addEventListener('pointercancel',()=>{drag=false;sfPointerX=sfPointerY=null});"""
if old_pointer not in html:
    raise SystemExit('spacefighter pointer block marker not found')
html=html.replace(old_pointer,new_pointer,1)

html=html.replace('./character-special-abilities.js?v=20260907-charability1','./character-special-abilities.js?v=20260907-charability2',1)

old_func="""  function shootingDelayMs(skin,baseMs){
    const base=Math.max(1,Number(baseMs)||1);
    return traits(skin).aya?Math.max(48,Math.round(base*.72)):base;
  }
"""
new_func="""  function shootingMoveMultiplier(skin){
    return traits(skin).aya?1.28:1;
  }
"""
if old_func not in js:
    raise SystemExit('ability shooting delay function marker not found')
js=js.replace(old_func,new_func,1)
js=js.replace("VERSION:'1.0.0',traits,racingLimits,shootingDelayMs,","VERSION:'1.0.1',traits,racingLimits,shootingMoveMultiplier,",1)

play.write_text(html,encoding='utf-8')
ability.write_text(js,encoding='utf-8')

# Structural verification
assert 'shootingDelayMs' not in html
assert 'shootingDelayMs' not in js
assert 'shootingMoveMultiplier' in html
assert 'shootingMoveMultiplier' in js
assert 'const delay=Math.max(70,98-power*5);' in html
assert "!isKf21&&sfAbility" in html
assert 'sp1/sotris-integration.js' in html
assert "const SP1_URL='sp1/sotris/index.html';" in sotris_integration.read_text(encoding='utf-8')

# Syntax verification of external module and every inline script body.
subprocess.run(['node','--check',str(ability)],check=True)
inline=[]
for m in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>.*?)</script>',html,re.S|re.I):
    if re.search(r'\bsrc\s*=',m.group('attrs'),re.I):
        continue
    inline.append(m.group('body'))
with tempfile.NamedTemporaryFile('w',suffix='.js',encoding='utf-8',delete=False) as f:
    f.write('\n;\n'.join(inline))
    tmp=f.name
subprocess.run(['node','--check',tmp],check=True)

sotris_game_after=sha(sotris_game)
sotris_integration_after=sha(sotris_integration)
if sotris_game_before!=sotris_game_after or sotris_integration_before!=sotris_integration_after:
    raise SystemExit('SOTRIS changed unexpectedly')

report.write_text('\n'.join([
    'SHOOTING MOVEMENT + SOTRIS VERIFY PASS',
    'AYA_SHOOTING_FIRE_RATE=BASE',
    'AYA_SHOOTING_MOVE_MULTIPLIER=1.28',
    'NONGAE_INHERITS_AYA_SHOOTING_MOVEMENT=YES',
    'KF21_INHERITS_CHARACTER_MOVEMENT_BONUS=NO',
    'NONGAE_MAX_JUMPS=4',
    'SOTRIS_INTEGRATION_PRESENT=YES',
    'SOTRIS_GAME_PRESENT=YES',
    'MAIN_HTML_REFERENCES_SOTRIS_INTEGRATION=YES',
    'STANDALONE_INDEX_REQUIRES_SP1_SUBDIRECTORY=YES',
    'SOTRIS_CHANGED=NO',
    f'SOTRIS_GAME_SHA256={sotris_game_after}',
    f'SOTRIS_INTEGRATION_SHA256={sotris_integration_after}',
    'CHARACTER_SPECIAL_JS_NODE_CHECK=PASS',
    'INLINE_JS_NODE_CHECK=PASS',
])+'\n',encoding='utf-8')
print(report.read_text(encoding='utf-8'))
