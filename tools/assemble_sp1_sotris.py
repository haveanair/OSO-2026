from pathlib import Path
import base64,hashlib,lzma,shutil
ROOT=Path(__file__).resolve().parents[1]
parts=ROOT/'tools'/'sp1_payload_b85'
out=ROOT/'play'/'sp1'/'sotris'/'index.html'
main=ROOT/'play'/'index.html'
loader='<script src="sp1/sotris-integration.js?v=20260903"></script>'
expected='d5e9b481a6e5ecf84004b3b446d9db40d93c967ee8311dc633ee874c6536c148'
chunks=sorted(parts.glob('part-*.txt'))
if not chunks: raise SystemExit('SP1 payload chunks missing')
data=''.join(p.read_text(encoding='ascii').strip() for p in chunks)
html=lzma.decompress(base64.b85decode(data.encode('ascii')))
actual=hashlib.sha256(html).hexdigest()
if actual!=expected: raise SystemExit(f'SP1 SHA256 mismatch: {actual}')
out.parent.mkdir(parents=True,exist_ok=True)
out.write_bytes(html)
text=main.read_text(encoding='utf-8')
if loader not in text:
    i=text.lower().rfind('</body>')
    if i<0: raise SystemExit('</body> not found')
    text=text[:i]+'\n<!-- SP1 SOTRIS LIVE INTEGRATION -->\n'+loader+'\n'+text[i:]
    main.write_text(text,encoding='utf-8')
if main.read_text(encoding='utf-8').count(loader)!=1: raise SystemExit('SP1 loader count is not 1')
for p in [ROOT/'tools'/'sp1_payload',ROOT/'tools'/'sp1_payload_b85']:
    if p.exists(): shutil.rmtree(p)
for p in [ROOT/'.github'/'sp1-sotris.trigger',ROOT/'.github'/'workflows'/'integrate-sp1-sotris.yml',Path(__file__)]:
    try:p.unlink()
    except FileNotFoundError:pass
print('SP1 assembled:',out.stat().st_size,'bytes')
print('sha256:',actual)
print('loader: OK')
