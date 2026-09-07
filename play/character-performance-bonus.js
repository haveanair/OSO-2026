/* 어서오소 캐릭터 성능 보너스
 * 선택한 캐릭터의 도감 가격대가 높을수록 게임 최종 점수와 코인 보상이 상승한다.
 * 기존 게임별 JS는 건드리지 않고 공통 finish / RPG 전투보상 / SP1 결과를 후킹한다.
 * 비단쌓기 모바일 UI 보정 및 PERFECT 2줄 이펙트를 후단에서 보강한다.
 */
(function(){
  'use strict';
  if(window.__OSO_CHARACTER_PERFORMANCE_BONUS__)return;
  window.__OSO_CHARACTER_PERFORMANCE_BONUS__=true;

  const STYLE_ID='osoCharacterPerformanceBonusStyle';
  const TOAST_ID='osoCharacterPerformanceBonusToast';
  const SP1_SEEN=new Set();

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

  function traitInfo(skin){
    const s=skin||{};
    try{
      const api=window.OsoCharacterSpecialAbilities;
      if(api&&typeof api.traits==='function'){
        const t=api.traits(s);
        if(t.nongae)return {kind:'nongae',label:'✨ 아요+하모 특성 · 상시 4단점프'};
        if(t.aya)return {kind:'aya',label:'⚡ 레이싱 300km/h · 슈팅 이동↑ · 점프↑'};
        if(t.hamo)return {kind:'hamo',label:'🎯 수산·싹쓸이·떡떡떡·연타왕 판정↑'};
      }
    }catch(_){ }
    const id=String(s.id||''),group=String(s.group||'');
    if(id==='nongae_jade'||id==='nongae_resolve'||group==='nongae')return {kind:'nongae',label:'✨ 아요+하모 특성 · 상시 4단점프'};
    if(group==='ayo'||id==='ayo'||id==='ayo_glasses')return {kind:'aya',label:'⚡ 레이싱 300km/h · 슈팅 이동↑ · 점프↑'};
    if(group==='hamo'||id==='hamo')return {kind:'hamo',label:'🎯 수산·싹쓸이·떡떡떡·연타왕 판정↑'};
    return null
  }

  function ensureStyle(){
    if(!document||document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
      .characterRewardBonus{display:block;margin:5px 0 1px;padding:3px 6px;border:1px solid #e7bb55;border-radius:999px;background:#fff4bd;color:#6a451b;font-size:9px;font-weight:1000;line-height:1.25;text-align:center}
      .characterRewardBonus.base{border-color:#aeb8c5;background:#eef2f7;color:#53606d}
      .characterAbilitySummary{display:block;margin:3px 0 2px;padding:3px 5px;border-radius:7px;background:#eef6ff;color:#284866;font-size:8px;font-weight:900;line-height:1.35;text-align:center;white-space:normal;word-break:keep-all}
      .characterAbilitySummary.hamo{background:#eef9ef;color:#285335}
      .characterAbilitySummary.nongae{background:#f6efff;color:#5b3476}
      #${TOAST_ID}{position:fixed;left:50%;top:max(76px,calc(env(safe-area-inset-top) + 62px));transform:translate(-50%,-12px);z-index:10050;max-width:92vw;padding:10px 14px;border:3px solid #ffe27a;border-radius:15px;background:#102444f2;color:#fff;text-align:center;font-size:11px;font-weight:1000;line-height:1.5;box-shadow:0 8px 26px #0008;opacity:0;pointer-events:none;transition:.18s}
      #${TOAST_ID}.show{opacity:1;transform:translate(-50%,0)}
      #${TOAST_ID} b{color:#ffe780}

      /* 비단쌓기 모바일 좌우 잘림 방지: 기존 silkSign/silkGuide/gameTip의 50% 이동을 완전히 해제 */
      #stage .sseTopHud .sseTitle{
        left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
        transform:none!important;translate:none!important;
        justify-self:center!important;box-sizing:border-box!important;
        width:calc(100% - 6px)!important;max-width:360px!important;min-width:0!important;
        margin:0 auto!important;padding:8px 10px!important;
        white-space:normal!important;overflow:visible!important;text-overflow:clip!important;
        overflow-wrap:break-word!important;word-break:keep-all!important;
        text-align:center!important;line-height:1.12!important;
      }
      #stage .sseBottomHud{
        left:8px!important;right:8px!important;width:auto!important;max-width:none!important;
        margin:0!important;transform:none!important;translate:none!important;
        box-sizing:border-box!important;overflow:visible!important;
      }
      #stage .sseBottomHud .sseGuide,
      #stage .sseBottomHud .sseGameTip{
        left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
        transform:none!important;translate:none!important;
        justify-self:center!important;box-sizing:border-box!important;
        width:min(100%,430px)!important;max-width:100%!important;min-width:0!important;
        margin:0 auto!important;text-align:center!important;
        white-space:normal!important;overflow:visible!important;text-overflow:clip!important;
        overflow-wrap:break-word!important;word-break:keep-all!important;
      }

      /* PERFECT 전용 2줄 이펙트 */
      #stage .ssePerfectBurst2{
        position:absolute!important;left:50%!important;top:37%!important;right:auto!important;bottom:auto!important;
        z-index:52!important;transform:translateX(-50%) scale(.72)!important;
        width:auto!important;min-width:min(230px,calc(100% - 28px))!important;
        max-width:calc(100% - 28px)!important;box-sizing:border-box!important;
        padding:10px 16px 9px!important;border:4px solid #7a4a22!important;border-radius:18px!important;
        background:#fff5c9f2!important;color:#5b341e!important;text-align:center!important;
        box-shadow:0 7px 0 #a66d35,0 13px 24px #0005!important;
        pointer-events:none!important;opacity:0!important;
        animation:ssePerfectBurst2 1.05s cubic-bezier(.18,.78,.22,1) forwards!important;
      }
      #stage .ssePerfectBurst2.heart{border-color:#a83f54!important;background:#fff0f3f4!important;box-shadow:0 7px 0 #b65a6d,0 13px 24px #0005!important}
      #stage .ssePerfectBurst2 .ssePerfectMain{
        display:block!important;margin:0!important;padding:0!important;
        font-size:clamp(20px,6vw,29px)!important;font-weight:1000!important;line-height:1.05!important;
        white-space:normal!important;word-break:keep-all!important;overflow-wrap:normal!important;
      }
      #stage .ssePerfectBurst2 .ssePerfectSub{
        display:block!important;margin:5px 0 0!important;padding:0!important;
        font-size:clamp(11px,3.3vw,15px)!important;font-weight:1000!important;line-height:1.15!important;
        white-space:normal!important;word-break:keep-all!important;overflow-wrap:break-word!important;
      }
      @keyframes ssePerfectBurst2{
        0%{opacity:0;transform:translateX(-50%) scale(.68)}
        18%{opacity:1;transform:translateX(-50%) scale(1.10)}
        42%{opacity:1;transform:translateX(-50%) scale(1)}
        78%{opacity:1;transform:translateX(-50%) scale(1)}
        100%{opacity:0;transform:translateX(-50%) translateY(-20px) scale(.92)}
      }
      @media(max-width:390px){
        #stage .sseTopHud .sseTitle{width:100%!important;max-width:100%!important;padding:7px 8px!important;font-size:17px!important}
        #stage .sseBottomHud{left:6px!important;right:6px!important}
        #stage .sseBottomHud .sseGuide,#stage .sseBottomHud .sseGameTip{width:100%!important;max-width:100%!important}
        #stage .ssePerfectBurst2{top:36%!important;min-width:min(220px,calc(100% - 20px))!important;max-width:calc(100% - 20px)!important;padding:9px 12px 8px!important}
      }
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
    clearTimeout(el._showT);clearTimeout(el._hideT);
    el.classList.remove('show');
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
      tag.classList.toggle('base',pct<=0);
      const label=pct>0?`⭐ 점수·코인 +${pct}%`:'점수·코인 기본 보상';
      if(tag.textContent!==label)tag.textContent=label;

      const trait=traitInfo(skin);
      let ability=card.querySelector('.characterAbilitySummary');
      if(trait){
        if(!ability){ability=document.createElement('span');const btn=card.querySelector('button[data-buy]');btn?card.insertBefore(ability,btn):card.appendChild(ability)}
        ability.className='characterAbilitySummary '+trait.kind;
        if(ability.textContent!==trait.label)ability.textContent=trait.label
      }else if(ability){ability.remove()}
    })
  }

  function wrapFinish(){
    try{
      if(typeof window.finish!=='function'||window.finish.__characterPerformanceWrapped)return false;
      const original=window.finish;
      const wrapped=function(){
        const args=Array.from(arguments),info=currentBonus();
        const baseScore=Math.max(0,Math.floor(Number(args[1])||0));
        const newScore=info.percent>0?boosted(baseScore,info.percent):baseScore;
        args[1]=newScore;
        let baseCoins=NaN,newCoins=NaN;
        if(typeof args[4]==='number'&&Number.isFinite(args[4])){
          baseCoins=Math.max(0,Math.floor(args[4]));newCoins=info.percent>0?boosted(baseCoins,info.percent):baseCoins;args[4]=newCoins
        }
        const result=original.apply(this,args);
        if(info.percent>0)showBonusToast(info,baseScore,newScore,baseCoins,newCoins);
        return result
      };
      wrapped.__characterPerformanceWrapped=true;wrapped.__characterPerformanceOriginal=original;window.finish=wrapped;return true
    }catch(_){return false}
  }

  function wrapFantasyBattleReward(){
    try{
      if(typeof window.fantasyBattleCoinReward!=='function'||window.fantasyBattleCoinReward.__characterPerformanceWrapped)return false;
      const original=window.fantasyBattleCoinReward;
      const wrapped=function(enemy){const base=Math.max(0,Math.floor(Number(original.call(this,enemy))||0)),info=currentBonus();return info.percent>0?boosted(base,info.percent):base};
      wrapped.__characterPerformanceWrapped=true;wrapped.__characterPerformanceOriginal=original;window.fantasyBattleCoinReward=wrapped;return true
    }catch(_){return false}
  }

  function showStackPerfectBurst(message){
    try{
      const scene=document.querySelector('#stage #sseScene');if(!scene)return false;
      const msg=String(message||'').trim();if(!/^PERFECT/.test(msg))return false;
      scene.querySelectorAll('.ssePerfectBurst2').forEach(e=>e.remove());
      const parts=msg.split(' · ').map(s=>s.trim()).filter(Boolean),main=parts.shift()||'PERFECT!',sub=parts.join(' · ');
      const box=document.createElement('div');box.className='ssePerfectBurst2'+(main.includes('❤️')?' heart':'');
      const a=document.createElement('span');a.className='ssePerfectMain';a.textContent=main;
      const b=document.createElement('span');b.className='ssePerfectSub';b.textContent=sub||'정확하게 맞췄습니다!';
      box.append(a,b);scene.appendChild(box);setTimeout(()=>box.remove(),1120);return true
    }catch(_){return false}
  }
  function wrapStackPerfectEffect(){
    try{
      if(typeof window.showComboBurst!=='function'||window.showComboBurst.__stackPerfectTwoLineWrapped)return false;
      const original=window.showComboBurst;
      const wrapped=function(message){
        const msg=String(message==null?'':message);
        if(/^PERFECT/.test(msg)&&document.querySelector('#stage #sseScene')){
          ensureStyle();if(showStackPerfectBurst(msg))return
        }
        return original.apply(this,arguments)
      };
      wrapped.__stackPerfectTwoLineWrapped=true;wrapped.__stackPerfectTwoLineOriginal=original;window.showComboBurst=wrapped;return true
    }catch(_){return false}
  }

  function handleSp1Result(e){
    try{
      const d=e&&e.data||{};if(d.source!=='sotris-sp1'||d.type!=='RESULT')return;
      const session=String(d.session||''),attempt=Math.max(0,Math.floor(Number(d.attempt)||0));if(!session||!attempt)return;
      const key=session+':'+attempt;if(SP1_SEEN.has(key))return;SP1_SEEN.add(key);
      const info=currentBonus();if(info.percent<=0||typeof state==='undefined')return;
      const score=Math.max(0,Math.floor(Number(d.score)||0)),newScore=boosted(score,info.percent),scoreExtra=Math.max(0,newScore-score);
      if(scoreExtra>0){
        if(!state.best||typeof state.best!=='object')state.best={};
        state.best.sotris=Math.max(Math.floor(Number(state.best.sotris)||0),newScore);
        state.todayScore=(Number(state.todayScore)||0)+scoreExtra
      }
      let repeatable=Math.max(5,Math.min(90,Math.floor(score/10)||5));if(d.clear)repeatable+=30+300;
      const boostedReward=boosted(repeatable,info.percent),coinExtra=Math.max(0,boostedReward-repeatable),before=Math.max(0,Math.floor(Number(state.coins)||0));
      if(coinExtra>0)state.coins=before+coinExtra;
      try{if(typeof save==='function')save()}catch(_){ }
      const coinEl=document&&document.getElementById('sp1Coin');if(coinEl)coinEl.textContent='🪙 '+fmt(state.coins||0);
      try{if(coinExtra>0&&typeof crossedCoinMilestones==='function'&&typeof playCoinMilestones==='function')playCoinMilestones(crossedCoinMilestones(before,state.coins))}catch(_){ }
      showBonusToast(info,score,newScore,repeatable,boostedReward,520)
    }catch(_){ }
  }

  function scheduleShopDecoration(){setTimeout(()=>{try{decorateShop()}catch(_){}},0)}
  function bindShopDecoration(){
    if(!document||document.documentElement.dataset.characterBonusShopBound==='1')return;
    document.documentElement.dataset.characterBonusShopBound='1';
    document.addEventListener('click',e=>{
      const t=e&&e.target;if(!t||!t.closest)return;
      if(t.closest('#titleCollection,[data-page="bookPage"],[data-buy]'))scheduleShopDecoration()
    },true)
  }

  function boot(){
    ensureStyle();wrapFinish();wrapFantasyBattleReward();wrapStackPerfectEffect();bindShopDecoration();
    if(window&&window.addEventListener)window.addEventListener('message',handleSp1Result)
  }

  window.OsoCharacterPerformanceBonus={bonusPercentForPrice,multiplierForPrice,boosted,currentBonus,traitInfo,decorateShop};
  if(document&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()
})();
