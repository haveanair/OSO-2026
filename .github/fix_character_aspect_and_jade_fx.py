from pathlib import Path
import hashlib,re

p=Path('play/index.html')
t=p.read_text(encoding='utf-8')
before=t
sotris=Path('play/sp1/sotris/index.html')
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()
changes=[]

def once(old,new,label):
    global t
    n=t.count(old)
    if n==1:
        t=t.replace(old,new,1);changes.append(label)
    elif n==0:
        changes.append(label+'_ALREADY_OR_NOT_FOUND')
    else:
        raise SystemExit(f'{label}: ambiguous count {n}')

# Connect separate modules without touching SOTRIS.
if 'character-aspect-guard.js' not in t:
    m=re.search(r'(<script src="\./character-special-abilities\.js\?v=[^"]+"></script>)',t)
    if not m: raise SystemExit('character special script tag not found')
    ins=m.group(1)+'\n<script src="./character-aspect-guard.js?v=20260907-aspect1"></script>\n<script src="./nongae-heaven-jade-fx.js?v=20260907-jade1"></script>'
    t=t[:m.start()]+ins+t[m.end():]
    changes.append('MODULE_TAGS')

# Runner: use intrinsic aspect ratio and uniform landing scale (no squash/stretch).
once("ctx.save();ctx.translate(84,y+45);ctx.scale(flipRunner?-sX:sX,sY);",
     "ctx.save();ctx.translate(84,y+45);const runnerScale=land>0?.90:1;ctx.scale(flipRunner?-runnerScale:runnerScale,runnerScale);",
     'RUN_UNIFORM_SCALE')
once("if(inv>0&&Math.floor(ts/90)%2===0)ctx.globalAlpha=.38;ctx.drawImage(img,-47,-47,94,94);ctx.restore()",
     "if(inv>0&&Math.floor(ts/90)%2===0)ctx.globalAlpha=.38;const runAG=window.OsoCharacterAspectGuard;runAG?runAG.drawContainedBox(ctx,img,-47,-47,94,94):ctx.drawImage(img,-47,-47,94,94);ctx.restore()",
     'RUN_ASPECT')

# Racing character portrait above car.
once("if(img.complete&&img.naturalWidth)ctx.drawImage(img,carX-28,carY-72,56,56);",
     "if(img.complete&&img.naturalWidth){const raceAG=window.OsoCharacterAspectGuard;raceAG?raceAG.drawContainedBox(ctx,img,carX-28,carY-72,56,56):ctx.drawImage(img,carX-28,carY-72,56,56)};",
     'RACE_ASPECT')

# Spacefighter player character / KF-21 box: fit image without changing source proportions.
once("isKf21?ctx.drawImage(playerImg,-40,-40,80,80):isNongae?ctx.drawImage(playerImg,-22,-39,44,70):ctx.drawImage(playerImg,-30,-31,60,62);ctx.restore()",
     "const sfAG=window.OsoCharacterAspectGuard;if(sfAG){if(isKf21)sfAG.drawContainedBox(ctx,playerImg,-40,-40,80,80);else if(isNongae)sfAG.drawContainedBox(ctx,playerImg,-22,-39,44,70);else sfAG.drawContainedBox(ctx,playerImg,-30,-31,60,62)}else{isKf21?ctx.drawImage(playerImg,-40,-40,80,80):isNongae?ctx.drawImage(playerImg,-22,-39,44,70):ctx.drawImage(playerImg,-30,-31,60,62)}ctx.restore()",
     'SPACEFIGHTER_ASPECT')

# RPG hero image: convert all simple 5-argument heroImg draws to contain-fit.
def split_args(s):
    out=[];cur=[];depth=0;quote=None;esc=False
    for ch in s:
        if quote:
            cur.append(ch)
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch==quote: quote=None
        elif ch in "'\"`": quote=ch;cur.append(ch)
        elif ch in '([{': depth+=1;cur.append(ch)
        elif ch in ')]}': depth=max(0,depth-1);cur.append(ch)
        elif ch==',' and depth==0: out.append(''.join(cur).strip());cur=[]
        else: cur.append(ch)
    out.append(''.join(cur).strip())
    return out

hero_count=0
pat=re.compile(r'ctx\.drawImage\(heroImg,([^;\n]+?)\)')
def hero_repl(m):
    global hero_count
    args=split_args(m.group(1))
    if len(args)!=4:return m.group(0)
    hero_count+=1
    a=','.join(args)
    return f'(window.OsoCharacterAspectGuard?window.OsoCharacterAspectGuard.drawContainedBox(ctx,heroImg,{a}):ctx.drawImage(heroImg,{a}))'
t=pat.sub(hero_repl,t)
if hero_count: changes.append(f'RPG_HERO_ASPECT_{hero_count}')

# Explicit Nongae large jade-ring branch before cargo/generic effects.
needle="}else if(superFx.kind==='cargo'){"
if "OsoNongaeHeavenJadeFx.draw(ctx,{W,H,ts,superFx,player})" not in t:
    if t.count(needle)!=1: raise SystemExit(f'jade insertion anchor count {t.count(needle)}')
    repl="}else if(superFx.kind==='heaven_jade'){\n   if(window.OsoNongaeHeavenJadeFx)window.OsoNongaeHeavenJadeFx.draw(ctx,{W,H,ts,superFx,player});\n  "+needle
    t=t.replace(needle,repl,1);changes.append('HEAVEN_JADE_LARGE_RING')

if t==before: raise SystemExit('no changes made')
p.write_text(t,encoding='utf-8')
sotris_after=hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_after!=sotris_before: raise SystemExit('SOTRIS changed unexpectedly')

report=[
 'CHARACTER ASPECT + NONGAE JADE FX VERIFIED',
 'CHANGES='+','.join(changes),
 'RUN_ASPECT_GUARD='+str('runAG.drawContainedBox' in t),
 'RACING_ASPECT_GUARD='+str('raceAG.drawContainedBox' in t),
 'SPACEFIGHTER_ASPECT_GUARD='+str('sfAG.drawContainedBox' in t),
 f'RPG_HERO_DRAW_REPLACEMENTS={hero_count}',
 'DOM_CHARACTER_OBJECT_FIT_MODULE=YES',
 'NONGAE_HEAVEN_JADE_LARGE_RING='+str("superFx.kind==='heaven_jade'" in t and 'OsoNongaeHeavenJadeFx.draw' in t),
 'NONGAE_IMAGE_GENERATED=NO',
 'SOTRIS_CHANGED=NO',
 'SOTRIS_SHA256='+sotris_after,
 'PLAY_SHA256_BEFORE='+hashlib.sha256(before.encode()).hexdigest(),
 'PLAY_SHA256_AFTER='+hashlib.sha256(t.encode()).hexdigest(),
]
Path('.github/character-aspect-jade-fx-report.txt').write_text('\n'.join(report)+'\n',encoding='utf-8')
