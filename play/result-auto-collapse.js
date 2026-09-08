/* 어서오소 공통 결과 점수판 자동 축소
 * - 결과 화면은 기존보다 작게 표시
 * - 표시 5초 뒤 자동으로 좌상단 '결과 보기' 버튼으로 축소
 * - 버튼을 눌러 다시 펼치거나 접을 수 있음
 */
(function(){
  'use strict';
  if(window.__OSO_RESULT_AUTO_COLLAPSE__)return;
  window.__OSO_RESULT_AUTO_COLLAPSE__=true;

  const STYLE_ID='osoResultAutoCollapseStyle';
  const AUTO_MS=5000;

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=`
      #stage .result.osoResultCollapsible{
        left:50%!important;right:auto!important;top:50%!important;
        width:min(86vw,400px)!important;max-width:400px!important;
        max-height:min(68vh,520px)!important;overflow:auto!important;
        transform:translate(-50%,-50%)!important;
        padding:12px 12px 11px!important;border-radius:20px!important;
        animation:osoResultCompactIn .22s ease-out!important;
        transition:width .18s ease,left .18s ease,top .18s ease,padding .18s ease,box-shadow .18s ease,background .18s ease!important;
      }
      #stage .result.osoResultCollapsible img{height:72px!important;max-height:72px!important}
      #stage .result.osoResultCollapsible .score{font-size:30px!important;line-height:1.05!important}
      #stage .result.osoResultCollapsible .resultBadge{font-size:12px!important}
      #stage .result.osoResultCollapsible .resultStars{font-size:18px!important}
      #stage .result.osoResultCollapsible .actions{margin-top:8px!important;gap:6px!important}
      #stage .result.osoResultCollapsible .actions button{padding:8px 9px!important}
      #stage .osoResultToggle{
        position:absolute;left:7px;top:7px;z-index:5;
        min-width:38px;height:34px;padding:0 9px;
        border:2px solid #704a31;border-radius:12px;
        background:linear-gradient(#fffef7,#ffe39b);color:#54341f;
        box-shadow:0 3px #c99b5e;font-size:11px;font-weight:1000;
        line-height:1;touch-action:manipulation;
      }
      #stage .result.osoResultCollapsed{
        left:10px!important;right:auto!important;top:10px!important;
        width:auto!important;max-width:none!important;max-height:none!important;
        min-width:0!important;overflow:visible!important;
        transform:none!important;padding:0!important;
        border:0!important;border-radius:0!important;background:transparent!important;
        box-shadow:none!important;animation:none!important;
      }
      #stage .result.osoResultCollapsed>*:not(.osoResultToggle){display:none!important}
      #stage .result.osoResultCollapsed .osoResultToggle{
        position:static!important;width:auto!important;height:38px!important;
        padding:0 12px!important;border:3px solid #704a31!important;
        border-radius:14px!important;background:linear-gradient(#fff9dc,#ffd85f)!important;
        box-shadow:0 4px #c9862d!important;font-size:12px!important;
      }
      @keyframes osoResultCompactIn{
        from{opacity:0;transform:translate(-50%,-46%) scale(.9)}
        to{opacity:1;transform:translate(-50%,-50%) scale(1)}
      }
      @media(max-width:390px){
        #stage .result.osoResultCollapsible{width:min(90vw,360px)!important;max-height:64vh!important;padding:10px!important}
        #stage .result.osoResultCollapsible img{height:62px!important}
        #stage .result.osoResultCollapsible .score{font-size:27px!important}
      }
    `;
    document.head.appendChild(st);
  }

  function setCollapsed(r,collapsed){
    if(!r||!r.isConnected)return;
    r.classList.toggle('osoResultCollapsed',!!collapsed);
    const b=r.querySelector(':scope > .osoResultToggle');
    if(b){
      b.textContent=collapsed?'🏆 결과 보기':'▾ 접기';
      b.setAttribute('aria-expanded',collapsed?'false':'true');
      b.setAttribute('aria-label',collapsed?'결과 점수판 펼치기':'결과 점수판 접기');
    }
  }

  function decorate(r){
    if(!(r instanceof HTMLElement)||!r.classList.contains('result')||r.dataset.osoResultCollapsible==='1')return;
    r.dataset.osoResultCollapsible='1';
    r.classList.add('osoResultCollapsible');
    const b=document.createElement('button');
    b.type='button';b.className='osoResultToggle';b.textContent='▾ 접기';
    b.setAttribute('aria-expanded','true');b.setAttribute('aria-label','결과 점수판 접기');
    b.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      if(r.__osoResultTimer){clearTimeout(r.__osoResultTimer);r.__osoResultTimer=0}
      setCollapsed(r,!r.classList.contains('osoResultCollapsed'));
    });
    r.prepend(b);
    r.__osoResultTimer=setTimeout(()=>{
      r.__osoResultTimer=0;
      setCollapsed(r,true);
    },AUTO_MS);
  }

  function scan(root=document){
    try{root.querySelectorAll&&root.querySelectorAll('#stage .result').forEach(decorate)}catch(_){ }
  }

  function init(){
    ensureStyle();scan();
    const obs=new MutationObserver(records=>{
      for(const rec of records){
        for(const n of rec.addedNodes){
          if(!(n instanceof Element))continue;
          if(n.matches&&n.matches('#stage .result'))decorate(n);
          scan(n);
        }
      }
    });
    obs.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
