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

  function syncDeleteButtonId(btn){
    if(!btn||!btn.classList||!btn.classList.contains('yaya-delete-chantier-modal-btn'))return;
    if(String(btn.dataset.yayaChantierId||'').trim())return;

    const direct=String(btn.getAttribute('onclick')||'');
    let m=direct.match(/deleteExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    if(m&&m[1]){
      btn.dataset.yayaChantierId=String(m[1]);
      return;
    }

    const modal=btn.closest('.yaya-chantier-edit-modal,.modal');
    if(!modal)return;

    const save=modal.querySelector('[onclick*="saveExistingChantier"]');
    const saveCode=String(save&&save.getAttribute('onclick')||'');
    m=saveCode.match(/saveExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    if(m&&m[1]){
      btn.dataset.yayaChantierId=String(m[1]);
      return;
    }

    const select=modal.querySelector('#yayaManageChantierSelect');
    if(select&&select.value){
      btn.dataset.yayaChantierId=String(select.value).trim();
    }
  }

  function syncDeleteButtons(){
    document.querySelectorAll('.yaya-delete-chantier-modal-btn').forEach(syncDeleteButtonId);
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(function(){
      removeDuplicateCards();
      syncDeleteButtons();
    },0);
  }

  function start(){
    removeDuplicateCards();
    syncDeleteButtons();

    const pane=document.getElementById('pane-chantiers');
    if(pane&&!pane.dataset.yayaDuplicateGuardObserved){
      pane.dataset.yayaDuplicateGuardObserved='1';
      new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
    }

    document.addEventListener('pointerdown',function(e){
      const btn=e.target&&e.target.closest&&e.target.closest('.yaya-delete-chantier-modal-btn');
      if(btn)syncDeleteButtonId(btn);
    },true);

    document.addEventListener('change',function(e){
      if(e.target&&e.target.id==='yayaManageChantierSelect'){
        const modal=e.target.closest('.modal');
        const btn=modal&&modal.querySelector('.yaya-delete-chantier-modal-btn');
        if(btn){
          delete btn.dataset.yayaChantierId;
          syncDeleteButtonId(btn);
        }
      }
    },true);

    new MutationObserver(syncDeleteButtons).observe(document.documentElement,{childList:true,subtree:true});

    window.addEventListener('yaya:data-refreshed',schedule);
    setInterval(function(){
      const live=document.getElementById('pane-chantiers');
      if(live&&!live.dataset.yayaDuplicateGuardObserved){
        live.dataset.yayaDuplicateGuardObserved='1';
        new MutationObserver(schedule).observe(live,{childList:true,subtree:true});
      }
      removeDuplicateCards();
      syncDeleteButtons();
    },1500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
