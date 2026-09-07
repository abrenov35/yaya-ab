(function(){
  'use strict';

  if(window.__yayaChargeSectionTabAlignmentV1)return;
  window.__yayaChargeSectionTabAlignmentV1=true;

  function clear(card){
    const action=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="charges"]');
    const rows=card.querySelectorAll(':scope > .yaya-detail-charges-pane .yaya-detail-charge-row');
    if(action){
      action.style.removeProperty('padding-left');
      action.style.removeProperty('padding-right');
    }
    rows.forEach(function(row){
      row.style.removeProperty('padding-left');
      row.style.removeProperty('padding-right');
    });
  }

  function alignCard(card){
    if(!card)return;
    if(window.innerWidth<=640){clear(card);return;}

    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;
    const first=tabs.querySelector('.yaya-detail-section-tab[data-section="marche"]')||tabs.querySelector('.yaya-detail-section-tab');
    const last=tabs.querySelector('.yaya-detail-section-tab[data-section="mail"]')||Array.from(tabs.querySelectorAll('.yaya-detail-section-tab')).pop();
    if(!first||!last)return;

    const cardRect=card.getBoundingClientRect();
    const firstRect=first.getBoundingClientRect();
    const lastRect=last.getBoundingClientRect();
    if(!cardRect.width||!firstRect.width||!lastRect.width)return;

    const left=Math.max(0,Math.round(firstRect.left-cardRect.left));
    const right=Math.max(0,Math.round(cardRect.right-lastRect.right));

    const action=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="charges"]');
    if(action){
      action.style.setProperty('padding-left',left+'px','important');
      action.style.setProperty('padding-right',right+'px','important');
      action.style.setProperty('box-sizing','border-box','important');
    }

    card.querySelectorAll(':scope > .yaya-detail-charges-pane .yaya-detail-charge-row').forEach(function(row){
      row.style.setProperty('padding-left',left+'px','important');
      row.style.setProperty('padding-right',right+'px','important');
      row.style.setProperty('box-sizing','border-box','important');
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
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('yaya:data-refreshed',schedule);
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
