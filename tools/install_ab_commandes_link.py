from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
new='yaya-ab-commandes-link.js?v=commandes-link-3'

if new in s:
    print('AB COMMANDES v3 déjà chargé')
    raise SystemExit(0)

replaced=False
for old in (
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
    s=s[:end] + "+'<script src=\"yaya-ab-commandes-link.js?v=commandes-link-3\"><\\/script>'" + s[end:]

p.write_text(s,encoding='utf-8')
print('AB COMMANDES v3 chargé dans Yaya')
