from pathlib import Path
import re

p = Path('play/index.html')
s = p.read_text(encoding='utf-8')

start = s.index('function playTteok(){')
end = s.index('/* POWERDUCK', start)
block = s[start:end]

old = '<div class="lifeHud" id="life">❤️❤️❤️</div>'
new = '<div class="lifeHud tteokLifeHud" id="life">❤️❤️❤️</div>'
if new not in block:
    if block.count(old) != 1:
        raise SystemExit(f'tteok life HUD target count={block.count(old)}')
    block = block.replace(old, new, 1)
    s = s[:start] + block + s[end:]

css = """\n/* v2.4.10 tteok heart HUD: speed HUD와 겹치지 않게 찰기 게이지 아래에 고정 */\n.tteokLifeHud{top:108px!important;left:10px!important;right:auto!important;z-index:18!important;display:block!important;visibility:visible!important;opacity:1!important}\n"""
if '.tteokLifeHud{' not in s:
    marker = '.feverText{top:82px!important}\n'
    if s.count(marker) != 1:
        raise SystemExit(f'tteok HUD CSS marker count={s.count(marker)}')
    s = s.replace(marker, marker + css, 1)

p.write_text(s, encoding='utf-8')
print('tteok heart HUD made visible below fever gauge')
