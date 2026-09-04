from pathlib import Path
import hashlib,json,re,subprocess

play=Path('play/index.html')
s=play.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()
sotris=Path('play/sp1/sotris/index.html')
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()

# Use the two already-registered user-selected Nongae assets. No image generation.
a1=Path('play/assets/nongae-01.webp').read_bytes()
a2=Path('play/assets/nongae-02.webp').read_bytes()
for name,data in [('nongae-01.webp',a1),('nongae-02.webp',a2)]:
    if len(data)<1000 or data[:4]!=b'RIFF' or data[8:12]!=b'WEBP':
        raise SystemExit(name+' is not a valid WEBP asset')
h1=hashlib.sha256(a1).hexdigest()
h2=hashlib.sha256(a2).hexdigest()

# Add two Nongae characters to the encyclopedia collection.
m=re.search(r'const OSO_SKINS=(\[.*?\]);\s*\n',s,re.S)
if not m:
    raise SystemExit('OSO_SKINS array not found')
skins=json.loads(m.group(1))
if any(x.get('id') in ('nongae_jade','nongae_resolve') for x in skins):
    raise SystemExit('Nongae skins already present')
skins.extend([
    {'id':'nongae_jade','name':'옥가락지 논개','price':3200,'src':'assets/nongae-01.webp?v=20260904-nongae2','group':'nongae','badge':'🌊 논개','note':'RPG 논개 클리어 후 해금'},
    {'id':'nongae_resolve','name':'결의의 논개','price':3800,'src':'assets/nongae-02.webp?v=20260904-nongae2','group':'nongae','badge':'🌊 논개','note':'RPG 논개 클리어 후 해금'}
])
newarr=json.dumps(skins,ensure_ascii=False,separators=(',',':'))
s=s[:m.start(1)]+newarr+s[m.end(1):]

# Persistent unlock flag + migration for users who already defeated Nongae in RPG save data.
marker="if(!Array.isArray(state.ownedSkins))state.ownedSkins=['default'];"
inject="""if(!Array.isArray(state.ownedSkins))state.ownedSkins=['default'];
if(typeof state.nongaeUnlocked!=='boolean')state.nongaeUnlocked=false;
if(!state.nongaeUnlocked){try{const d=JSON.parse(localStorage.getItem('jcm-fantasy-save-v200')||'null');if(d&&d.run&&(d.run.nongaDefeated||(Array.isArray(d.run.bossDefeated)&&d.run.bossDefeated[6]))){state.nongaeUnlocked=true;save()}}catch(_){}}"""
if s.count(marker)!=1:
    raise SystemExit('state marker count='+str(s.count(marker)))
s=s.replace(marker,inject,1)

# Add Nongae encyclopedia group, locked until Nongae clear.
old_groups=""" const groups=[
  {id:'oso',title:'🐂 오소',sub:'중앙시장의 주인공 · 기본~750 코인'},
  {id:'ayo',title:'🐱 아요 컬렉션',sub:'표정과 동작이 다양한 친구 · 1,000~1,900 코인'},
  {id:'hamo',title:'🦦 하모 컬렉션',sub:'특별한 친구 · 2,000~2,900 코인'}
 ];"""
new_groups=""" const groups=[
  {id:'oso',title:'🐂 오소',sub:'중앙시장의 주인공 · 기본~750 코인'},
  {id:'ayo',title:'🐱 아요 컬렉션',sub:'표정과 동작이 다양한 친구 · 1,000~1,900 코인'},
  {id:'hamo',title:'🦦 하모 컬렉션',sub:'특별한 친구 · 2,000~2,900 코인'},
  {id:'nongae',title:'🌊 논개 컬렉션',sub:'RPG 논개 클리어 후 해금 · 3,000 코인대'}
 ];"""
if s.count(old_groups)!=1:
    raise SystemExit('shop groups pattern count='+str(s.count(old_groups)))
s=s.replace(old_groups,new_groups,1)

old_cards=" const cards=OSO_SKINS.filter(s=>(s.group||'oso')===gr.id).map(s=>{"
new_cards=" const lockedGroup=gr.id==='nongae'&&!state.nongaeUnlocked;\n  const cards=OSO_SKINS.filter(s=>(s.group||'oso')===gr.id).map(s=>{"
if s.count(old_cards)!=1:
    raise SystemExit('shop cards pattern count='+str(s.count(old_cards)))
s=s.replace(old_cards,new_cards,1)

old_btn="""<button class=\"${selected?'selectedBtn':owned?'owned':''}\" data-buy=\"${s.id}\">${selected?'사용 중':owned?'사용하기':`🪙 ${s.price.toLocaleString()} 구입`}</button>"""
new_btn="""<button class=\"${selected?'selectedBtn':owned?'owned':''}\" data-buy=\"${s.id}\" ${lockedGroup?'disabled':''}>${lockedGroup?'🔒 RPG 논개 클리어 후 해금':selected?'사용 중':owned?'사용하기':`🪙 ${s.price.toLocaleString()} 구입`}</button>"""
if s.count(old_btn)!=1:
    raise SystemExit('shop button pattern count='+str(s.count(old_btn)))
s=s.replace(old_btn,new_btn,1)

old_click="const s=OSO_SKINS.find(x=>x.id===btn.dataset.buy);if(!s)return;"
new_click="const s=OSO_SKINS.find(x=>x.id===btn.dataset.buy);if(!s)return;if((s.group||'oso')==='nongae'&&!state.nongaeUnlocked){tone('bad');buzz(40);return}"
if s.count(old_click)!=1:
    raise SystemExit('shop click pattern count='+str(s.count(old_click)))
s=s.replace(old_click,new_click,1)

# Unlock only after the existing true RPG ending has fully finished.
old_end="setTimeout(()=>{stopBGM();finish('fantasy',Math.floor(score+18000),playOsoFantasy,true,fantasyBonusCoins)},46800)"
new_end="""setTimeout(()=>{
  stopBGM();
  if(run.nongaDefeated&&!state.nongaeUnlocked){
   state.nongaeUnlocked=true;save();
   s.innerHTML=`<div style=\"position:absolute;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 35%,#e8fbff,#75cce9 55%,#15528a);padding:20px\"><div style=\"width:min(92%,430px);padding:22px 16px;border:4px solid #fff;border-radius:24px;background:rgba(7,40,77,.92);box-shadow:0 12px 35px #0018;text-align:center;color:#fff\"><div style=\"font-weight:1000;font-size:28px;color:#ffe56e\">🌊 논개 캐릭터 2종 해금!</div><div style=\"display:flex;align-items:flex-end;justify-content:center;gap:18px;height:170px;margin:12px 0 8px\"><img src=\"assets/nongae-01.webp?v=20260904-nongae2\" style=\"max-height:160px;max-width:42%;object-fit:contain\"><img src=\"assets/nongae-02.webp?v=20260904-nongae2\" style=\"max-height:160px;max-width:46%;object-fit:contain\"></div><div style=\"font-size:15px;font-weight:900;line-height:1.55\">논개의 봉인을 풀었소!<br>도감에서 3,000 코인대에 구매할 수 있소.</div></div></div>`;
   tone('perfect');buzz([40,25,65,25,110]);
   setTimeout(()=>finish('fantasy',Math.floor(score+18000),playOsoFantasy,true,fantasyBonusCoins),2700)
  }else finish('fantasy',Math.floor(score+18000),playOsoFantasy,true,fantasyBonusCoins)
 },46800)"""
if s.count(old_end)!=1:
    raise SystemExit('fantasy ending timeout pattern count='+str(s.count(old_end)))
s=s.replace(old_end,new_end,1)

# Spacefighter: detect Nongae character mode.
old_head=""" const isKf21=craftMode==='kf21';
 const s=$('#stage'),skin=currentSkin(),group=skin.group||'oso';"""
new_head=""" const isKf21=craftMode==='kf21';
 const s=$('#stage'),skin=currentSkin(),group=skin.group||'oso';
 const isNongae=group==='nongae';"""
if s.count(old_head)!=1:
    raise SystemExit('spacefighter head pattern count='+str(s.count(old_head)))
s=s.replace(old_head,new_head,1)

# Nongae super name.
old_super_name="const superName=isKf21?'스카이 블레이즈!':(group==='oso'?'만물상 폭격!':'진주 폭풍!');"
new_super_name="const superName=isKf21?'스카이 블레이즈!':(isNongae?'천상의 옥가락지 어택!':(group==='oso'?'만물상 폭격!':'진주 폭풍!'));"
if s.count(old_super_name)!=1:
    raise SystemExit('super name pattern count='+str(s.count(old_super_name)))
s=s.replace(old_super_name,new_super_name,1)

# Nongae normal shots are hollow jade rings.
old_shadow="ctx.shadowColor=group==='oso'?'#ffd35b':'#7ceaff';"
new_shadow="ctx.shadowColor=group==='oso'?'#ffd35b':isNongae?'#42e0b4':'#7ceaff';"
if s.count(old_shadow)!=1:
    raise SystemExit('projectile shadow pattern count='+str(s.count(old_shadow)))
s=s.replace(old_shadow,new_shadow,1)

old_shot="""   }else if(group==='oso'){
    ctx.font=`${o.clone?12:16}px sans-serif`;ctx.fillText(shotIcon,o.x,o.y)
   }else{
    ctx.fillStyle='#fffef7';ctx.strokeStyle=o.clone?'#ca9fff':'#72e9ff';ctx.lineWidth=o.clone?1.5:2.5;
    ctx.beginPath();ctx.arc(o.x,o.y,o.clone?4.5:6.5,0,6.28);ctx.fill();ctx.stroke()
   }"""
new_shot="""   }else if(group==='oso'){
    ctx.font=`${o.clone?12:16}px sans-serif`;ctx.fillText(shotIcon,o.x,o.y)
   }else if(isNongae){
    const rr=o.clone?4.8:7.0;
    ctx.shadowBlur=o.clone?8:14;ctx.shadowColor='#38e0ad';ctx.strokeStyle='#35c99d';ctx.lineWidth=o.clone?2.2:3.2;
    ctx.beginPath();ctx.arc(o.x,o.y,rr,0,Math.PI*2);ctx.stroke();
    ctx.shadowBlur=0;ctx.strokeStyle='#d9fff6';ctx.lineWidth=o.clone?.8:1.2;
    ctx.beginPath();ctx.arc(o.x-1,o.y-1,Math.max(2,rr-1.4),3.45,5.75);ctx.stroke()
   }else{
    ctx.fillStyle='#fffef7';ctx.strokeStyle=o.clone?'#ca9fff':'#72e9ff';ctx.lineWidth=o.clone?1.5:2.5;
    ctx.beginPath();ctx.arc(o.x,o.y,o.clone?4.5:6.5,0,6.28);ctx.fill();ctx.stroke()
   }"""
if s.count(old_shot)!=1:
    raise SystemExit('projectile draw pattern count='+str(s.count(old_shot)))
s=s.replace(old_shot,new_shot,1)

# Nongae super uses a dedicated Canvas-only Heavenly Jade Ring effect.
old_super_fx="superFx={start:now,end:now+(isKf21?1750:1350),kind:isKf21?'kf21':(group==='oso'?'cargo':'pearl')};"
new_super_fx="superFx={start:now,end:now+(isKf21?1750:isNongae?1900:1350),kind:isKf21?'kf21':isNongae?'heaven_jade':(group==='oso'?'cargo':'pearl')};"
if s.count(old_super_fx)!=1:
    raise SystemExit('super fx pattern count='+str(s.count(old_super_fx)))
s=s.replace(old_super_fx,new_super_fx,1)

old_draw="  if(superFx.kind==='kf21'){"
new_draw="""  if(superFx.kind==='heaven_jade'){
   const elapsed=ts-superFx.start;
   ctx.save();ctx.globalCompositeOperation='lighter';
   const sky=ctx.createLinearGradient(0,0,0,H*.7);
   sky.addColorStop(0,`rgba(230,255,248,${.34*fade})`);sky.addColorStop(.5,`rgba(92,245,204,${.16*fade})`);sky.addColorStop(1,'rgba(46,198,157,0)');
   ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*.78);
   for(let i=0;i<14;i++){
    const delay=i*82,rp=Math.max(0,Math.min(1,(elapsed-delay)/620));
    if(rp<=0||rp>=1)continue;
    const col=i%7,row=(i/7)|0;
    const x=(.08+col*.14)*W+Math.sin(i*2.7)*8;
    const y=-42+rp*(H+96)+row*26;
    const rr=18+(i%3)*4;
    ctx.save();ctx.translate(x,y);ctx.rotate((i%2?-1:1)*(elapsed*.0018+i*.31));ctx.scale(1,.42);
    ctx.shadowBlur=24;ctx.shadowColor='#5ff0c4';ctx.strokeStyle=`rgba(72,226,180,${.95*(1-rp*.25)})`;ctx.lineWidth=7;
    ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();
    ctx.shadowBlur=7;ctx.strokeStyle='rgba(229,255,248,.96)';ctx.lineWidth=2.2;
    ctx.beginPath();ctx.arc(-1,-1,rr-4,3.35,5.8);ctx.stroke();ctx.restore();
   }
   const haloP=Math.max(0,Math.min(1,(elapsed-250)/1050));
   if(haloP>0){
    const hx=boss?boss.x:W*.5,hy=boss?boss.y:H*.34,rr=48+haloP*210;
    ctx.save();ctx.translate(hx,hy);ctx.scale(1,.38);ctx.shadowBlur=34;ctx.shadowColor='#7affd6';
    ctx.strokeStyle=`rgba(102,255,210,${fade*.9})`;ctx.lineWidth=14*(1-haloP*.45);ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle=`rgba(240,255,250,${fade*.9})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,rr*.72,0,Math.PI*2);ctx.stroke();ctx.restore();
   }
   ctx.restore();
  }else if(superFx.kind==='kf21'){"""
if s.count(old_draw)!=1:
    raise SystemExit('super draw pattern count='+str(s.count(old_draw)))
s=s.replace(old_draw,new_draw,1)

# Preserve tall Nongae proportions in the vertical shooter.
old_clone="isKf21?ctx.drawImage(playerImg,-25,-25,50,50):ctx.drawImage(playerImg,-20,-21,40,42)"
new_clone="isKf21?ctx.drawImage(playerImg,-25,-25,50,50):isNongae?ctx.drawImage(playerImg,-16,-25,32,50):ctx.drawImage(playerImg,-20,-21,40,42)"
old_player="isKf21?ctx.drawImage(playerImg,-40,-40,80,80):ctx.drawImage(playerImg,-30,-31,60,62)"
new_player="isKf21?ctx.drawImage(playerImg,-40,-40,80,80):isNongae?ctx.drawImage(playerImg,-22,-39,44,70):ctx.drawImage(playerImg,-30,-31,60,62)"
if s.count(old_clone)<1 or s.count(old_player)<1:
    raise SystemExit('player draw patterns missing')
s=s.replace(old_clone,new_clone).replace(old_player,new_player)
s=s.replace("group==='oso'?'🐂':group==='hamo'?'🦦':'🐱'","group==='oso'?'🐂':group==='hamo'?'🦦':group==='nongae'?'👘':'🐱'")

play.write_text(s,encoding='utf-8')

# Static verification.
if sotris_before!=hashlib.sha256(sotris.read_bytes()).hexdigest():
    raise SystemExit('Sotris changed unexpectedly')
assert s.count('"nongae_jade"')==1 and s.count('"nongae_resolve"')==1
assert '"price":3200' in s and '"price":3800' in s
assert "{id:'nongae',title:'🌊 논개 컬렉션'" in s
assert "run.nongaDefeated&&!state.nongaeUnlocked" in s
assert "논개 캐릭터 2종 해금!" in s
assert "const isNongae=group==='nongae';" in s
assert "ctx.strokeStyle='#35c99d'" in s
assert "천상의 옥가락지 어택!" in s
assert "superFx.kind==='heaven_jade'" in s
assert "isNongae?ctx.drawImage(playerImg,-22,-39,44,70)" in s

scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)
Path('/tmp/oso-inline.js').write_text('\n'.join(scripts),encoding='utf-8')
subprocess.run(['node','--check','/tmp/oso-inline.js'],check=True)

report='\n'.join([
    'NONGAE COLLECTION INTEGRATION VERIFIED',
    'UNLOCK_CONDITION=RPG Nongae defeated',
    'UNLOCK_PRESENTATION=after true ending finishes',
    'SHOP_GROUP=nongae',
    'NONGAE_01_PRICE=3200',
    'NONGAE_02_PRICE=3800',
    'SPACEFIGHTER_NORMAL_SHOT=hollow jade ring',
    'SPACEFIGHTER_SUPER=Heavenly Jade Ring Attack (Canvas only)',
    'OLD_RPG_SAVE_MIGRATION=enabled',
    'SOTRIS_CHANGED=NO',
    'INLINE_JS_NODE_CHECK=PASS',
    'ASSET01_SHA256='+h1,
    'ASSET02_SHA256='+h2,
    'PLAY_BEFORE_SHA256='+before,
    'PLAY_AFTER_SHA256='+hashlib.sha256(s.encode()).hexdigest()
])+'\n'
Path('.github/nongae-integration-report.txt').write_text(report,encoding='utf-8')
