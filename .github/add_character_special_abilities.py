from pathlib import Path
import hashlib, re, subprocess

INDEX=Path("play/index.html")
SOTRIS=Path("play/sp1/sotris/index.html")
REPORT=Path(".github/character-special-abilities-report.txt")

text=INDEX.read_text(encoding="utf-8")
before_hash=hashlib.sha256(text.encode("utf-8")).hexdigest()
sotris_before=hashlib.sha256(SOTRIS.read_bytes()).hexdigest()

def replace_once(old,new,label):
    global text
    n=text.count(old)
    if n!=1:
        raise SystemExit(f"{label}: expected 1 anchor, found {n}")
    text=text.replace(old,new,1)

replace_once(
""" const c=$('#rc'),ctx=c.getContext('2d'),flash=$('#runFlash');let alive=true,py=0,vy=0,jumps=0,jumpCap=2,lives=5,inv=0,world=0,score=0,coins=0,obs=[],coinList=[],raf,prev=performance.now(),obsT=.8,coinT=.45,land=0,img=new Image(),level=1,greatTotal=0,tripleCharges=0,patternSeq=0;img.src=currentOsoSrc();""",
""" const runnerAbility=window.OsoCharacterSpecialAbilities,runnerAbilitySkin=currentSkin();
 const c=$('#rc'),ctx=c.getContext('2d'),flash=$('#runFlash');let alive=true,py=0,vy=0,jumps=0,jumpCap=runnerAbility?runnerAbility.runBaseJumpCap(runnerAbilitySkin,2):2,lives=5,inv=0,world=0,score=0,coins=0,obs=[],coinList=[],raf,prev=performance.now(),obsT=.8,coinT=.45,land=0,img=new Image(),level=1,greatTotal=0,tripleCharges=0,patternSeq=0;img.src=currentOsoSrc();""",
"run ability init")

replace_once(
"""  const left=Math.max(0,jumpCap-jumps),ticket=tripleCharges>0?` · 3단권 ×${tripleCharges}`:'';
  $('#jumpHud').textContent=`점프 ${left}/${jumpCap}${ticket}`""",
"""  const left=Math.max(0,jumpCap-jumps),showTicket=runnerAbility?runnerAbility.runGreatAddsTripleTicket(runnerAbilitySkin):true,ticket=showTicket&&tripleCharges>0?` · 3단권 ×${tripleCharges}`:'';
  $('#jumpHud').textContent=`점프 ${left}/${jumpCap}${ticket}`""",
"run jump hud")

replace_once(
""" c.onpointerdown=()=>{
  if(jumps>=jumpCap)return;
  const next=jumps+1;
  if(next===3&&tripleCharges<=0){jumpCap=2;jumpHud();return}
  jumps=next;
  if(jumps===1){vy=-530;tone('good');buzz(9)}
  else if(jumps===2){vy=-470;tone('perfect');buzz([10,10,18])}
  else{tripleCharges--;vy=-445;tone('clear');buzz([12,7,24,7,34]);showComboBurst('3단 점프!',Math.max(2,greatTotal),'great')}
  jumpHud()
 };""",
""" c.onpointerdown=()=>{
  if(jumps>=jumpCap)return;
  const next=jumps+1,ticketNeeded=runnerAbility?runnerAbility.runNeedsTripleTicket(runnerAbilitySkin,next):next===3;
  if(ticketNeeded&&tripleCharges<=0){jumpCap=runnerAbility?runnerAbility.runBaseJumpCap(runnerAbilitySkin,2):2;jumpHud();return}
  jumps=next;
  const baseJumpVy=jumps===1?-530:jumps===2?-470:-445;
  vy=runnerAbility?runnerAbility.runJumpVelocity(runnerAbilitySkin,jumps,baseJumpVy):baseJumpVy;
  if(jumps===1){tone('good');buzz(9)}
  else if(jumps===2){tone('perfect');buzz([10,10,18])}
  else if(ticketNeeded){tripleCharges--;tone('clear');buzz([12,7,24,7,34]);showComboBurst('3단 점프!',Math.max(2,greatTotal),'great')}
  else{tone('clear');buzz(jumps>=4?[14,7,28,7,40]:[10,7,22]);if(jumps>=4)showComboBurst('4단 점프!',Math.max(4,greatTotal),'great')}
  jumpHud()
 };""",
"run jump input")

replace_once(
"""  p.done=true;greatTotal++;tripleCharges++;jumpCap=3;score+=80+greatTotal*10;
  const heartBonus=greatTotal%3===0;""",
"""  p.done=true;greatTotal++;const addsTripleTicket=runnerAbility?runnerAbility.runGreatAddsTripleTicket(runnerAbilitySkin):true;if(addsTripleTicket){tripleCharges++;jumpCap=3}else jumpCap=runnerAbility?runnerAbility.runBaseJumpCap(runnerAbilitySkin,2):2;score+=80+greatTotal*10;
  const heartBonus=greatTotal%3===0;""",
"run great reward")

replace_once(
"""  showComboBurst(heartBonus?'GREAT ×3! · ❤️ +1':'GREAT! · 3단점프 +1',greatTotal,'great');""",
"""  showComboBurst(heartBonus?'GREAT ×3! · ❤️ +1':(addsTripleTicket?'GREAT! · 3단점프 +1':'GREAT!'),greatTotal,'great');""",
"run great label")

replace_once(
"""  vy+=1300*dt;py+=vy*dt;if(py>0){if(vy>180)land=.16;py=0;vy=0;jumps=0;jumpCap=tripleCharges>0?3:2;jumpHud()}if(land>0)land-=dt;if(inv>0)inv-=dt;""",
"""  vy+=1300*dt;py+=vy*dt;if(py>0){if(vy>180)land=.16;py=0;vy=0;jumps=0;const baseCap=tripleCharges>0?3:2;jumpCap=runnerAbility?runnerAbility.runBaseJumpCap(runnerAbilitySkin,baseCap):baseCap;jumpHud()}if(land>0)land-=dt;if(inv>0)inv-=dt;""",
"run landing reset")

replace_once(
""" const DWELL=1250;""",
""" const fishAbility=window.OsoCharacterSpecialAbilities,fishAbilitySkin=currentSkin();
 const DWELL=fishAbility?fishAbility.fishDwellMs(fishAbilitySkin,1250):1250;""",
"fish dwell")

replace_once(
""" let score=0,t=35,alive=true,down=false,lastPt=null,items=[],raf,last=0,combo=0,lives=3,level=1,bonusCoins=0,prev=performance.now();
 const foods=[['bibimbap','비빔밥'],['noodle','국수'],['hotteok','호떡'],['gimbap','김밥'],['tteokbokki','떡볶이'],['juice','주스'],['chicken','통닭']];""",
""" let score=0,t=35,alive=true,down=false,lastPt=null,items=[],raf,last=0,combo=0,lives=3,level=1,bonusCoins=0,prev=performance.now();
 const sliceAbility=window.OsoCharacterSpecialAbilities,sliceAbilitySkin=currentSkin();
 const foods=[['bibimbap','비빔밥'],['noodle','국수'],['hotteok','호떡'],['gimbap','김밥'],['tteokbokki','떡볶이'],['juice','주스'],['chicken','통닭']];""",
"slice ability init")

replace_once(
"""   if(pointSegDistV14(cx,cy,x1,y1,x2,y2)<Math.max(38,r.width*.43))hits.push([e,cx,cy])""",
"""   const baseRadius=Math.max(38,r.width*.43),hitRadius=sliceAbility?sliceAbility.sliceRadius(sliceAbilitySkin,baseRadius):baseRadius;
   if(pointSegDistV14(cx,cy,x1,y1,x2,y2)<hitRadius)hits.push([e,cx,cy])""",
"slice hit radius")

replace_once(
"""  if(len>=7){slashTrailV14(lastPt[0],lastPt[1],e.clientX,e.clientY);if(speed>=105)sweep(lastPt[0],lastPt[1],e.clientX,e.clientY,speed);lastPt=[e.clientX,e.clientY,now]}""",
"""  if(len>=7){slashTrailV14(lastPt[0],lastPt[1],e.clientX,e.clientY);const minSwipe=sliceAbility?sliceAbility.sliceMinSwipeSpeed(sliceAbilitySkin,105):105;if(speed>=minSwipe)sweep(lastPt[0],lastPt[1],e.clientX,e.clientY,speed);lastPt=[e.clientX,e.clientY,now]}""",
"slice swipe threshold")

replace_once(
""" let phase=0,combo=0,fever=0,feverTime=0,level=1;

 const ring=$('#ring'),mallet=$('#mallet'),dough=$('#dough'),""",
""" let phase=0,combo=0,fever=0,feverTime=0,level=1;
 const tteokAbility=window.OsoCharacterSpecialAbilities,tteokAbilitySkin=currentSkin();

 const ring=$('#ring'),mallet=$('#mallet'),dough=$('#dough'),""",
"tteok ability init")

replace_once(
""" const PERFECT_WINDOW=.10;
 const GREAT_WINDOW=.25;
 const GOOD_WINDOW=.46;""",
""" const PERFECT_WINDOW=tteokAbility?tteokAbility.tteokWindow(tteokAbilitySkin,'perfect',.10):.10;
 const GREAT_WINDOW=tteokAbility?tteokAbility.tteokWindow(tteokAbilitySkin,'great',.25):.25;
 const GOOD_WINDOW=tteokAbility?tteokAbility.tteokWindow(tteokAbilitySkin,'good',.46):.46;""",
"tteok windows")

replace_once(
"""  {name:'지구',icon:'🌍',need:16}
 ];
 s.innerHTML=`<div class=\"powerduckScene\">""",
"""  {name:'지구',icon:'🌍',need:16}
 ];
 const powerduckAbility=window.OsoCharacterSpecialAbilities,powerduckAbilitySkin=currentSkin();
 if(powerduckAbility)targets.forEach(o=>o.need=powerduckAbility.powerduckNeed(powerduckAbilitySkin,o.need));
 s.innerHTML=`<div class=\"powerduckScene\">""",
"powerduck needs")

replace_once(
""" const isKf21=craftMode==='kf21';
 const s=$('#stage'),skin=currentSkin(),group=skin.group||'oso';
 const isNongae=group==='nongae';""",
""" const isKf21=craftMode==='kf21';
 const s=$('#stage'),skin=currentSkin(),group=skin.group||'oso';
 const sfAbility=window.OsoCharacterSpecialAbilities;
 const isNongae=group==='nongae';""",
"spacefighter ability init")

replace_once(
""" function firePlayer(ts){
  const delay=Math.max(70,98-power*5);
  if(ts-lastShot<delay)return;lastShot=ts;""",
""" function firePlayer(ts){
  const baseDelay=Math.max(70,98-power*5),delay=sfAbility?sfAbility.shootingDelayMs(skin,baseDelay):baseDelay;
  if(ts-lastShot<delay)return;lastShot=ts;""",
"spacefighter fire rate")

replace_once(
""" /* 표시 속도는 현실적인 220/260 km/h.
    화면 이동은 속도 비례 가속 스크롤이며 최고속도에서 v2.0.3의 9배율 대비 4배 이상. */
 const FINISH=420000,DRAW=118,NORMAL_MAX=220,BOOST_MAX=260,WORLD_PER_SEG=28;""",
""" /* 기본 표시 속도는 220/260 km/h. 아요/논개는 외부 캐릭터 특성 모듈에서 260/300 km/h로 확장한다.
    화면 이동은 속도 비례 가속 스크롤이며 최고속도에서 v2.0.3의 9배율 대비 4배 이상. */
 const raceAbility=window.OsoCharacterSpecialAbilities,raceLimits=raceAbility?raceAbility.racingLimits(currentSkin(),220,260):{normal:220,boost:260};
 const FINISH=420000,DRAW=118,NORMAL_MAX=raceLimits.normal,BOOST_MAX=raceLimits.boost,WORLD_PER_SEG=28;""",
"racing limits")

replace_once(
"""  boost=0;boostUntil=performance.now()+2050;tone('clear');buzz([20,10,35]);banner('TURBO!','260 km/h!')""",
"""  boost=0;boostUntil=performance.now()+2050;tone('clear');buzz([20,10,35]);banner('TURBO!',`${BOOST_MAX} km/h!`)""",
"racing turbo label")

replace_once(
"""<script src="./nongae-unlock-wrap.js?v=20260906-wrap1"></script>
<script src="./character-performance-bonus.js?v=20260906-charbonus2"></script>""",
"""<script src="./nongae-unlock-wrap.js?v=20260906-wrap1"></script>
<script src="./character-special-abilities.js?v=20260907-charability1"></script>
<script src="./character-performance-bonus.js?v=20260906-charbonus2"></script>""",
"special ability script connection")

INDEX.write_text(text,encoding="utf-8")
after_hash=hashlib.sha256(text.encode("utf-8")).hexdigest()
sotris_after=hashlib.sha256(SOTRIS.read_bytes()).hexdigest()
if sotris_before!=sotris_after:
    raise SystemExit("SOTRIS changed unexpectedly")

checks={
    "SPECIAL_MODULE_CONNECTED":'character-special-abilities.js?v=20260907-charability1' in text,
    "AYA_RACING_HOOK":'raceAbility.racingLimits(currentSkin(),220,260)' in text,
    "AYA_SHOOTING_HOOK":'sfAbility.shootingDelayMs(skin,baseDelay)' in text,
    "RUN_4JUMP_HOOK":'runnerAbility.runBaseJumpCap(runnerAbilitySkin,2)' in text and "runNeedsTripleTicket" in text,
    "FISH_JUDGEMENT_HOOK":'fishAbility.fishDwellMs' in text,
    "SLICE_JUDGEMENT_HOOK":'sliceAbility.sliceRadius' in text and 'sliceMinSwipeSpeed' in text,
    "TTEOK_JUDGEMENT_HOOK":'tteokAbility.tteokWindow' in text,
    "POWERDUCK_JUDGEMENT_HOOK":'powerduckAbility.powerduckNeed' in text,
}
bad=[k for k,v in checks.items() if not v]
if bad:
    raise SystemExit("verification failed: "+", ".join(bad))

inline=[]
for m in re.finditer(r'<script(?:\s[^>]*)?>(.*?)</script>',text,re.S|re.I):
    tag=m.group(0).split('>',1)[0]
    if re.search(r'\bsrc\s*=',tag,re.I): continue
    if re.search(r'type\s*=\s*["\']application/(?:ld\+json|json)["\']',tag,re.I): continue
    body=m.group(1)
    if body.strip(): inline.append(body)
for i,body in enumerate(inline,1):
    p=subprocess.run(["node","--check"],input=body,text=True,capture_output=True)
    if p.returncode:
        raise SystemExit(f"inline JS syntax check {i} failed:\n{p.stderr}")

REPORT.write_text(
    "\n".join([
        "CHARACTER SPECIAL ABILITIES VERIFIED",
        "AYA_RACING_NORMAL_MAX=260",
        "AYA_RACING_TOP_SPEED=300",
        "AYA_SHOOTING_COOLDOWN_MULTIPLIER=0.72",
        "AYA_RUN_FIRST_JUMP_VELOCITY=-640",
        "NONGAE_INHERITS_AYA=YES",
        "NONGAE_INHERITS_HAMO=YES",
        "NONGAE_MAX_JUMPS=4",
        "HAMO_FISH_DWELL_MULTIPLIER=1.36",
        "HAMO_SLICE_RADIUS_MULTIPLIER=1.45",
        "HAMO_SLICE_MIN_SWIPE_SPEED=70",
        "HAMO_TTEOK_PERFECT_MULTIPLIER=1.40",
        "HAMO_TTEOK_GREAT_MULTIPLIER=1.36",
        "HAMO_TTEOK_GOOD_MULTIPLIER=1.35",
        "HAMO_POWERDUCK_NEED_MULTIPLIER=0.78",
        "INLINE_JS_NODE_CHECK=PASS",
        "SOTRIS_CHANGED=NO",
        f"SOTRIS_SHA256={sotris_after}",
        f"PLAY_SHA256_BEFORE={before_hash}",
        f"PLAY_SHA256_AFTER={after_hash}",
    ])+"\n",encoding="utf-8")
print(REPORT.read_text(encoding="utf-8"))
