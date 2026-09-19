(function(){
  'use strict';

  if(window.__YAYA_CHARGES_TAB_NO_COUNT_V1)return;
  window.__YAYA_CHARGES_TAB_NO_COUNT_V1=true;

  const STYLE_ID='yaya-charges-tab-no-count-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="charges"] > small,
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="charges"] > span{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function clean(){
    document
      .querySelectorAll('#pane-chantiers .yaya-detail-section-tab[data-section="charges"]')
      .forEach(function(btn){
        btn.querySelectorAll(':scope > small,:scope > span').forEach(function(el){
          const value=String(el.textContent||'').replace(/\s+/g,' ').trim();
          if(/^\d+$/.test(value))el.remove();
        });
      });
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      clean();
    });
  }

  installStyle();
  clean();

  const pane=document.getElementById('pane-chantiers');
  if(pane){
    new MutationObserver(function(mutations){
      for(const mutation of mutations){
        if(mutation.addedNodes&&mutation.addedNodes.length){
          schedule();
          break;
        }
      }
    }).observe(pane,{childList:true,subtree:true});
  }

  window.addEventListener('yaya:data-refreshed',schedule,{passive:true});
})();