from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='yaya-ab-commandes-link.js?v=commandes-link-1'
new='yaya-ab-commandes-link.js?v=commandes-link-2'
if new in s:
    print('version déjà à jour')
    raise SystemExit(0)
if old not in s:
    raise SystemExit('référence AB COMMANDES introuvable')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('référence AB COMMANDES mise à jour')
