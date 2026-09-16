(function(){
'use strict';
/* Ancien lien Marché neutralisé : toutes les lignes Devis ouvrent désormais le nouveau circuit documentaire. */
function chantierId(row){
  const edit=row&&row.querySelector('.yaya-detail-document-edit');
  if(edit){
    const kind=String(edit.dataset.kind||'');
    const id=String(edit.dataset.rowId||'');
    try{
      if(kind==='main')return id;
      if(kind==='avenant'&&typeof S!=='undefined'&&Array.isArray(S.avenants)){
        const v=S.avenants.find(x=>String(x&&x.id)===id);
        if(v)return String(v.chantierId||'');
      }
    }catch(e){}
  }
  const card=row&&row.closest('.card');
  if(card){
    for(const el of card.querySelectorAll('[data-chantier-id],[onclick]')){
      if(el.dataset&&el.dataset.chantierId)return String(el.dataset.chantierId);
      const raw=String(el.getAttribute&&el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m)return m[1];
    }
  }
  return '';
}
function openNew(row){
  const cid=chantierId(row);
  if(!cid)return;
  if(typeof window.yayaOpenDevisDocuments==='function')window.yayaOpenDevisDocuments(cid);
}
function fix(row){
  const title=row.querySelector(':scope > strong');
  const view=row.querySelector('.yaya-detail-document-view');
  if(view)view.style.setProperty('display','none','important');
  if(!title)return;
  title.style.cursor='pointer';title.title='Ouvrir les devis du chantier';title.setAttribute('role','button');title.setAttribute('tabindex','0');
  if(title._yayaNewDevisBound)return;title._yayaNewDevisBound=true;
  title.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openNew(row);},true);
  title.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;e.preventDefault();e.stopImmediatePropagation();openNew(row);},true);
}
function run(){document.querySelectorAll('#pane-chantiers .yaya-detail-market-row').forEach(fix);}
run();const pane=document.getElementById('pane-chantiers');if(pane)new MutationObserver(()=>requestAnimationFrame(run)).observe(pane,{childList:true,subtree:true});
})();
