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

  renameAddButton();
  loadNoteChecklist();
  const observer=new MutationObserver(function(){
    renameAddButton();
    loadNoteChecklist();
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
