from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
new='yaya-ab-commandes-link.js?v=commandes-link-14'

if new in s:
    print('AB COMMANDES v14 déjà chargé')
    raise SystemExit(0)

replaced=False
for old in (
    'yaya-ab-commandes-link.js?v=commandes-link-13',
    'yaya-ab-commandes-link.js?v=commandes-link-12',
    'yaya-ab-commandes-link.js?v=commandes-link-11',
    'yaya-ab-commandes-link.js?v=commandes-link-10',
    'yaya-ab-commandes-link.js?v=commandes-link-9',
    'yaya-ab-commandes-link.js?v=commandes-link-8',
    'yaya-ab-commandes-link.js?v=commandes-link-7',
    'yaya-ab-commandes-link.js?v=commandes-link-6',
    'yaya-ab-commandes-link.js?v=commandes-link-5',
    'yaya-ab-commandes-link.js?v=commandes-link-4',
    'yaya-ab-commandes-link.js?v=commandes-link-3',
    'yaya-ab-commandes-link.js?v=commandes-link-2',
    'yaya-ab-commandes-link.js?v=commandes-link-1',
):
    if old in s:
        s=s.replace(old,new,1)
        replaced=True
        break

if not replaced:
    needle='chantier-detail-section-tabs-mail-wrapper.js?v=detailtabs-native-commandes-3'
    pos=s.find(needle)
    if pos<0:
        raise SystemExit('Point insertion onglets chantier introuvable')
    end=s.find("<\\/script>'",pos)
    if end<0:
        raise SystemExit('Fin script wrapper introuvable')
    end += len("<\\/script>'")
    s=s[:end] + "+'<script src=\"yaya-ab-commandes-link.js?v=commandes-link-14\"><\\/script>'" + s[end:]

p.write_text(s,encoding='utf-8')
print('AB COMMANDES v14 chargé dans Yaya - navigation stable sans boucle observer')
