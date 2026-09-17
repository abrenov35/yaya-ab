from pathlib import Path
import re

changed_files=[]

def save(path,text,old_text):
    if text!=old_text:
        Path(path).write_text(text,encoding='utf-8')
        changed_files.append(path)
        print('optimise:',path)
    else:
        print('inchangé:',path)

# 1) index.html : tous les correctifs additionnels chargent en defer, dans le même ordre.
#    On ajoute aussi la file Documents en arrière-plan juste après le verrou document.
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old=s
if 'const nonBlockingReplacement=' not in s:
    needle='  base=base.replace(marker,replacement);'
    if needle not in s:
        raise SystemExit('index.html: point defer introuvable')
    s=s.replace(
        needle,
        '  const nonBlockingReplacement=replacement.replaceAll(\'<script src="\',\'<script defer src="\');\n'
        '  base=base.replace(marker,nonBlockingReplacement);',
        1
    )
if 'documents-background-sync-v1.js?v=1' not in s:
    lines=s.splitlines(True)
    pos=next((i for i,line in enumerate(lines) if 'document-save-lock.js?v=doclock-1' in line),None)
    if pos is None:
        raise SystemExit('index.html: document-save-lock introuvable')
    indent=lines[pos][:len(lines[pos])-len(lines[pos].lstrip())]
    lines.insert(pos+1,indent+'\'<script src="documents-background-sync-v1.js?v=1"><\\/script>\'+\n')
    s=''.join(lines)
save('index.html',s,old)

# 2) Le voile de démarrage attend DOMContentLoaded, pas window.load.
#    Les scripts defer sont donc tous exécutés, mais images/iframes/ressources lentes ne bloquent plus l'utilisateur.
p=Path('index-production-base.html')
s=p.read_text(encoding='utf-8')
old=s
old_reveal="  if(document.readyState==='complete')setTimeout(show,0);\n  else window.addEventListener('load',function(){setTimeout(show,0);},{once:true});"
new_reveal="  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(show,0);},{once:true});\n  else setTimeout(show,0);"
if old_reveal in s:
    s=s.replace(old_reveal,new_reveal,1)
elif new_reveal not in s:
    raise SystemExit('index-production-base.html: reveal introuvable')
save('index-production-base.html',s,old)

# 3) index-legacy : supprime un observer global Avoir inutile grâce à la délégation de clic.
p=Path('index-legacy.html')
s=p.read_text(encoding='utf-8')
old=s
if 'YAYA_AVOIR_DELEGATION_V1' not in s:
    pattern=re.compile(
        r"\(function\(\)\{\s*function activerAvoirs\(\)\{[\s\S]*?"
        r"new MutationObserver\(activerAvoirs\)\.observe\(document\.documentElement, \{childList:true, subtree:true\}\);\s*\}\)\(\);"
    )
    replacement="""(function(){
  const YAYA_AVOIR_DELEGATION_V1=true;
  document.addEventListener('click',function(e){
    const el=e.target&&e.target.closest?e.target.closest('.b-avoir'):null;
    if(!el)return;
    e.stopPropagation();
    showAvoirTooltip(el,e);
  },false);
})();"""
    s,n=pattern.subn(replacement,s,count=1)
    if n!=1:
        raise SystemExit('index-legacy.html: observer Avoir introuvable')

# 4) index-legacy : l'ancien applyPatches scannait tout le DOM à chaque mutation.
#    Maintenant un seul passage par frame, seulement si un bloc utile a été ajouté.
old_tail="const _render=window.render;if(typeof _render==='function')window.render=function(){const r=_render.apply(this,arguments);setTimeout(applyPatches,0);return r};new MutationObserver(()=>applyPatches()).observe(document.documentElement,{childList:true,subtree:true});setTimeout(applyPatches,100);"
new_tail="""const _render=window.render;
let __yayaPatchRaf=0;
function __yayaSchedulePatches(){
  if(__yayaPatchRaf)return;
  __yayaPatchRaf=requestAnimationFrame(function(){__yayaPatchRaf=0;applyPatches();});
}
if(typeof _render==='function')window.render=function(){const r=_render.apply(this,arguments);__yayaSchedulePatches();return r};
new MutationObserver(function(mutations){
  let relevant=false;
  outer:for(const mutation of mutations){
    for(const node of mutation.addedNodes){
      if(node.nodeType!==1)continue;
      const el=node;
      if(el.matches?.('.modal,.card,.stat,.achligne,.yaya-week-hours-modal')||el.querySelector?.('.modal,.card,.stat,.achligne,.yaya-week-hours-modal')){relevant=true;break outer;}
    }
  }
  if(relevant)__yayaSchedulePatches();
}).observe(document.body,{childList:true,subtree:true});
setTimeout(__yayaSchedulePatches,100);"""
if old_tail in s:
    s=s.replace(old_tail,new_tail,1)
elif '__yayaSchedulePatches' not in s:
    raise SystemExit('index-legacy.html: observer applyPatches introuvable')
save('index-legacy.html',s,old)

# 5) Onglets chantier : ne rescanner les onglets que si un onglet a réellement été ajouté.
p=Path('chantier-tabs-soft-theme.js')
s=p.read_text(encoding='utf-8')
old=s
old_cb="""  const observer=new MutationObserver(function(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      patchCommandeTab();
    });
  });"""
new_cb="""  const observer=new MutationObserver(function(mutations){
    let relevant=false;
    outer:for(const mutation of mutations){
      for(const node of mutation.addedNodes){
        if(node.nodeType!==1)continue;
        const el=node;
        if(el.matches?.('.yaya-detail-section-tab')||el.querySelector?.('.yaya-detail-section-tab')){relevant=true;break outer;}
      }
    }
    if(!relevant||raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      patchCommandeTab();
    });
  });"""
if old_cb in s:
    s=s.replace(old_cb,new_cb,1)
elif 'outer:for(const mutation of mutations)' not in s:
    raise SystemExit('chantier-tabs-soft-theme.js: observer introuvable')
save('chantier-tabs-soft-theme.js',s,old)

# 6) Icônes œil : même principe, pas de scan complet pour une mutation sans rapport.
p=Path('colored-view-eyes.js')
s=p.read_text(encoding='utf-8')
old=s
old_eye="""    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        apply(root);
      });
    }).observe(root,{childList:true,subtree:true});"""
new_eye="""    new MutationObserver(function(mutations){
      let relevant=false;
      outer:for(const mutation of mutations){
        for(const node of mutation.addedNodes){
          if(node.nodeType!==1)continue;
          const el=node;
          if(el.matches?.('.yaya-detail-document-view,.yaya-detail-charge-view,.yaya-detail-commande-view')||el.querySelector?.('.yaya-detail-document-view,.yaya-detail-charge-view,.yaya-detail-commande-view')){relevant=true;break outer;}
        }
      }
      if(!relevant||raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        apply(root);
      });
    }).observe(root,{childList:true,subtree:true});"""
if old_eye in s:
    s=s.replace(old_eye,new_eye,1)
elif 'if(!relevant||raf)return;' not in s:
    raise SystemExit('colored-view-eyes.js: observer introuvable')
save('colored-view-eyes.js',s,old)

# 7) Page mails : ne réagit plus à chaque petit changement de ligne/bouton.
p=Path('mails-page-last10.js')
s=p.read_text(encoding='utf-8')
old=s
old_mail="new MutationObserver(function(){requestAnimationFrame(function(){installStyle();ensurePane();ensureTab();if(active)hideAllOtherContent();});}).observe(document.body,{childList:true,subtree:true});"
new_mail="new MutationObserver(function(mutations){let relevant=false;outer:for(const mutation of mutations){for(const node of [...mutation.addedNodes,...mutation.removedNodes]){if(node.nodeType!==1)continue;const el=node;if(el.matches?.('.body,.hdr,[id^=\"pane-\"]')||el.querySelector?.('.body,.hdr,[id^=\"pane-\"]')){relevant=true;break outer;}}}if(!relevant)return;requestAnimationFrame(function(){installStyle();ensurePane();ensureTab();if(active)hideAllOtherContent();});}).observe(document.body,{childList:true,subtree:true});"
if old_mail in s:
    s=s.replace(old_mail,new_mail,1)
elif '[...mutation.addedNodes,...mutation.removedNodes]' not in s:
    raise SystemExit('mails-page-last10.js: observer introuvable')
save('mails-page-last10.js',s,old)

# 8) Correctif mail : observer limité au panneau chantier et seulement aux lignes mail ajoutées.
p=Path('mail-edit-sync-fix.js')
s=p.read_text(encoding='utf-8')
old=s
old_sync="  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});"
new_sync="""  const mailObserverRoot=document.getElementById('pane-chantiers')||document.body;
  new MutationObserver(function(mutations){
    let relevant=false;
    outer:for(const mutation of mutations){
      for(const node of mutation.addedNodes){
        if(node.nodeType!==1)continue;
        const el=node;
        if(el.matches?.('.yaya-detail-mail-row,.message-ligne')||el.querySelector?.('.yaya-detail-mail-row,.message-ligne')){relevant=true;break outer;}
      }
    }
    if(relevant)schedule();
  }).observe(mailObserverRoot,{childList:true,subtree:true});"""
if old_sync in s:
    s=s.replace(old_sync,new_sync,1)
elif 'const mailObserverRoot=' not in s:
    raise SystemExit('mail-edit-sync-fix.js: observer introuvable')
save('mail-edit-sync-fix.js',s,old)

print('fichiers modifiés:',', '.join(changed_files) if changed_files else 'aucun')
