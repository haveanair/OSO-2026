from pathlib import Path
import re

# 비단 판정 이펙트가 생성돼도 보이지 않던 원인:
# 정적 규칙의 opacity/transform에 !important가 붙어 keyframe animation이 해당 값을 덮어쓰지 못함.
p = Path('play/character-performance-bonus.js')
s = p.read_text(encoding='utf-8')

# sseJudgeBurst2: animation이 opacity/transform을 실제로 변경할 수 있게 한다.
pat = re.compile(r'(#stage \.sseJudgeBurst2\{[^}]*?)transform:([^;]+)!important;([^}]*?)opacity:0!important;([^}]*?animation:sseJudgeBurst2)', re.S)
m = pat.search(s)
if not m:
    raise SystemExit('sseJudgeBurst2 animation-block pattern not found')
block = m.group(0)
fixed = block.replace('transform:translateX(-50%) scale(.72)!important;', 'transform:translateX(-50%) scale(.72);')
fixed = fixed.replace('opacity:0!important;', 'opacity:0;')
if 'will-change:transform,opacity;' not in fixed:
    fixed = fixed.replace('pointer-events:none!important;', 'pointer-events:none!important;will-change:transform,opacity;')
s = s[:m.start()] + fixed + s[m.end():]

# 예전 PERFECT 전용 레이어도 같은 실수가 있어 재사용 시 다시 사라지지 않도록 함께 수정.
s = s.replace('transform:translateX(-50%) scale(.72)!important;width:auto!important;',
              'transform:translateX(-50%) scale(.72);width:auto!important;')
s = s.replace('opacity:0!important;animation:ssePerfectBurst2',
              'opacity:0;animation:ssePerfectBurst2')

p.write_text(s, encoding='utf-8')

# 모바일 캐시가 과거 charbonus 파일을 계속 쓰지 않도록 운영 HTML의 캐시 버스터를 갱신한다.
p = Path('play/index.html')
h = p.read_text(encoding='utf-8')
h2, n = re.subn(r'character-performance-bonus\.js\?v=[^"\'<>\s]+',
                 'character-performance-bonus.js?v=20260908-judgefx1', h)
if n < 1:
    raise SystemExit('character-performance-bonus cache-buster tag not found')
p.write_text(h2, encoding='utf-8')

print('silk judgement animation visibility fixed; cache-buster updated')
