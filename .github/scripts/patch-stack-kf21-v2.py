from pathlib import Path
import re


def between_replace(text, start, end, replacement, label):
    a = text.find(start)
    if a < 0:
        raise SystemExit(f'missing start: {label}')
    b = text.find(end, a)
    if b < 0:
        raise SystemExit(f'missing end: {label}')
    return text[:a] + replacement + text[b:]


def block_end(text, block_start):
    open_pos = text.find('{', block_start)
    if open_pos < 0:
        raise SystemExit('missing opening brace')
    depth = 0
    quote = None
    esc = False
    for i in range(open_pos, len(text)):
        ch = text[i]
        if quote:
            if esc:
                esc = False
            elif ch == '\\':
                esc = True
            elif ch == quote:
                quote = None
            continue
        if ch in ('"', "'"):
            quote = ch
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return i + 1
    raise SystemExit('unclosed block')


# === 1. 비단쌓기 판정 출력 통일 ===
p = Path('play/character-performance-bonus.js')
s = p.read_text(encoding='utf-8')

css_marker = "      #stage .sseGreatBurst2{"
if css_marker not in s:
    raise SystemExit('missing stack great css marker')
judge_css = r'''      #stage .sseJudgeBurst2{position:absolute!important;left:50%!important;top:37%!important;z-index:74!important;transform:translateX(-50%) scale(.72)!important;width:auto!important;min-width:min(220px,calc(100% - 28px))!important;max-width:calc(100% - 28px)!important;box-sizing:border-box!important;padding:10px 15px 9px!important;border:4px solid #526477!important;border-radius:18px!important;background:#eff7fff4!important;color:#26384b!important;text-align:center!important;box-shadow:0 7px 0 #60778c,0 13px 24px #0005!important;pointer-events:none!important;opacity:0!important;animation:sseJudgeBurst2 1.02s cubic-bezier(.18,.78,.22,1) forwards!important}
      #stage .sseJudgeBurst2.perfect{border-color:#7a4a22!important;background:#fff5c9f4!important;color:#5b341e!important;box-shadow:0 7px 0 #a66d35,0 13px 24px #0005!important}
      #stage .sseJudgeBurst2.perfect.heart{border-color:#a83f54!important;background:#fff0f3f5!important;color:#7a2c41!important;box-shadow:0 7px 0 #b65a6d,0 13px 24px #0005!important}
      #stage .sseJudgeBurst2.great{border-color:#35704a!important;background:#efffcdf4!important;color:#27513a!important;box-shadow:0 7px 0 #4f855d,0 13px 24px #0004!important}
      #stage .sseJudgeBurst2.good{border-color:#397098!important;background:#e8f7fff4!important;color:#244e70!important;box-shadow:0 7px 0 #5889aa,0 13px 24px #0004!important}
      #stage .sseJudgeBurst2.close{border-color:#a56c25!important;background:#fff0c9f4!important;color:#72481c!important;box-shadow:0 7px 0 #bd843d,0 13px 24px #0004!important}
      #stage .sseJudgeBurst2.miss{border-color:#9e3e45!important;background:#ffe8eaf5!important;color:#742d34!important;box-shadow:0 7px 0 #b95d63,0 13px 24px #0005!important}
      #stage .sseJudgeBurst2 .sseJudgeMain{display:block!important;margin:0!important;padding:0!important;font-size:clamp(22px,6.2vw,30px)!important;font-weight:1000!important;line-height:1.02!important;white-space:normal!important;word-break:keep-all!important}
      #stage .sseJudgeBurst2 .sseJudgeSub{display:block!important;margin:5px 0 0!important;font-size:clamp(11px,3.2vw,14px)!important;font-weight:1000!important;line-height:1.15!important;white-space:normal!important;word-break:keep-all!important}
      @keyframes sseJudgeBurst2{0%{opacity:0;transform:translateX(-50%) scale(.68)}18%{opacity:1;transform:translateX(-50%) scale(1.08)}48%,78%{opacity:1;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-18px) scale(.94)}}

'''
s = s.replace(css_marker, judge_css + css_marker, 1)

renderer = r'''  function showStackJudgementBurst(message){
    try{
      const scene=document.querySelector('#stage #sseScene');if(!scene)return false;
      const msg=String(message||'').trim();let kind='',main='',sub='';
      if(/^PERFECT/.test(msg)){kind='perfect';const parts=msg.split(' · ').map(v=>v.trim()).filter(Boolean);main=parts.shift()||'PERFECT!';sub=parts.join(' · ')||'정확하게 맞췄습니다!'}
      else if(/^GREAT!/.test(msg)){kind='great';main='GREAT!';sub=msg.replace(/^GREAT!\s*/,'').trim()||'좋은 위치입니다!'}
      else if(/^GOOD!/.test(msg)){kind='good';main='GOOD!';sub=msg.replace(/^GOOD!\s*/,'').trim()||'좋습니다!'}
      else if(/^아슬아슬!/.test(msg)){kind='close';main='아슬아슬!';sub=msg.replace(/^아슬아슬!\s*/,'').trim()||'조금만 더 중앙으로!'}
      else if(/^MISS!/.test(msg)){kind='miss';main='MISS!';sub=msg.replace(/^MISS!\s*/,'').trim()||'다시 도전!'}
      else return false;
      scene.querySelectorAll('.sseJudgeBurst2,.sseGreatBurst2,.ssePerfectBurst2,.comboBurstFX').forEach(e=>e.remove());
      const box=document.createElement('div');box.className='sseJudgeBurst2 '+kind+(msg.includes('❤️ +1')?' heart':'');
      const a=document.createElement('span');a.className='sseJudgeMain';a.textContent=main;
      const b=document.createElement('span');b.className='sseJudgeSub';b.textContent=sub;
      box.append(a,b);scene.appendChild(box);void box.offsetWidth;setTimeout(()=>box.remove(),1120);return true
    }catch(_){return false}
  }
  function showStackGreatBurst(message){return showStackJudgementBurst(message)}
  function showStackPerfectBurst(message){return showStackJudgementBurst(message)}
'''
s = between_replace(
    s,
    "  function showStackGreatBurst(message){",
    "  function rewriteGrowMessage(msg,extra){",
    renderer,
    'stack judgement renderer',
)

wrapper = r'''  function wrapStackJudgementEffects(){
    try{
      if(typeof window.showComboBurst!=='function'||window.showComboBurst.__stackBalanceWrapped)return false;
      const original=window.showComboBurst;
      const wrapped=function(message){
        let msg=String(message==null?'':message);const stack=!!document.querySelector('#stage #sseScene');
        if(stack&&/^GREAT!/.test(msg)){const gain=expandLatestStackPiece(.04,5,8);msg=rewriteGrowMessage(msg,gain)}
        if(stack&&/^PERFECT/.test(msg)){const gain=expandLatestStackPiece(.06,9,14);msg=rewriteGrowMessage(msg,gain)}
        if(stack&&/^(?:PERFECT|GREAT!|GOOD!|아슬아슬!|MISS!)/.test(msg)){ensureStyle();if(showStackJudgementBurst(msg))return}
        arguments[0]=msg;return original.apply(this,arguments)
      };
      wrapped.__stackBalanceWrapped=true;wrapped.__stackBalanceOriginal=original;window.showComboBurst=wrapped;return true
    }catch(_){return false}
  }
'''
s = between_replace(
    s,
    "  function wrapStackJudgementEffects(){",
    "  function clearRoofVibration(){",
    wrapper,
    'stack judgement wrapper',
)
p.write_text(s, encoding='utf-8')


# === 2. KF-21 폭격 폭발 프레임과 진동 동기화 ===
p = Path('play/index.html')
h = p.read_text(encoding='utf-8')

old = "bombBuzz();setTimeout(()=>buzz([40,20,70,20,110]),330);setTimeout(()=>buzz([30,15,50]),720);"
new = "if(isKf21){buzz([18,10,28])}else{bombBuzz();setTimeout(()=>buzz([40,20,70,20,110]),330);setTimeout(()=>buzz([30,15,50]),720)}"
if old not in h:
    raise SystemExit('missing super vibration marker')
h = h.replace(old, new, 1)

m = re.search(r"}\s*else\s+if\s*\(\s*superFx\.kind\s*===\s*['\"]kf21['\"]\s*\)\s*\{", h)
if not m:
    raise SystemExit('missing KF21 super marker')
kf_pos = m.start()
m2 = re.search(r"if\s*\(\s*elapsed\s*>\s*610\s*\)\s*\{", h[kf_pos:])
if not m2:
    raise SystemExit('missing KF21 explosion start')
bomb_pos = kf_pos + m2.start()
bomb_end = block_end(h, bomb_pos)
new_bomb_block = r'''if(elapsed>610){
     const bp=Math.min(1,(elapsed-610)/900);let kfDetonations=0;
     superFx.kfVibeMask=superFx.kfVibeMask||0;
     for(let i=0;i<10;i++){
      const ex=((i*37)%10+.5)*W/10,ey=((i*71)%7+1)*H/9,pulse=Math.max(0,Math.sin(bp*Math.PI*3.4+i*.82));
      if(pulse>.16){
       const bit=1<<i;if(!(superFx.kfVibeMask&bit)){superFx.kfVibeMask|=bit;kfDetonations++}
       ctx.save();ctx.globalAlpha=.25+.62*pulse;ctx.fillStyle='#fff7bd';ctx.shadowBlur=30;ctx.shadowColor='#ff6a1d';ctx.beginPath();ctx.arc(ex,ey,12+50*pulse,0,6.28);ctx.fill();ctx.fillStyle='#ff6420';ctx.globalAlpha=.38*pulse;ctx.beginPath();ctx.arc(ex,ey,26+76*pulse,0,6.28);ctx.fill();ctx.restore()
      }
     }
     if(kfDetonations>0){
      screenShake=Math.max(screenShake,Math.min(11,4+kfDetonations*1.8));
      const vib=kfDetonations>=3?78:kfDetonations===2?60:44;
      try{if(navigator&&typeof navigator.vibrate==='function'){navigator.vibrate(0);navigator.vibrate(vib)}else buzz(vib)}catch(_){try{buzz(vib)}catch(__){}}
     }
    }'''
h = h[:bomb_pos] + new_bomb_block + h[bomb_end:]

h, n = re.subn(
    r"character-performance-bonus\.js\?v=[^\"']+",
    'character-performance-bonus.js?v=20260907-charbonus6',
    h,
    count=1,
)
if n != 1:
    raise SystemExit('character performance cache marker not found')
p.write_text(h, encoding='utf-8')

print('stack judgement + KF21 haptic patch applied')
