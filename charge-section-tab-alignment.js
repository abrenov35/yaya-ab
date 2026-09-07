(function(){
  'use strict';

  if(window.__yayaChargeSectionTabAlignmentV2)return;
  window.__yayaChargeSectionTabAlignmentV2=true;

  const SECTIONS=['marche','commandes','depenses','charges','documents','mail'];

  function sectionPane(card,key){
    const map={
      marche:'.yaya-detail-markets-pane',
      commandes:'.yaya-detail-commandes-pane',
      depenses:'.yaya-detail-expenses-pane',
      charges:'.yaya-detail-charges-pane',
      documents:'.yaya-detail-documents-pane',
      mail:'.yaya-detail-mails-pane'
    };
    const selector=map[key];
    return selector?card.querySelector(':scope > '+selector):null;
  }

  function clear(card){
    SECTIONS.forEach(function(key){
      const action=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="'+key+'"]');
      if(action){
        action.style.removeProperty('padding-left');
        action.style.removeProperty('padding-right');
      }
      const pane=sectionPane(card,key);
      if(!pane)return;
      pane.querySelectorAll(':scope > .yaya-detail-charge-row,:scope > .yaya-detail-document-row,:scope > .yaya-detail-commande-row').forEach(function(row){
        row.style.removeProperty('padding-left');
        row.style.removeProperty('padding-right');
      });
    });
  }

  function alignCard(card){
    if(!card)return;
    if(window.innerWidth<=640){clear(card);return;}

    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;
    const first=tabs.querySelector('.yaya-detail-section-tab[data-section="marche"]')||tabs.querySelector('.yaya-detail-section-tab');
    const allTabs=Array.from(tabs.querySelectorAll('.yaya-detail-section-tab'));
    const last=tabs.querySelector('.yaya-detail-section-tab[data-section="mail"]')||allTabs[allTabs.length-1];
    if(!first||!last)return;

    const cardRect=card.getBoundingClientRect();
    const firstRect=first.getBoundingClientRect();
    const lastRect=last.getBoundingClientRect();
    if(!cardRect.width||!firstRect.width||!lastRect.width)return;

    const left=Math.max(0,Math.round(firstRect.left-cardRect.left));
    const right=Math.max(0,Math.round(cardRect.right-lastRect.right));

    SECTIONS.forEach(function(key){
      const action=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="'+key+'"]');
      if(action){
        action.style.setProperty('padding-left',left+'px','important');
        action.style.setProperty('padding-right',right+'px','important');
        action.style.setProperty('box-sizing','border-box','important');
      }

      const pane=sectionPane(card,key);
      if(!pane)return;
      pane.querySelectorAll(':scope > .yaya-detail-charge-row,:scope > .yaya-detail-document-row,:scope > .yaya-detail-commande-row').forEach(function(row){
        row.style.setProperty('padding-left',left+'px','important');
        row.style.setProperty('padding-right',right+'px','important');
        row.style.setProperty('box-sizing','border-box','important');
      });
    });
  }

  function alignAll(){
    document.querySelectorAll('#pane-chantiers .card').forEach(function(card){
      if(card.querySelector(':scope > .yaya-detail-section-tabs'))alignCard(card);
    });
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;alignAll();});
  }

  schedule();
  setTimeout(schedule,150);
  setTimeout(schedule,700);
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('yaya:data-refreshed',schedule);
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
