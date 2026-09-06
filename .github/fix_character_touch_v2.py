from pathlib import Path

mod=Path('play/character-performance-bonus.js')
idx=Path('play/index.html')

s=mod.read_text(encoding='utf-8')
old="""  function observeShop(){\n    decorateShop();\n    const shop=document&&document.getElementById('osoShop');\n    if(shop&&typeof MutationObserver!=='undefined')new MutationObserver(()=>decorateShop()).observe(shop,{childList:true,subtree:true})\n  }\n\n  function boot(){\n    ensureStyle();wrapFinish();wrapFantasyBattleReward();observeShop();\n    if(window&&window.addEventListener)window.addEventListener('message',handleSp1Result)\n  }\n"""
new="""  function scheduleShopDecoration(){\n    setTimeout(()=>{try{decorateShop()}catch(_){}},0)\n  }\n  function bindShopDecoration(){\n    if(!document||document.documentElement.dataset.characterBonusShopBound==='1')return;\n    document.documentElement.dataset.characterBonusShopBound='1';\n    document.addEventListener('click',e=>{\n      const t=e&&e.target;\n      if(!t||!t.closest)return;\n      if(t.closest('#titleCollection,[data-page=\"bookPage\"],[data-buy]'))scheduleShopDecoration()\n    },true)\n  }\n\n  function boot(){\n    ensureStyle();wrapFinish();wrapFantasyBattleReward();bindShopDecoration();\n    if(window&&window.addEventListener)window.addEventListener('message',handleSp1Result)\n  }\n"""
if old not in s:
    raise SystemExit('expected observer block not found')
s=s.replace(old,new,1)
if 'MutationObserver' in s:
    raise SystemExit('MutationObserver still present in character bonus module')
mod.write_text(s,encoding='utf-8')

h=idx.read_text(encoding='utf-8')
oldtag='<script src="./character-performance-bonus.js?v=20260906-charbonus1"></script>'
newtag='<script src="./character-performance-bonus.js?v=20260906-charbonus2"></script>'
if oldtag not in h:
    raise SystemExit('old character bonus cache tag not found')
h=h.replace(oldtag,newtag,1)
if h.count(newtag)!=1:
    raise SystemExit('new cache tag count is not 1')
idx.write_text(h,encoding='utf-8')
print('character touch v2 patch applied')
