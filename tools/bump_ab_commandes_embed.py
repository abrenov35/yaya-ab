from pathlib import Path

# 1) Corrige directement le theme qui recree le badge du bouton Commande.
theme=Path('chantier-tabs-soft-theme.js')
t=theme.read_text(encoding='utf-8')
rule_marker='/* YAYA_COMMANDE_NO_COUNT_FINAL */'
if rule_marker not in t:
    anchor='    /* Actions chantier : tous les boutons ont exactement le même style. */'
    if anchor not in t:
        raise SystemExit('ancre theme onglets introuvable')
    rule='''    /* YAYA_COMMANDE_NO_COUNT_FINAL */\n    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="commandes"] > small,\n    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="commandes"] > span,\n    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab.yaya-commande-tab-contrast > small,\n    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab.yaya-commande-tab-contrast > span{\n      display:none!important;\n      visibility:hidden!important;\n      width:0!important;\n      min-width:0!important;\n      height:0!important;\n      margin:0!important;\n      padding:0!important;\n      border:0!important;\n    }\n\n'''
    t=t.replace(anchor,rule+anchor,1)
    theme.write_text(t,encoding='utf-8')
    print('theme Commande corrige: compteur masque a la source')
else:
    print('theme Commande deja corrige')

# 2) Force le navigateur a charger la nouvelle version du theme.
p=Path('index.html')
s=p.read_text(encoding='utf-8')
if 'chantier-tabs-soft-theme.js?v=softtabs-10' in s:
    s=s.replace('chantier-tabs-soft-theme.js?v=softtabs-10','chantier-tabs-soft-theme.js?v=softtabs-11',1)
elif 'chantier-tabs-soft-theme.js?v=softtabs-11' not in s:
    raise SystemExit('reference chantier-tabs-soft-theme v10/v11 introuvable')

# 3) Garde aussi le garde-fou final charge apres le theme.
new_script='commande-tab-no-count-final.js?v=1'
if new_script not in s:
    needle='chantier-tabs-soft-theme.js?v=softtabs-11'
    lines=s.splitlines(keepends=True)
    for i,line in enumerate(lines):
        if needle in line:
            ending='\n' if line.endswith('\n') else ''
            indent=line[:len(line)-len(line.lstrip())]
            lines.insert(i+1, indent+'\'<script src="commande-tab-no-count-final.js?v=1"><\\\\/script>\'+'+ending)
            s=''.join(lines)
            break
    else:
        raise SystemExit('ligne theme v11 introuvable pour garde-fou')

p.write_text(s,encoding='utf-8')
print('theme softtabs-11 + correctif compteur Commande charges')
