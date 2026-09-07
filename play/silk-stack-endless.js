/* 어서오소 비단쌓기 엔들리스 확장
 * 일반 15단 10회 클리어 후 엔들리스 해금.
 * 기존 playStack은 보존하고, 해금/모드선택/엔들리스만 별도 모듈로 연결한다.
 */
(()=>{
 'use strict';
 if(window.__OSO_SILK_STACK_ENDLESS__)return;
 window.__OSO_SILK_STACK_ENDLESS__=true;

 const UNLOCK_CLEARS=10;
 const CLEAR_KEY='oso_silk_stack_normal_clears_v1';
 const STYLE_ID='osoSilkStackEndlessStyle';
 const originalPlayStack=typeof window.playStack==='function'?window.playStack:null;
 let activeMode='';
 let normalClearRecorded=false;

 function readClears(){
  try{return Math.max(0,Math.floor(Number(localStorage.getItem(CLEAR_KEY))||0))}catch(_){return 0}
 }
 function writeClears(v){
  const n=Math.max(0,Math.floor(Number(v)||0));
  try{localStorage.setItem(CLEAR_KEY,String(n))}catch(_){}
  return n
 }
 function isUnlocked(){return readClears()>=UNLOCK_CLEARS}
 function recordNormalClear(){
  if(normalClearRecorded)return readClears();
  normalClearRecorded=true;
  const before=readClears(),after=writeClears(Math.min(UNLOCK_CLEARS,before+1));
  if(before<UNLOCK_CLEARS&&after>=UNLOCK_CLEARS){
   try{showComboBurst('∞ ENDLESS MODE 해금!',10,'great');tone('clear');buzz([24,10,36,10,55,10,80])}catch(_){}
  }
  return after
 }

 function installFinishHook(){
  if(typeof window.finish!=='function'||window.finish.__silkEndlessClearWrapped)return;
  const native=window.finish;
  const wrapped=function(code,score,retry,clear){
   if(code==='stack'&&clear===true&&activeMode==='normal')recordNormalClear();
   return native.apply(this,arguments)
  };
  wrapped.__silkEndlessClearWrapped=true;
  wrapped.__silkEndlessClearOriginal=native;
  window.finish=wrapped
 }

 function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
  .sseModeBox{position:absolute;inset:0;z-index:25;display:flex;align-items:center;justify-content:center;padding:22px;background:linear-gradient(#91dcff,#fff2c8 63%,#9d653b)}
  .sseModeCard{width:min(340px,92%);padding:20px 17px;border:4px solid #71452d;border-radius:22px;background:#fff8df;box-shadow:0 10px 0 #6c432c55,0 18px 36px #0004;text-align:center;color:#55331f}
  .sseModeCard h3{margin:0 0 8px;font-size:22px}.sseModeCard p{margin:5px 0 14px;font-size:11px;font-weight:900;line-height:1.55}
  .sseModeBtns{display:grid;grid-template-columns:1fr 1fr;gap:10px}.sseModeBtns button{min-height:58px;border:3px solid #70442b;border-radius:15px;background:#f2c45c;color:#4d2d1b;font-weight:1000;font-size:14px;box-shadow:0 5px #9a6535}
  .sseModeBtns button:last-child{background:linear-gradient(#8be0ff,#8178ff);color:#fff;border-color:#31477a;box-shadow:0 5px #35456e}
  .sseUnlockProgress{font-size:10px!important;color:#7b5b42}

  .sseScene{position:absolute;inset:0;overflow:hidden;transition:background .35s}
  .sseScene .silkLane{z-index:4}.sseScene .silkGround{z-index:3}.sseBackdrop{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1}
  .sseScene.sse-house{background:linear-gradient(#f4e7c7 0 56%,#d7b57e 56% 100%)}
  .sseScene.sse-building{background:linear-gradient(#b9dded 0 25%,#d7d5cf 25% 100%)}
  .sseScene.sse-sky{background:linear-gradient(#42b8f0 0%,#9ee5ff 62%,#e7f8ff 100%)}
  .sseScene.sse-space{background:radial-gradient(circle at 75% 18%,#33306c 0 3%,#101333 32%,#050817 72%,#01030b 100%)}
  .sseScene.sse-building .silkBackStall,.sseScene.sse-building .silkShelf,.sseScene.sse-sky .silkBackStall,.sseScene.sse-sky .silkShelf,.sseScene.sse-space .silkBackStall,.sseScene.sse-space .silkShelf{display:none}
  .sseScene.sse-sky .silkGround{background:linear-gradient(#d8f3ff,#8fd2ee);box-shadow:inset 0 8px #fff8}
  .sseScene.sse-space .silkGround{background:linear-gradient(#25284f,#10152f);box-shadow:inset 0 8px #7682bd}
  .sseScene.sse-space .silkGuide{background:#20284f;color:#dce9ff;box-shadow:0 4px #090d24}

  .sseHouseWall{position:absolute;left:5%;right:5%;bottom:70px;height:70%;border:7px solid #75462e;background:repeating-linear-gradient(90deg,#f2dfb6 0 64px,#e6cda0 64px 68px);box-shadow:inset 0 0 0 5px #fff4;opacity:.72}
  .sseHouseWindow{position:absolute;top:24%;width:70px;height:88px;border:7px solid #71482f;background:linear-gradient(#86d4f7 0 48%,#d6f4ff 48%);box-shadow:inset 0 0 0 4px #fff5}.sseHouseWindow.l{left:9%}.sseHouseWindow.r{right:9%}
  .sseCeiling{position:absolute;left:-3%;right:-3%;top:18%;height:24px;background:#6f432d;box-shadow:0 9px #b57a42,0 -5px #4b2c20}
  .sseBuildingWall{position:absolute;left:3%;right:3%;top:7%;bottom:65px;border:7px solid #555c67;background:repeating-linear-gradient(0deg,#c7c9c9 0 58px,#858d96 58px 64px);box-shadow:inset 0 0 0 4px #e8ecef}
  .sseWindowGrid{position:absolute;inset:11% 8% 17%;background:repeating-linear-gradient(90deg,#0000 0 10%,#4b7d9b 10% 20%,#bcecff 20% 27%,#0000 27% 32%),repeating-linear-gradient(0deg,#0000 0 14%,#fff7 14% 18%,#0000 18% 30%);opacity:.78}
  .sseFloorBand{position:absolute;left:0;right:0;top:20%;height:18px;background:#4f5660;box-shadow:0 5px #9ba1a8}

  .sseCloud{position:absolute;width:100px;height:30px;border-radius:999px;background:#fffde8;filter:drop-shadow(0 3px 2px #5b9dbb55);animation:sseFly 10s linear infinite}.sseCloud:before,.sseCloud:after{content:'';position:absolute;border-radius:50%;background:inherit}.sseCloud:before{width:46px;height:46px;left:16px;top:-23px}.sseCloud:after{width:54px;height:54px;right:10px;top:-29px}
  .sseCloud.c1{top:18%;left:-130px}.sseCloud.c2{top:43%;left:-190px;animation-duration:14s;animation-delay:-7s;transform:scale(.75)}
  .sseBird{position:absolute;left:-60px;font-size:24px;animation:sseFly 8s linear infinite;filter:drop-shadow(0 2px #fff8)}.sseBird.b1{top:35%;animation-delay:-2s}.sseBird.b2{top:22%;animation-duration:11s;animation-delay:-7s}
  .ssePlane{position:absolute;left:-120px;top:16%;font-size:42px;animation:sseFly 7s linear infinite;filter:drop-shadow(0 4px 3px #245a7a66)}
  @keyframes sseFly{to{left:calc(100% + 140px)}}

  .sseStars{position:absolute;inset:0;background-image:radial-gradient(#fff 1.2px,transparent 1.3px),radial-gradient(#8fd8ff 1px,transparent 1.1px),radial-gradient(#ffe9a1 1px,transparent 1.1px);background-size:37px 37px,53px 53px,79px 79px;background-position:0 0,17px 11px,31px 29px;animation:sseStars 7s linear infinite}
  @keyframes sseStars{to{background-position:37px 74px,70px 117px,110px 187px}}
  .sseRocket{position:absolute;left:-80px;top:20%;font-size:42px;transform:rotate(35deg);animation:sseRocket 9s linear infinite}@keyframes sseRocket{0%{left:-80px;top:55%}100%{left:110%;top:5%}}
  .sseMeteor{position:absolute;width:95px;height:3px;background:linear-gradient(90deg,#fff0,#fff);transform:rotate(-28deg);animation:sseMeteor 3.8s linear infinite}.sseMeteor.m1{left:15%;top:-20%;animation-delay:-1s}.sseMeteor.m2{left:65%;top:-10%;animation-delay:-2.6s}@keyframes sseMeteor{to{transform:translate(-260px,420px) rotate(-28deg);opacity:0}}
  .sseStation{position:absolute;right:6%;top:14%;width:112px;height:28px;border-radius:8px;background:#d6dce9;box-shadow:0 0 18px #b5dfff55}.sseStation:before,.sseStation:after{content:'';position:absolute;top:6px;width:64px;height:16px;background:repeating-linear-gradient(90deg,#28508c 0 9px,#78a8df 9px 14px)}.sseStation:before{right:100%}.sseStation:after{left:100%}.sseStation i{position:absolute;left:46px;top:-14px;width:20px;height:56px;border-radius:10px;background:#f2f5fb}
  .sseAstronaut{position:absolute;left:-80px;top:38%;font-size:38px;animation:sseAstronaut 13s ease-in-out infinite;animation-delay:var(--d,0s);opacity:0}@keyframes sseAstronaut{0%,18%{opacity:0;transform:translate(0,0) rotate(-18deg)}28%,72%{opacity:1}82%,100%{opacity:0;transform:translate(calc(100vw + 150px),-90px) rotate(32deg)}}

  .sseFloorHud{position:absolute;left:10px;top:10px;z-index:18;min-width:92px;padding:7px 9px;border:3px solid #3d2b22;border-radius:12px;background:#fff4d9e8;color:#4e3020;font-size:12px;font-weight:1000;line-height:1.2;text-align:left;box-shadow:0 4px #0003;pointer-events:none}
  .sseFloorHud.space{border-color:#8397d7;background:#111936e8;color:#e8efff}
  .sseEndlessTag{display:block;font-size:8px;letter-spacing:.7px;opacity:.75}
  .sseBreakFlash{position:absolute;inset:0;z-index:19;background:#fff;animation:sseFlash .45s ease-out forwards;pointer-events:none}@keyframes sseFlash{to{opacity:0}}
  .sseCrack{position:absolute;left:8%;right:8%;top:18%;height:14px;z-index:20;background:linear-gradient(105deg,#fff0 0 8%,#fff 9% 11%,#fff0 12% 22%,#fff 23% 26%,#fff0 27% 40%,#fff 41% 44%,#fff0 45%);filter:drop-shadow(0 2px #2b1a12);animation:sseCrack .55s ease-out forwards;pointer-events:none}@keyframes sseCrack{70%{transform:scaleY(2.1)}100%{opacity:0;transform:translateY(90px) scaleY(2.5)}}
  .sseDebris{position:absolute;z-index:21;width:18px;height:12px;border:2px solid #583721;background:#a96e42;left:var(--x);top:19%;animation:sseDebris .75s cubic-bezier(.2,.7,.3,1) forwards;pointer-events:none}@keyframes sseDebris{to{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
  .sseFlagBurst{animation:sseFlagBurst .65s ease-out}@keyframes sseFlagBurst{0%{transform:scale(.25) rotate(-8deg)}55%{transform:scale(1.18) rotate(2deg)}100%{transform:scale(1)}}
  `;document.head.appendChild(st)
 }

 function showModeSelect(){
  ensureStyle();
  const s=document.querySelector('#stage');
  if(!s){if(originalPlayStack)originalPlayStack();return}
  const clears=readClears();
  s.innerHTML=`<div class="sseModeBox"><div class="sseModeCard"><h3>🧵 비단쌓기</h3><p>일반 15단을 ${UNLOCK_CLEARS}번 클리어해 엔들리스가 활성화되었습니다.</p><div class="sseModeBtns"><button type="button" id="sseNormalBtn">15단 도전</button><button type="button" id="sseEndlessBtn">∞ 엔들리스</button></div><p class="sseUnlockProgress">일반 클리어 ${clears}/${UNLOCK_CLEARS}</p></div></div>`;
  const n=s.querySelector('#sseNormalBtn'),e=s.querySelector('#sseEndlessBtn');
  if(n)n.onclick=()=>startNormal();
  if(e)e.onclick=()=>playEndless();
  cleanup=()=>{if(n)n.onclick=null;if(e)e.onclick=null}
 }
 function startNormal(){
  activeMode='normal';normalClearRecorded=false;
  if(originalPlayStack){
   originalPlayStack();
   const tip=document.querySelector('#stage .gameTip');
   if(tip&&!isUnlocked())tip.textContent=`비단 폭이 점점 좁아지고 속도가 빨라집니다 · 15단 완성 목표 · ENDLESS 해금 ${readClears()}/${UNLOCK_CLEARS}`
  }
 }
 function entry(){
  installFinishHook();ensureStyle();
  normalClearRecorded=false;
  if(isUnlocked())showModeSelect();else startNormal()
 }

 function stageFor(total){
  const n=Math.max(0,Math.floor(Number(total)||0));
  if(n<45)return {zone:'house',floor:Math.floor(n/15)+1,label:`집 ${Math.floor(n/15)+1}층`};
  if(n<120)return {zone:'building',floor:Math.floor((n-45)/15)+1,label:`빌딩 ${Math.floor((n-45)/15)+1}층`};
  if(n<270)return {zone:'sky',floor:Math.floor((n-120)/15)+1,label:`하늘 ${Math.floor((n-120)/15)+1}층`};
  return {zone:'space',floor:Math.floor((n-270)/15)+1,label:`우주 ${Math.floor((n-270)/15)+1}구역`}
 }
 function breakLabel(total){
  if(total===15)return '지붕 격파! · 2층';
  if(total===30)return '천장 격파! · 3층';
  if(total===45)return '집 지붕 격파! · 빌딩 1층';
  if(total===120)return '빌딩 천장 격파! · 하늘 돌파';
  if(total===270)return '대기권 돌파! · 우주 진입';
  const st=stageFor(total);
  if(st.zone==='building')return `빌딩 ${st.floor}층 돌파!`;
  if(st.zone==='sky')return `하늘 ${st.floor}층 돌파!`;
  if(st.zone==='space')return `우주 고도 ${st.floor}`;
  return `${st.label} 돌파!`
 }
 function backdropHTML(st){
  if(st.zone==='house')return `<div class="sseHouseWall"></div><div class="sseHouseWindow l"></div><div class="sseHouseWindow r"></div><div class="sseCeiling"></div>`;
  if(st.zone==='building')return `<div class="sseBuildingWall"></div><div class="sseWindowGrid"></div><div class="sseFloorBand"></div>`;
  if(st.zone==='sky')return `<div class="sseCloud c1"></div><div class="sseCloud c2"></div><div class="sseBird b1">🐦</div><div class="sseBird b2">🐦</div>${st.floor>=5?'<div class="ssePlane">✈️</div>':''}`;
  return `<div class="sseStars"></div><div class="sseRocket">🚀</div><div class="sseMeteor m1"></div><div class="sseMeteor m2"></div><div class="sseStation"><i></i></div><div class="sseAstronaut" style="--d:-2s">🧑‍🚀</div><div class="sseAstronaut" style="--d:-9s;top:58%;font-size:31px">🧑‍🚀</div>`
 }

 function playEndless(){
  ensureStyle();activeMode='endless';normalClearRecorded=false;
  const s=document.querySelector('#stage');if(!s)return;
  s.innerHTML=`<div class="silkScene sseScene sse-house" id="sseScene"><div class="sseBackdrop" id="sseBackdrop"></div><div class="silkLane" id="silkLane"><div class="silkSign">∞ 차곡차곡 비단쌓기</div><div class="silkBackStall"></div><div class="silkShelf shelf1"></div><div class="silkShelf shelf2"></div><div class="silkGuide">화면을 눌러 비단을 떨어뜨리소!</div></div><div class="silkGround"></div></div><div class="sseFloorHud" id="sseFloorHud"><span class="sseEndlessTag">ENDLESS</span>집 1층 · 0단</div><div class="comboHud" id="perfectHud">정확도 0%</div><div class="levelHud" id="levelHud">LEVEL 1</div><div class="lifeHud" id="stackLife">❤️❤️❤️</div><div class="gameTip">15단마다 위층 돌파 · 빌딩 → 하늘 → 우주까지 끝없이 쌓기</div>`;
  const lane=s.querySelector('#silkLane'),scene=s.querySelector('#sseScene'),back=s.querySelector('#sseBackdrop');
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let score=0,total=0,segment=0,alive=true,raf,last=0,current=null,x=0,dir=1,perfect=0,accuracyTotal=0,level=1,lastDropAt=-1e9,retrying=false,lives=3,transitioning=false,lastStageKey='';
  const W=()=>lane.getBoundingClientRect().width,baseW=Math.min(235,W()*.58);
  const patterns=[['#f8d5e2','#f0aac3','#d36a93'],['#d2ebff','#9dd3ff','#4ea7df'],['#ffe6b3','#ffc34d','#d98c00'],['#dff2cc','#a8df84','#5ba046'],['#ecd8ff','#c7a0ff','#8450d1']];
  function silkHTML(idx){const c=patterns[idx%patterns.length];return `<div class="silkFold" style="--c1:${c[0]};--c2:${c[1]};--c3:${c[2]};"><i></i><i></i><i></i><span></span></div>`}
  function setScene(force=false){
   const st=stageFor(total),key=st.zone+':'+st.floor;
   if(force||key!==lastStageKey){scene.className=`silkScene sseScene sse-${st.zone}`;back.innerHTML=backdropHTML(st);lastStageKey=key}
   const h=s.querySelector('#sseFloorHud');h.classList.toggle('space',st.zone==='space');h.innerHTML=`<span class="sseEndlessTag">ENDLESS</span>${st.label} · ${total}단`
  }
  function hud(){
   const gs=document.querySelector('#gScore');if(gs)gs.textContent=score;
   const acc=total?Math.round(accuracyTotal/total):0,ph=s.querySelector('#perfectHud');if(ph)ph.textContent=`정확도 ${acc}%`;
   const lh=s.querySelector('#stackLife');if(lh)lh.textContent='❤️'.repeat(lives)+'🖤'.repeat(Math.max(0,3-lives));
   setScene()
  }
  function clearStackVisual(){lane.querySelectorAll('.silkPiece,.silkBase,.stackFlag').forEach(e=>e.remove())}
  function addBase(){
   const e=document.createElement('div');e.className='silkBase';e.style.width=baseW+'px';e.style.left=((W()-baseW)/2)+'px';e.style.bottom='82px';e.innerHTML=silkHTML(total);lane.appendChild(e);return e
  }
  function piece(){
   const e=document.createElement('div');e.className='silkPiece';e.setAttribute('aria-hidden','true');e.style.pointerEvents='none';
   const placed=lane.querySelectorAll('.silkPiece,.silkBase'),prev=placed[placed.length-1];let w=prev?parseFloat(prev.style.width):baseW;if(!Number.isFinite(w)||w<=0)w=baseW;
   e.style.width=w+'px';e.style.bottom=(135+segment*21)+'px';e.style.left=x+'px';e.innerHTML=silkHTML(total+1);lane.appendChild(e);return e
  }
  function flag1884(){
   const l=parseFloat(current?.style.left)||0,w=parseFloat(current?.style.width)||120;
   const flag=document.createElement('div');flag.className='stackFlag sseFlagBurst';flag.textContent='1884 진주중앙시장';flag.style.left=Math.max(8,Math.min(W()-178,l+w/2-78))+'px';flag.style.bottom=(135+segment*21+50)+'px';lane.appendChild(flag);return flag
  }
  function debris(){
   const flash=document.createElement('div');flash.className='sseBreakFlash';scene.appendChild(flash);
   const crack=document.createElement('div');crack.className='sseCrack';scene.appendChild(crack);
   for(let i=0;i<18;i++){const d=document.createElement('i');d.className='sseDebris';d.style.setProperty('--x',(5+Math.random()*90)+'%');d.style.setProperty('--dx',(-150+Math.random()*300)+'px');d.style.setProperty('--dy',(90+Math.random()*280)+'px');d.style.setProperty('--r',(-260+Math.random()*520)+'deg');scene.appendChild(d)}
   setTimeout(()=>{flash.remove();crack.remove();scene.querySelectorAll('.sseDebris').forEach(e=>e.remove())},900)
  }
  function breakthrough(){
   transitioning=true;flag1884();debris();
   try{showComboBurst(breakLabel(total),10,'great');particles(innerWidth*.5,innerHeight*.38,total>=270?'🌠':'✨',14);tone('clear');buzz([28,12,44,12,68]);softShake()}catch(_){}
   setTimeout(()=>{
    if(!alive)return;
    clearStackVisual();segment=0;setScene();addBase();dir*=-1;x=dir>0?0:Math.max(0,W()-baseW);current=piece();current.style.left=x+'px';lastDropAt=performance.now();transitioning=false;last=0;raf=requestAnimationFrame(loop)
   },760)
  }
  function drop(){
   if(!alive||!current||retrying||transitioning)return;
   const l=parseFloat(current.style.left),w=parseFloat(current.style.width),arr=lane.querySelectorAll('.silkPiece,.silkBase'),prev=arr[arr.length-2],pl=parseFloat(prev.style.left),pw=parseFloat(prev.style.width),left=Math.max(l,pl),right=Math.min(l+w,pl+pw),overlap=Math.max(0,right-left);
   if(overlap<28){
    retrying=true;const failed=current;failed.classList.add('miss');lives=Math.max(0,lives-1);score=Math.max(0,score-60);hud();
    try{tone('bad');buzz(110);softShake()}catch(_){}
    if(lives<=0){alive=false;cancelAnimationFrame(raf);try{showComboBurst('GAME OVER',3,'multi')}catch(_){};setTimeout(()=>finish('stack',score,entry,false),560);return}
    try{showComboBurst(`MISS! ❤️ ${lives}/3`,2,'multi')}catch(_){}
    setTimeout(()=>{if(!alive)return;failed.remove();dir*=-1;current=piece();x=dir>0?0:Math.max(0,W()-parseFloat(current.style.width));current.style.left=x+'px';lastDropAt=performance.now();retrying=false},360);return
   }
   current.style.left=left+'px';current.style.width=overlap+'px';
   const centered=Math.abs((l+w/2)-(pl+pw/2)),placementAcc=clamp(100-(centered/Math.max(1,pw*.5))*100,0,100),pts=placementAcc>=97?360:placementAcc>=88?220:placementAcc>=75?110:40;
   score+=pts;accuracyTotal+=placementAcc;
   try{
    if(placementAcc>=97){perfect++;current.classList.add('good','stackPerfect');tone('perfect');buzz([32,12,48,12,72]);showComboBurst(`PERFECT! +${pts}`,10,'great');particles(innerWidth*.5,innerHeight*.38,'✨',12)}
    else if(placementAcc>=88){current.classList.add('good');tone('perfect');buzz([32,12,48]);showComboBurst(`GREAT! +${pts}`,5,'great')}
    else if(placementAcc>=75){current.classList.add('ok');tone('good');buzz(32);showComboBurst(`GOOD! +${pts}`,2,'combo')}
    else{current.classList.add('ok');tone('good');buzz(32);showComboBurst(`아슬아슬! +${pts}`,2,'combo')}
   }catch(_){}
   total++;segment++;level=updateLevel('stack',score,level);hud();
   if(segment>=15){cancelAnimationFrame(raf);breakthrough();return}
   current=piece();dir*=-1;x=dir>0?0:Math.max(0,W()-parseFloat(current.style.width))
  }
  function pointer(e){if(!alive||!current||retrying||transitioning)return;const now=performance.now();if(now-lastDropAt<90)return;lastDropAt=now;e.preventDefault();drop()}
  function loop(ts){
   if(!alive||transitioning)return;
   if(!last){last=ts;raf=requestAnimationFrame(loop);return}
   const dt=Math.max(0,Math.min(.04,(ts-last)/1000));last=ts;if(retrying){raf=requestAnimationFrame(loop);return}
   const pieceW=parseFloat(current.style.width),maxX=Math.max(0,W()-pieceW),speedPx=120+Math.min(250,total*4.5)+(level-1)*22;
   x+=dir*speedPx*dt;if(x<=0){x=0;dir=1}if(x>=maxX){x=maxX;dir=-1}current.style.left=x+'px';raf=requestAnimationFrame(loop)
  }
  addBase();setScene();current=piece();hud();s.style.touchAction='none';s.addEventListener('pointerdown',pointer,{capture:true,passive:false});raf=requestAnimationFrame(loop);
  cleanup=()=>{alive=false;retrying=true;transitioning=false;cancelAnimationFrame(raf);s.removeEventListener('pointerdown',pointer,true)}
 }

 installFinishHook();ensureStyle();
 window.playStack=entry;
 window.OsoSilkStackEndless=Object.freeze({UNLOCK_CLEARS,getClearCount:readClears,isUnlocked,stageFor,playEndless,playNormal:startNormal});
})();
