(function(){
  'use strict';

  function norm(v){
    return String(v||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim()
      .toUpperCase();
  }

  function isCommandeButton(el){
    if(!el)return false;
    if(el.matches&&el.matches('[data-tab="commandes"]'))return true;
    return norm(el.textContent)==='COMMANDES';
  }

  function wire(){
    document.querySelectorAll('button,a').forEach(function(el){
      if(isCommandeButton(el)){
        el.setAttribute('data-tab','commandes');
        el.setAttribute('data-yaya-commandes-link','1');
      }
    });
  }

  document.addEventListener('click',function(ev){
    const el=ev.target&&ev.target.closest?ev.target.closest('button,a'):null;
    if(!isCommandeButton(el))return;
    ev.preventDefault();
    ev.stopPropagation();
    if(typeof ev.stopImmediatePropagation==='function')ev.stopImmediatePropagation();
    location.href='commandes.html?v=1';
  },true);

  wire();
  const obs=new MutationObserver(wire);
  obs.observe(document.documentElement,{childList:true,subtree:true});
})();
