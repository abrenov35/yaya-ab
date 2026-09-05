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

// Aligne Fermer en bas de la modale Ajouter un document.
(function(){
  if(document.querySelector('script[data-yaya-document-close-bottom-loader-v1]'))return;
  const s=document.createElement('script');
  s.src='document-create-close-bottom-fix.js?v=docclose-1';
  s.async=false;
  s.setAttribute('data-yaya-document-close-bottom-loader-v1','1');
  document.head.appendChild(s);
})();

// Centre et ordonne les actions de la modale Modifier le chantier.
(function(){
  if(document.querySelector('script[data-yaya-chantier-edit-actions-loader-v3]'))return;
  const s=document.createElement('script');
  s.src='chantier-edit-actions-fix.js?v=chantieractions-3';
  s.async=false;
  s.setAttribute('data-yaya-chantier-edit-actions-loader-v3','1');
  document.head.appendChild(s);
})();

// Supprime Fermer en haut de la modale Modifier le document.
(function(){
  if(document.querySelector('script[data-yaya-document-edit-close-loader-v1]'))return;
  const s=document.createElement('script');
  s.src='document-edit-close-fix.js?v=doceditclose-1';
  s.async=false;
  s.setAttribute('data-yaya-document-edit-close-loader-v1','1');
  document.head.appendChild(s);
})();

// Masque complètement la zone Document dans la modale Modifier le devis.
(function(){
  const id='yaya-devis-edit-hide-document-zone-v1';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    .yaya-devis-fast-modal .yaya-devis-document-field,
    .yaya-devis-fast-modal .yaya-devis-fast-piece,
    .yaya-devis-fast-modal #pj-zone{
      display:none!important;
    }
  `;
  document.head.appendChild(style);
})();

// Centre horizontalement le groupe de boutons de la toolbar Yaya sur ordinateur.
(function(){
  const id='yaya-toolbar-buttons-center-v1';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    @media(min-width:1100px){
      .hdr{
        display:grid!important;
        grid-template-columns:minmax(150px,1fr) auto minmax(150px,1fr)!important;
        align-items:center!important;
        gap:16px!important;
      }
      .hdr > .brand{
        grid-column:1!important;
        justify-self:start!important;
      }
      .hdr > .tabs{
        grid-column:2!important;
        justify-self:center!important;
        justify-content:center!important;
        flex-wrap:nowrap!important;
      }
      .hdr > .sync{
        grid-column:3!important;
        justify-self:end!important;
        margin-left:0!important;
        padding-left:0!important;
      }
    }
    @media(min-width:761px) and (max-width:1099px){
      .hdr > .tabs{
        justify-content:center!important;
      }
    }
  `;
  document.head.appendChild(style);
})();

// Ajoute le bouton Importer dans la modale Modifier le devis.
(function(){
  if(document.querySelector('script[data-yaya-devis-edit-import-loader-v1]'))return;
  const s=document.createElement('script');
  s.src='devis-edit-import-button.js?v=import-1';
  s.async=false;
  s.setAttribute('data-yaya-devis-edit-import-loader-v1','1');
  document.head.appendChild(s);
})();
