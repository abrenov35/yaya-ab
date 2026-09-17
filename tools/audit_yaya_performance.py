from pathlib import Path
import re

ROOT=Path('.')
SKIP={'.git','node_modules','.next','dist','build'}
patterns={
  'MutationObserver': re.compile(r'\bMutationObserver\b'),
  'setInterval': re.compile(r'\bsetInterval\s*\('),
  'apiGet_force': re.compile(r'apiGet\s*\(\s*true\s*\)'),
  'await_apiPost': re.compile(r'await\s+apiPost\s*\('),
  'querySelectorAll': re.compile(r'querySelectorAll\s*\('),
  'document_write': re.compile(r'document\.write\s*\('),
  'localStorage_write': re.compile(r'localStorage\.setItem\s*\('),
  'sync_xhr': re.compile(r'\.open\s*\([^\n]*,\s*false\s*\)'),
  'busy_loop': re.compile(r'while\s*\(\s*true\s*\)|for\s*\(\s*;;\s*\)'),
  'eval': re.compile(r'\beval\s*\('),
}

files=[]
for p in ROOT.rglob('*'):
    if not p.is_file() or p.suffix.lower() not in {'.js','.html'}: continue
    if any(part in SKIP for part in p.parts): continue
    try:text=p.read_text(encoding='utf-8')
    except Exception:continue
    files.append((p,text))

print(f'AUDIT YAYA: {len(files)} fichiers JS/HTML analysés')
print('')

# Top fichiers par signaux de coût
rows=[]
for p,text in files:
    counts={k:len(rx.findall(text)) for k,rx in patterns.items()}
    score=(counts['MutationObserver']*5 + counts['setInterval']*4 + counts['apiGet_force']*5 +
           counts['await_apiPost']*2 + counts['querySelectorAll'] + counts['document_write']*4 +
           counts['sync_xhr']*10 + counts['busy_loop']*10 + counts['eval']*4)
    if score: rows.append((score,p,counts,text.count('\n')+1))
rows.sort(reverse=True,key=lambda x:x[0])
print('TOP SIGNAUX DE COÛT')
for score,p,c,lines in rows[:45]:
    nz=', '.join(f'{k}={v}' for k,v in c.items() if v)
    print(f'{score:3d}  {str(p):55s} lignes={lines:5d}  {nz}')

print('\nOBSERVERS GLOBAUX / POTENTIELLEMENT COÛTEUX')
obs_rx=re.compile(r'new\s+MutationObserver[\s\S]{0,900}?\.observe\s*\(([^,\n]+),\s*\{([^}]*)\}\)',re.M)
for p,text in files:
    for m in obs_rx.finditer(text):
        target=' '.join(m.group(1).split())
        opts=' '.join(m.group(2).split())
        if 'subtree:true' in opts.replace(' ','') or 'document' in target or 'body' in target:
            line=text.count('\n',0,m.start())+1
            snippet=' '.join(text[m.start():m.start()+220].split())
            print(f'{p}:{line} target={target} opts={opts} :: {snippet[:210]}')

print('\nINTERVALLES')
for p,text in files:
    for m in re.finditer(r'setInterval\s*\(([^\n]{0,260})',text):
        line=text.count('\n',0,m.start())+1
        print(f'{p}:{line} :: '+m.group(0)[:260].replace('\n',' '))

print('\nÉCRITURES RÉSEAU ATTENDUES DANS LE PREMIER PLAN')
for p,text in files:
    for m in re.finditer(r'await\s+apiPost\s*\(([^\n]{0,220})',text):
        line=text.count('\n',0,m.start())+1
        print(f'{p}:{line} :: '+m.group(0)[:240].replace('\n',' '))

print('\nLECTURES RÉSEAU FORCÉES')
for p,text in files:
    for m in re.finditer(r'apiGet\s*\(\s*true\s*\)',text):
        line=text.count('\n',0,m.start())+1
        print(f'{p}:{line}')

print('\nSYNCHRONES DANGEREUX')
found=False
for p,text in files:
    for key in ('sync_xhr','busy_loop'):
        rx=patterns[key]
        for m in rx.finditer(text):
            found=True
            line=text.count('\n',0,m.start())+1
            print(f'{p}:{line} {key} :: '+' '.join(text[m.start():m.start()+180].split()))
if not found: print('aucun XHR synchrone / boucle infinie statique détecté')
