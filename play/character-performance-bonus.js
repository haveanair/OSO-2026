/* 어서오소 캐릭터 성능 보너스
 * 선택한 캐릭터의 도감 가격대가 높을수록 게임 최종 점수와 코인 보상이 상승한다.
 * 공통 finish / RPG 전투보상 / SP1 결과를 후킹한다.
 * 비단쌓기 모바일 UI, PERFECT 2줄 이펙트, GREAT/PERFECT 폭 회복,
 * 하모·논개 추가 정렬 보정, 구조물 격파 강진동을 후단에서 보강한다.
 * 타이틀 NEWS에서 주요 업데이트 이력을 제공한다.
 */
(function(){
  'use strict';
  if(window.__OSO_CHARACTER_PERFORMANCE_BONUS__)return;
  window.__OSO_CHARACTER_PERFORMANCE_BONUS__=true;

  const STYLE_ID='osoCharacterPerformanceBonusStyle';
  const TOAST_ID='osoCharacterPerformanceBonusToast';
  const SP1_SEEN=new Set();
  const roofVibeTimers=[];
  let stackObserver=null;

  const CHANGELOG=[
    {date:'2026.08.28',title:'첫 웹게임장 빌드',items:['「어서오소! 중앙시장 게임장」 기본 골격 구축','오소·하모·아요 캐릭터와 시장 테마 UI 적용','중앙시장 거점을 활용한 7개 기본 미니게임 및 GPS·QR 해금 구조 시작']},
    {date:'2026.08.29',title:'점수·랭킹·확장게임 체계',items:['일일 누적점수·TOP10 랭킹·누적 코인 시스템 정비','게임별 홈/나가기와 축하·진동·기록 연출 강화','우주파이터·레이싱·환상대모험으로 이어지는 추가 해금 구조 확장']},
    {date:'2026.08.30',title:'웹판 중심 운영 전환',items:['모바일 웹 완성도 향상을 최우선으로 운영 방향 전환','시장탐험 GPS·지도·QR 보조 해금 흐름 보완','시장 현장 스탬프투어 활용을 위한 웹 접근성 정비']},
    {date:'2026.08.31',title:'OSO-2026 온라인 운영 시작',items:['GitHub Pages 기반 OSO-2026 공개 운영판 정비','게임 접속 QR 및 해금 QR 경로 수정','온라인 실전판을 이후 통합 작업의 기준으로 고정']},
    {date:'2026.09.04',title:'논개 캐릭터 이식',items:['논개 캐릭터 2종과 RPG 연계 해금 구조 추가','논개 전용 옥가락지 일반공격 및 특수기 연출 확장','기존 캐릭터 시스템과 논개 능력 연동 작업 시작']},
    {date:'2026.09.06',title:'캐릭터 해금·특성 통합',items:['논개 해금 래퍼 및 캐릭터 특성 연동 강화','캐릭터별 게임 성능 차이를 공통 특성 시스템으로 정리','웹 운영판 캐릭터 표시·연출 안정화']},
    {date:'2026.09.07',title:'비단쌓기 엔들리스·캐릭터 능력 대개편',items:['비단쌓기 일반 15단 / 엔들리스 모드 분리 및 엔들리스 10단 돌파 적용','PERFECT 3회마다 하트 +1, GREAT/PERFECT 비단 폭 회복 추가','하모·논개 비단 판정/정렬 보정 강화 및 구조물 격파 연출·진동 강화','일시정지, 모바일 HUD 재배치, PERFECT 2줄 이펙트 적용','타이틀 NEWS 업데이트 이력 기능 추가']}
  ];

  function bonusPercentForPrice(value){
    const p=Math.max(0,Math.floor(Number(value)||0));
    if(p<=0)return 0;
    if(p<250)return 2;
    if(p<500)return 4;
    if(p<750)return 6;
    if(p<1000)return 8;
    if(p<1500)return 10;
    if(p<2000)return 12;
    if(p<2400)return 15;
    if(p<2800)return 18;
    if(p<3200)return 20;
    if(p<3600)return 22;
    return 25;
  }
  function multiplierForPrice(value){return 1+bonusPercentForPrice(value)/100}
  function boosted(value,pct){
    const n=Math.max(0,Number(value)||0);
    return Math.max(0,Math.floor(n*(1+(Number(pct)||0)/100)))
  }
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function selectedSkin(){
    try{
      if(typeof currentSkin==='function')return currentSkin()||null;
      if(typeof OSO_SKINS!=='undefined'&&typeof state!=='undefined')return OSO_SKINS.find(x=>x.id===state.selectedSkin)||OSO_SKINS[0]||null;
    }catch(_){ }
    return null
  }
  function currentBonus(){
    const skin=selectedSkin()||{};
    const price=Math.max(0,Math.floor(Number(skin.price)||0));
    const percent=bonusPercentForPrice(price);
    return {id:skin.id||'default',name:skin.name||'기본 오소',price,percent,multiplier:1+percent/100}
  }
  function skinTraits(skin=selectedSkin()||{}){
    try{
      const api=window.OsoCharacterSpecialAbilities;
      if(api&&typeof api.traits==='function')return api.traits(skin)||{}
    }catch(_){ }
    const id=String(skin.id||''),group=String(skin.group||'');
    const nongae=id==='nongae_jade'||id==='nongae_resolve'||group==='nongae';
    return {nongae,hamo:nongae||group==='hamo'||id==='hamo',aya:nongae||group==='ayo'||id==='ayo'||id==='ayo_glasses'}
  }
  function traitInfo(skin){
    const s=skin||{},t=skinTraits(s);
    if(t.nongae)return {kind:'nongae',label:'✨ 아요+하모 특성 · 비단 판정↑ · 상시 4단점프'};
    if(t.aya)return {kind:'aya',label:'⚡ 레이싱 300km/h · 슈팅 이동↑ · 점프↑'};
    if(t.hamo)return {kind:'hamo',label:'🎯 수산·싹쓸이·떡떡떡·연타왕·비단 판정↑'};
    return null
  }

  function ensureStyle(){
    if(!document||document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
      .characterRewardBonus{display:block;margin:5px 0 1px;padding:3px 6px;border:1px solid #e7bb55;border-radius:999px;background:#fff4bd;color:#6a451b;font-size:9px;font-weight:1000;line-height:1.25;text-align:center}
      .characterRewardBonus.base{border-color:#aeb8c5;background:#eef2f7;color:#53606d}
      .characterAbilitySummary{display:block;margin:3px 0 2px;padding:3px 5px;border-radius:7px;background:#eef6ff;color:#284866;font-size:8px;font-weight:900;line-height:1.35;text-align:center;white-space:normal;word-break:keep-all}
      .characterAbilitySummary.hamo{background:#eef9ef;color:#285335}.characterAbilitySummary.nongae{background:#f6efff;color:#5b3476}
      #${TOAST_ID}{position:fixed;left:50%;top:max(76px,calc(env(safe-area-inset-top) + 62px));transform:translate(-50%,-12px);z-index:10050;max-width:92vw;padding:10px 14px;border:3px solid #ffe27a;border-radius:15px;background:#102444f2;color:#fff;text-align:center;font-size:11px;font-weight:1000;line-height:1.5;box-shadow:0 8px 26px #0008;opacity:0;pointer-events:none;transition:.18s}
      #${TOAST_ID}.show{opacity:1;transform:translate(-50%,0)}#${TOAST_ID} b{color:#ffe780}

      #stage .sseTopHud .sseTitle{left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;translate:none!important;justify-self:center!important;box-sizing:border-box!important;width:calc(100% - 6px)!important;max-width:360px!important;min-width:0!important;margin:0 auto!important;padding:8px 10px!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:break-word!important;word-break:keep-all!important;text-align:center!important;line-height:1.12!important}
      #stage .sseBottomHud{left:8px!important;right:8px!important;width:auto!important;max-width:none!important;margin:0!important;transform:none!important;translate:none!important;box-sizing:border-box!important;overflow:visible!important}
      #stage .sseBottomHud .sseGuide,#stage .sseBottomHud .sseGameTip,#stage .sseBottomHud .sseAssistBadge{left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;translate:none!important;justify-self:center!important;box-sizing:border-box!important;width:min(100%,430px)!important;max-width:100%!important;min-width:0!important;margin:0 auto!important;text-align:center!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:break-word!important;word-break:keep-all!important}
      #stage .sseAssistBadge{padding:4px 9px!important;border:2px solid #5b4a27;border-radius:999px;background:#f4ffbde8;color:#40351d;font-size:8px!important;font-weight:1000!important;line-height:1.15!important;box-shadow:0 3px #8d743e99}
      #stage .sseAssistBadge.nongae{background:#f4e9ffe8;border-color:#714a87;color:#4c2c60}

      #stage .ssePerfectBurst2{position:absolute!important;left:50%!important;top:37%!important;right:auto!important;bottom:auto!important;z-index:52!important;transform:translateX(-50%) scale(.72)!important;width:auto!important;min-width:min(230px,calc(100% - 28px))!important;max-width:calc(100% - 28px)!important;box-sizing:border-box!important;padding:10px 16px 9px!important;border:4px solid #7a4a22!important;border-radius:18px!important;background:#fff5c9f2!important;color:#5b341e!important;text-align:center!important;box-shadow:0 7px 0 #a66d35,0 13px 24px #0005!important;pointer-events:none!important;opacity:0!important;animation:ssePerfectBurst2 1.05s cubic-bezier(.18,.78,.22,1) forwards!important}
      #stage .ssePerfectBurst2.heart{border-color:#a83f54!important;background:#fff0f3f4!important;box-shadow:0 7px 0 #b65a6d,0 13px 24px #0005!important}
      #stage .ssePerfectBurst2 .ssePerfectMain{display:block!important;margin:0!important;padding:0!important;font-size:clamp(20px,6vw,29px)!important;font-weight:1000!important;line-height:1.05!important;white-space:normal!important;word-break:keep-all!important;overflow-wrap:normal!important}
      #stage .ssePerfectBurst2 .ssePerfectSub{display:block!important;margin:5px 0 0!important;padding:0!important;font-size:clamp(11px,3.3vw,15px)!important;font-weight:1000!important;line-height:1.15!important;white-space:normal!important;word-break:keep-all!important;overflow-wrap:break-word!important}
      @keyframes ssePerfectBurst2{0%{opacity:0;transform:translateX(-50%) scale(.68)}18%{opacity:1;transform:translateX(-50%) scale(1.10)}42%,78%{opacity:1;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-20px) scale(.92)}}

      #osoNewsBtn{position:absolute;left:12px;top:12px;z-index:35;width:52px;height:52px;border:4px solid #5b3824;border-radius:17px;background:linear-gradient(#fff8dc,#ffd85f);box-shadow:0 5px #a66b2d;color:#54321e;font-size:26px;line-height:1;display:grid;place-items:center;font-weight:1000;touch-action:manipulation}
      #osoNewsBtn:after{content:'NEWS';position:absolute;left:50%;bottom:2px;transform:translateX(-50%);font-size:7px;letter-spacing:.5px;font-weight:1000}
      #osoNewsBtn:active{transform:translateY(2px);box-shadow:0 3px #a66b2d}
      #osoNewsModal{position:fixed;inset:0;z-index:12000;display:none;align-items:center;justify-content:center;padding:max(16px,env(safe-area-inset-top)) 12px max(16px,env(safe-area-inset-bottom));background:#26170fa8;backdrop-filter:blur(3px)}
      #osoNewsModal.show{display:flex}.osoNewsCard{width:min(590px,96vw);max-height:88vh;display:flex;flex-direction:column;border:4px solid #69432d;border-radius:24px;background:#fff8df;box-shadow:0 18px 45px #0008;overflow:hidden;color:#4b2d1d}
      .osoNewsHead{flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:13px 14px;border-bottom:3px solid #d29a52;background:linear-gradient(#ffe36d,#ffc94c)}.osoNewsHead strong{flex:1;font-size:20px}.osoNewsClose{width:42px;height:42px;border:3px solid #64422d;border-radius:13px;background:#fff8df;font-size:21px;font-weight:1000}
      .osoNewsList{overflow:auto;padding:13px 12px 20px;-webkit-overflow-scrolling:touch}.osoNewsEntry{margin:0 0 13px;padding:11px 12px;border:3px solid #b98a52;border-radius:17px;background:#fffdf3;box-shadow:0 4px #d8b27d}.osoNewsDate{display:inline-block;margin-bottom:5px;padding:3px 8px;border-radius:999px;background:#5b3b28;color:#fff;font-size:9px;font-weight:1000}.osoNewsEntry h3{margin:0 0 6px;font-size:15px}.osoNewsEntry ul{margin:0;padding-left:18px;font-size:10px;font-weight:850;line-height:1.55}.osoNewsFoot{padding:0 12px 11px;font-size:8px;font-weight:800;opacity:.58;text-align:center}

      @media(max-width:390px){#stage .sseTopHud .sseTitle{width:100%!important;max-width:100%!important;padding:7px 8px!important;font-size:17px!important}#stage .sseBottomHud{left:6px!important;right:6px!important}#stage .sseBottomHud .sseGuide,#stage .sseBottomHud .sseGameTip,#stage .sseBottomHud .sseAssistBadge{width:100%!important;max-width:100%!important}#stage .ssePerfectBurst2{top:36%!important;min-width:min(220px,calc(100% - 20px))!important;max-width:calc(100% - 20px)!important;padding:9px 12px 8px!important}#osoNewsBtn{left:8px;top:8px;width:46px;height:46px;font-size:23px}.osoNewsCard{max-height:91vh}.osoNewsHead strong{font-size:18px}}
    `;document.head&&document.head.appendChild(st)
  }

  function showBonusToast(info,baseScore,newScore,baseCoins,newCoins,delay=80){
    if(!info||info.percent<=0||!document||!document.body)return;
    ensureStyle();
    let el=document.getElementById(TOAST_ID);
    if(!el){el=document.createElement('div');el.id=TOAST_ID;document.body.appendChild(el)}
    const parts=[`<b>${escapeHtml(info.name)} +${info.percent}%</b>`,`점수 ${fmt(baseScore)} → ${fmt(newScore)}`];
    if(Number.isFinite(baseCoins)&&Number.isFinite(newCoins)&&newCoins>baseCoins)parts.push(`코인 ${fmt(baseCoins)} → ${fmt(newCoins)}`);
    el.innerHTML=parts.join(' · ');
    clearTimeout(el._showT);clearTimeout(el._hideT);el.classList.remove('show');
    el._showT=setTimeout(()=>{el.classList.add('show');el._hideT=setTimeout(()=>el.classList.remove('show'),2600)},delay)
  }
  function fmt(v){return Math.max(0,Math.floor(Number(v)||0)).toLocaleString()}
  function escapeHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function catalog(){try{return typeof OSO_SKINS!=='undefined'&&Array.isArray(OSO_SKINS)?OSO_SKINS:[]}catch(_){return []}}
  function decorateShop(){
    if(!document)return;
    const shop=document.getElementById('osoShop');if(!shop)return;
    const byId=new Map(catalog().map(x=>[x.id,x]));
    shop.querySelectorAll('.skinCard[data-skin]').forEach(card=>{
      const skin=byId.get(card.dataset.skin);if(!skin)return;
      const pct=bonusPercentForPrice(skin.price);
      let tag=card.querySelector('.characterRewardBonus');
      if(!tag){tag=document.createElement('span');tag.className='characterRewardBonus';const btn=card.querySelector('button[data-buy]');btn?card.insertBefore(tag,btn):card.appendChild(tag)}
      tag.classList.toggle('base',pct<=0);tag.textContent=pct>0?`⭐ 점수·코인 +${pct}%`:'점수·코인 기본 보상';
      const trait=traitInfo(skin);let ability=card.querySelector('.characterAbilitySummary');
      if(trait){if(!ability){ability=document.createElement('span');const btn=card.querySelector('button[data-buy]');btn?card.insertBefore(ability,btn):card.appendChild(ability)}ability.className='characterAbilitySummary '+trait.kind;ability.textContent=trait.label}else if(ability)ability.remove()
    })
  }

  function wrapFinish(){
    try{
      if(typeof window.finish!=='function'||window.finish.__characterPerformanceWrapped)return false;
      const original=window.finish;
      const wrapped=function(){
        const args=Array.from(arguments),info=currentBonus(),baseScore=Math.max(0,Math.floor(Number(args[1])||0)),newScore=info.percent>0?boosted(baseScore,info.percent):baseScore;args[1]=newScore;
        let baseCoins=NaN,newCoins=NaN;if(typeof args[4]==='number'&&Number.isFinite(args[4])){baseCoins=Math.max(0,Math.floor(args[4]));newCoins=info.percent>0?boosted(baseCoins,info.percent):baseCoins;args[4]=newCoins}
        const result=original.apply(this,args);if(info.percent>0)showBonusToast(info,baseScore,newScore,baseCoins,newCoins);return result
      };
      wrapped.__characterPerformanceWrapped=true;wrapped.__characterPerformanceOriginal=original;window.finish=wrapped;return true
    }catch(_){return false}
  }
  function wrapFantasyBattleReward(){
    try{
      if(typeof window.fantasyBattleCoinReward!=='function'||window.fantasyBattleCoinReward.__characterPerformanceWrapped)return false;
      const original=window.fantasyBattleCoinReward,wrapped=function(enemy){const base=Math.max(0,Math.floor(Number(original.call(this,enemy))||0)),info=currentBonus();return info.percent>0?boosted(base,info.percent):base};
      wrapped.__characterPerformanceWrapped=true;wrapped.__characterPerformanceOriginal=original;window.fantasyBattleCoinReward=wrapped;return true
    }catch(_){return false}
  }

  function stackAssistInfo(){
    const t=skinTraits();
    if(t.nongae)return {on:true,nongae:true,label:'✨ 논개 비단 판정보정 ON'};
    if(t.hamo)return {on:true,nongae:false,label:'🎯 하모 비단 판정보정 ON'};
    return {on:false,nongae:false,label:''}
  }
  function refreshStackAssistBadge(){
    try{
      const bottom=document.querySelector('#stage #sseScene .sseBottomHud');if(!bottom)return;
      const a=stackAssistInfo();let badge=bottom.querySelector('.sseAssistBadge');
      if(!a.on){if(badge)badge.remove();return}
      if(!badge){badge=document.createElement('div');badge.className='sseAssistBadge';bottom.prepend(badge)}
      badge.classList.toggle('nongae',a.nongae);badge.textContent=a.label
    }catch(_){ }
  }
  function installStackMagnetAssist(){
    if(!document||document.documentElement.dataset.stackMagnetAssist==='1')return;
    document.documentElement.dataset.stackMagnetAssist='1';
    document.addEventListener('pointerdown',e=>{
      try{
        if(e.target&&e.target.closest&&e.target.closest('.sseControl'))return;
        const scene=document.querySelector('#stage #sseScene'),a=stackAssistInfo();if(!scene||!a.on)return;
        const lane=scene.querySelector('#silkLane');if(!lane)return;
        const arr=[...lane.querySelectorAll('.silkPiece,.silkBase')];if(arr.length<2)return;
        const cur=arr[arr.length-1],prev=arr[arr.length-2];if(!cur.classList.contains('silkPiece')||cur.classList.contains('miss'))return;
        const l=parseFloat(cur.style.left),w=parseFloat(cur.style.width),pl=parseFloat(prev.style.left),pw=parseFloat(prev.style.width);if(![l,w,pl,pw].every(Number.isFinite))return;
        const desired=pl+pw/2-w/2,delta=desired-l,maxShift=a.nongae?34:30,strength=a.nongae?.68:.62,shift=clamp(delta*strength,-maxShift,maxShift),maxLeft=Math.max(0,lane.getBoundingClientRect().width-w);
        cur.style.left=clamp(l+shift,0,maxLeft)+'px';
      }catch(_){ }
    },true)
  }
  function expandLatestStackPiece(ratio,minPx,maxPx){
    try{
      const lane=document.querySelector('#stage #sseScene #silkLane');if(!lane)return 0;
      const arr=[...lane.querySelectorAll('.silkPiece,.silkBase')],el=arr[arr.length-1];if(!el||!el.classList.contains('silkPiece')||el.classList.contains('miss'))return 0;
      const oldW=parseFloat(el.style.width),oldL=parseFloat(el.style.left),laneW=lane.getBoundingClientRect().width;if(![oldW,oldL,laneW].every(Number.isFinite))return 0;
      const cap=Math.min(235,laneW*.58),wanted=clamp(oldW*ratio,minPx,maxPx),newW=Math.min(cap,oldW+wanted),gain=newW-oldW;if(gain<.5)return 0;
      const center=oldL+oldW/2,newL=clamp(center-newW/2,0,Math.max(0,laneW-newW));el.style.left=newL+'px';el.style.width=newW+'px';return Math.round(gain)
    }catch(_){return 0}
  }
  function showStackPerfectBurst(message){
    try{
      const scene=document.querySelector('#stage #sseScene');if(!scene)return false;
      const msg=String(message||'').trim();if(!/^PERFECT/.test(msg))return false;
      scene.querySelectorAll('.ssePerfectBurst2').forEach(e=>e.remove());
      const parts=msg.split(' · ').map(s=>s.trim()).filter(Boolean),main=parts.shift()||'PERFECT!',sub=parts.join(' · '),box=document.createElement('div');box.className='ssePerfectBurst2'+(main.includes('❤️')?' heart':'');
      const a=document.createElement('span');a.className='ssePerfectMain';a.textContent=main;const b=document.createElement('span');b.className='ssePerfectSub';b.textContent=sub||'정확하게 맞췄습니다!';box.append(a,b);scene.appendChild(box);setTimeout(()=>box.remove(),1120);return true
    }catch(_){return false}
  }
  function rewriteGrowMessage(msg,extra){
    if(extra<=0)return msg;
    const m=msg.match(/비단 \+(\d+)/),sum=(m?Number(m[1])||0:0)+extra;
    if(m)return msg.replace(/비단 \+\d+/,`비단 +${sum}`);
    const point=msg.match(/\s·\s\+(\d+)\s*$/);return point?msg.replace(point[0],` · 비단 +${sum} · +${point[1]}`):`${msg} · 비단 +${sum}`
  }
  function wrapStackJudgementEffects(){
    try{
      if(typeof window.showComboBurst!=='function'||window.showComboBurst.__stackBalanceWrapped)return false;
      const original=window.showComboBurst;
      const wrapped=function(message){
        let msg=String(message==null?'':message);
        const stack=!!document.querySelector('#stage #sseScene');
        if(stack&&/^GREAT!/.test(msg)){const gain=expandLatestStackPiece(.035,4,7);msg=rewriteGrowMessage(msg,gain);arguments[0]=msg}
        if(stack&&/^PERFECT/.test(msg)){const gain=expandLatestStackPiece(.05,7,11);msg=rewriteGrowMessage(msg,gain);ensureStyle();if(showStackPerfectBurst(msg))return}
        return original.apply(this,arguments)
      };
      wrapped.__stackBalanceWrapped=true;wrapped.__stackBalanceOriginal=original;window.showComboBurst=wrapped;return true
    }catch(_){return false}
  }

  function clearRoofVibration(){while(roofVibeTimers.length)clearTimeout(roofVibeTimers.pop());try{if(navigator&&typeof navigator.vibrate==='function')navigator.vibrate(0)}catch(_){ }}
  function strongRoofVibration(){
    clearRoofVibration();
    const pulses=[[0,340],[450,440],[1030,560],[1730,950]];
    try{
      if(navigator&&typeof navigator.vibrate==='function'){
        pulses.forEach(([at,dur])=>roofVibeTimers.push(setTimeout(()=>{try{navigator.vibrate(0);navigator.vibrate(dur)}catch(_){}},at)));return
      }
    }catch(_){ }
    try{if(typeof buzz==='function')buzz([340,110,440,140,560,140,950])}catch(_){ }
  }
  function installStackObserver(){
    if(stackObserver||!document)return;
    const stage=document.getElementById('stage');if(!stage)return;
    stackObserver=new MutationObserver(ms=>{
      let blast=false,sceneAdded=false;
      for(const m of ms)for(const n of m.addedNodes){if(!(n instanceof Element))continue;if(n.matches&&n.matches('.sseBreakFlash')||n.querySelector&&n.querySelector('.sseBreakFlash'))blast=true;if(n.matches&&n.matches('#sseScene')||n.querySelector&&n.querySelector('#sseScene'))sceneAdded=true}
      if(blast)strongRoofVibration();if(sceneAdded)setTimeout(refreshStackAssistBadge,0)
    });
    stackObserver.observe(stage,{childList:true,subtree:true});setTimeout(refreshStackAssistBadge,0)
  }

  function ensureNewsUI(){
    if(!document)return;
    ensureStyle();
    const host=document.querySelector('#titleSplash .titleScene')||document.getElementById('titleSplash');if(!host)return;
    let btn=document.getElementById('osoNewsBtn');if(!btn){btn=document.createElement('button');btn.id='osoNewsBtn';btn.type='button';btn.setAttribute('aria-label','업데이트 소식');btn.textContent='📰';host.appendChild(btn)}
    let modal=document.getElementById('osoNewsModal');
    if(!modal){
      modal=document.createElement('div');modal.id='osoNewsModal';modal.innerHTML=`<div class="osoNewsCard" role="dialog" aria-modal="true" aria-label="업데이트 소식"><div class="osoNewsHead"><span style="font-size:28px">📰</span><strong>어서오소 업데이트 소식</strong><button class="osoNewsClose" type="button" aria-label="닫기">✕</button></div><div class="osoNewsList">${CHANGELOG.map(e=>`<section class="osoNewsEntry"><span class="osoNewsDate">${e.date}</span><h3>${escapeHtml(e.title)}</h3><ul>${e.items.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></section>`).join('')}</div><div class="osoNewsFoot">큰 기능 추가와 운영판 주요 변경을 날짜순으로 기록합니다.</div></div>`;document.body.appendChild(modal)
    }
    const open=e=>{e.preventDefault();e.stopPropagation();modal.classList.add('show')},close=e=>{if(e){e.preventDefault();e.stopPropagation()}modal.classList.remove('show')};
    if(!btn.dataset.newsBound){btn.dataset.newsBound='1';btn.addEventListener('pointerdown',open,{passive:false})}
    const c=modal.querySelector('.osoNewsClose');if(c&&!c.dataset.newsBound){c.dataset.newsBound='1';c.addEventListener('pointerdown',close,{passive:false})}
    if(!modal.dataset.newsBound){modal.dataset.newsBound='1';modal.addEventListener('pointerdown',e=>{if(e.target===modal)close(e)},{passive:false})}
  }

  function handleSp1Result(e){
    try{
      const d=e&&e.data||{};if(d.source!=='sotris-sp1'||d.type!=='RESULT')return;
      const session=String(d.session||''),attempt=Math.max(0,Math.floor(Number(d.attempt)||0));if(!session||!attempt)return;
      const key=session+':'+attempt;if(SP1_SEEN.has(key))return;SP1_SEEN.add(key);
      const info=currentBonus();if(info.percent<=0||typeof state==='undefined')return;
      const score=Math.max(0,Math.floor(Number(d.score)||0)),newScore=boosted(score,info.percent),scoreExtra=Math.max(0,newScore-score);
      if(scoreExtra>0){if(!state.best||typeof state.best!=='object')state.best={};state.best.sotris=Math.max(Math.floor(Number(state.best.sotris)||0),newScore);state.todayScore=(Number(state.todayScore)||0)+scoreExtra}
      let repeatable=Math.max(5,Math.min(90,Math.floor(score/10)||5));if(d.clear)repeatable+=330;
      const boostedReward=boosted(repeatable,info.percent),coinExtra=Math.max(0,boostedReward-repeatable),before=Math.max(0,Math.floor(Number(state.coins)||0));if(coinExtra>0)state.coins=before+coinExtra;
      try{if(typeof save==='function')save()}catch(_){ }const coinEl=document&&document.getElementById('sp1Coin');if(coinEl)coinEl.textContent='🪙 '+fmt(state.coins||0);
      try{if(coinExtra>0&&typeof crossedCoinMilestones==='function'&&typeof playCoinMilestones==='function')playCoinMilestones(crossedCoinMilestones(before,state.coins))}catch(_){ }showBonusToast(info,score,newScore,repeatable,boostedReward,520)
    }catch(_){ }
  }
  function scheduleShopDecoration(){setTimeout(()=>{try{decorateShop()}catch(_){}},0)}
  function bindShopDecoration(){
    if(!document||document.documentElement.dataset.characterBonusShopBound==='1')return;document.documentElement.dataset.characterBonusShopBound='1';document.addEventListener('click',e=>{const t=e&&e.target;if(!t||!t.closest)return;if(t.closest('#titleCollection,[data-page="bookPage"],[data-buy]'))scheduleShopDecoration()},true)
  }

  function boot(){
    ensureStyle();wrapFinish();wrapFantasyBattleReward();wrapStackJudgementEffects();bindShopDecoration();installStackMagnetAssist();installStackObserver();ensureNewsUI();
    if(window&&window.addEventListener)window.addEventListener('message',handleSp1Result)
  }

  window.OsoCharacterPerformanceBonus={bonusPercentForPrice,multiplierForPrice,boosted,currentBonus,traitInfo,decorateShop,stackAssistInfo,strongRoofVibration,CHANGELOG};
  if(document&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()
})();
