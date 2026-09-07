from pathlib import Path
import re, subprocess, hashlib

p=Path('play/silk-stack-endless.js')
s=p.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()

# 1) Extra visual rules: stronger cheerful roof break + distant broken building/mountains.
anchor="  .sseFlagBurst{animation:sseFlagBurst .65s ease-out}@keyframes sseFlagBurst{0%{transform:scale(.25) rotate(-8deg)}55%{transform:scale(1.18) rotate(2deg)}100%{transform:scale(1)}}\n"
extra="""  .sseFlagBurst{animation:sseFlagBurst .65s ease-out}@keyframes sseFlagBurst{0%{transform:scale(.25) rotate(-8deg)}55%{transform:scale(1.18) rotate(2deg)}100%{transform:scale(1)}}
  .sseBreakRing{position:absolute;left:50%;top:20%;z-index:22;width:36px;height:36px;border:8px solid #fff6c7;border-radius:50%;transform:translate(-50%,-50%);animation:sseBreakRing .58s ease-out forwards;pointer-events:none}@keyframes sseBreakRing{to{width:360px;height:360px;opacity:0}}
  .sseRoofChunk{position:absolute;z-index:23;left:var(--x);top:16%;width:var(--w);height:22px;border:3px solid #623a26;background:linear-gradient(#d69555,#8f5937);clip-path:polygon(0 0,100% 9%,88% 100%,9% 86%);transform-origin:center;animation:sseRoofPop .72s cubic-bezier(.18,.8,.28,1) forwards;pointer-events:none}@keyframes sseRoofPop{0%{transform:translate(0,0) rotate(0) scale(1)}35%{transform:translate(var(--dx),-55px) rotate(var(--r)) scale(1.08)}100%{transform:translate(var(--dx),230px) rotate(calc(var(--r) * 1.8)) scale(.88);opacity:0}}
  .sseBackdrop{--skyScale:1;--skyDrop:0px;--skyFade:1}
  .sseMountainFar,.sseMountainNear{position:absolute;left:-8%;right:-8%;bottom:56px;transform-origin:50% 100%;pointer-events:none}
  .sseMountainFar{height:34%;background:#84a9b6;clip-path:polygon(0 100%,0 71%,10% 46%,19% 70%,31% 31%,42% 68%,52% 41%,65% 72%,76% 34%,88% 66%,100% 44%,100% 100%);opacity:calc(.72 * var(--skyFade));transform:translateY(var(--skyDrop)) scale(var(--skyScale))}
  .sseMountainNear{height:25%;background:#537c69;clip-path:polygon(0 100%,0 66%,15% 38%,29% 72%,46% 32%,61% 74%,78% 45%,100% 69%,100% 100%);opacity:calc(.85 * var(--skyFade));transform:translateY(var(--skyDrop)) scale(var(--skyScale))}
  .sseBrokenBuilding{position:absolute;left:50%;bottom:54px;width:116px;height:210px;margin-left:-58px;background:repeating-linear-gradient(0deg,#7d8790 0 32px,#59636d 32px 37px);border:5px solid #454d54;clip-path:polygon(0 10%,12% 2%,25% 12%,40% 0,55% 13%,71% 4%,84% 12%,100% 3%,100% 100%,0 100%);transform-origin:50% 100%;transform:translateY(var(--skyDrop)) scale(var(--skyScale));opacity:var(--skyFade);box-shadow:0 6px 18px #1e435455}
  .sseBrokenBuilding:after{content:'';position:absolute;inset:22px 15px;background:repeating-linear-gradient(0deg,#90d0ef 0 17px,#40515c 17px 24px);opacity:.75}
  .sseScene.sse-sky.sse-high .ssePlane{opacity:1}.sseScene.sse-sky .ssePlane{opacity:0;transition:opacity .6s}
  .sseScene.sse-sky .silkGround{opacity:var(--skyFade);transition:opacity .35s}
"""
if anchor not in s:
    raise SystemExit('visual CSS anchor not found')
s=s.replace(anchor,extra,1)

# 2) Correct continuous floor numbering and sky/space thresholds.
pat=r" function stageFor\(total\)\{.*?\n \}\n function breakLabel\(total\)\{.*?\n \}\n function backdropHTML\(st\)\{.*?\n \}\n"
repl=""" function stageFor(total){
  const n=Math.max(0,Math.floor(Number(total)||0));
  if(n<30)return {zone:'house',floor:Math.floor(n/15)+1,label:`집 ${Math.floor(n/15)+1}층`};
  if(n<75){const floor=Math.floor(n/15)+1;return {zone:'building',floor,label:`빌딩 ${floor}층`}}
  if(n<225){const floor=Math.floor((n-75)/15)+1;return {zone:'sky',floor,label:`하늘 ${floor}층`}}
  return {zone:'space',floor:Math.floor((n-225)/15)+1,label:`우주 ${Math.floor((n-225)/15)+1}구역`}
 }
 function breakLabel(total){
  if(total===15)return '지붕 격파! · 2층';
  if(total===30)return '집 지붕 격파! · 빌딩 3층';
  if(total===45)return '빌딩 3층 격파! · 4층';
  if(total===60)return '빌딩 4층 격파! · 5층';
  if(total===75)return '빌딩 천장 격파! · 하늘 돌파';
  if(total===225)return '대기권 돌파! · 우주 진입';
  const st=stageFor(total);
  if(st.zone==='sky')return `하늘 ${st.floor}층 돌파!`;
  if(st.zone==='space')return `우주 고도 ${st.floor}`;
  return `${st.label} 돌파!`
 }
 function backdropHTML(st){
  if(st.zone==='house')return `<div class="sseHouseWall"></div><div class="sseHouseWindow l"></div><div class="sseHouseWindow r"></div><div class="sseCeiling"></div>`;
  if(st.zone==='building')return `<div class="sseBuildingWall"></div><div class="sseWindowGrid"></div><div class="sseFloorBand"></div>`;
  if(st.zone==='sky')return `<div class="sseMountainFar"></div><div class="sseMountainNear"></div><div class="sseBrokenBuilding"></div><div class="sseCloud c1"></div><div class="sseCloud c2"></div><div class="sseBird b1">🐦</div><div class="sseBird b2">🐦</div><div class="ssePlane">✈️</div>`;
  return `<div class="sseStars"></div><div class="sseRocket">🚀</div><div class="sseMeteor m1"></div><div class="sseMeteor m2"></div><div class="sseStation"><i></i></div><div class="sseAstronaut" style="--d:-2s">🧑‍🚀</div><div class="sseAstronaut" style="--d:-9s;top:58%;font-size:31px">🧑‍🚀</div>`
 }
"""
s,n=re.subn(pat,repl,s,flags=re.S)
if n!=1: raise SystemExit(f'stage block replace count {n}')

# 3) State for carry-over width and continuous sky camera.
old="let score=0,total=0,segment=0,alive=true,raf,last=0,current=null,x=0,dir=1,perfect=0,accuracyTotal=0,level=1,lastDropAt=-1e9,retrying=false,lives=3,transitioning=false,lastStageKey='';\n  const W=()=>lane.getBoundingClientRect().width,baseW=Math.min(235,W()*.58);"
new="let score=0,total=0,segment=0,alive=true,raf,last=0,current=null,x=0,dir=1,perfect=0,accuracyTotal=0,level=1,lastDropAt=-1e9,retrying=false,lives=3,transitioning=false,lastStageKey='',carryWidth=0,cameraOffset=0;\n  const W=()=>lane.getBoundingClientRect().width,baseW=Math.min(235,W()*.58);carryWidth=baseW;"
if old not in s: raise SystemExit('state anchor not found')
s=s.replace(old,new,1)

# 4) Scene changes: house/building switch per floor, sky and space stay continuous.
pat=r"  function setScene\(force=false\)\{.*?\n  \}\n  function hud\(\)\{"
repl="""  function setScene(force=false){
   const st=stageFor(total),continuous=st.zone==='sky'||st.zone==='space',key=continuous?st.zone:st.zone+':'+st.floor;
   const high=st.zone==='sky'&&st.floor>=5;
   scene.className=`silkScene sseScene sse-${st.zone}${high?' sse-high':''}`;
   if(force||key!==lastStageKey){back.innerHTML=backdropHTML(st);lastStageKey=key}
   if(st.zone==='sky'){
    const p=clamp((total-75)/150,0,1);
    back.style.setProperty('--skyScale',(1-p*.58).toFixed(3));
    back.style.setProperty('--skyDrop',Math.round(p*88)+'px');
    back.style.setProperty('--skyFade',Math.max(.08,1-p*.88).toFixed(3))
   }else{back.style.setProperty('--skyScale','1');back.style.setProperty('--skyDrop','0px');back.style.setProperty('--skyFade','1')}
   const h=s.querySelector('#sseFloorHud');h.classList.toggle('space',st.zone==='space');h.innerHTML=`<span class="sseEndlessTag">ENDLESS</span>${st.label} · ${total}단`
  }
  function hud(){"""
s,n=re.subn(pat,repl,s,flags=re.S)
if n!=1: raise SystemExit(f'setScene replace count {n}')

# 5) Carry narrowed width into the next broken floor.
pat=r"  function clearStackVisual\(\)\{.*?\n  function piece\(\)\{"
repl="""  function clearStackVisual(){lane.querySelectorAll('.silkPiece,.silkBase,.stackFlag').forEach(e=>e.remove())}
  function addBase(width=carryWidth){
   const w=Math.max(28,Math.min(baseW,Number(width)||baseW));
   const e=document.createElement('div');e.className='silkBase';e.style.width=w+'px';e.style.left=((W()-w)/2)+'px';e.style.bottom='82px';e.innerHTML=silkHTML(total);lane.appendChild(e);return e
  }
  function piece(){"""
s,n=re.subn(pat,repl,s,flags=re.S)
if n!=1: raise SystemExit(f'base replace count {n}')

s=s.replace("e.style.width=w+'px';e.style.bottom=(135+segment*21)+'px';e.style.left=x+'px';", "e.style.width=w+'px';e.style.bottom=(135+segment*21-cameraOffset)+'px';e.style.left=x+'px';",1)
s=s.replace("flag.style.bottom=(135+segment*21+50)+'px';", "flag.style.bottom=(135+segment*21-cameraOffset+50)+'px';",1)

# 6) Strong roof destruction effect.
pat=r"  function debris\(\)\{.*?\n  \}\n  function breakthrough\(\)\{.*?\n  \}\n  function drop\(\)\{"
repl="""  function debris(){
   const flash=document.createElement('div');flash.className='sseBreakFlash';scene.appendChild(flash);
   const ring=document.createElement('div');ring.className='sseBreakRing';scene.appendChild(ring);
   const crack=document.createElement('div');crack.className='sseCrack';scene.appendChild(crack);
   for(let i=0;i<7;i++){const r=document.createElement('i');r.className='sseRoofChunk';r.style.setProperty('--x',(2+i*14)+'%');r.style.setProperty('--w',(44+Math.random()*34)+'px');r.style.setProperty('--dx',(-110+Math.random()*220)+'px');r.style.setProperty('--r',(-90+Math.random()*180)+'deg');scene.appendChild(r)}
   for(let i=0;i<24;i++){const d=document.createElement('i');d.className='sseDebris';d.style.setProperty('--x',(3+Math.random()*94)+'%');d.style.setProperty('--dx',(-180+Math.random()*360)+'px');d.style.setProperty('--dy',(90+Math.random()*300)+'px');d.style.setProperty('--r',(-320+Math.random()*640)+'deg');scene.appendChild(d)}
   setTimeout(()=>{flash.remove();ring.remove();crack.remove();scene.querySelectorAll('.sseDebris,.sseRoofChunk').forEach(e=>e.remove())},940)
  }
  function scrollContinuous(){
   if(total<75)return;
   const limit=Math.max(250,scene.clientHeight*.56),top=135+segment*21-cameraOffset+50;
   if(top<=limit)return;
   const shift=Math.min(25,Math.max(8,top-limit));cameraOffset+=shift;
   lane.querySelectorAll('.silkPiece,.silkBase,.stackFlag').forEach(el=>{const b=parseFloat(el.style.bottom);if(!Number.isFinite(b))return;const nb=b-shift;el.style.bottom=nb+'px';if(nb<-75)el.remove()})
  }
  function continuousMilestone(){
   flag1884();
   try{showComboBurst(breakLabel(total),8,'great');particles(innerWidth*.5,innerHeight*.34,total>=225?'🌠':'✨',10);tone('clear');buzz([18,8,28,8,42])}catch(_){}
   if(total===225){debris();try{softShake()}catch(_){};setScene(true)}
  }
  function breakthrough(){
   transitioning=true;carryWidth=Math.max(28,parseFloat(current?.style.width)||carryWidth||baseW);flag1884();debris();
   try{showComboBurst(breakLabel(total),10,'great');particles(innerWidth*.5,innerHeight*.38,'✨',16);tone('clear');buzz([22,8,36,8,54,8,76]);softShake()}catch(_){}
   setTimeout(()=>{
    if(!alive)return;
    clearStackVisual();segment=0;cameraOffset=0;setScene(true);addBase(carryWidth);dir*=-1;x=dir>0?0:Math.max(0,W()-carryWidth);current=piece();current.style.left=x+'px';lastDropAt=performance.now();transitioning=false;last=0;raf=requestAnimationFrame(loop)
   },620)
  }
  function drop(){"""
s,n=re.subn(pat,repl,s,flags=re.S)
if n!=1: raise SystemExit(f'break block replace count {n}')

# 7) Only house/building roof breaks interrupt. From sky onward, stacking/camera remain continuous.
old="total++;segment++;level=updateLevel('stack',score,level);hud();\n   if(segment>=15){cancelAnimationFrame(raf);breakthrough();return}\n   current=piece();dir*=-1;x=dir>0?0:Math.max(0,W()-parseFloat(current.style.width))"
new="total++;segment++;level=updateLevel('stack',score,level);hud();\n   if(total<=75&&total%15===0){cancelAnimationFrame(raf);breakthrough();return}\n   if(total>75&&total%15===0)continuousMilestone();\n   if(total>=75)scrollContinuous();\n   current=piece();dir*=-1;x=dir>0?0:Math.max(0,W()-parseFloat(current.style.width))"
if old not in s: raise SystemExit('drop milestone anchor not found')
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
subprocess.run(['node','--check',str(p)],check=True)

# Force browsers to load refined module.
idx=Path('play/index.html')
h=idx.read_text(encoding='utf-8')
oldtag='<script src="./silk-stack-endless.js?v=20260907-endless1"></script>'
newtag='<script src="./silk-stack-endless.js?v=20260907-endless2"></script>'
if newtag not in h:
    if h.count(oldtag)!=1: raise SystemExit(f'index silk tag count {h.count(oldtag)}')
    h=h.replace(oldtag,newtag,1)
idx.write_text(h,encoding='utf-8')

after=hashlib.sha256(s.encode()).hexdigest()
Path('.github/silk-stack-continuity-report.txt').write_text('\n'.join([
 'SILK STACK CONTINUITY REFINEMENT VERIFIED',
 'HOUSE_FLOORS=1,2',
 'BUILDING_FLOORS=3,4,5',
 'BUILDING_5_BREAK_TO_SKY=YES',
 'SKY_START_TOTAL=75',
 'SKY_CONTINUOUS_NO_15_STACK_RESET=YES',
 'SPACE_START_TOTAL=225',
 'SPACE_TRANSITION_CONTINUOUS=YES',
 'NARROWED_WIDTH_CARRIES_AFTER_BREAK=YES',
 'ROOF_BREAK_CHUNKS=7',
 'ROOF_BREAK_DEBRIS=24',
 'ROOF_BREAK_RING=YES',
 'DISTANT_BROKEN_BUILDING=YES',
 'MOUNTAINS=YES',
 'NATURAL_ALTITUDE_ZOOM=YES',
 'FLAG_EVERY_15_STACKS=YES',
 'MODULE_JS_NODE_CHECK=PASS',
 f'MODULE_SHA256_BEFORE={before}',
 f'MODULE_SHA256_AFTER={after}',
])+'\n',encoding='utf-8')
