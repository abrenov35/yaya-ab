from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
filename='yaya-ab-commandes-link.js?v=commandes-link-1'
if filename in s:
    print('Lien AB COMMANDES déjà chargé')
    raise SystemExit(0)

lines=s.splitlines(True)
inserted=False
new=[]
for line in lines:
    new.append(line)
    if (not inserted) and 'chantier-detail-section-tabs-mail-wrapper.js?v=detailtabs-native-commandes-3' in line:
        ending='\n' if line.endswith('\n') else ''
        new.append('    \'<script src="yaya-ab-commandes-link.js?v=commandes-link-1"><\\\\/script>\'+'+ending)
        inserted=True

if not inserted:
    raise SystemExit('Point insertion onglets chantier introuvable')

s=''.join(new)
p.write_text(s,encoding='utf-8')
print('Lien AB COMMANDES installé sous les onglets chantier')
