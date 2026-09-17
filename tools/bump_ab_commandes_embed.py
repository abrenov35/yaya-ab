from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='commandes-hide-kpis.js?v=2'
new='commandes-hide-kpis.js?v=4'

if new in s:
    print('version commandes-hide-kpis déjà à jour')
    raise SystemExit(0)

if old not in s:
    raise SystemExit('référence commandes-hide-kpis introuvable')

s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('référence commandes-hide-kpis mise à jour')
