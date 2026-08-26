(function(){
  'use strict';

  function isEditOrDelete(btn){
    if(!btn)return false;
    const txt=String(btn.textContent||'').trim();
    const onclick=String(btn.getAttribute('onclick')||'');
    return /editDocument|delDocument/i.test(onclick) || /^(✎|✏|✐|✕|×|❌)$/.test(txt);
  }

  function removeAddDocumentButton(){
    const pane=document.getElementById('pane-documents');
    if(!pane)return;
    pane.querySelectorAll('button').forEach(function(btn){
      const txt=String(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      const onclick=String(btn.getAttribute('onclick')||'');
      if(txt.includes('ajouter un document') || /openDocumentModal\(\)/i.test(onclick)){
        btn.remove();
      }
    });
  }

  function clean(root){
    if(!root)return;
    root.querySelectorAll('.achligne.ligD').forEach(function(row){
      row.querySelectorAll('button').forEach(function(btn){
        if(isEditOrDelete(btn))btn.remove();
      });
    });
  }

  function apply(){
    removeAddDocumentButton();
    clean(document.getElementById('pane-documents'));
    clean(document.getElementById('pane-chantiers'));
  }

  const docPane=document.getElementById('pane-documents');
  if(docPane){
    new MutationObserver(apply).observe(docPane,{childList:true,subtree:true});
  }
  const chantierPane=document.getElementById('pane-chantiers');
  if(chantierPane){
    new MutationObserver(apply).observe(chantierPane,{childList:true,subtree:true});
  }

  setTimeout(apply,0);
  setTimeout(apply,100);
  setTimeout(apply,500);
})();
