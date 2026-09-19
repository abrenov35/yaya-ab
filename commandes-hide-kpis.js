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
      .yaya-cmd-native-root .ycn-v4-status{height:30px!important;width:auto!important;min-width:0!important;max-width:165px!important;justify-self:start!important;border-radius:7px!important;padding:0 8px!important;font-size:10.8px!important;}
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
          display:grid!important;
          grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) minmax(0,.85fr)!important;
          justify-content:stretch!important;
          gap:5px!important;
          padding:6px 8px!important;
        }
        .yaya-cmd-native-root .ycn-row-summary strong{
          grid-column:1/-1!important;
          width:100%!important;
          line-height:1.2!important;
        }
        .yaya-cmd-native-root .ycn-row-summary .ycn-supplier{display:none!important;}
        .yaya-cmd-native-root .ycn-v4-status,
        .yaya-cmd-native-root .ycn-v4-pieces,
        .yaya-cmd-native-root .ycn-v4-url{
          width:100%!important;
          min-width:0!important;
          max-width:none!important;
          height:30px!important;
          margin:0!important;
          padding:0 5px!important;
          box-sizing:border-box!important;
          align-self:stretch!important;
          justify-self:stretch!important;
        }
        .yaya-cmd-native-root .ycn-v4-status{grid-column:1!important;}
        .yaya-cmd-native-root .ycn-v4-pieces{grid-column:2!important;}
        body .yaya-cmd-native-root .ycn-row .ycn-v4-url{
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
          grid-column:3!important;
        }
        body .yaya-cmd-native-root .ycn-row .ycn-v4-url:disabled{
          display:inline-flex!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if(!document.getElementById('yaya-commandes-kanban-v1')){
    const kanban=document.createElement('style');
    kanban.id='yaya-commandes-kanban-v1';
    kanban.textContent=`
      .yaya-cmd-native-root .ycn-toolbar{margin-bottom:10px!important;}
      .yaya-cmd-native-root .ycn-groups{
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:10px!important;
        align-items:start!important;
        overflow:visible!important;
      }
      .yaya-cmd-native-root .ycn-group{
        display:block!important;
        min-width:0!important;
        overflow:visible!important;
        padding:0 7px 8px!important;
        border:1px solid #dde5ee!important;
        border-radius:10px!important;
        background:#f7f9fc!important;
        box-shadow:none!important;
      }
      .yaya-cmd-native-root .ycn-group-head{
        min-height:38px!important;
        padding:0 3px!important;
        border:0!important;
        border-bottom:3px solid #b9c5d2!important;
        border-radius:0!important;
        background:transparent!important;
        color:#20364f!important;
        box-shadow:none!important;
      }
      .yaya-cmd-native-root .ycn-group-left{gap:7px!important;min-width:0!important;}
      .yaya-cmd-native-root .ycn-group-left>span:last-child{
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        font-size:11.8px!important;
        font-weight:900!important;
      }
      .yaya-cmd-native-root .ycn-dot{display:none!important;}
      .yaya-cmd-native-root .ycn-count{
        min-width:20px!important;
        height:20px!important;
        padding:0 6px!important;
        border-radius:10px!important;
        background:#e7edf4!important;
        color:#52667c!important;
        font-size:10px!important;
        font-weight:900!important;
      }
      .yaya-cmd-native-root .ycn-group-body,
      .yaya-cmd-native-root .ycn-group.open .ycn-group-body{
        display:flex!important;
        flex-direction:column!important;
        gap:7px!important;
        min-height:58px!important;
        padding:8px 0 0!important;
        border:0!important;
        background:transparent!important;
      }
      .yaya-cmd-native-root .ycn-row{
        width:100%!important;
        overflow:hidden!important;
        border:1px solid #d7e0ea!important;
        border-radius:9px!important;
        background:#fff!important;
        box-shadow:0 1px 4px rgba(22,45,73,.08)!important;
      }
      .yaya-cmd-native-root .ycn-row:hover{
        border-color:#bccbda!important;
        box-shadow:0 3px 10px rgba(22,45,73,.11)!important;
      }
      .yaya-cmd-native-root .ycn-row-top{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        gap:6px!important;
        padding:10px!important;
      }
      .yaya-cmd-native-root .ycn-row-summary{display:contents!important;}
      .yaya-cmd-native-root .ycn-row-summary strong{
        grid-column:1/-1!important;
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#102b48!important;
        font-size:12.5px!important;
        font-weight:900!important;
        line-height:1.25!important;
      }
      .yaya-cmd-native-root .ycn-row-summary .ycn-supplier{
        display:block!important;
        grid-column:1/-1!important;
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#738195!important;
        font-size:10.5px!important;
        line-height:1.2!important;
      }
      .yaya-cmd-native-root .ycn-row-summary .ycn-qte,
      .yaya-cmd-native-root .ycn-row-summary .ycn-resp{display:none!important;}
      .yaya-cmd-native-root .ycn-v4-pieces,
      .yaya-cmd-native-root .ycn-v4-url{
        width:100%!important;
        min-width:0!important;
        height:29px!important;
        padding:0 7px!important;
        border-radius:7px!important;
        font-size:10px!important;
      }
      .yaya-cmd-native-root .ycn-v4-pieces{grid-column:1!important;}
      .yaya-cmd-native-root .ycn-v4-url{grid-column:2!important;}
      .yaya-cmd-native-root .ycn-v4-status{
        grid-column:1/-1!important;
        width:100%!important;
        min-width:0!important;
        max-width:none!important;
        height:30px!important;
        justify-self:stretch!important;
        font-size:10.5px!important;
      }
      .yaya-cmd-native-root .ycn-empty{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:52px!important;
        padding:8px!important;
        color:#94a0ad!important;
        font-size:10px!important;
        font-style:normal!important;
        text-align:center!important;
      }
      .yaya-cmd-native-root .ycn-group[data-ycn-group="choice"]{background:#fbf9ff!important;border-color:#e2d7f1!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="choice"] .ycn-group-head{border-bottom-color:#9b5de5!important;color:#6d28a8!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="todo"]{background:#fffaf7!important;border-color:#f1ded4!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="todo"] .ycn-group-head{border-bottom-color:#ef8b4c!important;color:#a84a1c!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="ordered"]{background:#f8fbff!important;border-color:#d8e4f4!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="ordered"] .ycn-group-head{border-bottom-color:#3478df!important;color:#1858b8!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="received"]{background:#f8fcfa!important;border-color:#d7eadf!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="received"] .ycn-group-head{border-bottom-color:#2f9f6b!important;color:#087148!important;}
      .yaya-cmd-native-root .ycn-group[data-ycn-group="choice"] .ycn-row,
      .yaya-cmd-native-root .ycn-group[data-ycn-group="todo"] .ycn-row,
      .yaya-cmd-native-root .ycn-group[data-ycn-group="ordered"] .ycn-row,
      .yaya-cmd-native-root .ycn-group[data-ycn-group="received"] .ycn-row{box-shadow:0 1px 4px rgba(22,45,73,.08)!important;}

      @media(max-width:860px){
        .yaya-cmd-native-root .ycn-groups{
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:8px!important;
          overflow:visible!important;
          padding:1px 0 8px!important;
        }
        .yaya-cmd-native-root .ycn-group{
          width:auto!important;
          min-width:0!important;
          padding:0 5px 6px!important;
        }

        /* Règle finale : Statut | Pièce | Lien sur une seule ligne */
        .yaya-cmd-native-root .ycn-row-top{
          display:grid!important;
          grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) minmax(0,.85fr)!important;
          gap:5px!important;
          align-items:center!important;
          padding:6px 8px!important;
        }
        .yaya-cmd-native-root .ycn-row-summary{display:contents!important;}
        .yaya-cmd-native-root .ycn-row-summary strong{
          grid-column:1/-1!important;
          width:100%!important;
          line-height:1.2!important;
        }
        .yaya-cmd-native-root .ycn-row-summary .ycn-supplier{display:none!important;}
        .yaya-cmd-native-root .ycn-v4-status,
        .yaya-cmd-native-root .ycn-v4-pieces,
        .yaya-cmd-native-root .ycn-v4-url{
          width:100%!important;
          min-width:0!important;
          max-width:none!important;
          height:30px!important;
          margin:0!important;
          padding:0 5px!important;
          box-sizing:border-box!important;
          align-self:stretch!important;
          justify-self:stretch!important;
        }
        .yaya-cmd-native-root .ycn-v4-status{grid-column:1!important;}
        .yaya-cmd-native-root .ycn-v4-pieces{grid-column:2!important;}
        body .yaya-cmd-native-root .ycn-row .ycn-v4-url{
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
          grid-column:3!important;
        }
        body .yaya-cmd-native-root .ycn-row .ycn-v4-url:disabled{
          display:inline-flex!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
      }
    `;
    document.head.appendChild(kanban);
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
    // Le Kanban gère lui-même le responsive, sans styles inline concurrents.
  }

  function compactActionLabels(){
    document.querySelectorAll('.yaya-cmd-native-root .ycn-v4-pieces').forEach(function(btn){
      const raw=String(btn.textContent||'');
      const m=raw.match(/\((\d+)\)|\b(\d+)\b/);
      const n=m?Number(m[1]||m[2]||0):0;
      const has=btn.classList.contains('has');
      btn.textContent=has?(n>1?'📎 '+n:'📎 Pièce'):'📎 Pièce';
      btn.title=has?(n>1?n+' pièces jointes':'1 pièce jointe'):'Aucune pièce jointe';
      btn.setAttribute('aria-label',btn.title);
    });
    document.querySelectorAll('.yaya-cmd-native-root .ycn-v4-url').forEach(function(btn){
      btn.textContent='🔗 Lien';
      btn.title=btn.disabled?'Aucun lien':'Ouvrir le lien';
      btn.setAttribute('aria-label',btn.title);
    });
  }

  function fitStatusWidths(){
    // Les dimensions des actions Commandes sont maintenant pilotées par le rendu natif.
  }

  function refreshUi(){
    renameAddButton(document);
    removeCommandCount();
    compactActionLabels();
    forcePortraitCommandLayout();
    fitStatusWidths();
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