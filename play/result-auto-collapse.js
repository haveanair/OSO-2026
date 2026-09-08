/* 어서오소 공통 결과 점수판 자동 축소
 * - 결과 화면은 기존보다 작게 표시
 * - 표시 5초 뒤 HUD를 피한 좌측 상단 '결과 보기' 버튼으로 축소
 * - 버튼을 눌러 다시 펼치거나 접을 수 있음
 * - 메인 게임과 같은 출처의 SP1 결과 화면까지 공통 처리
 */
(function(){
  'use strict';
  if(window.__OSO_RESULT_AUTO_COLLAPSE__)return;
  window.__OSO_RESULT_AUTO_COLLAPSE__=true;

  const STYLE_ID='osoResultAutoCollapseStyle';
  const AUTO_MS=5000;
  const HUD_SELECTORS=[
    '.counter','.comboHud','.lifeHud','.levelHud','.playCoinHud','.gameBest',
    '.runHud','.jumpHud','.tteokSpeed','.feverWrap','.feverText','.sseTopHud',
    '.raceHud','.raceCoinHud','.fantasyHud','.sfHud'
  ].join(',');

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
        left:12px!important;right:auto!important;top:var(--oso-result-collapsed-top,64px)!important;
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

  function positionCollapsed(r){
    try{
      const stage=r.closest('#stage');if(!stage)return;
      const sr=stage.getBoundingClientRect();
      const leftBand=sr.left+Math.min(230,sr.width*.48);
      let top=12;
      stage.querySelectorAll(HUD_SELECTORS).forEach(el=>{
        if(el===r||r.contains(el))return;
        const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0)return;
        const q=el.getBoundingClientRect();
        if(q.width<2||q.height<2||q.bottom<=sr.top||q.top>=sr.top+sr.height*.44)return;
        if(q.left>=leftBand||q.right<=sr.left)return;
        top=Math.max(top,q.bottom-sr.top+9);
      });
      top=Math.min(Math.max(12,top),Math.max(12,sr.height*.42));
      r.style.setProperty('--oso-result-collapsed-top',Math.round(top)+'px');
    }catch(_){ }
  }

  function setCollapsed(r,collapsed){
    if(!r||!r.isConnected)return;
    if(collapsed)positionCollapsed(r);
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

  function installSp1(frame){
    try{
      const doc=frame&&frame.contentDocument;if(!doc||doc.__osoResultCollapseInstalled)return;
      doc.__osoResultCollapseInstalled=true;
      const st=doc.createElement('style');st.id='osoSpResultCollapseStyle';st.textContent=`
        .osoSpResultToggle{position:absolute;left:12px;top:max(58px,calc(env(safe-area-inset-top) + 54px));z-index:90;height:38px;padding:0 12px;border:2px solid #ffe37a;border-radius:13px;background:linear-gradient(#fff9dc,#ffd85f);color:#16182a;box-shadow:0 4px #7b5d20;font:1000 12px system-ui,-apple-system,"Noto Sans KR",sans-serif;pointer-events:auto;touch-action:manipulation}
        #gameOver.osoSpResultCollapsed,#ending.osoSpResultCollapsed{display:block!important;background:transparent!important;padding:0!important;pointer-events:none!important}
        #gameOver.osoSpResultCollapsed>.pop,#ending.osoSpResultCollapsed>.endContent,#ending.osoSpResultCollapsed>.endingCard{display:none!important}
        #gameOver.osoSpResultCollapsed>.celebrateField{display:none!important}
        .osoSpResultCollapsed>.osoSpResultToggle{pointer-events:auto!important}
      `;(doc.head||doc.documentElement).appendChild(st);

      const configs=[['#gameOver','.pop'],['#ending','.endContent,.endingCard']];
      function reset(root){
        if(root.__osoSpResultTimer){clearTimeout(root.__osoSpResultTimer);root.__osoSpResultTimer=0}
        root.classList.remove('osoSpResultCollapsed');
        root.dataset.osoSpResultArmed='';
        const old=root.querySelector(':scope > .osoSpResultToggle');if(old)old.remove();
      }
      function arm(root,cardSelector){
        if(!root||!root.classList.contains('on')){if(root&&root.dataset.osoSpResultArmed==='1')reset(root);return}
        if(root.dataset.osoSpResultArmed==='1')return;
        if(!root.querySelector(cardSelector))return;
        root.dataset.osoSpResultArmed='1';
        const b=doc.createElement('button');b.type='button';b.className='osoSpResultToggle';b.textContent='▾ 접기';b.setAttribute('aria-expanded','true');
        b.addEventListener('click',e=>{
          e.preventDefault();e.stopPropagation();
          if(root.__osoSpResultTimer){clearTimeout(root.__osoSpResultTimer);root.__osoSpResultTimer=0}
          const collapsed=!root.classList.contains('osoSpResultCollapsed');
          root.classList.toggle('osoSpResultCollapsed',collapsed);
          b.textContent=collapsed?'🏆 결과 보기':'▾ 접기';b.setAttribute('aria-expanded',collapsed?'false':'true');
        });
        root.appendChild(b);
        root.__osoSpResultTimer=setTimeout(()=>{
          root.__osoSpResultTimer=0;
          if(!root.classList.contains('on'))return;
          root.classList.add('osoSpResultCollapsed');b.textContent='🏆 결과 보기';b.setAttribute('aria-expanded','false');
        },AUTO_MS);
      }
      function sync(){configs.forEach(([sel,card])=>arm(doc.querySelector(sel),card))}
      const obs=new MutationObserver(sync);obs.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
      sync();
    }catch(_){ }
  }

  function watchSp1(){
    const hook=frame=>{
      if(!(frame instanceof HTMLIFrameElement)||frame.id!=='sp1Frame'||frame.dataset.osoCollapseHook==='1')return;
      frame.dataset.osoCollapseHook='1';frame.addEventListener('load',()=>installSp1(frame));installSp1(frame);
    };
    document.querySelectorAll('#sp1Frame').forEach(hook);
    const obs=new MutationObserver(records=>records.forEach(rec=>rec.addedNodes.forEach(n=>{
      if(!(n instanceof Element))return;if(n.matches&&n.matches('#sp1Frame'))hook(n);n.querySelectorAll&&n.querySelectorAll('#sp1Frame').forEach(hook)
    })));
    obs.observe(document.documentElement,{subtree:true,childList:true});
  }

  function init(){
    ensureStyle();scan();watchSp1();
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
    addEventListener('resize',()=>document.querySelectorAll('#stage .result.osoResultCollapsed').forEach(positionCollapsed),{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
