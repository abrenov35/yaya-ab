from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='<script src="yaya-ab-commandes-link.js?v=commandes-link-1"><\\/script>'
if marker in s:
    print('Lien AB COMMANDES déjà chargé')
    raise SystemExit(0)

needle='<script src="chantier-detail-section-tabs-mail-wrapper.js?v=detailtabs-native-commandes-3"><\\/script>'
if needle not in s:
    raise SystemExit('Point insertion onglets chantier introuvable')

s=s.replace(needle, needle + marker, 1)
s=s.replace('<title>Yaya v205.571 — AB RENOV 35</title>','<title>Yaya v205.572 — AB RENOV 35</title>',1)
p.write_text(s,encoding='utf-8')
print('Lien AB COMMANDES installé sous les onglets chantier')
