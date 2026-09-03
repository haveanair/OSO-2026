from pathlib import Path
import hashlib,re,subprocess

play=Path('play/index.html')
sp1=Path('play/sp1/sotris/index.html')
asset=Path('play/assets/kf21-game-topdown.webp')
s=play.read_text(encoding='utf-8')
sp1_before=hashlib.sha256(sp1.read_bytes()).hexdigest()
play_before=hashlib.sha256(s.encode()).hexdigest()

SIDE='assets/kf21-approved-top.webp?v=20260903-kf21select1'
TOP='assets/kf21-game-topdown.webp?v=20260904-kf21game1'

# 실제 게임 플레이어에만 탑뷰를 사용한다. 선택 화면의 SIDE 자산은 그대로 둔다.
old_player_src="const playerImg=new Image();playerImg.src=isKf21?'"+SIDE+"':currentOsoSrc();"
new_player_src="const playerImg=new Image();playerImg.src=isKf21?'"+TOP+"':currentOsoSrc();"
if s.count(old_player_src)!=1:
    raise SystemExit(f'player source count={s.count(old_player_src)}')
s=s.replace(old_player_src,new_player_src,1)

# 캐릭터 카드 이름 줄바꿈
old_desc="<div class=\"sfCraftDesc\">현재 도감에서 선택한 ${skin.name||'캐릭터'}로 출격<br>기존 공격 · 기존 초필살기</div>"
new_desc="<div class=\"sfCraftDesc\">현재 선택<br><strong>${skin.name||'캐릭터'}</strong><br>기존 공격 · 기존 초필살기</div>"
if s.count(old_desc)!=1:
    raise SystemExit(f'character desc count={s.count(old_desc)}')
s=s.replace(old_desc,new_desc,1)

# 종스크롤 탑뷰 비율로 게임 내 렌더만 조정
old_clone="isKf21?ctx.drawImage(playerImg,-29,-19,58,38):ctx.drawImage(playerImg,-20,-21,40,42)"
new_clone="isKf21?ctx.drawImage(playerImg,-25,-25,50,50):ctx.drawImage(playerImg,-20,-21,40,42)"
old_main="isKf21?ctx.drawImage(playerImg,-43,-28,86,56):ctx.drawImage(playerImg,-30,-31,60,62)"
new_main="isKf21?ctx.drawImage(playerImg,-40,-40,80,80):ctx.drawImage(playerImg,-30,-31,60,62)"
if s.count(old_clone)<1 or s.count(old_main)<1:
    raise SystemExit(f'draw patterns clone={s.count(old_clone)} main={s.count(old_main)}')
s=s.replace(old_clone,new_clone).replace(old_main,new_main)

# KF-21 해금 메시지는 기존 엔딩과 분리해 엔딩 종료 뒤에만 표시
old_end="""s.innerHTML=`<div class=\"sfEnding\"><div class=\"sfEndingCard\"><div class=\"earth\">🌍✨</div><h2>지구에 평화가 찾아왔다.</h2><p>오소와 친구들이 악의 본거지를 무너뜨렸소!</p><strong>1884 진주중앙시장 파이팅!</strong>${state.spacefighterKf21New?'<div style=\"margin-top:15px;padding:10px 12px;border:2px solid #77dcff;border-radius:12px;background:#062550;color:#ffe268;font-weight:1000\">NEW FIGHTER · KF-21 전투기 해금!<br><span style=\"font-size:12px;color:#d6efff\">다음 출격부터 캐릭터 / KF-21 선택 가능</span></div>':''}</div></div>`;
    victoryFanfare();bombBuzz();
    setTimeout(()=>finish('spacefighter',Math.floor(score+5000),beginSpacefighter,true,bonusCoins),4400)"""
new_end="""s.innerHTML=`<div class=\"sfEnding\"><div class=\"sfEndingCard\"><div class=\"earth\">🌍✨</div><h2>지구에 평화가 찾아왔다.</h2><p>오소와 친구들이 악의 본거지를 무너뜨렸소!</p><strong>1884 진주중앙시장 파이팅!</strong></div></div>`;
    victoryFanfare();bombBuzz();
    if(state.spacefighterKf21New){
     setTimeout(()=>{
      s.innerHTML=`<div class=\"sfEnding\"><div class=\"sfEndingCard\"><div style=\"font-size:56px\">✈️✨</div><h2>KF-21 전투기 해금!</h2><p>다음 출격부터 선택할 수 있소.</p><strong>캐릭터 / KF-21</strong></div></div>`;
      tone('perfect');buzz([45,20,70,20,120]);
      setTimeout(()=>finish('spacefighter',Math.floor(score+5000),beginSpacefighter,true,bonusCoins),1900)
     },4400)
    }else{
     setTimeout(()=>finish('spacefighter',Math.floor(score+5000),beginSpacefighter,true,bonusCoins),4400)
    }"""
if s.count(old_end)!=1:
    raise SystemExit(f'ending block count={s.count(old_end)}')
s=s.replace(old_end,new_end,1)

s=s.replace('/* SPACEFIGHTER KF21 SELECT v1.0 */','/* SPACEFIGHTER KF21 SELECT v1.1 GAME TOPDOWN */',1)
play.write_text(s,encoding='utf-8')

# 검증
if not asset.exists() or asset.stat().st_size<10000:
    raise SystemExit('user top-down asset missing')
if TOP not in s:
    raise SystemExit('game top-down asset not wired')
if s.count(SIDE)<1:
    raise SystemExit('selection side-view asset was lost')
if old_player_src in s:
    raise SystemExit('old in-game side-view source remains')
if '현재 선택<br><strong>${skin.name||\'캐릭터\'}</strong><br>' not in s:
    raise SystemExit('character line break missing')
if 'NEW FIGHTER · KF-21 전투기 해금!' in s:
    raise SystemExit('unlock message still inside ending')
if hashlib.sha256(sp1.read_bytes()).hexdigest()!=sp1_before:
    raise SystemExit('SP1 Sotris file changed')

scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)
Path('/tmp/oso-inline.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/oso-inline.js'],check=True)

report='\n'.join([
 'SPACEFIGHTER KF21 ANGLE FIX v1.1',
 'SOTRIS_CHANGED=NO',
 'SORTIE_SELECTION_VIEW=SIDE',
 'IN_GAME_VIEW=TOPDOWN',
 'CHARACTER_CARD_LINEBREAK=YES',
 'UNLOCK_MESSAGE_IN_ENDING=NO',
 'UNLOCK_MESSAGE_AFTER_ENDING=YES',
 f'TOPDOWN_ASSET_BYTES={asset.stat().st_size}',
 'TOPDOWN_ASSET_SHA256='+hashlib.sha256(asset.read_bytes()).hexdigest(),
 'SP1_SHA256='+sp1_before,
 'PLAY_BEFORE_SHA256='+play_before,
 'PLAY_AFTER_SHA256='+hashlib.sha256(s.encode()).hexdigest(),
 'INLINE_JS_NODE_CHECK=PASS',
])+'\n'
Path('.github/spacefighter-kf21-angle-fix-report.txt').write_text(report,encoding='utf-8')
