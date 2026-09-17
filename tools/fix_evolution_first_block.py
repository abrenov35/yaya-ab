from pathlib import Path


def replace_once(path, old, new, label):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    if new in text:
        print(label + ' deja applique')
        return False
    if old not in text:
        raise SystemExit(label + ' : motif introuvable')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')
    print(label + ' applique')
    return True


replace_once(
    'evolution-ca-sticky-layout.js',
    """        #pane-evolution.evo50-ready .evo50-scroll{\n          min-height:0!important;\n          height:100%!important;\n          overflow-y:auto!important;""",
    """        #pane-evolution.evo50-ready .evo50-scroll{\n          min-height:0!important;\n          height:auto!important;\n          align-self:stretch!important;\n          overflow-y:auto!important;""",
    'Evolution : hauteur du premier bloc'
)

replace_once(
    'index.html',
    'evolution-ca-sticky-layout.js?v=sticky-v51',
    'evolution-ca-sticky-layout.js?v=sticky-v52',
    'Evolution : cache buster sticky v52'
)
