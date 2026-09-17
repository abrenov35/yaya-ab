// Masque uniquement les 4 cartes KPI en haut de l'onglet Commandes
// et renforce la lisibilite du bouton Enregistrer des notes, notamment sur iPhone.
// Renomme aussi le bouton d'ajout pour expliciter son action.
(function(){
  'use strict';
  const STYLE_ID='yaya-commandes-hide-kpis';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .ycn-kpis{display:none!important;}
      .yaya-detail-section-tab[data-section="commandes"] small{display:none!important;}
      .yaya-cmd-native-root .ycn-note-actions [data-ycn-note-save]{
        background:#0b4f86!important;
        border:1px solid #083f6d!important;
        color:#fff!important;
        opacity:1!important;
        box-shadow:0 2px 6px rgba(11,79,134,.22)!important;
      }
      .yaya-cmd-native-root .ycn-note-actions [data-ycn-note-save]:disabled{
        background:#d7e3ef!important;
        border-color:#9fb3c8!important;
        color:#304b67!important;
        opacity:1!important;
        box-shadow:none!important;
      }

      /* Boutons Pièces / URL : bleu pastel sans donnée, vert pastel avec donnée. */
      .yaya-cmd-native-root .ycn-v4-pieces,
      .yaya-cmd-native-root .ycn-v4-url{
        min-width:92px!important;
        padding:0 14px!important;
        background:#e8f3ff!important;
        border-color:#b8d4ef!important;
        color:#205b8f!important;
        opacity:1!important;
      }
      .yaya-cmd-native-root .ycn-v4-pieces.has,
      .yaya-cmd-native-root .ycn-v4-url:not(:disabled){
        background:#e8f5ec!important;
        border-color:#b9dfc5!important;
        color:#287a46!important;
        opacity:1!important;
      }
      .yaya-cmd-native-root .ycn-v4-url:disabled{
        background:#e8f3ff!important;
        border-color:#b8d4ef!important;
        color:#205b8f!important;
        opacity:1!important;
        cursor:default!important;
      }

      /* Téléphone vertical : produit sur la 1re ligne, statut + Pièces + URL sur la 2e. */
      @media(max-width:760px){
        .yaya-cmd-native-root .ycn-row-top{
          grid-template-columns:minmax(0,1fr) minmax(78px,.72fr) minmax(68px,.62fr)!important;
          gap:6px!important;
          padding:8px 10px!important;
        }
        .yaya-cmd-native-root .ycn-row-summary strong{
          grid-column:1/-1!important;
          width:100%!important;
        }
        .yaya-cmd-native-root .ycn-row-summary .ycn-supplier{
          display:none!important;
        }
        .yaya-cmd-native-root .ycn-v4-status{
          grid-column:1!important;
          width:100%!important;
          min-width:0!important;
        }
        .yaya-cmd-native-root .ycn-v4-pieces{
          grid-column:2!important;
          min-width:0!important;
          width:100%!important;
          padding:0 8px!important;
        }
        body .yaya-cmd-native-root .ycn-row .ycn-v4-url{
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
          grid-column:3!important;
          min-width:0!important;
          width:100%!important;
          padding:0 8px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renameAddButton(){
    document.querySelectorAll('.yaya-cmd-native-root [data-ycn-add]').forEach(function(btn){
      if(btn.textContent.trim()!=='+ ajouter une commande')btn.textContent='+ ajouter une commande';
    });
  }

  function loadNoteChecklist(){
    if(window.__YAYA_COMMANDES_NOTE_CHECKLIST_V3)return;
    if(document.querySelector('script[data-yaya-note-checklist-v3]'))return;
    const s=document.createElement('script');
    s.src='commandes-note-checklist.js?v=5';
    s.async=true;
    s.dataset.yayaNoteChecklistV3='1';
    document.head.appendChild(s);
  }

  // Le CSS natif de commandes-native-line-v4 est injecté après ce fichier et masque URL en mobile.
  // On applique donc les propriétés critiques en style inline !important : elles ne peuvent plus être écrasées.
  function forcePortraitCommandLayout(){
    const mobile=window.matchMedia && window.matchMedia('(max-width:760px)').matches;
    document.querySelectorAll('.yaya-cmd-native-root .ycn-row-top').forEach(function(top){
      const summary=top.querySelector('.ycn-row-summary');
      const product=summary && summary.querySelector('strong');
      const supplier=summary && summary.querySelector('.ycn-supplier');
      const status=top.querySelector('.ycn-v4-status');
      const pieces=top.querySelector('.ycn-v4-pieces');
      const url=top.querySelector('.ycn-v4-url');

      if(mobile){
        top.style.setProperty('grid-template-columns','minmax(0,1fr) minmax(78px,.72fr) minmax(68px,.62fr)','important');
        top.style.setProperty('gap','6px','important');
        top.style.setProperty('padding','8px 10px','important');
        if(product){product.style.setProperty('grid-column','1 / -1','important');product.style.setProperty('width','100%','important');}
        if(supplier)supplier.style.setProperty('display','none','important');
        if(status){status.style.setProperty('grid-column','1','important');status.style.setProperty('width','100%','important');status.style.setProperty('min-width','0','important');}
        if(pieces){pieces.style.setProperty('grid-column','2','important');pieces.style.setProperty('min-width','0','important');pieces.style.setProperty('width','100%','important');pieces.style.setProperty('padding','0 8px','important');}
        if(url){
          url.style.setProperty('display','inline-flex','important');
          url.style.setProperty('align-items','center','important');
          url.style.setProperty('justify-content','center','important');
          url.style.setProperty('grid-column','3','important');
          url.style.setProperty('min-width','0','important');
          url.style.setProperty('width','100%','important');
          url.style.setProperty('padding','0 8px','important');
          url.style.setProperty('visibility','visible','important');
        }
      }else{
        ['grid-template-columns','gap','padding'].forEach(function(p){top.style.removeProperty(p);});
        if(product){product.style.removeProperty('grid-column');product.style.removeProperty('width');}
        if(supplier)supplier.style.removeProperty('display');
        [status,pieces,url].forEach(function(el){if(!el)return;['grid-column','min-width','width','padding','display','align-items','justify-content','visibility'].forEach(function(p){el.style.removeProperty(p);});});
      }
    });
  }

  function refreshUi(){
    renameAddButton();
    loadNoteChecklist();
    forcePortraitCommandLayout();
  }

  refreshUi();
  const observer=new MutationObserver(refreshUi);
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',forcePortraitCommandLayout,{passive:true});
  window.addEventListener('orientationchange',forcePortraitCommandLayout,{passive:true});
})();
