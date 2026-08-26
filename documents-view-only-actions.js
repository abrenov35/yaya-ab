(function(){
  'use strict';

  function isEditOrDelete(btn){
    if(!btn)return false;
    const txt=String(btn.textContent||'').trim();
    const onclick=String(btn.getAttribute('onclick')||'');
    return /editDocument|delDocument/i.test(onclick) || /^(✎|✏|✐|✕|×|❌)$/.test(txt);
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
