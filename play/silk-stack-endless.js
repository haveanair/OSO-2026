/* 어서오소 비단쌓기 통합 확장
 * 모드 선택 뒤 기존 readyThen 카운트다운을 1회만 사용한다.
 * 일반 15단 / 엔들리스가 동일 판정 엔진을 사용한다.
 * 하모·논개는 겹침 및 중심 오차 판정을 완화한다.
 * 15·30·45·60·75단 구조물 격파를 대표 연출로 강화한다.
 */
(()=>{
 'use strict';
 if(window.__OSO_SILK_STACK_ENDLESS__)return;
 window.__OSO_SILK_STACK_ENDLESS__=true;

 const UNLOCK_CLEARS=10;
 const CLEAR_KEY='oso_silk_stack_normal_clears_v1';
 const STYLE_ID='osoSilkStackEndlessStyle';
 const nativeStartGame=typeof window.startGame==='function'?window.startGame:null;
 let activeMode='', normalClearRecorded=false;

 function readClears(){try{return Math.max(0,Math.floor(Number(localStorage.getItem(CLEAR_KEY))||0))}catch(_){return 0}}
 function writeClears(v){const n=Math.max(0,Math.floor(Number(v)||0));try{localStorage.setItem(CLEAR_KEY,String(n))}catch(_){}return n}
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

 function skinTraits(){
  let skin=null;
  try{skin=typeof currentSkin==='function'?(currentSkin()||null):null}catch(_){}
  try{
   const api=window.OsoCharacterSpecialAbilities;
   if(api&&typeof api.traits==='function')return api.traits(skin||{})
  }catch(_){}
  const s=skin||{},id=String(s.id||''),group=String(s.group||'');
  const nongae=id==='nongae_jade'||id==='nongae_resolve'||group==='nongae';
  return {nongae,hamo:nongae||group==='hamo'||id==='hamo'}
 }
 function assistProfile(){
  const t=skinTraits(),assisted=!!(t.hamo||t.nongae);
  return {assisted,minOverlap:assisted?20:28,centerScale:assisted?1.30:1}
 }

 function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
  .sseModeBox{position:absolute;inset:0;z-index:25;display:flex;align-items:center;justify-content:center;padding:22px;background:linear-gradient(#91dcff,#fff2c8 63%,#9d653b)}
  .sseModeCard{width:min(340px,92%);padding:20px 17px;border:4px solid #71452d;border-radius:22px;background:#fff8df;box-shadow:0 10px 0 #6c432c55,0 18px 36px #0004;text-align:center;color:#55331f}
  .sseModeCard h3{margin:0 0 8px;font-size:22px}.sseModeCard p{margin:5px 0 14px;font-size:11px;font-weight:900;line-height:1.55}
  .sseModeBtns{display:grid;grid-template-columns:1fr 1fr;gap:10px}.sseModeBtns button{min-height:58px;border:3px solid #70442b;border-radius:15px;background:#f2c45c;color:#4d2d1b;font-weight:1000;font-size:14px;box-shadow:0 5px #9a6535}
  .sseModeBtns button:last-child{background:linear-gradient(#8be0ff,#8178ff);color:#fff;border-color:#31477a;box-shadow:0 5px #35456e}
  .sseUnlockProgress{font-size:10px!important;color:#7b5b42}.sseModeBtns button:disabled{background:#c8c8c8;color:#707070;border-color:#8a8a8a;box-shadow:0 5px #888;opacity:.76}
  .sseScene{position:absolute;inset:0;overflow:hidden;transition:background .35s}.sseScene .silkLane{z-index:4}.sseScene .silkGround{z-index:3}.sseBackdrop{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;--skyScale:1;--skyDrop:0px;--skyFade:1}
  .sseScene.sse-house{background:linear-gradient(#f4e7c7 0 56%,#d7b57e 56% 100%)}.sseScene.sse-building{background:linear-gradient(#b9dded 0 25%,#d7d5cf 25% 100%)}.sseScene.sse-sky{background:linear-gradient(#42b8f0 0%,#9ee5ff 62%,#e7f8ff 100%)}.sseScene.sse-space{background:radial-gradient(circle at 75% 18%,#33306c 0 3%,#101333 32%,#050817 72%,#01030b 100%)}
  .sseScene.sse-building .silkBackStall,.sseScene.sse-building .silkShelf,.sseScene.sse-sky .silkBackStall,.sseScene.sse-sky .silkShelf,.sseScene.sse-space .silkBackStall,.sseScene.sse-space .silkShelf{display:none}
  .sseScene.sse-sky .silkGround{background:linear-gradient(#d8f3ff,#8fd2ee);box-shadow:inset 0 8px #fff8;opacity:var(--skyFade);transition:opacity .35s}.sseScene.sse-space .silkGround{background:linear-gradient(#25284f,#10152f);box-shadow:inset 0 8px #7682bd}.sseScene.sse-space .silkGuide{background:#20284f;color:#dce9ff;box-shadow:0 4px #090d24}
  .sseHouseWall{position:absolute;left:5%;right:5%;bottom:70px;height:70%;border:7px solid #75462e;background:repeating-linear-gradient(90deg,#f2dfb6 0 64px,#e6cda0 64px 68px);box-shadow:inset 0 0 0 5px #fff4;opacity:.72}.sseHouseWindow{position:absolute;top:24%;width:70px;height:88px;border:7px solid #71482f;background:linear-gradient(#86d4f7 0 48%,#d6f4ff 48%);box-shadow:inset 0 0 0 4px #fff5}.sseHouseWindow.l{left:9%}.sseHouseWindow.r{right:9%}.sseCeiling{position:absolute;left:-3%;right:-3%;top:18%;height:24px;background:#6f432d;box-shadow:0 9px #b57a42,0 -5px #4b2c20}
  .sseBuildingWall{position:absolute;left:3%;right:3%;top:7%;bottom:65px;border:7px solid #555c67;background:repeating-linear-gradient(0deg,#c7c9c9 0 58px,#858d96 58px 64px);box-shadow:inset 0 0 0 4px #e8ecef}.sseWindowGrid{position:absolute;inset:11% 8% 17%;background:repeating-linear-gradient(90deg,#0000 0 10%,#4b7d9b 10% 20%,#bcecff 20% 27%,#0000 27% 32%),repeating-linear-gradient(0deg,#0000 0 14%,#fff7 14% 18%,#0000 18% 30%);opacity:.78}.sseFloorBand{position:absolute;left:0;right:0;top:20%;height:18px;background:#4f5660;box-shadow:0 5px #9ba1a8}
  .sseCloud{position:absolute;width:100px;height:30px;border-radius:999px;background:#fffde8;filter:drop-shadow(0 3px 2px #5b9dbb55);animation:sseFly 10s linear infinite}.sseCloud:before,.sseCloud:after{content:'';position:absolute;border-radius:50%;background:inherit}.sseCloud:before{width:46px;height:46px;left:16px;top:-23px}.sseCloud:after{width:54px;height:54px;right:10px;top:-29px}.sseCloud.c1{top:18%;left:-130px}.sseCloud.c2{top:43%;left:-190px;animation-duration:14s;animation-delay:-7s;transform:scale(.75)}.sseBird{position:absolute;left:-60px;font-size:24px;animation:sseFly 8s linear infinite}.sseBird.b1{top:35%;animation-delay:-2s}.sseBird.b2{top:22%;animation-duration:11s;animation-delay:-7s}.ssePlane{position:absolute;left:-120px;top:16%;font-size:42px;animation:sseFly 7s linear infinite;opacity:0;transition:opacity .6s}.sseScene.sse-sky.sse-high .ssePlane{opacity:1}@keyframes sseFly{to{left:calc(100% + 140px)}}
  .sseMountainFar,.sseMountainNear{position:absolute;left:-8%;right:-8%;bottom:56px;transform-origin:50% 100%;pointer-events:none}.sseMountainFar{height:34%;background:#84a9b6;clip-path:polygon(0 100%,0 71%,10% 46%,19% 70%,31% 31%,42% 68%,52% 41%,65% 72%,76% 34%,88% 66%,100% 44%,100% 100%);opacity:calc(.72 * var(--skyFade));transform:translateY(var(--skyDrop)) scale(var(--skyScale))}.sseMountainNear{height:25%;background:#537c69;clip-path:polygon(0 100%,0 66%,15% 38%,29% 72%,46% 32%,61% 74%,78% 45%,100% 69%,100% 100%);opacity:calc(.85 * var(--skyFade));transform:translateY(var(--skyDrop)) scale(var(--skyScale))}
  .sseBrokenBuilding{position:absolute;left:50%;bottom:54px;width:116px;height:210px;margin-left:-58px;background:repeating-linear-gradient(0deg,#7d8790 0 32px,#59636d 32px 37px);border:5px solid #454d54;clip-path:polygon(0 10%,12% 2%,25% 12%,40% 0,55% 13%,71% 4%,84% 12%,100% 3%,100% 100%,0 100%);transform-origin:50% 100%;transform:translateY(var(--skyDrop)) scale(var(--skyScale));opacity:var(--skyFade)}.sseBrokenBuilding:after{content:'';position:absolute;inset:22px 15px;background:repeating-linear-gradient(0deg,#90d0ef 0 17px,#40515c 17px 24px);opacity:.75}
  .sseStars{position:absolute;inset:0;background-image:radial-gradient(#fff 1.2px,transparent 1.3px),radial-gradient(#8fd8ff 1px,transparent 1.1px),radial-gradient(#ffe9a1 1px,transparent 1.1px);background-size:37px 37px,53px 53px,79px 79px;background-position:0 0,17px 11px,31px 29px;animation:sseStars 7s linear infinite}@keyframes sseStars{to{background-position:37px 74px,70px 117px,110px 187px}}.sseRocket{position:absolute;left:-80px;top:20%;font-size:42px;transform:rotate(35deg);animation:sseRocket 9s linear infinite}@keyframes sseRocket{0%{left:-80px;top:55%}100%{left:110%;top:5%}}.sseMeteor{position:absolute;width:95px;height:3px;background:linear-gradient(90deg,#fff0,#fff);transform:rotate(-28deg);animation:sseMeteor 3.8s linear infinite}.sseMeteor.m1{left:15%;top:-20%;animation-delay:-1s}.sseMeteor.m2{left:65%;top:-10%;animation-delay:-2.6s}@keyframes sseMeteor{to{transform:translate(-260px,420px) rotate(-28deg);opacity:0}}.sseStation{position:absolute;right:6%;top:14%;width:112px;height:28px;border-radius:8px;background:#d6dce9}.sseStation:before,.sseStation:after{content:'';position:absolute;top:6px;width:64px;height:16px;background:repeating-linear-gradient(90deg,#28508c 0 9px,#78a8df 9px 14px)}.sseStation:before{right:100%}.sseStation:after{left:100%}.sseStation i{position:absolute;left:46px;top:-14px;width:20px;height:56px;border-radius:10px;background:#f2f5fb}.sseAstronaut{position:absolute;left:-80px;top:38%;font-size:38px;animation:sseAstronaut 13s ease-in-out infinite;animation-delay:var(--d,0s);opacity:0}@keyframes sseAstronaut{0%,18%{opacity:0;transform:translate(0,0) rotate(-18deg)}28%,72%{opacity:1}82%,100%{opacity:0;transform:translate(calc(100vw + 150px),-90px) rotate(32deg)}}
  .sseFloorHud{position:absolute;left:10px;top:10px;z-index:18;min-width:92px;padding:7px 9px;border:3px solid #3d2b22;border-radius:12px;background:#fff4d9e8;color:#4e3020;font-size:12px;font-weight:1000;line-height:1.2;text-align:left;box-shadow:0 4px #0003;pointer-events:none}.sseFloorHud.space{border-color:#8397d7;background:#111936e8;color:#e8efff}.sseEndlessTag{display:block;font-size:8px;letter-spacing:.7px;opacity:.75}
  .sseBreakFlash{position:absolute;inset:0;z-index:30;background:#fff;animation:sseFlash .82s ease-out forwards;pointer-events:none}@keyframes sseFlash{0%{opacity:.95}35%{opacity:.55}100%{opacity:0}}
  .sseImpactShake{animation:sseImpactShake 1.45s cubic-bezier(.2,.7,.2,1)}@keyframes sseImpactShake{0%,100%{transform:translate(0)}5%{transform:translate(-7px,4px)}10%{transform:translate(8px,-5px)}18%{transform:translate(-10px,-2px)}28%{transform:translate(9px,5px)}40%{transform:translate(-6px,3px)}55%{transform:translate(5px,-3px)}72%{transform:translate(-3px,2px)}}
  .sseBreakRing{position:absolute;left:50%;top:21%;z-index:31;width:28px;height:28px;border:8px solid #fff6c7;border-radius:50%;transform:translate(-50%,-50%);animation:sseBreakRing var(--dur,.95s) ease-out var(--delay,0s) forwards;pointer-events:none;opacity:0}@keyframes sseBreakRing{0%{width:28px;height:28px;opacity:1}100%{width:520px;height:520px;opacity:0}}
  .sseCrack{position:absolute;left:4%;right:4%;top:17%;height:19px;z-index:32;background:linear-gradient(103deg,#fff0 0 7%,#fff 8% 11%,#fff0 12% 21%,#fff 22% 25%,#fff0 26% 39%,#fff 40% 44%,#fff0 45% 59%,#fff 60% 64%,#fff0 65%);filter:drop-shadow(0 3px #2b1a12);animation:sseCrack 1.2s ease-out forwards;pointer-events:none}@keyframes sseCrack{0%{transform:scaleY(.25);opacity:0}18%{transform:scaleY(1.7);opacity:1}70%{transform:translateY(34px) scaleY(2.8)}100%{opacity:0;transform:translateY(145px) scaleY(3.2)}}
  .sseRoofChunk,.sseDebris,.sseDust{position:absolute;left:var(--x);top:var(--y);pointer-events:none;will-change:transform,opacity}
  .sseRoofChunk{z-index:var(--z,34);width:var(--w);height:var(--h,26px);border:3px solid #623a26;background:linear-gradient(#e1a260,#8f5937);clip-path:polygon(0 0,100% 8%,86% 100%,8% 88%);animation:sseChunkFly var(--dur,1.7s) cubic-bezier(.12,.72,.18,1) var(--delay,0s) forwards}
  .sseDebris{z-index:var(--z,33);width:var(--w,15px);height:var(--h,11px);border:2px solid #583721;background:var(--c,#a96e42);clip-path:polygon(8% 0,100% 12%,88% 100%,0 76%);animation:sseChunkFly var(--dur,1.55s) cubic-bezier(.12,.72,.18,1) var(--delay,0s) forwards}
  @keyframes sseChunkFly{0%{transform:translate(0,0) rotate(0) scale(1);opacity:1}16%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--r)) scale(var(--s,1));opacity:0}}
  .sseDust{z-index:29;width:var(--w,34px);height:var(--w,34px);border-radius:50%;background:#d8bb8b99;filter:blur(2px);animation:sseDust 1.35s ease-out var(--delay,0s) forwards}@keyframes sseDust{0%{transform:scale(.3);opacity:.8}100%{transform:translate(var(--dx),var(--dy)) scale(2.8);opacity:0}}
  .sseFlagBurst{animation:sseFlagBurst .85s ease-out}@keyframes sseFlagBurst{0%{transform:scale(.18) rotate(-9deg)}55%{transform:scale(1.22) rotate(2deg)}100%{transform:scale(1)}}
  .sseAltitudePulse{position:absolute;inset:0;z-index:19;pointer-events:none;border:10px solid #fff9;animation:sseAltitudePulse .58s ease-out forwards}@keyframes sseAltitudePulse{0%{opacity:1;transform:scale(.94)}100%{opacity:0;transform:scale(1.08)}}
  `;document.head.appendChild(st)
 }

 function stageFor(total){
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
  const st=stageFor(total);return st.zone==='sky'?`하늘 ${st.floor}층 상승!`:st.zone==='space'?`우주 고도 ${st.floor}`:`${st.label} 돌파!`
 }
 function backdropHTML(st){
  if(st.zone==='house')return `<div class="sseHouseWall"></div><div class="sseHouseWindow l"></div><div class="sseHouseWindow r"></div><div class="sseCeiling"></div>`;
  if(st.zone==='building')return `<div class="sseBuildingWall"></div><div class="sseWindowGrid"></div><div class="sseFloorBand"></div>`;
  if(st.zone==='sky')return `<div class="sseMountainFar"></div><div class="sseMountainNear"></div><div class="sseBrokenBuilding"></div><div class="sseCloud c1"></div><div class="sseCloud c2"></div><div class="sseBird b1">🐦</div><div class="sseBird b2">🐦</div><div class="ssePlane">✈️</div>`;
  return `<div class="sseStars"></div><div class="sseRocket">🚀</div><div class="sseMeteor m1"></div><div class="sseMeteor m2"></div><div class="sseStation"><i></i></div><div class="sseAstronaut" style="--d:-2s">🧑‍🚀</div><div class="sseAstronaut" style="--d:-9s;top:58%;font-size:31px">🧑‍🚀</div>`
 }

 function showModeSelect(){
  ensureStyle();
  const s=document.querySelector('#stage');if(!s)return;
  const clears=readClears(),unlocked=isUnlocked(),msg=unlocked?`일반 15단을 ${UNLOCK_CLEARS}번 클리어해 엔들리스가 활성화되었습니다.`:`일반 15단을 ${UNLOCK_CLEARS}번 클리어하면 엔들리스가 활성화됩니다.`;
  s.innerHTML=`<div class="sseModeBox"><div class="sseModeCard"><h3>🧵 비단쌓기</h3><p>${msg}</p><div class="sseModeBtns"><button type="button" id="sseNormalBtn">15단 도전</button><button type="button" id="sseEndlessBtn" ${unlocked?'':'disabled'}>${unlocked?'∞ 엔들리스':`🔒 엔들리스 ${clears}/${UNLOCK_CLEARS}`}</button></div><p class="sseUnlockProgress">일반 클리어 ${clears}/${UNLOCK_CLEARS}</p></div></div>`;
  const choose=mode=>{
   activeMode=mode;normalClearRecorded=false;s.innerHTML='';
   const go=()=>playStackMode(mode);
   if(typeof readyThen==='function')readyThen(go);else go()
  };
  const n=s.querySelector('#sseNormalBtn'),e=s.querySelector('#sseEndlessBtn');
  if(n)n.onclick=()=>choose('normal');if(e&&unlocked)e.onclick=()=>choose('endless');
  cleanup=()=>{if(n)n.onclick=null;if(e)e.onclick=null}
 }

 function installStartHook(){
  if(!nativeStartGame||nativeStartGame.__silkModeFirstWrapped)return;
  const wrapped=function(code){
   if(code!=='stack')return nativeStartGame.apply(this,arguments);
   try{
    if(!state.unlock[code])return;
    if(cleanup){cleanup();cleanup=null}
    const g=game(code);activeGameCode=code;
    $('#gameOverlay').classList.add('show');$('#gTitle').textContent=g.name;$('#gScore').textContent='0';updateBestHud(0);$('#stage').innerHTML='';
    showModeSelect()
   }catch(_){return nativeStartGame.apply(this,arguments)}
  };
  wrapped.__silkModeFirstWrapped=true;wrapped.__silkModeFirstOriginal=nativeStartGame;window.startGame=wrapped
 }

 function playStackMode(mode='endless'){
  ensureStyle();activeMode=mode;normalClearRecorded=false;
  const normal=mode==='normal',s=document.querySelector('#stage');if(!s)return;
  s.innerHTML=`<div class="silkScene sseScene sse-house" id="sseScene"><div class="sseBackdrop" id="sseBackdrop"></div><div class="silkLane" id="silkLane"><div class="silkSign">${normal?'차곡차곡 비단쌓기':'∞ 차곡차곡 비단쌓기'}</div><div class="silkBackStall"></div><div class="silkShelf shelf1"></div><div class="silkShelf shelf2"></div><div class="silkGuide">화면을 눌러 비단을 떨어뜨리소!</div></div><div class="silkGround"></div></div><div class="sseFloorHud" id="sseFloorHud">${normal?'0 / 15 단':'<span class="sseEndlessTag">ENDLESS</span>집 1층 · 0단'}</div><div class="comboHud" id="perfectHud">정확도 0%</div><div class="levelHud" id="levelHud">LEVEL 1</div><div class="lifeHud" id="stackLife">❤️❤️❤️</div><div class="gameTip">${normal?'비단 폭이 점점 좁아지고 속도가 빨라집니다 · 15단 완성 목표':'15단마다 위층 돌파 · 빌딩 → 하늘 → 우주까지 끝없이 쌓기'}</div>`;
  const lane=s.querySelector('#silkLane'),scene=s.querySelector('#sseScene'),back=s.querySelector('#sseBackdrop'),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),assist=assistProfile();
  let score=0,total=0,segment=0,alive=true,raf=0,last=0,current=null,x=0,dir=1,accuracyTotal=0,level=1,lastDropAt=-1e9,retrying=false,lives=3,transitioning=false,lastStageKey='',carryWidth=0,cameraOffset=0,finalFlagShown=false;
  const W=()=>lane.getBoundingClientRect().width,baseW=Math.min(235,W()*.58);carryWidth=baseW;
  const patterns=[['#f8d5e2','#f0aac3','#d36a93'],['#d2ebff','#9dd3ff','#4ea7df'],['#ffe6b3','#ffc34d','#d98c00'],['#dff2cc','#a8df84','#5ba046'],['#ecd8ff','#c7a0ff','#8450d1']];
  function silkHTML(idx){const c=patterns[idx%patterns.length];return `<div class="silkFold" style="--c1:${c[0]};--c2:${c[1]};--c3:${c[2]};"><i></i><i></i><i></i><span></span></div>`}
  function setScene(force=false){
   const st=stageFor(total),continuous=st.zone==='sky'||st.zone==='space',key=continuous?st.zone:st.zone+':'+st.floor,high=st.zone==='sky'&&st.floor>=5;
   scene.className=`silkScene sseScene sse-${st.zone}${high?' sse-high':''}`;
   if(force||key!==lastStageKey){back.innerHTML=backdropHTML(st);lastStageKey=key}
   if(st.zone==='sky'){const p=clamp((total-75)/150,0,1);back.style.setProperty('--skyScale',(1-p*.58).toFixed(3));back.style.setProperty('--skyDrop',Math.round(p*88)+'px');back.style.setProperty('--skyFade',Math.max(.08,1-p*.88).toFixed(3))}
   else{back.style.setProperty('--skyScale','1');back.style.setProperty('--skyDrop','0px');back.style.setProperty('--skyFade','1')}
   const h=s.querySelector('#sseFloorHud');if(!h)return;
   h.classList.toggle('space',st.zone==='space');
   h.innerHTML=normal?`${total} / 15 단`:`<span class="sseEndlessTag">ENDLESS</span>${st.label} · ${total}단`
  }
  function hud(skipScene=false){
   const gs=document.querySelector('#gScore');if(gs)gs.textContent=score;
   const acc=total?Math.round(accuracyTotal/total):0,ph=s.querySelector('#perfectHud');if(ph)ph.textContent=`정확도 ${acc}%`;
   const lh=s.querySelector('#stackLife');if(lh)lh.textContent='❤️'.repeat(lives)+'🖤'.repeat(Math.max(0,3-lives));
   const lev=s.querySelector('#levelHud');if(lev)lev.textContent=`LEVEL ${level}`;if(!skipScene)setScene()
  }
  function clearStackVisual(){lane.querySelectorAll('.silkPiece,.silkBase,.stackFlag').forEach(e=>e.remove())}
  function addBase(width=carryWidth){
   const w=Math.max(28,Math.min(baseW,Number(width)||baseW)),e=document.createElement('div');e.className='silkBase';e.style.width=w+'px';e.style.left=((W()-w)/2)+'px';e.style.bottom='82px';e.innerHTML=silkHTML(total);lane.appendChild(e);return e
  }
  function piece(){
   const e=document.createElement('div');e.className='silkPiece';e.setAttribute('aria-hidden','true');e.style.pointerEvents='none';
   const placed=lane.querySelectorAll('.silkPiece,.silkBase'),prev=placed[placed.length-1];let w=prev?parseFloat(prev.style.width):baseW;if(!Number.isFinite(w)||w<=0)w=baseW;
   e.style.width=w+'px';e.style.bottom=(135+segment*21-cameraOffset)+'px';e.style.left=x+'px';e.innerHTML=silkHTML(total+1);lane.appendChild(e);return e
  }
  function flag1884(){
   lane.querySelectorAll('.stackFlag').forEach(e=>e.remove());
   const placed=[...lane.querySelectorAll('.silkPiece,.silkBase')].filter(e=>!e.classList.contains('miss')),anchor=placed[placed.length-1]||current,l=parseFloat(anchor?.style.left)||0,w=parseFloat(anchor?.style.width)||120,b=parseFloat(anchor?.style.bottom),flag=document.createElement('div');
   flag.className='stackFlag sseFlagBurst';flag.textContent='1884 진주중앙시장';flag.style.left=Math.max(8,Math.min(W()-178,l+w/2-78))+'px';flag.style.bottom=((Number.isFinite(b)?b:135)+58)+'px';lane.appendChild(flag);return flag
  }
  function showFinalFlag(){if(finalFlagShown)return;finalFlagShown=true;flag1884()}

  function impactSounds(){
   try{buzz([70,38,115,44,155,56,260]);tone('bad');setTimeout(()=>beep(92,.11,.055,'square',58),130);setTimeout(()=>beep(72,.16,.065,'sawtooth',48),390);setTimeout(()=>beep(55,.28,.075,'square',38),720)}catch(_){}
  }
  function structureBlast(){
   scene.classList.remove('sseImpactShake');void scene.offsetWidth;scene.classList.add('sseImpactShake');
   const flash=document.createElement('div');flash.className='sseBreakFlash';scene.appendChild(flash);
   const crack=document.createElement('div');crack.className='sseCrack';scene.appendChild(crack);
   for(let i=0;i<3;i++){const ring=document.createElement('i');ring.className='sseBreakRing';ring.style.setProperty('--delay',(i*.16)+'s');ring.style.setProperty('--dur',(0.86+i*.16)+'s');scene.appendChild(ring)}
   for(let i=0;i<14;i++){
    const el=document.createElement('i'),front=i%4===0,backDepth=i%5===0,angle=(Math.PI*2*i/14)+(Math.random()-.5)*.55,dist=front?320+Math.random()*250:backDepth?130+Math.random()*150:210+Math.random()*260;
    el.className='sseRoofChunk';el.style.setProperty('--x',(10+Math.random()*80)+'%');el.style.setProperty('--y',(12+Math.random()*15)+'%');el.style.setProperty('--w',(44+Math.random()*70)+'px');el.style.setProperty('--h',(20+Math.random()*26)+'px');el.style.setProperty('--dx',(Math.cos(angle)*dist)+'px');el.style.setProperty('--dy',(Math.sin(angle)*dist)+'px');el.style.setProperty('--r',((-540+Math.random()*1080))+'deg');el.style.setProperty('--s',front?(2.2+Math.random()*2.0).toFixed(2):backDepth?(0.18+Math.random()*.28).toFixed(2):(0.65+Math.random()*.75).toFixed(2));el.style.setProperty('--z',front?'38':backDepth?'27':'34');el.style.setProperty('--dur',(1.45+Math.random()*.65)+'s');el.style.setProperty('--delay',(Math.random()*.12)+'s');scene.appendChild(el)
   }
   const colors=['#a96e42','#c58c5d','#7f5138','#d6b17b'];
   for(let i=0;i<52;i++){
    const el=document.createElement('i'),front=i%9===0,backDepth=i%7===0,angle=Math.random()*Math.PI*2,dist=front?300+Math.random()*320:backDepth?90+Math.random()*170:160+Math.random()*320;
    el.className='sseDebris';el.style.setProperty('--x',(3+Math.random()*94)+'%');el.style.setProperty('--y',(13+Math.random()*20)+'%');el.style.setProperty('--w',(8+Math.random()*18)+'px');el.style.setProperty('--h',(6+Math.random()*14)+'px');el.style.setProperty('--c',colors[i%colors.length]);el.style.setProperty('--dx',(Math.cos(angle)*dist)+'px');el.style.setProperty('--dy',(Math.sin(angle)*dist)+'px');el.style.setProperty('--r',((-900+Math.random()*1800))+'deg');el.style.setProperty('--s',front?(2.4+Math.random()*2.2).toFixed(2):backDepth?(0.15+Math.random()*.3).toFixed(2):(0.45+Math.random()*1.0).toFixed(2));el.style.setProperty('--z',front?'39':backDepth?'26':'33');el.style.setProperty('--dur',(1.15+Math.random()*.95)+'s');el.style.setProperty('--delay',(Math.random()*.18)+'s');scene.appendChild(el)
   }
   for(let i=0;i<16;i++){const d=document.createElement('i'),a=Math.random()*Math.PI*2,dist=70+Math.random()*180;d.className='sseDust';d.style.setProperty('--x',(24+Math.random()*52)+'%');d.style.setProperty('--y',(15+Math.random()*17)+'%');d.style.setProperty('--w',(20+Math.random()*52)+'px');d.style.setProperty('--dx',(Math.cos(a)*dist)+'px');d.style.setProperty('--dy',(Math.sin(a)*dist)+'px');d.style.setProperty('--delay',(Math.random()*.16)+'s');scene.appendChild(d)}
   impactSounds();
   setTimeout(()=>{scene.classList.remove('sseImpactShake');scene.querySelectorAll('.sseBreakFlash,.sseCrack,.sseBreakRing,.sseRoofChunk,.sseDebris,.sseDust').forEach(e=>e.remove())},2250)
  }
  function altitudeMilestone(){
   const pulse=document.createElement('div');pulse.className='sseAltitudePulse';scene.appendChild(pulse);setTimeout(()=>pulse.remove(),650);
   try{showComboBurst(breakLabel(total),7,'great');particles(innerWidth*.5,innerHeight*.34,total>=225?'🌠':'✨',10);tone('clear');buzz([16,7,25,7,38])}catch(_){}
   if(total===225)setScene(true)
  }
  function scrollContinuous(){
   if(total<75)return;const limit=Math.max(250,scene.clientHeight*.56),top=135+segment*21-cameraOffset+50;if(top<=limit)return;
   const shift=Math.min(25,Math.max(8,top-limit));cameraOffset+=shift;
   lane.querySelectorAll('.silkPiece,.silkBase,.stackFlag').forEach(el=>{const b=parseFloat(el.style.bottom);if(!Number.isFinite(b))return;const nb=b-shift;el.style.bottom=nb+'px';if(nb<-75)el.remove()})
  }
  function resumeAfterBreak(){
   if(!alive)return;clearStackVisual();segment=0;cameraOffset=0;setScene(true);addBase(carryWidth);dir*=-1;x=dir>0?0:Math.max(0,W()-carryWidth);current=piece();current.style.left=x+'px';lastDropAt=performance.now();transitioning=false;last=0;raf=requestAnimationFrame(loop)
  }
  function breakthrough(){
   transitioning=true;carryWidth=Math.max(28,parseFloat(current?.style.width)||carryWidth||baseW);structureBlast();
   try{showComboBurst(breakLabel(total),10,'great');particles(innerWidth*.5,innerHeight*.38,'✨',22)}catch(_){}
   setTimeout(resumeAfterBreak,1750)
  }
  function finishNormal(){
   transitioning=true;carryWidth=Math.max(28,parseFloat(current?.style.width)||carryWidth||baseW);structureBlast();
   try{showComboBurst('15단 완성! 지붕 격파!',10,'great');particles(innerWidth*.5,innerHeight*.38,'✨',24)}catch(_){}
   setTimeout(()=>{if(!alive)return;showFinalFlag();try{tone('clear');buzz([24,10,40,10,65])}catch(_){}},1550);
   setTimeout(()=>{if(!alive)return;alive=false;cancelAnimationFrame(raf);recordNormalClear();finish('stack',score+400,showModeSelect,true)},2550)
  }
  function gameOver(){
   alive=false;cancelAnimationFrame(raf);showFinalFlag();try{showComboBurst('GAME OVER',3,'multi');tone('clear');buzz([20,8,34,8,52])}catch(_){}
   setTimeout(()=>finish('stack',score,showModeSelect,false),980)
  }
  function drop(){
   if(!alive||!current||retrying||transitioning)return;
   const l=parseFloat(current.style.left),w=parseFloat(current.style.width),arr=lane.querySelectorAll('.silkPiece,.silkBase'),prev=arr[arr.length-2],pl=parseFloat(prev.style.left),pw=parseFloat(prev.style.width),left=Math.max(l,pl),right=Math.min(l+w,pl+pw),overlap=Math.max(0,right-left);
   if(overlap<assist.minOverlap){
    retrying=true;const failed=current;failed.classList.add('miss');lives=Math.max(0,lives-1);score=Math.max(0,score-60);hud();try{tone('bad');buzz(110);softShake()}catch(_){}
    if(lives<=0){gameOver();return}
    try{showComboBurst(`MISS! ❤️ ${lives}/3`,2,'multi')}catch(_){}
    setTimeout(()=>{if(!alive)return;failed.remove();dir*=-1;current=piece();x=dir>0?0:Math.max(0,W()-parseFloat(current.style.width));current.style.left=x+'px';lastDropAt=performance.now();retrying=false},360);return
   }
   current.style.left=left+'px';current.style.width=overlap+'px';
   const centered=Math.abs((l+w/2)-(pl+pw/2)),denom=Math.max(1,pw*.5*assist.centerScale),placementAcc=clamp(100-(centered/denom)*100,0,100),pts=placementAcc>=97?360:placementAcc>=88?220:placementAcc>=75?110:40;
   score+=pts;accuracyTotal+=placementAcc;
   try{
    if(placementAcc>=97){current.classList.add('good','stackPerfect');tone('perfect');buzz([32,12,48,12,72]);showComboBurst(`PERFECT! +${pts}`,10,'great');particles(innerWidth*.5,innerHeight*.38,'✨',12)}
    else if(placementAcc>=88){current.classList.add('good');tone('perfect');buzz([32,12,48]);showComboBurst(`GREAT! +${pts}`,5,'great')}
    else if(placementAcc>=75){current.classList.add('ok');tone('good');buzz(32);showComboBurst(`GOOD! +${pts}`,2,'combo')}
    else{current.classList.add('ok');tone('good');buzz(32);showComboBurst(`아슬아슬! +${pts}`,2,'combo')}
   }catch(_){}
   total++;segment++;level=updateLevel('stack',score,level);
   const structuralMilestone=(normal&&total>=15)||(!normal&&total<=75&&total%15===0);hud(structuralMilestone);
   if(normal&&total>=15){cancelAnimationFrame(raf);finishNormal();return}
   if(!normal&&total<=75&&total%15===0){cancelAnimationFrame(raf);breakthrough();return}
   if(!normal&&total>75&&total%15===0)altitudeMilestone();
   if(!normal&&total>=75)scrollContinuous();
   current=piece();dir*=-1;x=dir>0?0:Math.max(0,W()-parseFloat(current.style.width))
  }
  function pointer(e){if(!alive||!current||retrying||transitioning)return;const now=performance.now();if(now-lastDropAt<90)return;lastDropAt=now;e.preventDefault();drop()}
  function loop(ts){
   if(!alive||transitioning)return;if(!last){last=ts;raf=requestAnimationFrame(loop);return}
   const dt=Math.max(0,Math.min(.04,(ts-last)/1000));last=ts;if(retrying){raf=requestAnimationFrame(loop);return}
   const pieceW=parseFloat(current.style.width),maxX=Math.max(0,W()-pieceW),speedPx=120+Math.min(250,total*4.5)+(level-1)*22;
   x+=dir*speedPx*dt;if(x<=0){x=0;dir=1}if(x>=maxX){x=maxX;dir=-1}current.style.left=x+'px';raf=requestAnimationFrame(loop)
  }
  addBase();setScene(true);current=piece();hud();s.style.touchAction='none';s.addEventListener('pointerdown',pointer,{capture:true,passive:false});raf=requestAnimationFrame(loop);
  cleanup=()=>{alive=false;retrying=true;transitioning=false;cancelAnimationFrame(raf);s.removeEventListener('pointerdown',pointer,true)}
 }

 function entry(){ensureStyle();normalClearRecorded=false;showModeSelect()}
 installStartHook();ensureStyle();window.playStack=entry;
 window.OsoSilkStackEndless=Object.freeze({UNLOCK_CLEARS,getClearCount:readClears,isUnlocked,stageFor,playEndless:()=>playStackMode('endless'),playNormal:()=>playStackMode('normal'),assistProfile});
})();