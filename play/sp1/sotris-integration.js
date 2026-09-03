/* JCM SP1 SOTRIS LIVE INTEGRATION 2026-09-03 · CARD OSO v3.9.2 */
(function(){
'use strict';
if(window.__JCM_SP1_SOTRIS_LIVE__)return;
window.__JCM_SP1_SOTRIS_LIVE__=true;

const SP1_CLEAR_BONUS=300;
const SP1_FIRST_CLEAR_BONUS=200;
const SP1_URL='sp1/sotris/index.html';
let host=null,frame=null,pendingRank=false,pendingMilestones=[];
const settled=new Set();

function ensureState(){
 if(!state.specialUnlocks||typeof state.specialUnlocks!=='object')state.specialUnlocks={};
 if(!state.specialClears||typeof state.specialClears!=='object')state.specialClears={};
 if(!state.best||typeof state.best!=='object')state.best={};
 if(!Array.isArray(state.ownedSkins))state.ownedSkins=[];
}
function osoItems(){
 try{return (Array.isArray(OSO_SKINS)?OSO_SKINS:[]).filter(s=>(s.group||'oso')==='oso'&&Number(s.price||0)>0)}catch(_){return []}
}
function allOsoOwned(){
 const items=osoItems();
 return items.length>0&&items.every(s=>state.ownedSkins.includes(s.id));
}
function unlockIfReady(){
 ensureState();
 if(state.specialUnlocks.sotris)return false;
 if(allOsoOwned()){
  state.specialUnlocks.sotris=true;
  try{save()}catch(_){}
  return true;
 }
 return false;
}
function unlocked(){ensureState();return !!state.specialUnlocks.sotris||unlockIfReady()}
function progress(){const a=osoItems();return {owned:1+a.filter(s=>state.ownedSkins.includes(s.id)).length,total:1+a.length}}
function sp1CardOsoSrc(){
 try{
  const a=Array.isArray(OSO_SKINS)?OSO_SKINS:[];
  const s=a.find(x=>x.id==='default')||a.find(x=>(x.group||'oso')==='oso');
  return s&&s.src?s.src:'';
 }catch(_){return ''}
}

function addStyle(){
 if(document.getElementById('sp1LiveStyle'))return;
 const s=document.createElement('style');s.id='sp1LiveStyle';s.textContent=`
 #specialGameSection{margin:18px 0 8px}.sp1SectionTitle{font-weight:1000;font-size:18px;color:#5c4028;margin:0 3px 9px}.sp1SectionTitle small{display:block;font-size:9px;opacity:.65;margin-top:2px}
 .sp1Card{width:100%;min-height:150px;text-align:left;position:relative;overflow:hidden;border:3px solid #704a31;border-radius:22px;background:radial-gradient(circle at 88% 15%,#75dcff55,transparent 29%),linear-gradient(135deg,#071226,#17375f 58%,#6a4a92);color:#fff;box-shadow:0 6px #b18455,0 14px 24px #88603a20;padding:16px 132px 14px 14px;touch-action:manipulation}
 .sp1Card:before{content:'SPECIAL';position:absolute;right:-24px;top:14px;transform:rotate(35deg);background:#ffd44e;color:#39260f;padding:4px 30px;font-size:9px;font-weight:1000}.sp1Card.lock{filter:grayscale(.78);opacity:.64}.sp1Card.lock:after{content:'🔒';position:absolute;right:13px;bottom:11px;font-size:30px}.sp1Card .medal{font-size:35px;margin-right:7px}.sp1Card b{font-size:17px;vertical-align:8px}.sp1Card p{font-size:10px;margin:7px 0 0;color:#dce8ff;font-weight:800}.sp1Card .best{margin-top:11px;font-size:11px;font-weight:1000;color:#ffe477}.sp1Card .sp1Oso{position:absolute;right:12px;bottom:-7px;width:108px;height:132px;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 7px 7px #0007);pointer-events:none;z-index:1}.sp1Card:before{z-index:3}.sp1Card>span,.sp1Card>b,.sp1Card>p,.sp1Card>.best{position:relative;z-index:2}@media(max-width:390px){.sp1Card{padding-right:116px}.sp1Card .sp1Oso{right:7px;width:98px;height:123px}}
 #sp1Host{position:fixed;inset:0;z-index:9998;background:#06101f;display:none}#sp1Host.show{display:block}#sp1Host iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#071226}
 .sp1MainBar{position:absolute;z-index:5;left:0;right:0;top:0;height:54px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:7px;padding:max(5px,env(safe-area-inset-top)) 8px 5px;background:linear-gradient(#fffdf2,#ffe79b);border-bottom:3px solid #b88841;color:#49331f;box-shadow:0 4px 12px #0004}.sp1MainBar button{border:2px solid #8b6136;border-radius:12px;background:#fff;padding:7px 9px;font-weight:1000}.sp1MainBar b{text-align:center;font-size:13px}.sp1MainBar .coin{font-size:11px;font-weight:1000;white-space:nowrap}
 .sp1Toast{position:absolute;z-index:9;left:50%;top:68px;transform:translateX(-50%) translateY(-12px);max-width:92vw;background:#091326ee;color:#fff;border:2px solid #ffd45a;border-radius:15px;padding:10px 13px;text-align:center;font-size:12px;font-weight:1000;box-shadow:0 8px 25px #0009;opacity:0;pointer-events:none;transition:.2s}.sp1Toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
 .sp1Unlock{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#071226dd;pointer-events:none;animation:sp1Fade 2.8s forwards}.sp1UnlockCard{background:linear-gradient(#fff6bc,#ffcb42);border:5px solid #6c451f;border-radius:24px;padding:22px 25px;text-align:center;color:#492d17;box-shadow:0 12px #9c5a22,0 22px 50px #0007;font-weight:1000;animation:sp1Pop .38s ease-out}.sp1UnlockCard .m{font-size:54px}.sp1UnlockCard h2{margin:2px 0;font-size:24px}.sp1UnlockCard p{margin:5px 0 0;font-size:12px}@keyframes sp1Pop{from{transform:scale(.55) rotate(-5deg);opacity:0}to{transform:scale(1);opacity:1}}@keyframes sp1Fade{0%,76%{opacity:1}100%{opacity:0}}
 `;document.head.appendChild(s);
}
function unlockFx(){
 if(document.querySelector('.sp1Unlock'))return;
 const d=document.createElement('div');d.className='sp1Unlock';d.innerHTML='<div class="sp1UnlockCard"><div class="m">🏅</div><h2>SP1 소트리스 해금!</h2><p>도감에서 오소를 모두 모았소!</p></div>';document.body.appendChild(d);
 try{tone('clear');buzz([45,20,70,25,110])}catch(_){}
 setTimeout(()=>d.remove(),2900);
}
function renderCard(){
 addStyle();ensureState();
 const lib=document.getElementById('library');if(!lib)return;
 const newly=unlockIfReady();let sec=document.getElementById('specialGameSection');if(!sec){sec=document.createElement('section');sec.id='specialGameSection';lib.insertAdjacentElement('afterend',sec)}
 const ok=unlocked(),p=progress(),best=Math.max(0,Math.floor(Number(state.best.sotris)||0)),osoSrc=sp1CardOsoSrc();
 sec.innerHTML=`<div class="sp1SectionTitle">🏅 SPECIAL GAME<small>일반 게임 1~10과 별도인 컬렉션 해금 게임</small></div><button id="sp1Card" class="sp1Card ${ok?'':'lock'}"><span class="medal">🏅</span><b>${ok?'SP1 · 소트리스':'SP1 · ???'}</b><p>${ok?'5 STAGES · 아케이드 퍼즐':'도감에서 오소 전부 수집 시 해금'}</p><div class="best">${ok?`🏆 최고 ${best.toLocaleString()}점`:`오소 수집 ${p.owned} / ${p.total}`}</div>${osoSrc?`<img class="sp1Oso" src="${osoSrc}" alt="오소">`:''}</button>`;
 const b=document.getElementById('sp1Card');if(b)b.onclick=()=>{if(ok)launch();else{try{tone('bad');buzz(50)}catch(_){}}};
 if(newly)setTimeout(unlockFx,90);
}
function ensureHost(){
 if(host&&host.isConnected)return;
 host=document.createElement('div');host.id='sp1Host';host.innerHTML=`<iframe id="sp1Frame" title="SP1 소트리스" allow="autoplay"></iframe><div class="sp1MainBar"><button id="sp1Back">← 게임장</button><b>🏅 SP1 · 소트리스</b><span class="coin" id="sp1Coin">🪙 0</span></div><div class="sp1Toast" id="sp1Toast"></div>`;document.body.appendChild(host);frame=document.getElementById('sp1Frame');document.getElementById('sp1Back').onclick=close;
}
function updateCoin(){const e=document.getElementById('sp1Coin');if(e)e.textContent='🪙 '+Number(state.coins||0).toLocaleString()}
function toast(t,d=1900){const e=document.getElementById('sp1Toast');if(!e)return;e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),d)}
function launch(){if(!unlocked())return;ensureHost();settled.clear();pendingRank=false;pendingMilestones=[];try{if(typeof stopBGM==='function')stopBGM()}catch(_){}updateCoin();host.classList.add('show');frame.src=SP1_URL+'?v=20260903-hard300-progress19';}
function close(){if(!host)return;try{frame.src='about:blank'}catch(_){}host.classList.remove('show');try{if(typeof refresh==='function')refresh();if(typeof startBGM==='function')startBGM('hub',1)}catch(_){}if(pendingRank){pendingRank=false;setTimeout(()=>{try{promptInitialsIfNeeded(null)}catch(_){}},350)}}
function settle(d){
 ensureState();const session=String(d.session||''),attempt=Math.max(0,Math.floor(Number(d.attempt)||0));if(!session||!attempt)return;const key=session+':'+attempt;if(settled.has(key))return;settled.add(key);
 const score=Math.max(0,Math.floor(Number(d.score)||0)),clear=!!d.clear;try{ensureDailyScoreDate()}catch(_){}
 state.best.sotris=Math.max(Math.floor(Number(state.best.sotris)||0),score);state.todayScore=(Number(state.todayScore)||0)+score;try{if(typeof ensureScoreBonusUnlocks==='function'&&!(typeof DEV_ALL_UNLOCKED!=='undefined'&&DEV_ALL_UNLOCKED))ensureScoreBonusUnlocks()}catch(_){}
 let base=Math.max(5,Math.min(90,Math.floor(score/10)||5));if(clear)base+=30;const first=clear&&!state.specialClears.sotris;const sp=clear?SP1_CLEAR_BONUS:0,firstBonus=first?SP1_FIRST_CLEAR_BONUS:0;if(clear)state.specialClears.sotris=true;const reward=base+sp+firstBonus,before=Math.max(0,Math.floor(Number(state.coins)||0));state.coins=before+reward;
 try{if(typeof crossedCoinMilestones==='function')pendingMilestones.push(...crossedCoinMilestones(before,state.coins))}catch(_){}try{save()}catch(_){}pendingRank=true;updateCoin();
 try{if(clear&&typeof gameClearFanfare==='function')gameClearFanfare('sotris');else if(typeof tone==='function')tone(clear?'clear':'good')}catch(_){}
 if(frame&&frame.contentWindow)frame.contentWindow.postMessage({source:'jcm-main',type:'SP1_REWARD',session,attempt,clear,score,baseReward:base,specialBonus:sp,firstClearBonus:firstBonus,totalReward:reward,coins:state.coins},'*');
 toast(clear?`완주 보상 +${reward.toLocaleString()} 코인${first?' · 최초 완주 포함':''}`:`도전 보상 +${reward.toLocaleString()} 코인`,2400);
}
window.addEventListener('message',e=>{if(!frame||e.source!==frame.contentWindow)return;const d=e.data||{};if(d.source!=='sotris-sp1')return;if(d.type==='RESULT')settle(d);else if(d.type==='EXIT')close()});
if(typeof refresh==='function'&&!refresh.__sp1LiveWrapped){const original=refresh;refresh=function(){const r=original.apply(this,arguments);try{renderCard()}catch(_){}return r};refresh.__sp1LiveWrapped=true}
window.__JCM_SP1_SYNC_UNLOCK__=()=>{try{renderCard();return unlocked()}catch(_){return false}};
window.addEventListener('pageshow',()=>{try{renderCard()}catch(_){}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){try{renderCard()}catch(_){}}});
addStyle();ensureState();renderCard();
})();
