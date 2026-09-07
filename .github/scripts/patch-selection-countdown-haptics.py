from pathlib import Path

p=Path('play/index.html')
s=p.read_text(encoding='utf-8')

# 1) 화면 아무 곳 터치가 아니라 실제 선택 가능한 UI를 클릭했을 때만 짧은 선택 햅틱.
marker="""// 전역 화면 터치는 진동시키지 않는다. 진동은 실제 선택·성공·충돌·폭발 등 해당 동작의 buzz 호출에서만 발생한다.\n"""
if marker not in s:
    raise SystemExit('missing selection haptic marker')

insert="""// 전역 화면 터치는 진동시키지 않는다. 진동은 실제 선택·성공·충돌·폭발 등 해당 동작의 buzz 호출에서만 발생한다.\nfunction selectionHapticElement(target){\n const t=target instanceof Element?target:null;if(!t)return null;\n const el=t.closest('button,a[href],[role=\"button\"],select,summary,input[type=\"button\"],input[type=\"submit\"],input[type=\"radio\"],input[type=\"checkbox\"]');\n if(!el||el.disabled||el.getAttribute('aria-disabled')==='true')return null;\n // 누르고 유지/연타하는 플레이 조작은 선택 UI가 아니므로 전역 선택 햅틱에서 제외한다.\n if(el.closest('.fantasyDpad,.raceSteer')||['raceAccel','raceBrake','raceDrift','raceBoost','hitBtn'].includes(el.id)||el.classList.contains('pdTarget'))return null;\n return el\n}\naddEventListener('click',e=>{\n const el=selectionHapticElement(e.target);if(!el)return;\n try{buzz(12)}catch(_){}\n},{capture:true,passive:true});\n"""
if 'function selectionHapticElement(target)' not in s:
    s=s.replace(marker,insert,1)

# 2) 공통 3-2-1-GO 카운트다운의 각 표시 순간에 햅틱을 직접 연결한다.
old=""" function draw(){const v=seq[i];e.innerHTML=`<div class=\"readyDisc ${v==='GO!'?'go':''}\">${v}</div>`;if(v==='GO!')tone('perfect');else beep(580,.04,.025)}\n"""
new=""" function draw(){\n  const v=seq[i];e.innerHTML=`<div class=\"readyDisc ${v==='GO!'?'go':''}\">${v}</div>`;\n  if(v==='GO!'){tone('perfect');buzz([48,12,78])}\n  else{beep(580,.04,.025);buzz(v==='3'?26:v==='2'?32:40)}\n }\n"""
if old not in s:
    if "buzz([48,12,78])" not in s:
        raise SystemExit('missing readyThen draw marker')
else:
    s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('selection + 3-2-1-GO haptics restored')
