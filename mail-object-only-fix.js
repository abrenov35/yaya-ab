(function(){
'use strict';
function extractId(row){
  var el=[...row.querySelectorAll('[onclick]')].find(function(x){return /(voirMessageYaya|editDocument|delDocument)/.test(String(x.getAttribute('onclick')||''));});
  var raw=String(el&&el.getAttribute('onclick')||'');
  var m=raw.match(/(?:voirMessageYaya|editDocument|delDocument)\(['\"]([^'\"]+)/);
  return m&&m[1]?String(m[1]):'';
}
function normalizeActions(row){
  var id=extractId(row);
  if(!id)return;
  var actions=row.querySelector('.message-actions')||row.lastElementChild;
  if(!actions)return;
  actions.classList.add('message-actions');
  actions.innerHTML=''
    +'<button type="button" class="btn2 message-view-btn" title="Voir le message" aria-label="Voir le message" onclick="voirMessageYaya(\''+id+'\')">👁</button>'
    +'<button type="button" class="btn2 message-edit-btn" title="Modifier le mail" aria-label="Modifier le mail" onclick="editDocument(\''+id+'\')">✎</button>'
    +'<button type="button" class="x message-delete-btn" title="Supprimer le mail" aria-label="Supprimer le mail" onclick="delDocument(\''+id+'\')">✕</button>';
  actions.style.setProperty('display','grid','important');
  actions.style.setProperty('grid-template-columns','28px 28px 28px','important');
  actions.style.setProperty('column-gap','6px','important');
  actions.style.setProperty('align-items','center','important');
  actions.style.setProperty('justify-content','end','important');
  actions.style.setProperty('min-width','96px','important');
  actions.style.setProperty('height','34px','important');
  actions.style.setProperty('overflow','visible','important');
}
function fix(){
  document.querySelectorAll('#pane-chantiers .message-ligne').forEach(function(row){
    row.classList.add('yaya-detail-section-node');
    row.dataset.section='documents';
    var subject=row.querySelector('.message-categorie');
    var body=row.querySelector('.message-apercu');
    if(body){body.remove();}
    if(subject){
      subject.style.maxWidth='none';
      subject.style.width='auto';
      subject.style.whiteSpace='nowrap';
      subject.style.overflow='hidden';
      subject.style.textOverflow='ellipsis';
    }
    row.style.setProperty('grid-template-columns','100px minmax(0,1fr) 90px 96px','important');
    row.style.setProperty('height','46px','important');
    row.style.setProperty('min-height','46px','important');
    row.style.setProperty('max-height','46px','important');
    row.style.setProperty('align-items','center','important');
    row.style.setProperty('overflow','hidden','important');
    normalizeActions(row);
  });
}
fix();
setTimeout(fix,50);setTimeout(fix,250);setTimeout(fix,1000);
new MutationObserver(function(){requestAnimationFrame(fix);}).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('yaya:data-refreshed',fix);
})();
