from pathlib import Path

P = Path('play/index.html')
s = P.read_text(encoding='utf-8')


def replace_once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise SystemExit(f'{label}: target count={n}, expected=1')
    return text.replace(old, new, 1)

# 1) 실패 결과는 모든 공통 게임에서 GAME OVER를 명시한다.
s = replace_once(
    s,
    "<div class=\"resultBadge\">${clear?'🎉 클리어!':rec?'🏆 신기록!':'도전 완료'}</div>",
    "<div class=\"resultBadge\">${clear?'🎉 클리어!':rec?'💥 GAME OVER · 🏆 신기록!':'💥 GAME OVER'}</div>",
    'common GAME OVER badge'
)

# 2) 수산시장: 하모/아요 오선택은 점수 감점이 아니라 하트 1 소모, 0이면 GAME OVER.
a = s.index('function playFish(){')
b = s.index('/* stack */', a)
fish = s[a:b]

fish = replace_once(
    fish,
    '<div class="counter" id="tm">35</div><div class="comboHud" id="combo">COMBO ×0</div><div class="levelHud" id="levelHud">LEVEL 1</div>',
    '<div class="counter" id="tm">35</div><div class="comboHud" id="combo">COMBO ×0</div><div class="lifeHud" id="life">❤️❤️❤️</div><div class="levelHud" id="levelHud">LEVEL 1</div>',
    'fish life HUD'
)
fish = replace_once(
    fish,
    'let score=0,t=35,combo=0,level=1,sp=null,ended=false,wave=0,bonusCoins=0;',
    'let score=0,t=35,combo=0,level=1,sp=null,ended=false,wave=0,bonusCoins=0,lives=3;',
    'fish lives var'
)
fish = replace_once(
    fish,
    "function hud(){$('#combo').textContent=`COMBO ×${combo}`;const c=$('#playCoinHud');if(c)c.textContent=`🪙 +${bonusCoins}`}",
    "function hud(){$('#combo').textContent=`COMBO ×${combo}`;const l=$('#life');if(l)l.textContent='❤️'.repeat(lives)+'🖤'.repeat(3-lives);const c=$('#playCoinHud');if(c)c.textContent=`🪙 +${bonusCoins}`}",
    'fish HUD renderer'
)
fish = replace_once(
    fish,
    "const DWELL=fishAbility?fishAbility.fishDwellMs(fishAbilitySkin,1250):1250;",
    """const DWELL=fishAbility?fishAbility.fishDwellMs(fishAbilitySkin,1250):1250;
 function endFish(clear){
  if(ended)return;ended=true;if(sp)clearInterval(sp);clearInterval(ti);
  expireTimers.forEach(id=>clearTimeout(id));expireTimers.clear();holes.forEach(h=>clearHole(h,false));
  const fg=s.querySelector('.fishGrid');if(fg)fg.remove();stopWater();finish('fish',score,playFish,!!clear,bonusCoins)
 }""",
    'fish end helper'
)
fish = replace_once(
    fish,
    "combo=0;score=Math.max(0,score-8);tone('bad');bombBuzz();softShake();fxText(x,y,'앗! -8','#d94343')",
    "combo=0;lives--;tone('bad');bombBuzz();softShake();fxText(x,y,'❤️ -1','#d94343');hud();if(lives<=0){clearHole(h,false);$('#gScore').textContent=score;endFish(false);return}",
    'fish friend penalty'
)
old_fish_timer = "let ti=setInterval(()=>{t--;$('#tm').textContent=t;if(t<=0){ended=true;clearInterval(sp);clearInterval(ti);expireTimers.forEach(id=>clearTimeout(id));expireTimers.clear();holes.forEach(h=>clearHole(h,false));const fg=s.querySelector('.fishGrid');if(fg)fg.remove();stopWater();finish('fish',score,playFish,true,bonusCoins)}},1000);"
fish = replace_once(
    fish,
    old_fish_timer,
    "let ti=setInterval(()=>{t--;$('#tm').textContent=t;if(t<=0)endFish(true)},1000);",
    'fish timer finish'
)
s = s[:a] + fish + s[b:]

# 3) 떡떡떡: 수동/자동 MISS 모두 하트 1 소모, 0이면 GAME OVER.
a = s.index('function playTteok(){')
b = s.index('/* POWERDUCK', a)
tteok = s[a:b]

tteok = replace_once(
    tteok,
    '<div class="comboHud" id="combo">COMBO ×0</div><div class="levelHud" id="levelHud">LEVEL 1</div><div class="feverWrap">',
    '<div class="comboHud" id="combo">COMBO ×0</div><div class="lifeHud" id="life">❤️❤️❤️</div><div class="levelHud" id="levelHud">LEVEL 1</div><div class="feverWrap">',
    'tteok life HUD'
)
tteok = replace_once(
    tteok,
    'let phase=0,combo=0,fever=0,feverTime=0,level=1;',
    'let phase=0,combo=0,fever=0,feverTime=0,level=1,lives=3;',
    'tteok lives var'
)
tteok = replace_once(
    tteok,
    "$('#combo').textContent=`COMBO ×${combo}`;\n  $('#feverFill').style.width=fever+'%';",
    "$('#combo').textContent=`COMBO ×${combo}`;\n  const l=$('#life');if(l)l.textContent='❤️'.repeat(lives)+'🖤'.repeat(3-lives);\n  $('#feverFill').style.width=fever+'%';",
    'tteok HUD renderer'
)
tteok = replace_once(
    tteok,
    """ function nextBeat(){
  phase=0;""",
    """ function loseTteokHeart(){
  if(!alive)return true;lives=Math.max(0,lives-1);hud();buzz([35,14,55]);
  if(lives<=0){alive=false;clearInterval(ti);cancelAnimationFrame(raf);finish('tteok',score,playTteok,false);return true}
  return false
 }

 function nextBeat(){
  phase=0;""",
    'tteok lose-heart helper'
)
tteok = replace_once(
    tteok,
    """  }else{
   combo=0;tone('bad');softShake();
  }

  let mult=feverTime>0?2:1;""",
    """  }else{
   combo=0;tone('bad');softShake();if(loseTteokHeart())return;
  }

  let mult=feverTime>0?2:1;""",
    'tteok manual MISS heart'
)
tteok = replace_once(
    tteok,
    """   tone('bad');
   nextBeat();
  }

  const scale=2.75-1.75*phase;""",
    """   tone('bad');softShake();if(loseTteokHeart())return;
   nextBeat();
  }

  const scale=2.75-1.75*phase;""",
    'tteok auto MISS heart'
)
s = s[:a] + tteok + s[b:]

# 4) 결과 접기 외부 스크립트 새 버전 강제 로드.
s = replace_once(
    s,
    './result-auto-collapse.js?v=20260908-resultcollapse1',
    './result-auto-collapse.js?v=20260908-resultcollapse2',
    'result collapse cache'
)

P.write_text(s, encoding='utf-8')
print('patched GAME OVER / fish hearts / tteok hearts / result collapse cache')
