(function(){
  'use strict';

  const HIDDEN_TABS=new Set(['achats','sous-traitant','documents']);

  function cleanup(){
    document.querySelectorAll('.hdr .tabs .tab').forEach(btn=>{
      if(HIDDEN_TABS.has(String(btn.dataset.tab||'')))btn.remove();
    });
  }

  cleanup();
  setTimeout(cleanup,0);
  setTimeout(cleanup,220);

  const observer=new MutationObserver(cleanup);
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
