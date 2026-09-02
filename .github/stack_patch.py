from pathlib import Path
import sys

path = Path(sys.argv[1] if len(sys.argv) > 1 else 'play/index.html')
s = path.read_text(encoding='utf-8')

replacements = [
    (
        '  <div class="levelHud" id="levelHud">LEVEL 1</div>\n  \n  <div class="gameTip">비단 폭이 점점 좁아지고 속도가 빨라집니다 · 15단 완성 목표</div>`;',
        '  <div class="levelHud" id="levelHud">LEVEL 1</div>\n  <div class="lifeHud" id="stackLife">❤️❤️❤️</div>\n  \n  <div class="gameTip">폭 유지가 핵심 · MISS 시 ❤️ -1 · 15단 완성</div>`;'
    ),
    (
        '  let score=0,floor=0,alive=true,raf,last=0,current=null,x=0,dir=1,perfect=0,accuracyTotal=0,level=1,lastDropAt=-1e9,retrying=false;',
        '  let score=0,floor=0,alive=true,raf,last=0,current=null,x=0,dir=1,perfect=0,accuracyTotal=0,level=1,lastDropAt=-1e9,retrying=false,lives=3;'
    ),
    (
        "  function hud(){\n   $('#gScore').textContent=score;\n   $('#floorHud').textContent=`${floor} / 15 단`;\n   const acc=floor?Math.round(accuracyTotal/floor):0;\n   $('#perfectHud').textContent=`정확도 ${acc}%`;\n  }",
        "  function hud(){\n   $('#gScore').textContent=score;\n   $('#floorHud').textContent=`${floor} / 15 단`;\n   const acc=floor?Math.round(accuracyTotal/floor):0;\n   $('#perfectHud').textContent=`정확도 ${acc}%`;\n   $('#stackLife').textContent='❤️'.repeat(lives)+'🖤'.repeat(Math.max(0,3-lives));\n  }"
    ),
    (
        "   let w=Math.max(90,baseW-floor*12);\n   e.style.width=w+'px';",
        "   const placed=lane.querySelectorAll('.silkPiece,.silkBase');\n   const prevPlaced=placed[placed.length-1];\n   let w=prevPlaced?parseFloat(prevPlaced.style.width):baseW;\n   if(!Number.isFinite(w)||w<=0)w=baseW;\n   e.style.width=w+'px';"
    ),
    (
        "   if(overlap<28){\n    retrying=true;\n    const failed=current;\n    failed.classList.add('miss');\n    score=Math.max(0,score-30);$('#gScore').textContent=score;\n    tone('bad');buzz(110);softShake();showComboBurst('MISS! 다시!',2,'multi');\n    setTimeout(()=>{\n     if(!alive)return;\n     failed.remove();\n     dir*=-1;\n     current=piece();\n     x=dir>0?0:Math.max(0,W()-parseFloat(current.style.width));\n     current.style.left=x+'px';\n     lastDropAt=performance.now();\n     retrying=false\n    },360);\n    return;\n   }",
        "   if(overlap<28){\n    retrying=true;\n    const failed=current;\n    failed.classList.add('miss');\n    lives=Math.max(0,lives-1);\n    score=Math.max(0,score-60);hud();\n    tone('bad');buzz(110);softShake();\n    if(lives<=0){\n     alive=false;\n     cancelAnimationFrame(raf);\n     showComboBurst('GAME OVER',3,'multi');\n     setTimeout(()=>finish('stack',score,playStack,false),560);\n     return;\n    }\n    showComboBurst(`MISS! ❤️ ${lives}/3`,2,'multi');\n    setTimeout(()=>{\n     if(!alive)return;\n     failed.remove();\n     dir*=-1;\n     current=piece();\n     x=dir>0?0:Math.max(0,W()-parseFloat(current.style.width));\n     current.style.left=x+'px';\n     lastDropAt=performance.now();\n     retrying=false\n    },360);\n    return;\n   }"
    ),
    (
        "   let centered=Math.abs((l+w/2)-(pl+pw/2));\n   let q=overlap/pw;\n   let placementAcc=stackClamp(100-(centered/Math.max(1,pw*.5))*100,0,100);\n   let bonus=Math.max(0,Math.round(100-centered));\n   score += Math.round(130*q)+bonus;\n   accuracyTotal+=placementAcc;",
        "   let centered=Math.abs((l+w/2)-(pl+pw/2));\n   let placementAcc=stackClamp(100-(centered/Math.max(1,pw*.5))*100,0,100);\n   let pts=placementAcc>=97?360:placementAcc>=88?220:placementAcc>=75?110:40;\n   score += pts;\n   accuracyTotal+=placementAcc;"
    ),
    (
        "    showComboBurst('PERFECT!',10,'great');particles(innerWidth*.5,innerHeight*.38,'✨',12)",
        "    showComboBurst(`PERFECT! +${pts}`,10,'great');particles(innerWidth*.5,innerHeight*.38,'✨',12)"
    ),
    (
        "    current.classList.add('good');tone('perfect');buzz([32,12,48]);showComboBurst('GREAT!',5,'great')",
        "    current.classList.add('good');tone('perfect');buzz([32,12,48]);showComboBurst(`GREAT! +${pts}`,5,'great')"
    ),
    (
        "    current.classList.add('ok');tone('good');buzz(32);showComboBurst('GOOD!',2,'combo')",
        "    current.classList.add('ok');tone('good');buzz(32);showComboBurst(`GOOD! +${pts}`,2,'combo')"
    ),
    (
        "    current.classList.add('ok');tone('good');buzz(32);showComboBurst('아슬아슬!',2,'combo')",
        "    current.classList.add('ok');tone('good');buzz(32);showComboBurst(`아슬아슬! +${pts}`,2,'combo')"
    ),
]

for idx, (old, new) in enumerate(replacements, 1):
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'replacement {idx}: expected exactly 1 occurrence, found {count}')
    s = s.replace(old, new, 1)

path.write_text(s, encoding='utf-8')
print(f'patched {len(replacements)} stack-only replacements')
