(function(){
  'use strict';

  if(window.__yayaDuplicateDisplayGuardInstalled)return;
  window.__yayaDuplicateDisplayGuardInstalled=true;

  let timer=0;

  function chantierIdFromCard(card){
    if(!card)return '';
    const buttons=card.querySelectorAll('button');
    for(const btn of buttons){
      const code=String(btn.getAttribute('onclick')||'');
      const m=code.match(/toggleChantier\(['\"]([^'\"]+)['\"]\)/);
      if(m&&m[1])return String(m[1]);
    }
    return '';
  }

  function removeDuplicateCards(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    const seen=new Set();
    Array.from(pane.children).forEach(function(card){
      if(!card.classList||!card.classList.contains('card'))return;
      const id=chantierIdFromCard(card);
      if(!id)return;

      if(seen.has(id)){
        card.remove();
        console.warn('Doublon visuel chantier masqué :',id);
        return;
      }
      seen.add(id);
    });
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(removeDuplicateCards,0);
  }

  function start(){
    removeDuplicateCards();

    const pane=document.getElementById('pane-chantiers');
    if(pane&&!pane.dataset.yayaDuplicateGuardObserved){
      pane.dataset.yayaDuplicateGuardObserved='1';
      new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
    }

    window.addEventListener('yaya:data-refreshed',schedule);
    setInterval(function(){
      const live=document.getElementById('pane-chantiers');
      if(live&&!live.dataset.yayaDuplicateGuardObserved){
        live.dataset.yayaDuplicateGuardObserved='1';
        new MutationObserver(schedule).observe(live,{childList:true,subtree:true});
      }
      removeDuplicateCards();
    },1500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
