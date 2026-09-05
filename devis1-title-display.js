(function(){
  'use strict';

  function chantierById(id){
    try{
      return Array.isArray(S&&S.chantiers)
        ? S.chantiers.find(function(c){return String(c&&c.id)===String(id);})||null
        : null;
    }catch(e){return null;}
  }

  function apply(){
    document.querySelectorAll('.yaya-detail-market-row').forEach(function(row){
      const edit=row.querySelector('.yaya-detail-document-edit[data-kind="main"]');
      const strong=row.querySelector('strong');
      if(!edit||!strong)return;

      const c=chantierById(edit.dataset.rowId||'');
      if(!c)return;

      const objet=String(c.numero||'').trim();
      const title='Devis 1'+(objet?' - '+objet:'');

      let textNode=null;
      for(const node of strong.childNodes){
        if(node.nodeType===Node.TEXT_NODE){textNode=node;break;}
      }
      if(textNode)textNode.nodeValue=title;
      else strong.insertBefore(document.createTextNode(title),strong.firstChild);

      strong.querySelectorAll('small').forEach(function(small){
        const txt=String(small.textContent||'').trim();
        if(objet && txt==='N° '+objet)small.remove();
      });
    });
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      apply();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
