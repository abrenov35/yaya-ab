from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

replacements=[
    ('commandes-hide-kpis.js?v=17','commandes-hide-kpis.js?v=18'),
    ('commande-tab-no-count-final.js?v=1','commande-tab-no-count-final.js?v=2'),
]

changed=False
for old,new in replacements:
    if new in s:
        print(new+' deja charge')
        continue
    if old not in s:
        raise SystemExit('reference introuvable: '+old)
    s=s.replace(old,new,1)
    changed=True
    print(old+' -> '+new)

if changed:
    p.write_text(s,encoding='utf-8')
    print('libelle Ajouter une commande publie')
else:
    print('aucun changement necessaire')
