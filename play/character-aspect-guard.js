/* 어서오소 캐릭터 원본 비율 보호 모듈
 * 캐릭터 이미지를 정해진 박스 안에 contain 방식으로 배치해 가로/세로 찌그러짐을 막는다.
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
    `;
    document.head.appendChild(st);
  }
  installCss();
  window.OsoCharacterAspectGuard={VERSION:'1.0.0',sizeOf,containRect,drawContainedBox,drawCentered,installCss};
})();
