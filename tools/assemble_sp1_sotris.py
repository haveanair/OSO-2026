from pathlib import Path
import base64,gzip,shutil
ROOT=Path(__file__).resolve().parents[1]
parts=ROOT/'tools'/'sp1_payload'
out=ROOT/'play'/'sp1'/'sotris'/'index.html'
main=ROOT/'play'/'index.html'
loader='<script src="sp1/sotris-integration.js?v=20260903"></script>'
chunks=sorted(parts.glob('part-*.txt'))
if not chunks: raise SystemExit('SP1 payload chunks missing')
data=''.join(p.read_text(encoding='ascii').strip() for p in chunks)
out.parent.mkdir(parents=True,exist_ok=True)
out.write_bytes(gzip.decompress(base64.b64decode(data)))
text=main.read_text(encoding='utf-8')
if loader not in text:
    i=text.lower().rfind('</body>')
    if i<0: raise SystemExit('</body> not found')
    text=text[:i]+'\n<!-- SP1 SOTRIS LIVE INTEGRATION -->\n'+loader+'\n'+text[i:]
    main.write_text(text,encoding='utf-8')
shutil.rmtree(parts)
print('SP1 assembled:',out.stat().st_size,'bytes')
print('loader:',loader in main.read_text(encoding='utf-8'))
