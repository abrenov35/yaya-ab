(function(){
  'use strict';

  let active={kind:'',id:''};

  function rememberFromEditButton(btn){
    if(!btn)return;
    active={
      kind:String(btn.dataset.kind||''),
      id:String(btn.dataset.rowId||'')
    };
  }

  function resolveContext(){
    if(active.id)return active;
    const modal=document.querySelector('.yaya-devis-fast-modal');
    if(!modal)return {kind:'',id:''};
    if(modal.querySelector('#edNom')){
      try{
        if(typeof focusChantier!=='undefined'&&focusChantier){
          return {kind:'main',id:String(focusChantier)};
        }
      }catch(e){}
    }
    return {kind:'',id:''};
  }

  document.addEventListener('click',function(e){
    const edit=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-document-edit'):null;
    if(edit)rememberFromEditButton(edit);
  },true);

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('.yaya-devis-fast-replace'):null;
    if(!btn)return;

    const ctx=resolveContext();
    if(!ctx.id)return;

    const type=ctx.kind==='avenant'?'avenant':'devis';

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if(typeof remplacerPJ==='function'){
      remplacerPJ(type,ctx.id);
    }else{
      try{if(typeof toast==='function')toast('Ajout de document indisponible',true);}catch(err){}
    }
  },true);
})();
