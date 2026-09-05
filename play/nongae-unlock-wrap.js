/* 논개 2종 해금 팝업 제목 줄바꿈 보정 */
(function(){
  'use strict';
  const TARGET='🌊 논개 캐릭터 2종 해금!';
  const FIXED='🌊 논개 캐릭터 2종<br>해금!';

  function normalize(v){return String(v||'').replace(/\s+/g,' ').trim()}
  function fix(root=document){
    const nodes=root.querySelectorAll('h1,h2,h3,strong,.title,.unlockTitle');
    for(const el of nodes){
      if(normalize(el.textContent)!==TARGET)continue;
      if(el.dataset.nongaeWrapFixed==='1')continue;
      el.innerHTML=FIXED;
      el.dataset.nongaeWrapFixed='1';
      el.style.wordBreak='keep-all';
      el.style.overflowWrap='normal';
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>fix(),{once:true});
  else fix();
  new MutationObserver(muts=>{
    for(const m of muts){
      for(const n of m.addedNodes){
        if(n.nodeType!==1)continue;
        if(/^H[1-3]$/.test(n.tagName)||n.matches?.('strong,.title,.unlockTitle')){
          if(normalize(n.textContent)===TARGET){n.innerHTML=FIXED;n.dataset.nongaeWrapFixed='1';n.style.wordBreak='keep-all';n.style.overflowWrap='normal'}
        }
        fix(n);
      }
    }
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
