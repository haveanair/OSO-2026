from pathlib import Path

# 1) 운영 본체: 임의 화면 터치 시 대기 진동 재생/첫 터치 진동을 제거한다.
p=Path('play/index.html')
s=p.read_text(encoding='utf-8')
old="""let pendingBrowserBuzz=null,hapticsPrimed=false;
function buzz(v=32){
 const h=normalizeBuzz(v);
 if(nativeBuzz(h)){pendingBrowserBuzz=null;return true}
 const ok=browserBuzz(h);pendingBrowserBuzz=ok?null:h;return ok
}
// content:// / file://에서는 네이티브 브리지가 없으므로 실제 사용자 터치에서 대기 중인 진동을 다시 시도한다.
addEventListener('pointerdown',()=>{
 if(pendingBrowserBuzz){const h=pendingBrowserBuzz;pendingBrowserBuzz=null;browserBuzz(h);return}
 if(!hapticsPrimed){hapticsPrimed=true;browserBuzz(32)}
},{capture:true,passive:true});
"""
new="""function buzz(v=32){
 const h=normalizeBuzz(v);
 if(nativeBuzz(h))return true;
 return browserBuzz(h)
}
// 전역 화면 터치는 진동시키지 않는다. 진동은 실제 선택·성공·충돌·폭발 등 해당 동작의 buzz 호출에서만 발생한다.
"""
if old not in s:
    raise SystemExit('missing global touch haptic block')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# 2) 비단쌓기 하모/논개 판정보정: 게임 장면 밖 터치에는 절대 반응하지 않는다.
p=Path('play/character-performance-bonus.js')
s=p.read_text(encoding='utf-8')
old="""    document.addEventListener('pointerdown',e=>{
      try{
        if(e.target&&e.target.closest&&e.target.closest('.sseControl'))return;
        const scene=document.querySelector('#stage #sseScene'),a=stackAssistInfo();if(!scene||!a.on)return;
        const lane=scene.querySelector('#silkLane');if(!lane)return;
"""
new="""    document.addEventListener('pointerdown',e=>{
      try{
        const target=e.target instanceof Element?e.target:null;if(!target)return;
        const scene=target.closest('#stage #sseScene');if(!scene||target.closest('.sseControl'))return;
        const a=stackAssistInfo();if(!a.on)return;
        const lane=scene.querySelector('#silkLane');if(!lane)return;
"""
if old not in s:
    raise SystemExit('missing stack magnet pointer block')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

print('selection-only touch haptics patch applied')
