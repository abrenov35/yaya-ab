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

// Watchdog OneDrive v2 : délai réseau + sécurité visuelle indépendante.
(function(){
  if(document.querySelector('script[data-yaya-onedrive-timeout-loader-v2]'))return;
  const s=document.createElement('script');
  s.src='onedrive-timeout-diagnostic.js?v=onedrive-timeout-2';
  s.async=false;
  s.setAttribute('data-yaya-onedrive-timeout-loader-v2','1');
  document.head.appendChild(s);
})();

// Recharger le lecteur OneDrive en dernier.
(function(){
  if(document.querySelector('script[data-yaya-onedrive-final-loader-v2]'))return;
  const s=document.createElement('script');
  s.src='onedrive-external-open.js?v=onedrive-binary-preview-12';
  s.async=false;
  s.setAttribute('data-yaya-onedrive-final-loader-v2','1');
  document.head.appendChild(s);
})();

// La toolbar doit rester sticky après tous les correctifs mobile.
(function(){
  if(document.querySelector('script[data-yaya-header-sticky-loader-v3]'))return;
  const s=document.createElement('script');
  s.src='header-sticky-toolbar.js?v=sticky-3';
  s.async=false;
  s.setAttribute('data-yaya-header-sticky-loader-v3','1');
  document.head.appendChild(s);
})();

// Affiche la version réellement déployée dans Yaya.
(function(){
  if(document.querySelector('script[data-yaya-version-indicator]'))return;
  const s=document.createElement('script');
  s.src='version-indicator.js?v=version-1';
  s.async=false;
  s.setAttribute('data-yaya-version-indicator','1');
  document.head.appendChild(s);
})();

// Simplifie et aligne les actions de la modale Ajouter le devis.
(function(){
  if(document.querySelector('script[data-yaya-devis-create-actions-loader-v1]'))return;
  const s=document.createElement('script');
  s.src='devis-create-actions-fix.js?v=devisactions-1';
  s.async=false;
  s.setAttribute('data-yaya-devis-create-actions-loader-v1','1');
  document.head.appendChild(s);
})();

// Simplifie et aligne les actions de la modale Achat / facture.
(function(){
  if(document.querySelector('script[data-yaya-achat-create-actions-loader-v1]'))return;
  const s=document.createElement('script');
  s.src='achat-create-actions-fix.js?v=achatactions-1';
  s.async=false;
  s.setAttribute('data-yaya-achat-create-actions-loader-v1','1');
  document.head.appendChild(s);
})();
