from pathlib import Path
import base64, hashlib
pairs=[
    ('.github/nongae01_final.b64','play/assets/nongae-01.webp','be7a984bf0359ed4cc0b877652c4055f4d127614e6e108ba68d7ad13581c80d1',28458),
    ('.github/nongae02_final.b64','play/assets/nongae-02.webp','8400bd0b49965a46f2300f69e93bf82bbc3cba60ff9860abdc5afbe568e38337',61778),
]
for src,dst,expected,size in pairs:
    raw=Path(src).read_text(encoding='utf-8').strip()
    data=base64.b64decode(raw,validate=True)
    got=hashlib.sha256(data).hexdigest()
    if got != expected: raise SystemExit(f'{src}: SHA256 {got} != {expected}')
    if len(data)!=size: raise SystemExit(f'{src}: size {len(data)} != {size}')
    if data[:4]!=b'RIFF' or data[8:12]!=b'WEBP': raise SystemExit(f'{src}: invalid WEBP')
    Path(dst).write_bytes(data)
    print(f'OK {dst} {len(data)} {got}')
