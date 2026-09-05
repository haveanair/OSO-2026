/* 어서오소 RPG 탐험중 아이템/회복마법 사용 모듈
 * 새 기능은 기존 RPG 본체와 분리하고, play/index.html 에서는 init API만 연결한다.
 */
(function(){
  'use strict';

  const STYLE_ID='osoRpgFieldActionsStyle';
  const PAGE_ID='fantasyFieldActionsPage';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=`
      .fantasySaveActions .fieldAction{background:linear-gradient(#2c7391,#17445f);border-color:#9eeaff;color:#fff}
      .fantasySaveActions .fieldMagic{background:linear-gradient(#6751a7,#392b71);border-color:#d8c5ff;color:#fff}
      .fantasyFieldActionsPage{display:none}
      .fantasyFieldActionsPage.show{display:block}
      .fantasyFieldSummary{margin:0 0 9px;padding:8px 9px;border:1px solid #7da0dc;background:#051333;color:#dce9ff;font-size:10px;font-weight:900;line-height:1.5;text-align:center}
      .fantasyFieldList{display:grid;gap:7px}
      .fantasyFieldUse{width:100%;display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;text-align:left;border:2px solid #dce8ff;background:#143b79;color:#fff;border-radius:7px;padding:9px 10px;font-size:10px;font-weight:1000}
      .fantasyFieldUse strong{display:block;color:#fff4a8;font-size:12px;margin-bottom:2px}
      .fantasyFieldUse small{display:block;color:#d8e5ff;font-size:9px;line-height:1.4}
      .fantasyFieldUse em{font-style:normal;white-space:nowrap;color:#fff8c6}
      .fantasyFieldUse:disabled{opacity:.43;filter:grayscale(.2)}
      .fantasyFieldOnly{border-color:#7c86a0;background:#202b45}
      .fantasyFieldFeedback{min-height:34px;margin:8px 0;padding:7px 9px;border:1px solid #7da0dc;background:#071a3d;color:#fff3a0;font-size:10px;font-weight:1000;line-height:1.45;text-align:center}
      .fantasyFieldBack{width:100%;border:2px solid #e6eeff;background:#4f3442;color:#fff;border-radius:5px;padding:10px 6px;font-size:11px;font-weight:1000}
    `;
    document.head.appendChild(st);
  }

  function init(api){
    if(!api||!api.hero||!api.run||!api.menuHome||!api.saveMenu)return false;
    if(document.getElementById(PAGE_ID))return true;
    ensureStyle();

    const actions=api.menuHome.querySelector('.fantasySaveActions');
    const card=api.saveMenu.querySelector('.fantasySaveCard');
    if(!actions||!card)return false;

    const itemBtn=document.createElement('button');
    itemBtn.type='button';itemBtn.className='fieldAction';itemBtn.id='fantasyFieldItemBtn';itemBtn.textContent='아이템';
    const magicBtn=document.createElement('button');
    magicBtn.type='button';magicBtn.className='fieldMagic';magicBtn.id='fantasyFieldMagicBtn';magicBtn.textContent='마법';

    const saveBtn=actions.querySelector('#fantasySaveBtn');
    if(saveBtn){actions.insertBefore(itemBtn,saveBtn);actions.insertBefore(magicBtn,saveBtn)}
    else{actions.appendChild(itemBtn);actions.appendChild(magicBtn)}

    const page=document.createElement('div');
    page.className='fantasyFieldActionsPage';page.id=PAGE_ID;
    page.innerHTML=`<h3 id="fantasyFieldActionsTitle">탐험중 사용</h3><div class="fantasyFieldSummary" id="fantasyFieldSummary"></div><div class="fantasyFieldList" id="fantasyFieldList"></div><div class="fantasyFieldFeedback" id="fantasyFieldFeedback">전투 밖에서도 회복 아이템과 회복 마법을 사용할 수 있습니다.</div><button type="button" class="fantasyFieldBack" id="fantasyFieldBack">모험 메뉴로</button>`;
    card.appendChild(page);

    const title=page.querySelector('#fantasyFieldActionsTitle');
    const summary=page.querySelector('#fantasyFieldSummary');
    const list=page.querySelector('#fantasyFieldList');
    const feedback=page.querySelector('#fantasyFieldFeedback');
    let mode='item';

    function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
    function setFeedback(msg){feedback.textContent=msg}
    function sound(kind='good'){
      try{api.tone&&api.tone(kind)}catch(_){ }
      try{api.buzz&&api.buzz([12,6,20])}catch(_){ }
    }
    function refreshSummary(){summary.textContent=`LV ${api.hero.lv} · HP ${api.hero.hp}/${api.hero.maxHp} · MP ${api.hero.mp}/${api.hero.maxMp}`}

    function useItem(id){
      const inv=api.run.inventory||(api.run.inventory={});
      if((inv[id]||0)<=0){setFeedback(`${id}이(가) 없습니다.`);return}
      if(id==='포션'){
        if(api.hero.hp>=api.hero.maxHp){setFeedback('HP가 이미 가득 찼습니다.');return}
        const before=api.hero.hp;api.hero.hp=api.hero.maxHp;inv.포션--;
        api.updateHud();sound('coin');setFeedback(`포션 사용! HP +${api.hero.hp-before} · 완전회복`);render();return
      }
      if(id==='에테르'){
        if(api.hero.mp>=api.hero.maxMp){setFeedback('MP가 이미 가득 찼습니다.');return}
        const before=api.hero.mp;api.hero.mp=api.hero.maxMp;inv.에테르--;
        api.updateHud();sound('coin');setFeedback(`에테르 사용! MP +${api.hero.mp-before} · 완전회복`);render();return
      }
      setFeedback('성수는 적에게 피해를 주는 전투 전용 아이템입니다.')
    }

    function fieldSpell(id){
      const learned=(typeof api.spells==='function'?api.spells():[]).find(x=>x.id===id);
      if(!learned){setFeedback(id==='heal'?'회복은 LV2에 습득합니다.':'대회복은 LV6에 습득합니다.');return}
      if(api.hero.hp>=api.hero.maxHp){setFeedback('HP가 이미 가득 찼습니다.');return}
      if(api.hero.mp<learned.mp){setFeedback(`MP가 부족합니다. 필요 MP ${learned.mp}`);return}
      api.hero.mp-=learned.mp;
      const amount=id==='greaterHeal'?28+api.hero.lv*3:12+api.hero.lv*2;
      const before=api.hero.hp;api.hero.hp=Math.min(api.hero.maxHp,api.hero.hp+amount);
      const actual=api.hero.hp-before;
      api.updateHud();sound('clear');
      setFeedback(`${learned.name}! HP +${actual} · MP ${learned.mp} 사용`);render()
    }

    function itemRow(id,desc,fieldOk){
      const n=(api.run.inventory&&api.run.inventory[id])||0;
      const noEffect=(id==='포션'&&api.hero.hp>=api.hero.maxHp)||(id==='에테르'&&api.hero.mp>=api.hero.maxMp);
      const disabled=!fieldOk||n<=0||noEffect;
      const note=!fieldOk?'전투 전용':n<=0?'보유 없음':noEffect?'현재 수치 MAX':`보유 ${n}`;
      return `<button type="button" class="fantasyFieldUse${fieldOk?'':' fantasyFieldOnly'}" data-field-item="${esc(id)}" ${disabled?'disabled':''}><span><strong>${esc(id)}</strong><small>${esc(desc)}</small></span><em>${esc(note)}</em></button>`
    }
    function magicRow(id,name,lv,mp,desc){
      const learned=api.hero.lv>=lv;
      const enough=api.hero.mp>=mp;
      const useful=api.hero.hp<api.hero.maxHp;
      const disabled=!learned||!enough||!useful;
      const note=!learned?`LV${lv} 습득`:!enough?`MP 부족`:!useful?'HP MAX':`MP ${mp}`;
      return `<button type="button" class="fantasyFieldUse" data-field-spell="${id}" ${disabled?'disabled':''}><span><strong>${esc(name)}</strong><small>${esc(desc)}</small></span><em>${esc(note)}</em></button>`
    }

    function render(){
      refreshSummary();
      if(mode==='item'){
        title.textContent='아이템';
        list.innerHTML=itemRow('포션','HP 완전회복',true)+itemRow('에테르','MP 완전회복',true)+itemRow('성수','적에게 빛 피해',false)
      }else{
        title.textContent='마법';
        list.innerHTML=magicRow('heal','회복',2,2,`HP ${12+api.hero.lv*2} 회복`)+magicRow('greaterHeal','대회복',6,5,`HP ${28+api.hero.lv*3} 회복`)+`<button type="button" class="fantasyFieldUse fantasyFieldOnly" disabled><span><strong>공격·방어 마법</strong><small>적 대상 공격마법과 방어막은 전투에서 사용</small></span><em>전투 전용</em></button>`
      }
    }
    function open(which){
      mode=which;setFeedback(which==='item'?'사용할 아이템을 선택하세요.':'탐험 중에는 회복 계열 마법을 사용할 수 있습니다.');
      if(api.statusPage)api.statusPage.classList.remove('show');
      api.menuHome.classList.add('hide');page.classList.add('show');render()
    }
    function back(){page.classList.remove('show');api.menuHome.classList.remove('hide')}
    function reset(){page.classList.remove('show');api.menuHome.classList.remove('hide')}

    itemBtn.addEventListener('click',()=>open('item'));
    magicBtn.addEventListener('click',()=>open('magic'));
    page.querySelector('#fantasyFieldBack').addEventListener('click',back);
    list.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b||b.disabled)return;
      if(b.dataset.fieldItem)useItem(b.dataset.fieldItem);
      else if(b.dataset.fieldSpell)fieldSpell(b.dataset.fieldSpell)
    });
    const menuBtn=document.getElementById('fantasyMenuBtn');
    if(menuBtn)menuBtn.addEventListener('click',reset);
    api.saveMenu.addEventListener('click',e=>{if(e.target===api.saveMenu)reset()});

    return true
  }

  window.OsoRpgFieldActions={init};
})();
