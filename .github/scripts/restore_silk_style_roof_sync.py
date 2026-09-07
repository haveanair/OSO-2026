from pathlib import Path
import re

bonus_path = Path('play/character-performance-bonus.js')
silk_path = Path('play/silk-stack-endless.js')
index_path = Path('play/index.html')

bonus = bonus_path.read_text(encoding='utf-8')
silk = silk_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

# Remove the later unified judgement-card style.
bonus, n = re.subn(
    r'\n      #stage \.sseJudgeBurst2\{.*?@keyframes sseJudgeBurst2\{[^\n]*\}\n',
    '\n', bonus, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f'unified judgement CSS block not found: {n}')

# Keep the previous GREAT look, but allow its original animation to control
# opacity/transform (the !important declarations suppress the keyframes).
bonus = bonus.replace(
    'transform:translateX(-50%) scale(.74)!important;width:auto!important;',
    'transform:translateX(-50%) scale(.74);width:auto!important;', 1)
bonus = bonus.replace(
    'pointer-events:none!important;opacity:0!important;animation:sseGreatBurst2 .98s',
    'pointer-events:none!important;will-change:transform,opacity;opacity:0;animation:sseGreatBurst2 .98s', 1)

func_region = re.compile(
    r'  function showStackJudgementBurst\(message\)\{.*?\n  function rewriteGrowMessage\(msg,extra\)\{',
    re.S)
func_replacement = r'''  function showStackGreatBurst(message){
    try{
      const scene=document.querySelector('#stage #sseScene');if(!scene)return false;
      const msg=String(message||'').trim();if(!/^GREAT!/.test(msg))return false;
      scene.querySelectorAll('.sseGreatBurst2,.sseJudgeBurst2').forEach(e=>e.remove());
      const rest=msg.replace(/^GREAT!\s*/,'').trim();
      const box=document.createElement('div');box.className='sseGreatBurst2';
      const a=document.createElement('span');a.className='sseGreatMain';a.textContent='GREAT!';
      const b=document.createElement('span');b.className='sseGreatSub';b.textContent=rest||'좋은 위치입니다!';
      box.append(a,b);scene.appendChild(box);void box.offsetWidth;setTimeout(()=>box.remove(),1040);return true
    }catch(_){return false}
  }
  function showStackPerfectBurst(message){
    try{
      const scene=document.querySelector('#stage #sseScene');if(!scene)return false;
      const msg=String(message||'').trim();if(!/^PERFECT/.test(msg))return false;
      scene.querySelectorAll('.ssePerfectBurst2,.sseJudgeBurst2').forEach(e=>e.remove());
      const parts=msg.split(' · ').map(s=>s.trim()).filter(Boolean),main=parts.shift()||'PERFECT!',sub=parts.join(' · '),box=document.createElement('div');
      box.className='ssePerfectBurst2'+(main.includes('❤️')?' heart':'');
      const a=document.createElement('span');a.className='ssePerfectMain';a.textContent=main;
      const b=document.createElement('span');b.className='ssePerfectSub';b.textContent=sub||'정확하게 맞췄습니다!';
      box.append(a,b);scene.appendChild(box);void box.offsetWidth;setTimeout(()=>box.remove(),1120);return true
    }catch(_){return false}
  }
  function rewriteGrowMessage(msg,extra){'''
bonus, n = func_region.subn(func_replacement, bonus, count=1)
if n != 1:
    raise SystemExit(f'judgement function region not found: {n}')

current_wrapper = '''        if(stack&&/^GREAT!/.test(msg)){const gain=expandLatestStackPiece(.04,5,8);msg=rewriteGrowMessage(msg,gain)}
        if(stack&&/^PERFECT/.test(msg)){const gain=expandLatestStackPiece(.06,9,14);msg=rewriteGrowMessage(msg,gain)}
        if(stack&&/^(?:PERFECT|GREAT!|GOOD!|아슬아슬!|MISS!)/.test(msg)){ensureStyle();if(showStackJudgementBurst(msg))return}
        arguments[0]=msg;return original.apply(this,arguments)'''
restored_wrapper = '''        if(stack&&/^GREAT!/.test(msg)){const gain=expandLatestStackPiece(.04,5,8);msg=rewriteGrowMessage(msg,gain);ensureStyle();if(showStackGreatBurst(msg))return;arguments[0]=msg}
        if(stack&&/^PERFECT/.test(msg)){const gain=expandLatestStackPiece(.06,9,14);msg=rewriteGrowMessage(msg,gain);ensureStyle();if(showStackPerfectBurst(msg))return;arguments[0]=msg}
        return original.apply(this,arguments)'''
if current_wrapper not in bonus:
    raise SystemExit('current unified judgement wrapper not found')
bonus = bonus.replace(current_wrapper, restored_wrapper, 1)

# Stop the late bonus observer from starting a second unsynchronised roof-vibe
# sequence. The core roof impact timeline owns those haptics now.
bonus = bonus.replace('      let blast=false,sceneAdded=false;', '      let sceneAdded=false;', 1)
bonus = re.sub(
    r"\n        if\(\(n\.matches&&n\.matches\('\.sseBreakFlash'\)\)\|\|\(n\.querySelector&&n\.querySelector\('\.sseBreakFlash'\)\)\)blast=true;",
    '', bonus, count=1)
bonus = bonus.replace(
    '      if(blast)strongRoofVibration();if(sceneAdded)setTimeout(refreshStackAssistBadge,0)',
    '      if(sceneAdded)setTimeout(refreshStackAssistBadge,0)', 1)

# Synchronise every roof vibration with an actual impact sound. The Web
# Vibration API does not provide motor amplitude; stronger feel is created by
# progressively longer multi-pulse patterns at the same impact timestamps.
impact_region = re.compile(
    r'  function hardRoofVibrate\(\)\{.*?\n  function structureBlast\(\)\{',
    re.S)
synced_impact = r'''  function roofImpactVibrate(pattern){
   try{if(navigator&&typeof navigator.vibrate==='function'){navigator.vibrate(0);navigator.vibrate(pattern);return}}catch(_){}
   try{buzz(pattern)}catch(_){}
  }
  function impactSounds(){
   try{
    tone('bad');roofImpactVibrate([68,18,34]);
    setTimeout(()=>{beep(92,.11,.055,'square',58);roofImpactVibrate([82,18,82])},130);
    setTimeout(()=>{beep(72,.16,.065,'sawtooth',48);roofImpactVibrate([105,22,105])},390);
    setTimeout(()=>{beep(55,.28,.075,'square',38);roofImpactVibrate([170,28,185,28,235])},720)
   }catch(_){}
  }
  function structureBlast(){'''
silk, n = impact_region.subn(synced_impact, silk, count=1)
if n != 1:
    raise SystemExit(f'roof impact region not found: {n}')

index, n1 = re.subn(
    r'(\./silk-stack-endless\.js\?v=)[^"\']+',
    r'\g<1>20260908-roofsync1', index, count=1)
index, n2 = re.subn(
    r'(\./character-performance-bonus\.js\?v=)[^"\']+',
    r'\g<1>20260908-judgestyle-restore1', index, count=1)
if n1 != 1 or n2 != 1:
    raise SystemExit(f'cache-buster targets not found: silk={n1}, bonus={n2}')

bonus_path.write_text(bonus, encoding='utf-8')
silk_path.write_text(silk, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')
