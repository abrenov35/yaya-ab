(function(){
  'use strict';

  function clean(){
    const pane=document.getElementById('pane-achats');
    if(!pane)return;
    pane.querySelectorAll('button').forEach(btn=>{
      const txt=(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(txt.includes('ajouter un achat')||txt.includes('ajouter une charge')){
        btn.remove();
      }
    });
  }

  clean();
  const obs=new MutationObserver(()=>clean());
  obs.observe(document.documentElement,{childList:true,subtree:true});
})();
