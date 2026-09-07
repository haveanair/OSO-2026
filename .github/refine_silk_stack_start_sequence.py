from pathlib import Path
import re, subprocess, hashlib

mod=Path('play/silk-stack-endless.js')
s=mod.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()

# 1) Countdown / locked mode-select UI styles.
anchor="  .sseUnlockProgress{font-size:10px!important;color:#7b5b42}\n"
extra="""  .sseUnlockProgress{font-size:10px!important;color:#7b5b42}
  .sseModeBtns button:disabled{background:#c8c8c8;color:#707070;border-color:#8a8a8a;box-shadow:0 5px #888;opacity:.76}
  .sseCountdownBox{position:absolute;inset:0;z-index:28;display:flex;align-items:center;justify-content:center;background:linear-gradient(#8edcff,#fff0c5 64%,#9e663c)}
  .sseCountdownCard{min-width:190px;padding:22px 26px 26px;border:4px solid #5d3a27;border-radius:24px;background:#fff8dff2;box-shadow:0 10px 0 #68452d55,0 18px 42px #0004;text-align:center;color:#4e2f1d}
  .sseCountdownCard small{display:block;margin-bottom:5px;font-size:11px;font-weight:1000;letter-spacing:.4px}
  .sseCountdownCard strong{display:block;font-size:64px;line-height:1;font-weight:1000;text-shadow:0 5px #0002;animation:sseCountPop .28s ease-out}
  .sseCountdownCard strong.go{font-size:46px;color:#ef632b}
  @keyframes sseCountPop{0%{transform:scale(.4);opacity:.25}70%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}
"""
if anchor not in s:
    raise SystemExit('countdown CSS anchor not found')
s=s.replace(anchor,extra,1)

# 2) Always show mode-selection first. Locked players see normal + disabled endless.
pat=r" function showModeSelect\(\)\{.*?\n function stageFor\(total\)\{"
repl=""" function showModeSelect(){
  ensureStyle();
  const s=document.querySelector('#stage');
  if(!s){if(originalPlayStack)originalPlayStack();return}
  const clears=readClears(),unlocked=isUnlocked();
  const msg=unlocked?`일반 15단을 ${UNLOCK_CLEARS}번 클리어해 엔들리스가 활성화되었습니다.`:`일반 15단을 ${UNLOCK_CLEARS}번 클리어하면 엔들리스가 활성화됩니다.`;
  s.innerHTML=`<div class="sseModeBox"><div class="sseModeCard"><h3>🧵 비단쌓기</h3><p>${msg}</p><div class="sseModeBtns"><button type="button" id="sseNormalBtn">15단 도전</button><button type="button" id="sseEndlessBtn" ${unlocked?'':'disabled'}>${unlocked?'∞ 엔들리스':`🔒 엔들리스 ${clears}/${UNLOCK_CLEARS}`}</button></div><p class="sseUnlockProgress">일반 클리어 ${clears}/${UNLOCK_CLEARS}</p></div></div>`;
  const n=s.querySelector('#sseNormalBtn'),e=s.querySelector('#sseEndlessBtn');
  if(n)n.onclick=()=>startCountdown('normal');
  if(e&&unlocked)e.onclick=()=>startCountdown('endless');
  cleanup=()=>{if(n)n.onclick=null;if(e)e.onclick=null}
 }
 function startCountdown(mode){
  const s=document.querySelector('#stage');if(!s)return;
  const label=mode==='endless'?'∞ 엔들리스':'15단 도전';
  s.innerHTML=`<div class="sseCountdownBox"><div class="sseCountdownCard"><small>${label}</small><strong id="sseCountdownNum">3</strong></div></div>`;
  const el=s.querySelector('#sseCountdownNum'),steps=['3','2','1','GO!'];let idx=0,cancelled=false,timer=0;
  function sound(v){try{tone(v==='GO!'?'clear':'good');buzz(v==='GO!'?[18,7,28]:9)}catch(_){}}
  sound('3');
  function advance(){
   if(cancelled)return;
   idx++;
   if(idx>=steps.length){
    timer=setTimeout(()=>{if(cancelled)return;if(mode==='endless')playEndless();else startNormal()},260);return
   }
   el.textContent=steps[idx];el.className=steps[idx]==='GO!'?'go':'';void el.offsetWidth;el.style.animation='none';void el.offsetWidth;el.style.animation='';sound(steps[idx]);
   timer=setTimeout(advance,steps[idx]==='GO!'?440:620)
  }
  timer=setTimeout(advance,620);
  cleanup=()=>{cancelled=true;clearTimeout(timer)}
 }
 function startNormal(){
  activeMode='normal';normalClearRecorded=false;
  if(originalPlayStack){
   originalPlayStack();
   const tip=document.querySelector('#stage .gameTip');
   if(tip&&!isUnlocked())tip.textContent=`비단 폭이 점점 좁아지고 속도가 빨라집니다 · 15단 완성 목표 · ENDLESS 해금 ${readClears()}/${UNLOCK_CLEARS}`
  }
 }
 function entry(){
  installFinishHook();ensureStyle();
  normalClearRecorded=false;
  showModeSelect()
 }

 function stageFor(total){"""
s,n=re.subn(pat,repl,s,flags=re.S)
if n!=1:
    raise SystemExit(f'mode/countdown block replace count {n}')

# 3) Endless final flag only once, anchored to the last successful silk piece.
old="let score=0,total=0,segment=0,alive=true,raf,last=0,current=null,x=0,dir=1,perfect=0,accuracyTotal=0,level=1,lastDropAt=-1e9,retrying=false,lives=3,transitioning=false,lastStageKey='',carryWidth=0,cameraOffset=0;"
new="let score=0,total=0,segment=0,alive=true,raf,last=0,current=null,x=0,dir=1,perfect=0,accuracyTotal=0,level=1,lastDropAt=-1e9,retrying=false,lives=3,transitioning=false,lastStageKey='',carryWidth=0,cameraOffset=0,finalFlagShown=false;"
if old not in s: raise SystemExit('endless state anchor not found')
s=s.replace(old,new,1)

pat=r"  function flag1884\(\)\{.*?\n  \}\n  function debris\(\)\{"
repl="""  function flag1884(){
   lane.querySelectorAll('.stackFlag').forEach(e=>e.remove());
   const placed=[...lane.querySelectorAll('.silkPiece,.silkBase')].filter(e=>!e.classList.contains('miss'));
   const anchor=placed[placed.length-1]||current;
   const l=parseFloat(anchor?.style.left)||0,w=parseFloat(anchor?.style.width)||120,b=parseFloat(anchor?.style.bottom);
   const flag=document.createElement('div');flag.className='stackFlag sseFlagBurst';flag.textContent='1884 진주중앙시장';flag.style.left=Math.max(8,Math.min(W()-178,l+w/2-78))+'px';flag.style.bottom=((Number.isFinite(b)?b:135)+58)+'px';lane.appendChild(flag);return flag
  }
  function showFinalFlag(){if(finalFlagShown)return;finalFlagShown=true;flag1884()}
  function debris(){"""
s,n=re.subn(pat,repl,s,flags=re.S)
if n!=1: raise SystemExit(f'flag function replace count {n}')

s=s.replace("  function continuousMilestone(){\n   flag1884();\n", "  function continuousMilestone(){\n", 1)
s=s.replace("transitioning=true;carryWidth=Math.max(28,parseFloat(current?.style.width)||carryWidth||baseW);flag1884();debris();", "transitioning=true;carryWidth=Math.max(28,parseFloat(current?.style.width)||carryWidth||baseW);debris();", 1)

old_gameover="if(lives<=0){alive=false;cancelAnimationFrame(raf);try{showComboBurst('GAME OVER',3,'multi')}catch(_){};setTimeout(()=>finish('stack',score,entry,false),560);return}"
new_gameover="if(lives<=0){alive=false;cancelAnimationFrame(raf);showFinalFlag();try{showComboBurst('GAME OVER',3,'multi');tone('clear');buzz([20,8,34,8,52])}catch(_){};setTimeout(()=>finish('stack',score,entry,false),980);return}"
if old_gameover not in s: raise SystemExit('game over anchor not found')
s=s.replace(old_gameover,new_gameover,1)

# 4) Cache-bust the connected module in the main web build.
idx=Path('play/index.html')
h=idx.read_text(encoding='utf-8')
h_before=hashlib.sha256(h.encode()).hexdigest()
pat_idx=r'<script src="\./silk-stack-endless\.js\?v=[^"]+"></script>'
h,n=re.subn(pat_idx,'<script src="./silk-stack-endless.js?v=20260907-endless3"></script>',h,count=1)
if n!=1: raise SystemExit(f'index cache-bust count {n}')
idx.write_text(h,encoding='utf-8')

# 5) Protect SOTRIS and verify JS syntax.
sot=Path('play/sp1/sotris/index.html')
sot_hash=hashlib.sha256(sot.read_bytes()).hexdigest()
mod.write_text(s,encoding='utf-8')
subprocess.run(['node','--check',str(mod)],check=True)
if hashlib.sha256(sot.read_bytes()).hexdigest()!=sot_hash: raise SystemExit('SOTRIS changed unexpectedly')

after=hashlib.sha256(s.encode()).hexdigest()
h_after=hashlib.sha256(h.encode()).hexdigest()
Path('.github/silk-stack-start-sequence-report.txt').write_text('\n'.join([
 'SILK STACK START SEQUENCE VERIFIED',
 'MODE_SELECT_ALWAYS_FIRST=YES',
 'LOCKED_ENDLESS_BUTTON=YES',
 'COUNTDOWN_SEQUENCE=3,2,1,GO',
 'COUNTDOWN_BEFORE_NORMAL=YES',
 'COUNTDOWN_BEFORE_ENDLESS=YES',
 'ENDLESS_FLAG_AT_MILESTONES=NO',
 'ENDLESS_FLAG_AT_BREAKTHROUGH=NO',
 'ENDLESS_FLAG_AT_GAME_END_ONCE=YES',
 'SKY_CONTINUITY_PRESERVED=YES',
 'SOTRIS_CHANGED=NO',
 'MODULE_JS_NODE_CHECK=PASS',
 f'SOTRIS_SHA256={sot_hash}',
 f'MODULE_SHA256_BEFORE={before}',
 f'MODULE_SHA256_AFTER={after}',
 f'PLAY_SHA256_BEFORE={h_before}',
 f'PLAY_SHA256_AFTER={h_after}',
])+'\n',encoding='utf-8')
