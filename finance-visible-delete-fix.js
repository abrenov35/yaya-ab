(function(){
  'use strict';

  if(window.__yayaFinanceVisibleDeleteFixV4)return;
  window.__yayaFinanceVisibleDeleteFixV4=true;

  const STYLE_ID='yaya-hide-finance-row-delete-v4';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent='#pane-chantiers .yaya-detail-charge-delete{display:none!important}';
    document.head.appendChild(style);
  }

  function removeRowDeleteButtons(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-charge-delete').forEach(function(btn){
      btn.remove();
    });
  }

  function apply(){
    ensureStyle();
    removeRowDeleteButtons();
  }

  apply();

  const root=document.getElementById('pane-chantiers')||document.body;
  let raf=0;
  new MutationObserver(function(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      apply();
    });
  }).observe(root,{childList:true,subtree:true});
})();
