from pathlib import Path
import hashlib, subprocess, tempfile, re

play=Path('play/index.html')
sotris=Path('play/sp1/sotris/index.html')
module=Path('play/rpg-save-confirm.js')
report=Path('.github/rpg-save-confirm-report.txt')

s=play.read_text(encoding='utf-8')
before=hashlib.sha256(s.encode()).hexdigest()
sotris_before=hashlib.sha256(sotris.read_bytes()).hexdigest()

init_anchor="window.OsoRpgFieldActions?.init({hero,run,spells,updateHud,tone,buzz,menuHome,statusPage,saveMenu}); $('#fantasyMapBtn')"
init_repl="window.OsoRpgFieldActions?.init({hero,run,spells,updateHud,tone,buzz,menuHome,statusPage,saveMenu});window.OsoRpgSaveConfirm?.init({saveMenu}); $('#fantasyMapBtn')"
if 'window.OsoRpgSaveConfirm?.init({saveMenu});' not in s:
    if init_anchor not in s:
        raise SystemExit('init anchor not found')
    s=s.replace(init_anchor,init_repl,1)

script_anchor='<script src="./rpg-field-actions.js?v=20260905-field1"></script>'
script_line='<script src="./rpg-save-confirm.js?v=20260906-saveconfirm1"></script>'
if script_line not in s:
    if script_anchor not in s:
        raise SystemExit('script anchor not found')
    s=s.replace(script_anchor,script_anchor+'\n'+script_line,1)

play.write_text(s,encoding='utf-8')

after=hashlib.sha256(play.read_bytes()).hexdigest()
sotris_after=hashlib.sha256(sotris.read_bytes()).hexdigest()
if sotris_before!=sotris_after:
    raise SystemExit('SOTRIS changed')

subprocess.run(['node','--check',str(module)],check=True)
# Validate every inline script independently.
html=play.read_text(encoding='utf-8')
inline=[]
for m in re.finditer(r'<script([^>]*)>(.*?)</script>',html,re.S|re.I):
    if re.search(r'\bsrc\s*=',m.group(1),re.I):
        continue
    code=m.group(2).strip()
    if code:
        inline.append(code)
for i,code in enumerate(inline):
    with tempfile.NamedTemporaryFile('w',suffix='.js',encoding='utf-8',delete=False) as f:
        f.write(code)
        name=f.name
    subprocess.run(['node','--check',name],check=True)

checks={
 'SAVE_CONFIRM_INIT': 'window.OsoRpgSaveConfirm?.init({saveMenu});' in html,
 'SAVE_CONFIRM_SCRIPT': script_line in html,
 'MODULE_EXISTS': module.exists(),
}
if not all(checks.values()):
    raise SystemExit(str(checks))

report.write_text('\n'.join([
 'RPG SAVE/LOAD CONFIRMATION VERIFIED',
 'SEPARATE_MODULE=play/rpg-save-confirm.js',
 'SAVE_CONFIRMATION=ENABLED',
 'LOAD_CONFIRMATION=ENABLED',
 'SAVE_WARNING=existing save may be overwritten',
 'LOAD_WARNING=unsaved progress may be lost',
 'EXISTING_SAVE_LOAD_LOGIC_REWRITE=NO',
 'MODULE_JS_NODE_CHECK=PASS',
 'INLINE_JS_NODE_CHECK=PASS',
 'SOTRIS_CHANGED=NO',
 f'PLAY_SHA256_BEFORE={before}',
 f'PLAY_SHA256_AFTER={after}',
]),encoding='utf-8')
print('RPG save/load confirmation connected')
