from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

new_script='commande-tab-no-count-final.js?v=1'
if new_script in s:
    print('correctif compteur Commande deja charge')
    raise SystemExit(0)

marker="'<script src=\"chantier-tabs-soft-theme.js?v=softtabs-10\"><\\/script>'+"
if marker not in s:
    raise SystemExit('reference chantier-tabs-soft-theme introuvable')

insert=marker+"\n    '<script src=\"commande-tab-no-count-final.js?v=1\"><\\/script>'+"
s=s.replace(marker,insert,1)
p.write_text(s,encoding='utf-8')
print('correctif compteur Commande ajoute apres le theme des onglets')
