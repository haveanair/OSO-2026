from pathlib import Path
import re

p=Path('play/index.html')
t=p.read_text(encoding='utf-8')
out=[]
out.append('CHARACTER RENDER INSPECTION')
out.append(f'INDEX_CHARS={len(t)}')
patterns=[
 ('HEAVEN_JADE','heaven_jade'),
 ('CURRENT_OSO_SRC','currentOsoSrc'),
 ('FRIEND_CHAR','friendChar'),
 ('DRAW_IMAGE','drawImage('),
 ('PLAYER_IMG','playerImg'),
 ('RUN_IMG','img.src=currentOsoSrc'),
 ('SPACEFIGHTER','function playSpacefighter'),
 ('SUPER_FX','superFx'),
 ('SOTRIS_LINK','sp1/sotris-integration.js'),
]
for label,pat in patterns:
 out.append('')
 out.append(f'## {label}')
 starts=[m.start() for m in re.finditer(re.escape(pat),t)]
 out.append(f'COUNT={len(starts)}')
 for i,pos in enumerate(starts[:20],1):
  a=max(0,pos-420);b=min(len(t),pos+780)
  s=t[a:b].replace('\r','').replace('\n','\\n')
  out.append(f'[{i}] {s}')
Path('.github/character-render-inspection.txt').write_text('\n'.join(out)+'\n',encoding='utf-8')
