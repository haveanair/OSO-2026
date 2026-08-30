#!/usr/bin/env python3
import base64, io, math, os, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

if len(sys.argv) < 3:
    raise SystemExit('usage: gen_visual_assets.py <play/index.html> <output-dir>')
html_path = Path(sys.argv[1])
out_dir = Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)
preview_dir = out_dir / 'preview'
preview_dir.mkdir(exist_ok=True)

HTML = html_path.read_text(encoding='utf-8', errors='ignore')
DATA = []
for m in re.finditer(r'data:image/(?:webp|png|jpeg);base64,([A-Za-z0-9+/=]+)', HTML):
    raw = base64.b64decode(m.group(1))
    try:
        im = Image.open(io.BytesIO(raw)).convert('RGBA')
        DATA.append(im)
    except Exception:
        pass

def image_by_size(size):
    for im in DATA:
        if im.size == size:
            return im.copy()
    raise RuntimeError(f'missing embedded source image {size}')

market = image_by_size((347,211))
powerduck = image_by_size((1536,1366))
hamo = image_by_size((359,431))
oso = image_by_size((233,269))
ayo = image_by_size((320,337))

FONT_CANDIDATES = [
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf',
    '/usr/share/fonts/truetype/unfonts-core/UnDotumBold.ttf',
]
FONT = next((p for p in FONT_CANDIDATES if os.path.exists(p)), None)
if not FONT:
    raise RuntimeError('Korean font not found; install fonts-noto-cjk')

def F(n): return ImageFont.truetype(FONT, n)
def rrect(d, box, radius, fill, outline=None, width=1):
    d.rounded_rectangle(box, radius, fill=fill, outline=outline, width=width)
def paste_fit(base, im, box):
    x,y,w,h=box
    t=im.copy(); t.thumbnail((w,h),Image.Resampling.LANCZOS)
    base.alpha_composite(t,(x+(w-t.width)//2,y+(h-t.height)//2))
def gradient(size,c0,c1):
    w,h=size; im=Image.new('RGB',size); p=im.load()
    for y in range(h):
        t=y/max(1,h-1); c=tuple(round(c0[i]*(1-t)+c1[i]*t) for i in range(3))
        for x in range(w): p[x,y]=c
    return im.convert('RGBA')

def title_screen():
    W,H=480,320
    im=gradient((W,H),(255,245,191),(255,183,92)); d=ImageDraw.Draw(im)
    for x in range(0,W,48): d.polygon([(x,0),(x+24,0),(x+48,36),(x+24,36)],fill=(255,236,190,190))
    d.rectangle((0,36,W,42),fill=(126,74,42,255))
    paste_fit(im,market,(12,8,130,64)); paste_fit(im,powerduck,(W-98,4,86,74))
    rrect(d,(72,48,W-64,160),18,(255,255,241,235),(95,58,36,255),5)
    d.text((W//2,72),'어서오소!',font=F(34),fill='#f39b22',stroke_width=3,stroke_fill='#4c2a21',anchor='mm')
    d.text((W//2,108),'중앙시장 게임장',font=F(28),fill='#2e7494',stroke_width=3,stroke_fill='white',anchor='mm')
    rrect(d,(145,125,W-137,156),14,(35,47,63,245),(255,225,116,255),3)
    d.text((W//2,140),'RETRO · GBA EDITION',font=F(17),fill='white',anchor='mm')
    paste_fit(im,hamo,(8,178,142,138)); paste_fit(im,oso,(W//2-63,172,126,142)); paste_fit(im,ayo,(W-145,180,136,130))
    rrect(d,(45,H-31,W-45,H-5),12,(57,37,26,220))
    d.text((W//2,H-18),'START 버튼으로 게임 시작  ·  © 파워덕질 2026',font=F(11),fill='#fff6c9',anchor='mm')
    return im.resize((240,160),Image.Resampling.LANCZOS)

def splash_screen():
    W,H=480,320; im=gradient((W,H),(255,248,218),(255,198,116)); d=ImageDraw.Draw(im)
    for x in range(-40,W+60,88):
        d.polygon([(x,0),(x+44,0),(x+70,70),(x+26,70)],fill=(238,96,73,255))
        d.polygon([(x+44,0),(x+88,0),(x+114,70),(x+70,70)],fill=(255,241,203,255))
    d.rectangle((0,68,W,80),fill='#79472d')
    paste_fit(im,market,(30,96,220,130)); paste_fit(im,powerduck,(W-195,90,160,140))
    d.text((W//2,245),'1884 진주중앙시장 × 파워덕질',font=F(22),fill='#533522',anchor='mm')
    rrect(d,(110,267,W-110,307),18,'#2f4858','#fff0b5',4)
    d.text((W//2,287),'RETRO GBA EDITION',font=F(17),fill='white',anchor='mm')
    return im.resize((240,160),Image.Resampling.LANCZOS)

def ranking_screen():
    W,H=480,320; im=gradient((W,H),(198,237,248),(255,218,159)); d=ImageDraw.Draw(im)
    rrect(d,(24,18,W-24,74),18,'#684127','#fff1b8',5); d.text((W//2,45),'시장게임 명예의 전당',font=F(25),fill='#fff5cf',anchor='mm')
    rrect(d,(72,88,W-72,270),18,'#fffdf1','#7c5636',5)
    for i in range(5):
        y=112+i*30; d.text((105,y),'★' if i==0 else str(i+1),font=F(16),fill='#c48419',anchor='mm')
        d.text((145,y),f'{i+1}위',font=F(15),fill='#4d3928',anchor='lm'); d.text((W-120,y),'000000',font=F(15),fill='#2c6982',anchor='rm')
    paste_fit(im,hamo,(4,205,82,100)); paste_fit(im,ayo,(W-90,210,82,90)); paste_fit(im,oso,(W//2-38,260,76,60))
    d.text((W//2,300),'START : 게임 선택',font=F(13),fill='#513724',anchor='mm')
    return im.resize((240,160),Image.Resampling.LANCZOS)

def icon(name):
    S=4; im=Image.new('RGBA',(24*S,24*S),(0,0,0,0)); d=ImageDraw.Draw(im)
    if name=='apple':
        d.ellipse((4*S,6*S,20*S,21*S),fill='#e7473d',outline='#922b25',width=S); d.ellipse((7*S,4*S,14*S,10*S),fill='#f05a4f'); d.line((12*S,6*S,13*S,2*S),fill='#70432c',width=2*S); d.ellipse((13*S,2*S,19*S,6*S),fill='#4fae55')
    elif name=='orange':
        d.ellipse((4*S,5*S,20*S,21*S),fill='#f39a27',outline='#a55a18',width=S); d.ellipse((9*S,7*S,12*S,10*S),fill='#ffc45c'); d.line((12*S,6*S,13*S,3*S),fill='#6c462d',width=S); d.ellipse((13*S,2*S,18*S,6*S),fill='#56a94e')
    elif name=='carrot':
        d.polygon([(8*S,6*S),(18*S,7*S),(12*S,22*S)],fill='#ef7d2d',outline='#9c4c1d'); d.line((10*S,10*S,15*S,11*S),fill='#ffc06a',width=S); d.polygon([(10*S,7*S),(6*S,2*S),(11*S,4*S),(13*S,1*S),(14*S,6*S),(19*S,3*S),(16*S,8*S)],fill='#4aa951')
    elif name=='bomb':
        d.ellipse((4*S,6*S,20*S,22*S),fill='#30343d',outline='#111319',width=S); d.ellipse((7*S,8*S,11*S,12*S),fill='#777d86'); d.line((15*S,6*S,18*S,2*S),fill='#704b2b',width=2*S); d.ellipse((20*S,2*S,23*S,5*S),fill='#ff7844')
    elif name=='gold':
        pts=[]
        for i in range(10):
            a=-math.pi/2+i*math.pi/5; r=(10 if i%2==0 else 4.5)*S
            pts.append((12*S+math.cos(a)*r,12*S+math.sin(a)*r))
        d.polygon(pts,fill='#ffd94a',outline='#b5831c')
    elif name in ('fish','fishgold'):
        col='#3ea7df' if name=='fish' else '#f4c64e'; out='#1b6087' if name=='fish' else '#9b6e17'
        d.ellipse((4*S,7*S,18*S,18*S),fill=col,outline=out,width=S); d.polygon([(18*S,12*S),(23*S,7*S),(23*S,18*S)],fill=col,outline=out); d.ellipse((7*S,10*S,9*S,12*S),fill='white'); d.ellipse((8*S,11*S,9*S,12*S),fill='#1f2b35')
    return im.resize((24,24),Image.Resampling.LANCZOS)

def sprite_from(src,size,canvas):
    S=2; c=Image.new('RGBA',(canvas[0]*S,canvas[1]*S),(0,0,0,0)); t=src.copy(); t.thumbnail((size[0]*S,size[1]*S),Image.Resampling.LANCZOS); c.alpha_composite(t,((c.width-t.width)//2,(c.height-t.height)//2)); return c.resize(canvas,Image.Resampling.LANCZOS)

def basket_assets():
    W,H=480,320; bg=gradient((W,H),(182,239,255),(253,223,166)); d=ImageDraw.Draw(bg)
    for x in range(-20,W+60,72): d.polygon([(x,0),(x+42,0),(x+30,54),(x-12,54)],fill=(238,97,75,255)); d.polygon([(x+42,0),(x+72,0),(x+60,54),(x+30,54)],fill=(255,241,202,255))
    d.rectangle((0,52,W,62),fill=(118,69,40,255)); rrect(d,(128,22,W-128,61),14,(110,64,39,255),(255,242,190,255),4); d.text((W//2,42),'오소의 장바구니',font=F(18),fill='#fff5c8',anchor='mm')
    rrect(d,(10,192,W-10,H+20),28,(165,94,49,255),(107,62,35,255),7)
    for x in (16,W-188): rrect(d,(x,190,x+170,270),16,(211,144,74,255),(105,61,35,255),6); rrect(d,(x+8,200,x+162,254),12,(236,183,106,255),(168,99,49,255),4)
    d.rectangle((0,270,W,H),fill=(190,144,90,255)); d.rectangle((0,270,W,281),fill=(112,73,43,255))
    rrect(d,(12,70,126,106),16,(255,255,248,240),(97,65,43,255),4); d.text((69,88),'SCORE  0000',font=F(15),fill='#3e2b1d',anchor='mm')
    rrect(d,(W-136,70,W-12,106),16,(255,255,248,240),(97,65,43,255),4); d.text((W-74,88),'LIFE  ♥♥♥♥♥',font=F(14),fill='#bd423f',anchor='mm')
    rrect(d,(140,114,W-140,146),14,(255,253,240,220),(134,94,58,255),3); d.text((W//2,130),'← → 이동 · 폭탄은 피하소!',font=F(12),fill='#5b402c',anchor='mm')
    bg=bg.resize((240,160),Image.Resampling.LANCZOS)
    for j,n in enumerate(('apple','carrot','orange')): bg.alpha_composite(icon(n),(18+j*22,100))
    for j,n in enumerate(('orange','apple','carrot')): bg.alpha_composite(icon(n),(170+j*22,100))
    ospr=sprite_from(oso,(58,67),(64,72))
    b=Image.new('RGBA',(144,72),(0,0,0,0)); bd=ImageDraw.Draw(b); bd.ellipse((10,56,134,70),fill=(0,0,0,50)); rrect(bd,(10,6,134,62),24,(255,209,82,255),(130,79,38,255),6); bd.rectangle((16,4,128,20),fill=(255,222,105,255))
    for x in range(20,128,20): bd.rectangle((x,14,x+8,54),fill=(238,177,47,180))
    bspr=b.resize((72,36),Image.Resampling.LANCZOS)
    sprites={'oso_sprite':ospr,'basket_sprite':bspr,'apple':icon('apple'),'orange':icon('orange'),'carrot':icon('carrot'),'gold':icon('gold'),'bomb':icon('bomb')}
    frame=bg.copy(); frame.alpha_composite(ospr,(88,82)); frame.alpha_composite(bspr,(84,122)); frame.alpha_composite(icon('apple'),(32,52)); frame.alpha_composite(icon('carrot'),(123,63)); frame.alpha_composite(icon('bomb'),(188,41)); frame.alpha_composite(icon('orange'),(165,84))
    return bg,sprites,frame

def fish_assets():
    W,H=480,320; bg=gradient((W,H),(188,240,255),(68,169,211)); d=ImageDraw.Draw(bg)
    for x in range(-40,W+60,90): d.ellipse((x,66,x+72,120),fill=(255,255,255,130))
    rrect(d,(20,96,W-20,306),30,'#b66b37','#694026',7); d.rectangle((32,108,W-32,126),fill='#efb26e')
    rrect(d,(130,14,W-130,58),14,'#2b7e9f','#ffffff',4); d.text((W//2,36),'팔딱팔딱 수산시장',font=F(18),fill='white',anchor='mm')
    rrect(d,(12,18,122,55),14,'#fffef4','#477a8c',3); d.text((67,36),'SCORE 0000',font=F(13),fill='#25495b',anchor='mm'); rrect(d,(W-120,18,W-12,55),14,'#fffef4','#477a8c',3); d.text((W-66,36),'TIME 35',font=F(13),fill='#25495b',anchor='mm')
    for cy in (145,210,275):
        for cx in (95,240,385):
            d.ellipse((cx-48,cy-30,cx+48,cy+30),fill='#7a4b2d',outline='#54301e',width=4); d.ellipse((cx-37,cy-22,cx+37,cy+22),fill='#3da8cb',outline='#176986',width=4); d.ellipse((cx-28,cy-15,cx+28,cy+7),fill='#58c6df')
    bg=bg.resize((240,160),Image.Resampling.LANCZOS)
    friend=sprite_from(oso,(28,32),(34,36)); sprites={'fish':icon('fish'),'fishgold':icon('fishgold'),'friend_oso':friend}
    frame=bg.copy(); frame.alpha_composite(sprites['fish'],(34,57)); frame.alpha_composite(sprites['fishgold'],(106,89)); frame.alpha_composite(friend,(175,119))
    return bg,sprites,frame

def gba555(rgb):
    r,g,b=rgb; return (r>>3)|((g>>3)<<5)|((b>>3)<<10)
def packbits(data):
    out=bytearray(); i=0; n=len(data)
    while i<n:
        run=1
        while i+run<n and data[i+run]==data[i] and run<128: run+=1
        if run>=3:
            out.extend((0x80|(run-1),data[i])); i+=run; continue
        start=i; i+=run
        while i<n and i-start<128:
            rr=1
            while i+rr<n and data[i+rr]==data[i] and rr<128: rr+=1
            if rr>=3: break
            i+=rr
        lit=data[start:i]; out.append(len(lit)-1); out.extend(lit)
    return bytes(out)
def palette_for(bg,sprites):
    pixels=[]
    for r,g,b,a in bg.getdata(): pixels.append((r,g,b))
    for im in sprites.values():
        for r,g,b,a in im.getdata():
            if a>=96: pixels.append((r,g,b))
    step=max(1,len(pixels)//200000); sample=pixels[::step]
    strip=Image.new('RGB',(len(sample),1)); strip.putdata(sample)
    q=strip.quantize(colors=255,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
    raw=q.getpalette()[:765]; cols=[tuple(raw[i:i+3]) for i in range(0,len(raw),3)]
    while len(cols)<255: cols.append((0,0,0))
    return cols
def _nearest_index(rgb, colors, cache):
    if rgb in cache: return cache[rgb]
    r,g,b=rgb; best=0; bestd=1<<30
    for i,(pr,pg,pb) in enumerate(colors):
        d=(r-pr)*(r-pr)+(g-pg)*(g-pg)+(b-pb)*(b-pb)
        if d<bestd: bestd=d; best=i
    cache[rgb]=best+1
    return best+1
def map_bg(im,colors):
    cache={}; return bytes(_nearest_index(rgb,colors,cache) for rgb in im.convert('RGB').getdata())
def map_sprite(im,colors):
    cache={}; rgb=list(im.convert('RGB').getdata()); a=list(im.getchannel('A').getdata())
    return bytes(0 if aa<96 else _nearest_index(px,colors,cache) for px,aa in zip(rgb,a))
def c_u8(name,data):
    return f'const unsigned char {name}[{len(data)}] = {{\n'+'\n'.join('  '+','.join(str(v) for v in data[i:i+24])+',' for i in range(0,len(data),24))+'\n};\n'
def c_u16(name,data):
    return f'const unsigned short {name}[{len(data)}] = {{\n'+'\n'.join('  '+','.join(f'0x{v:04X}' for v in data[i:i+16])+',' for i in range(0,len(data),16))+'\n};\n'
def static_asset(name,im):
    q=im.convert('RGB').quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
    pal=q.getpalette()[:768]; cols=[tuple(pal[i:i+3]) for i in range(0,768,3)]; rle=packbits(bytes(q.getdata()))
    return c_u16(name+'_palette',[gba555(c) for c in cols])+c_u8(name+'_rle',rle)+f'const unsigned int {name}_rle_len={len(rle)}u;\n'

splash=splash_screen(); title=title_screen(); ranking=ranking_screen(); basket_bg,basket_s,basket_frame=basket_assets(); fish_bg,fish_s,fish_frame=fish_assets()
for n,im in [('splash',splash),('title',title),('ranking',ranking),('basket',basket_frame),('fish',fish_frame)]: im.convert('RGB').save(preview_dir/f'{n}.png')

header=['#ifndef OSO_VISUAL_ASSETS_H','#define OSO_VISUAL_ASSETS_H','#include <gba.h>','']
source=['#include "visual_assets.h"','']
for name,im in [('splash',splash),('title',title),('ranking',ranking)]:
    header += [f'extern const unsigned short {name}_palette[256];',f'extern const unsigned char {name}_rle[];',f'extern const unsigned int {name}_rle_len;']
    source.append(static_asset(name,im))
for name,bg,sprites in [('basket',basket_bg,basket_s),('fish',fish_bg,fish_s)]:
    cols=palette_for(bg,sprites); pix=map_bg(bg,cols); rle=packbits(pix)
    header += [f'extern const unsigned short {name}_palette[256];',f'extern const unsigned char {name}_bg_rle[];',f'extern const unsigned int {name}_bg_rle_len;']
    source += [c_u16(name+'_palette',[0]+[gba555(c) for c in cols]),c_u8(name+'_bg_rle',rle),f'const unsigned int {name}_bg_rle_len={len(rle)}u;\n']
    for sn,sim in sprites.items():
        data=map_sprite(sim,cols); w,h=sim.size
        header += [f'extern const unsigned char spr_{sn}[{len(data)}];',f'#define SPR_{sn.upper()}_W {w}',f'#define SPR_{sn.upper()}_H {h}']
        source.append(c_u8('spr_'+sn,data))
header += ['','#endif','']
(out_dir/'visual_assets.h').write_text('\n'.join(header),encoding='utf-8')
(out_dir/'visual_assets.c').write_text('\n'.join(source),encoding='utf-8')
print('generated',out_dir/'visual_assets.c', (out_dir/'visual_assets.c').stat().st_size)
