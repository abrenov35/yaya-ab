from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='commandes-hide-kpis.js?v=5'
new='commandes-hide-kpis.js?v=6'

if new in s:
    print('version commandes-hide-kpis deja a jour')
    raise SystemExit(0)

if old not in s:
    raise SystemExit('reference commandes-hide-kpis v5 introuvable')

s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('reference commandes-hide-kpis mise a jour')
