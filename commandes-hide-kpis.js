// Masque uniquement les 4 cartes KPI en haut de l'onglet Commandes
// et renforce la lisibilite du bouton Enregistrer des notes, notamment sur iPhone.
// Version optimisee : aucun balayage global du DOM pendant la saisie.
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

      /* Lecture "en un coup d'oeil" : plus dense, sans perdre les actions utiles. */
      .yaya-cmd-native-root .ycn-groups{gap:12px!important;}
      .yaya-cmd-native-root .ycn-group{gap:3px!important;}
      .yaya-cmd-native-root .ycn-group-head{min-height:26px!important;padding:0 2px 3px!important;}
      .yaya-cmd-native-root .ycn-group-left>span:last-child{font-size:12.5px!important;}
      .yaya-cmd-native-root .ycn-count{min-width:20px!important;height:20px!important;padding:0 6px!important;font-size:10px!important;}
      .yaya-cmd-native-root .ycn-group-body{gap:5px!important;}
      .yaya-cmd-native-root .ycn-empty{display:none!important;}
      .yaya-cmd-native-root .ycn-row{position:relative!important;border-radius:8px!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="choice"] .ycn-row{box-shadow:inset 3px 0 0 var(--ycn-purple)!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="todo"] .ycn-row{box-shadow:inset 3px 0 0 var(--ycn-orange)!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="ordered"] .ycn-row{box-shadow:inset 3px 0 0 var(--ycn-blue)!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="received"] .ycn-row{box-shadow:inset 3px 0 0 var(--ycn-green)!important;}
      .yaya-cmd-native-root .ycn-row-summary strong{font-size:13px!important;font-weight:900!important;color:#102b48!important;}
      .yaya-cmd-native-root .ycn-v4-status{height:30px!important;border-radius:7px!important;padding:0 8px!important;font-size:10.8px!important;}
      .yaya-cmd-native-root .ycn-v4-pieces,
      .yaya-cmd-native-root .ycn-v4-url{
        height:30px!important;
        min-width:0!important;
        padding:0 9px!important;
        border-radius:7px!important;
        font-size:10.5px!important;
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
      .yaya-cmd-native-root .ycn-v4-url:disabled{display:none!important;}

      @media(max-width:760px){
        .yaya-cmd-native-root .ycn-row-top{
          grid-template-columns:minmax(0,1fr) minmax(64px,.45fr) 36px!important;
          gap:5px!important;
          padding:6px 8px!important;
        }
        .yaya-cmd-native-root .ycn-row-summary strong{
          grid-column:1/-1!important;
          width:100%!important;
          line-height:1.2!important;
        }
        .yaya-cmd-native-root .ycn-row-summary .ycn-supplier{display:none!important;}
        .yaya-cmd-native-root .ycn-v4-status{grid-column:1!important;width:100%!important;min-width:0!important;}
        .yaya-cmd-native-root .ycn-v4-pieces{grid-column:2!important;min-width:0!important;width:100%!important;padding:0 7px!important;}
        body .yaya-cmd-native-root .ycn-row .ycn-v4-url:not(:disabled){
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
          grid-column:3!important;
          min-width:36px!important;
          width:36px!important;
          padding:0!important;
        }
        body .yaya-cmd-native-root .ycn-row .ycn-v4-url:disabled{display:none!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function renameAddButton(root){
    (root||document).querySelectorAll('.yaya-cmd-native-root [data-ycn-add]').forEach(function(btn){
      if(btn.textContent.trim()!=='+ Ajouter une commande')btn.textContent='+ Ajouter une commande';
    });
  }

  function removeCommandCount(){
    document.querySelectorAll(
      '#pane-chantiers .yaya-detail-section-tab[data-section="commandes"],'+
      '#pane-chantiers .yaya-detail-section-tab.yaya-commande-tab-contrast'
    ).forEach(function(btn){
      btn.querySelectorAll(':scope > small,:scope > span').forEach(function(el){
        const value=String(el.textContent||'').replace(/\s+/g,' ').trim();
        if(/^\d+$/.test(value))el.remove();
      });
    });
  }

  function loadNoteChecklist(){
    if(window.__YAYA_COMMANDES_NOTE_CHECKLIST_V3)return;
    if(document.querySelector('script[data-yaya-note-checklist-v3]'))return;
    const s=document.createElement('script');
    s.src='commandes-note-checklist.js?v=7';
    s.async=true;
    s.dataset.yayaNoteChecklistV3='1';
    document.head.appendChild(s);
  }

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
        const hasUrl=!!(url&&!url.disabled);
        top.style.setProperty('grid-template-columns',hasUrl?'minmax(0,1fr) minmax(64px,.45fr) 36px':'minmax(0,1fr) minmax(64px,.45fr)','important');
        top.style.setProperty('gap','5px','important');
        top.style.setProperty('padding','6px 8px','important');
        if(product){product.style.setProperty('grid-column','1 / -1','important');product.style.setProperty('width','100%','important');}
        if(supplier)supplier.style.setProperty('display','none','important');
        if(status){status.style.setProperty('grid-column','1','important');status.style.setProperty('width','100%','important');status.style.setProperty('min-width','0','important');}
        if(pieces){pieces.style.setProperty('grid-column','2','important');pieces.style.setProperty('min-width','0','important');pieces.style.setProperty('width','100%','important');pieces.style.setProperty('padding','0 7px','important');}
        if(url){
          if(hasUrl){
            url.style.setProperty('display','inline-flex','important');
            url.style.setProperty('align-items','center','important');
            url.style.setProperty('justify-content','center','important');
            url.style.setProperty('grid-column','3','important');
            url.style.setProperty('min-width','36px','important');
            url.style.setProperty('width','36px','important');
            url.style.setProperty('padding','0','important');
            url.style.setProperty('visibility','visible','important');
          }else{
            url.style.setProperty('display','none','important');
          }
        }
      }else{
        ['grid-template-columns','gap','padding'].forEach(function(p){top.style.removeProperty(p);});
        if(product){product.style.removeProperty('grid-column');product.style.removeProperty('width');}
        if(supplier)supplier.style.removeProperty('display');
        [status,pieces,url].forEach(function(el){if(!el)return;['grid-column','min-width','width','padding','display','align-items','justify-content','visibility'].forEach(function(p){el.style.removeProperty(p);});});
      }
    });
  }

  function compactActionLabels(){
    document.querySelectorAll('.yaya-cmd-native-root .ycn-v4-pieces').forEach(function(btn){
      const m=String(btn.textContent||'').match(/(\d+)/);
      const n=m?Number(m[1]):0;
      btn.textContent='📎 '+n;
      btn.title=n===1?'1 pièce jointe':n+' pièces jointes';
      btn.setAttribute('aria-label',btn.title);
    });
    document.querySelectorAll('.yaya-cmd-native-root .ycn-v4-url').forEach(function(btn){
      btn.textContent='🔗';
      btn.title=btn.disabled?'Aucun lien':'Ouvrir le lien';
      btn.setAttribute('aria-label',btn.title);
    });
  }

  function refreshUi(){
    renameAddButton(document);
    removeCommandCount();
    compactActionLabels();
    forcePortraitCommandLayout();
  }

  loadNoteChecklist();
  refreshUi();

  let raf=0;
  function scheduleRefresh(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      refreshUi();
    });
  }

  const observer=new MutationObserver(function(mutations){
    let relevant=false;
    outer: for(const mutation of mutations){
      for(const node of mutation.addedNodes){
        if(node.nodeType!==1)continue;
        const el=node;
        if(
          el.matches?.('.yaya-cmd-native-root,.yaya-detail-section-tabs,.yaya-detail-section-tab,[data-ycn-add]') ||
          el.querySelector?.('.yaya-cmd-native-root,.yaya-detail-section-tabs,.yaya-detail-section-tab,[data-ycn-add]')
        ){
          relevant=true;
          break outer;
        }
      }
    }
    if(relevant)scheduleRefresh();
  });
  observer.observe(document.body,{childList:true,subtree:true});

  window.addEventListener('resize',forcePortraitCommandLayout,{passive:true});
  window.addEventListener('orientationchange',forcePortraitCommandLayout,{passive:true});
})();