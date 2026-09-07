from pathlib import Path
import re

bonus_path = Path('play/character-performance-bonus.js')
index_path = Path('play/index.html')

bonus = bonus_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

# Restore the judgement presentation to the game's original showComboBurst look.
# Keep only a line-break behavior for GREAT, without introducing a replacement card design.
css_start = bonus.find('      #stage .sseGreatBurst2{')
css_end = bonus.find('      #osoNewsBtn{', css_start)
if css_start < 0 or css_end < 0:
    raise SystemExit(f'custom judgement css region not found: {css_start}, {css_end}')
bonus = bonus[:css_start] + '      #stage .comboBurstFX{white-space:pre-line!important}\n\n' + bonus[css_end:]

func_start = bonus.find('  function showStackGreatBurst(message){')
func_end = bonus.find('  function rewriteGrowMessage(msg,extra){', func_start)
if func_start < 0 or func_end < 0:
    raise SystemExit(f'custom judgement function region not found: {func_start}, {func_end}')
bonus = bonus[:func_start] + bonus[func_end:]

old_wrapper = """        if(stack&&/^GREAT!/.test(msg)){const gain=expandLatestStackPiece(.04,5,8);msg=rewriteGrowMessage(msg,gain);ensureStyle();if(showStackGreatBurst(msg))return;arguments[0]=msg}
        if(stack&&/^PERFECT/.test(msg)){const gain=expandLatestStackPiece(.06,9,14);msg=rewriteGrowMessage(msg,gain);ensureStyle();if(showStackPerfectBurst(msg))return;arguments[0]=msg}
        return original.apply(this,arguments)"""
new_wrapper = """        if(stack&&/^GREAT!/.test(msg)){
          const gain=expandLatestStackPiece(.04,5,8);msg=rewriteGrowMessage(msg,gain);
          msg=msg.replace(/^GREAT!\\s*/, 'GREAT!\\n');arguments[0]=msg
        }
        if(stack&&/^PERFECT/.test(msg)){
          const gain=expandLatestStackPiece(.06,9,14);msg=rewriteGrowMessage(msg,gain);arguments[0]=msg
        }
        return original.apply(this,arguments)"""
if old_wrapper not in bonus:
    raise SystemExit('current custom judgement wrapper not found')
bonus = bonus.replace(old_wrapper, new_wrapper, 1)

index, n = re.subn(r'(\./character-performance-bonus\.js\?v=)[^"\']+', r'\g<1>20260908-originaljudge2', index, count=1)
if n != 1:
    raise SystemExit(f'character-performance cache tag not found: {n}')

bonus_path.write_text(bonus, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')
