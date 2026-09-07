/* 어서오소 캐릭터 원본 비율 보호 모듈
 * 캐릭터 이미지를 정해진 박스 안에 contain 방식으로 배치해 가로/세로 찌그러짐을 막는다.
 * 비단쌓기에서 잘못된 하단 조작 설명을 제거하고 클리어 깃발을 화면 안에 확실히 표시한다.
 */
(function(){
  'use strict';
  if(window.__OSO_CHARACTER_ASPECT_GUARD__)return;
  window.__OSO_CHARACTER_ASPECT_GUARD__=true;

  function sizeOf(img){
    const w=Math.max(1,Number(img&&(img.naturalWidth||img.videoWidth||img.width))||1);
    const h=Math.max(1,Number(img&&(img.naturalHeight||img.videoHeight||img.height))||1);
    return {w,h};
  }
  function containRect(img,x,y,maxW,maxH,anchorX=.5,anchorY=.5){
    const s=sizeOf(img),mw=Math.max(1,Math.abs(Number(maxW)||1)),mh=Math.max(1,Math.abs(Number(maxH)||1));
    const k=Math.min(mw/s.w,mh/s.h),w=s.w*k,h=s.h*k;
    return {x:Number(x)+mw*anchorX-w*anchorX,y:Number(y)+mh*anchorY-h*anchorY,w,h};
  }
  function drawContainedBox(ctx,img,x,y,maxW,maxH,anchorX=.5,anchorY=.5){
    if(!ctx||!img)return null;
    const r=containRect(img,x,y,maxW,maxH,anchorX,anchorY);
    ctx.drawImage(img,r.x,r.y,r.w,r.h);
    return r;
  }
  function drawCentered(ctx,img,cx,cy,maxW,maxH){
    return drawContainedBox(ctx,img,Number(cx)-Number(maxW)/2,Number(cy)-Number(maxH)/2,maxW,maxH,.5,.5);
  }
  function installCss(){
    if(document.getElementById('osoCharacterAspectGuardStyle'))return;
    const st=document.createElement('style');
    st.id='osoCharacterAspectGuardStyle';
    st.textContent=`
      #stage img.friendChar,
      #stage img.tteokMascotV9,
      #stage img[class*="Mascot"],
      #stage img[class*="mascot"],
      #stage img[class*="Character"],
      #stage img[class*="character"],
      #stage img[class*="Oso"],
      #stage img[class*="oso"],
      #library img,
      .shopSheet img,
      .skinCard img{object-fit:contain!important;object-position:center bottom!important}

      /* 비단쌓기: 오해를 부르는 "비단을 떨어뜨리소" 안내는 사용하지 않는다. */
      #stage #sseScene .sseGuide{display:none!important}

      /* 비단쌓기 클리어 깃발은 스택 높이와 무관하게 화면 중앙에서 반드시 보이게 한다. */
      #stage #sseScene .stackFlag.sseFlagBurst{
        position:absolute!important;
        left:50%!important;right:auto!important;top:46%!important;bottom:auto!important;
        transform:translate(-50%,-50%)!important;
        z-index:64!important;
        display:flex!important;align-items:center!important;justify-content:center!important;
        width:min(270px,calc(100% - 42px))!important;min-height:58px!important;
        margin:0!important;padding:11px 14px 11px 20px!important;
        box-sizing:border-box!important;
        border:4px solid #633b25!important;border-radius:8px 15px 15px 8px!important;
        background:linear-gradient(180deg,#ffe869,#f6b522)!important;
        color:#4c2d1c!important;
        font-size:clamp(16px,4.8vw,21px)!important;font-weight:1000!important;line-height:1.15!important;
        text-align:center!important;white-space:normal!important;word-break:keep-all!important;
        opacity:1!important;visibility:visible!important;overflow:visible!important;
        box-shadow:0 7px 0 #9d632f,0 13px 26px #0005!important;
        pointer-events:none!important;
        animation:osoStackClearFlag 1.05s cubic-bezier(.2,.8,.2,1) both!important;
      }
      #stage #sseScene .stackFlag.sseFlagBurst:before{
        content:''!important;position:absolute!important;left:-9px!important;top:-16px!important;
        width:7px!important;height:92px!important;border:2px solid #56331f!important;border-radius:999px!important;
        background:linear-gradient(90deg,#8a5a31,#d6a264,#7a4b29)!important;
        box-shadow:2px 3px 5px #0004!important;
      }
      #stage #sseScene .stackFlag.sseFlagBurst:after{
        content:'★'!important;position:absolute!important;left:-15px!important;top:-31px!important;
        width:19px!important;height:19px!important;display:grid!important;place-items:center!important;
        color:#ffd63b!important;font-size:17px!important;text-shadow:0 2px #69401f!important;
      }
      @keyframes osoStackClearFlag{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.35) rotate(-6deg)}
        45%{opacity:1;transform:translate(-50%,-50%) scale(1.13) rotate(2deg)}
        72%{opacity:1;transform:translate(-50%,-50%) scale(.98) rotate(-1deg)}
        100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}
      }
      @media(max-width:390px){
        #stage #sseScene .stackFlag.sseFlagBurst{top:48%!important;width:calc(100% - 34px)!important;min-height:54px!important;padding:9px 10px 9px 18px!important;font-size:16px!important}
      }
    `;
    document.head.appendChild(st);
  }
  function removeWrongStackGuide(root=document){
    try{
      const scope=root&&root.querySelectorAll?root:document;
      scope.querySelectorAll('#stage #sseScene .sseGuide').forEach(el=>el.remove());
    }catch(_){ }
  }
  function installStackPresentationGuard(){
    const bind=()=>{
      const stage=document.getElementById('stage');
      if(!stage||stage.dataset.ssePresentationGuard==='1')return;
      stage.dataset.ssePresentationGuard='1';
      removeWrongStackGuide(document);
      new MutationObserver(()=>removeWrongStackGuide(document)).observe(stage,{childList:true,subtree:true});
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  }
  installCss();
  installStackPresentationGuard();
  window.OsoCharacterAspectGuard={VERSION:'1.1.0',sizeOf,containRect,drawContainedBox,drawCentered,installCss,removeWrongStackGuide};
})();
