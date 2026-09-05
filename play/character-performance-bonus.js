/* 어서오소 캐릭터 성능 보너스
 * 선택한 캐릭터의 도감 가격대가 높을수록 게임 최종 점수와 코인 보상이 상승한다.
 * 기존 게임별 JS는 건드리지 않고 공통 finish / RPG 전투보상 / SP1 결과를 후킹한다.
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

  function ensureStyle(){
    if(!document||document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');st.id=STYLE_ID;st.textContent=`
      .characterRewardBonus{display:block;margin:5px 0 1px;padding:3px 6px;border:1px solid #e7bb55;border-radius:999px;background:#fff4bd;color:#6a451b;font-size:9px;font-weight:1000;line-height:1.25;text-align:center}
      .characterRewardBonus.base{border-color:#aeb8c5;background:#eef2f7;color:#53606d}
      #${TOAST_ID}{position:fixed;left:50%;top:max(76px,calc(env(safe-area-inset-top) + 62px));transform:translate(-50%,-12px);z-index:10050;max-width:92vw;padding:10px 14px;border:3px solid #ffe27a;border-radius:15px;background:#102444f2;color:#fff;text-align:center;font-size:11px;font-weight:1000;line-height:1.5;box-shadow:0 8px 26px #0008;opacity:0;pointer-events:none;transition:.18s}
      #${TOAST_ID}.show{opacity:1;transform:translate(-50%,0)}
      #${TOAST_ID} b{color:#ffe780}
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
      tag.textContent=pct>0?`⭐ 점수·코인 +${pct}%`:'점수·코인 기본 보상'
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
        /* 현재 공통 finish 시그니처의 5번째 인자는 게임 내부에서 모은 추가 코인이다. */
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
      /* SP1 최초클리어 200 고정보너스는 그대로 두고, 매 플레이 반복 보상만 캐릭터 보너스를 적용한다. */
      let repeatable=Math.max(5,Math.min(90,Math.floor(score/10)||5));if(d.clear)repeatable+=30+300;
      const boostedReward=boosted(repeatable,info.percent),coinExtra=Math.max(0,boostedReward-repeatable),before=Math.max(0,Math.floor(Number(state.coins)||0));
      if(coinExtra>0)state.coins=before+coinExtra;
      try{if(typeof save==='function')save()}catch(_){ }
      const coinEl=document&&document.getElementById('sp1Coin');if(coinEl)coinEl.textContent='🪙 '+fmt(state.coins||0);
      try{if(coinExtra>0&&typeof crossedCoinMilestones==='function'&&typeof playCoinMilestones==='function')playCoinMilestones(crossedCoinMilestones(before,state.coins))}catch(_){ }
      showBonusToast(info,score,newScore,repeatable,boostedReward,520)
    }catch(_){ }
  }

  function observeShop(){
    decorateShop();
    const shop=document&&document.getElementById('osoShop');
    if(shop&&typeof MutationObserver!=='undefined')new MutationObserver(()=>decorateShop()).observe(shop,{childList:true,subtree:true})
  }

  function boot(){
    ensureStyle();wrapFinish();wrapFantasyBattleReward();observeShop();
    if(window&&window.addEventListener)window.addEventListener('message',handleSp1Result)
  }

  window.OsoCharacterPerformanceBonus={bonusPercentForPrice,multiplierForPrice,boosted,currentBonus,decorateShop};
  if(document&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()
})();
