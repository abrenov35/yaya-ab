from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

new_script='commande-tab-no-count-final.js?v=1'
if new_script in s:
    print('correctif compteur Commande deja charge')
    raise SystemExit(0)

needle='chantier-tabs-soft-theme.js?v=softtabs-10'
lines=s.splitlines(keepends=True)
for i,line in enumerate(lines):
    if needle in line:
        ending='\n' if line.endswith('\n') else ''
        indent=line[:len(line)-len(line.lstrip())]
        lines.insert(i+1, indent+'\'<script src="commande-tab-no-count-final.js?v=1"><\\/script>\'+'+ending)
        break
else:
    raise SystemExit('reference chantier-tabs-soft-theme introuvable')

p.write_text(''.join(lines),encoding='utf-8')
print('correctif compteur Commande ajoute apres le theme des onglets')
