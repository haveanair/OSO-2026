/* 어서오소 RPG 중간저장/불러오기 재확인 모듈
 * 기존 RPG 저장 로직은 건드리지 않고 버튼 동작 앞에 확인 절차만 추가한다.
 */
(function(){
  'use strict';

  const STYLE_ID='osoRpgSaveConfirmStyle';
  const OVERLAY_ID='fantasySaveConfirmOverlay';
  let bypassButton=null;

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=`
      .fantasySaveConfirmOverlay{position:absolute;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:24px;background:#020814e8}
      .fantasySaveConfirmCard{width:min(330px,94%);border:4px double #fff;background:#09204b;color:#fff;padding:16px;box-shadow:0 12px 32px #000c;text-align:center}
      .fantasySaveConfirmCard h3{margin:0 0 10px;color:#ffe783;font-size:18px}
      .fantasySaveConfirmCard p{margin:0 0 14px;padding:10px;border:1px solid #6f8fd0;background:#051333;color:#e8f0ff;font-size:10px;font-weight:900;line-height:1.65}
      .fantasySaveConfirmActions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .fantasySaveConfirmActions button{border:2px solid #e6eeff;border-radius:6px;padding:11px 6px;color:#fff;font-size:11px;font-weight:1000}
      .fantasySaveConfirmYes{background:#1d5d98}
      .fantasySaveConfirmNo{background:#4f3442}
    `;
    document.head.appendChild(st);
  }

  function init(api){
    if(!api||!api.saveMenu)return false;
    const saveBtn=document.getElementById('fantasySaveBtn');
    const loadBtn=document.getElementById('fantasyLoadBtn');
    if(!saveBtn||!loadBtn)return false;
    ensureStyle();

    function closeConfirm(){
      const old=document.getElementById(OVERLAY_ID);
      if(old)old.remove();
    }

    function confirmAction(btn,kind){
      closeConfirm();
      const isSave=kind==='save';
      const ov=document.createElement('div');
      ov.id=OVERLAY_ID;
      ov.className='fantasySaveConfirmOverlay';
      ov.innerHTML=`<div class="fantasySaveConfirmCard" role="dialog" aria-modal="true" aria-labelledby="fantasySaveConfirmTitle"><h3 id="fantasySaveConfirmTitle">${isSave?'중간 저장 확인':'불러오기 확인'}</h3><p>${isSave?'현재 위치와 진행 상황을 중간 저장합니다.<br>기존 중간 저장 데이터가 있으면 덮어씁니다.<br><b>저장하시겠습니까?</b>':'현재 진행을 저장하지 않았다면 이후 내용은 사라집니다.<br>저장된 시점으로 돌아갑니다.<br><b>불러오시겠습니까?</b>'}</p><div class="fantasySaveConfirmActions"><button type="button" class="fantasySaveConfirmYes">${isSave?'저장하기':'불러오기'}</button><button type="button" class="fantasySaveConfirmNo">취소</button></div></div>`;
      api.saveMenu.appendChild(ov);
      const yes=ov.querySelector('.fantasySaveConfirmYes');
      const no=ov.querySelector('.fantasySaveConfirmNo');
      yes.onclick=()=>{
        closeConfirm();
        bypassButton=btn;
        btn.click();
      };
      no.onclick=closeConfirm;
      ov.addEventListener('click',e=>{if(e.target===ov)closeConfirm()});
      setTimeout(()=>yes.focus(),0);
    }

    function guard(btn,kind){
      if(btn.dataset.osoSaveConfirmBound==='1')return;
      btn.dataset.osoSaveConfirmBound='1';
      btn.addEventListener('click',e=>{
        if(bypassButton===btn){bypassButton=null;return}
        e.preventDefault();
        e.stopImmediatePropagation();
        confirmAction(btn,kind);
      },true);
    }

    guard(saveBtn,'save');
    guard(loadBtn,'load');
    return true;
  }

  window.OsoRpgSaveConfirm={init};
})();
