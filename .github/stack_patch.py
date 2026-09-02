from pathlib import Path
import re
import sys

path = Path(sys.argv[1] if len(sys.argv) > 1 else 'play/index.html')
s = path.read_text(encoding='utf-8')
start = s.index('function playStack(){')
end = s.index('/* run - stable dt + 2 jumps */', start)
before, block, after = s[:start], s[start:end], s[end:]

# Small stable anchors only; every edit is restricted to playStack().
exact_replacements = [
    (
        '<div class="levelHud" id="levelHud">LEVEL 1</div>',
        '<div class="levelHud" id="levelHud">LEVEL 1</div>\n  <div class="lifeHud" id="stackLife">❤️❤️❤️</div>'
    ),
    (
        'let score=0,floor=0,alive=true,raf,last=0,current=null,x=0,dir=1,perfect=0,accuracyTotal=0,level=1,lastDropAt=-1e9,retrying=false;',
        'let score=0,floor=0,alive=true,raf,last=0,current=null,x=0,dir=1,perfect=0,accuracyTotal=0,level=1,lastDropAt=-1e9,retrying=false,lives=3;'
    ),
    (
        "$('#perfectHud').textContent=`정확도 ${acc}%`;",
        "$('#perfectHud').textContent=`정확도 ${acc}%`;\n   $('#stackLife').textContent='❤️'.repeat(lives)+'🖤'.repeat(Math.max(0,3-lives));"
    ),
    (
        "showComboBurst('PERFECT!',10,'great');",
        "showComboBurst(`PERFECT! +${pts}`,10,'great');"
    ),
    (
        "showComboBurst('GREAT!',5,'great')",
        "showComboBurst(`GREAT! +${pts}`,5,'great')"
    ),
    (
        "showComboBurst('GOOD!',2,'combo')",
        "showComboBurst(`GOOD! +${pts}`,2,'combo')"
    ),
    (
        "showComboBurst('아슬아슬!',2,'combo')",
        "showComboBurst(`아슬아슬! +${pts}`,2,'combo')"
    ),
]
for idx, (old, new) in enumerate(exact_replacements, 1):
    count = block.count(old)
    if count != 1:
        raise SystemExit(f'exact replacement {idx}: expected exactly 1 occurrence inside playStack, found {count}')
    block = block.replace(old, new, 1)

# Next moving silk inherits the exact width of the latest placed silk.
width_pattern = r"let\s+w\s*=\s*Math\.max\(\s*90\s*,\s*baseW\s*-\s*floor\s*\*\s*12\s*\)\s*;\s*e\.style\.width\s*=\s*w\s*\+\s*['\"]px['\"]\s*;"
width_new = "const placed=lane.querySelectorAll('.silkPiece,.silkBase');\n   const prevPlaced=placed[placed.length-1];\n   let w=prevPlaced?parseFloat(prevPlaced.style.width):baseW;\n   if(!Number.isFinite(w)||w<=0)w=baseW;\n   e.style.width=w+'px';"
block, n = re.subn(width_pattern, width_new, block, count=1)
if n != 1:
    raise SystemExit(f'width replacement: expected exactly 1 occurrence inside playStack, found {n}')

# MISS: lose one heart and 60 points.
miss_penalty_pattern = r"score\s*=\s*Math\.max\(\s*0\s*,\s*score\s*-\s*30\s*\)\s*;\s*\$\('#gScore'\)\.textContent\s*=\s*score\s*;"
miss_penalty_new = "lives=Math.max(0,lives-1);\n    score=Math.max(0,score-60);hud();"
block, n = re.subn(miss_penalty_pattern, miss_penalty_new, block, count=1)
if n != 1:
    raise SystemExit(f'miss penalty replacement: expected exactly 1 occurrence, found {n}')

miss_fx_pattern = r"tone\('bad'\)\s*;\s*buzz\(110\)\s*;\s*softShake\(\)\s*;\s*showComboBurst\('MISS! 다시!'\s*,\s*2\s*,\s*'multi'\)\s*;"
miss_fx_new = "tone('bad');buzz(110);softShake();\n    if(lives<=0){\n     alive=false;\n     cancelAnimationFrame(raf);\n     showComboBurst('GAME OVER',3,'multi');\n     setTimeout(()=>finish('stack',score,playStack,false),560);\n     return;\n    }\n    showComboBurst(`MISS! ❤️ ${lives}/3`,2,'multi');"
block, n = re.subn(miss_fx_pattern, miss_fx_new, block, count=1)
if n != 1:
    raise SystemExit(f'miss FX replacement: expected exactly 1 occurrence, found {n}')

# Wider score separation by placement accuracy.
score_pattern = r"let\s+q\s*=\s*overlap\s*/\s*pw\s*;\s*let\s+placementAcc\s*=\s*stackClamp\(\s*100\s*-\s*\(centered\s*/\s*Math\.max\(\s*1\s*,\s*pw\s*\*\s*\.5\s*\)\)\s*\*\s*100\s*,\s*0\s*,\s*100\s*\)\s*;\s*let\s+bonus\s*=\s*Math\.max\(\s*0\s*,\s*Math\.round\(\s*100\s*-\s*centered\s*\)\s*\)\s*;\s*score\s*\+=\s*Math\.round\(\s*130\s*\*\s*q\s*\)\s*\+\s*bonus\s*;"
score_new = "let placementAcc=stackClamp(100-(centered/Math.max(1,pw*.5))*100,0,100);\n   let pts=placementAcc>=97?360:placementAcc>=88?220:placementAcc>=75?110:40;\n   score += pts;"
block, n = re.subn(score_pattern, score_new, block, count=1)
if n != 1:
    raise SystemExit(f'score replacement: expected exactly 1 occurrence, found {n}')

checks = [
    'id="stackLife"',
    'lives=3',
    "'❤️'.repeat(lives)",
    'prevPlaced?parseFloat(prevPlaced.style.width):baseW',
    "finish('stack',score,playStack,false)",
    'placementAcc>=97?360:placementAcc>=88?220:placementAcc>=75?110:40',
    'MISS! ❤️ ${lives}/3',
]
for token in checks:
    if token not in block:
        raise SystemExit(f'missing expected patched token: {token}')

# Old behavior must be gone from playStack().
for old_token in ['baseW-floor*12', "showComboBurst('MISS! 다시!'", 'Math.round(130*q)+bonus']:
    if old_token in block:
        raise SystemExit(f'old stack behavior still present: {old_token}')

s = before + block + after
path.write_text(s, encoding='utf-8')
print('stack patch complete: persistent width, 3-heart MISS game over, wider score tiers')
