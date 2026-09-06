/* 어서오소 캐릭터 고유 특성
 * 신규 캐릭터 특성은 이 파일에만 정의하고, 기존 게임 코드는 최소 훅만 연결한다.
 * 아요: 레이싱/슈팅/달리기 강화
 * 하모: 수산시장/싹쓸이/떡떡떡/연타왕 판정 강화
 * 논개: 아요+하모 장점 + 상시 4단 점프
 */
(function(){
  'use strict';
  if(window.__OSO_CHARACTER_SPECIAL_ABILITIES__)return;
  window.__OSO_CHARACTER_SPECIAL_ABILITIES__=true;

  function traits(skin){
    const s=skin||{},id=String(s.id||''),group=String(s.group||'');
    const nongae=id==='nongae_jade'||id==='nongae_resolve'||group==='nongae';
    const aya=nongae||group==='ayo'||id==='ayo'||id==='ayo_glasses';
    const hamo=nongae||group==='hamo'||id==='hamo';
    return {aya,hamo,nongae};
  }

  function racingLimits(skin,normalMax=220,boostMax=260){
    return traits(skin).aya?{normal:260,boost:300}:{normal:normalMax,boost:boostMax};
  }

  function shootingDelayMs(skin,baseMs){
    const base=Math.max(1,Number(baseMs)||1);
    return traits(skin).aya?Math.max(48,Math.round(base*.72)):base;
  }

  function runBaseJumpCap(skin,baseCap=2){
    return traits(skin).nongae?4:Math.max(1,Math.floor(Number(baseCap)||2));
  }

  function runJumpVelocity(skin,jumpIndex,baseVelocity){
    if(!traits(skin).aya)return baseVelocity;
    const boosted=[-640,-560,-510,-470];
    const i=Math.max(0,Math.min(boosted.length-1,Math.floor(Number(jumpIndex)||1)-1));
    return boosted[i];
  }

  function runNeedsTripleTicket(skin,jumpIndex){
    return !traits(skin).nongae&&Math.floor(Number(jumpIndex)||0)>=3;
  }

  function runGreatAddsTripleTicket(skin){return !traits(skin).nongae}

  function fishDwellMs(skin,baseMs){
    const base=Math.max(1,Number(baseMs)||1);
    return traits(skin).hamo?Math.round(base*1.36):base;
  }

  function sliceRadius(skin,baseRadius){
    const base=Math.max(1,Number(baseRadius)||1);
    return traits(skin).hamo?base*1.45:base;
  }

  function sliceMinSwipeSpeed(skin,baseSpeed){
    const base=Math.max(1,Number(baseSpeed)||1);
    return traits(skin).hamo?Math.min(base,70):base;
  }

  function tteokWindow(skin,kind,baseWindow){
    const base=Math.max(0,Number(baseWindow)||0);
    if(!traits(skin).hamo)return base;
    const mult=kind==='perfect'?1.40:kind==='great'?1.36:1.35;
    return base*mult;
  }

  function powerduckNeed(skin,baseNeed){
    const base=Math.max(1,Math.floor(Number(baseNeed)||1));
    return traits(skin).hamo?Math.max(1,Math.ceil(base*.78)):base;
  }

  window.OsoCharacterSpecialAbilities={
    VERSION:'1.0.0',traits,racingLimits,shootingDelayMs,
    runBaseJumpCap,runJumpVelocity,runNeedsTripleTicket,runGreatAddsTripleTicket,
    fishDwellMs,sliceRadius,sliceMinSwipeSpeed,tteokWindow,powerduckNeed
  };
})();
