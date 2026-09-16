(function(){
  'use strict';
  if(window.__yayaDevisDownloadToolbar)return;
  window.__yayaDevisDownloadToolbar=true;

  const STYLE_ID='yaya-devis-download-toolbar-style-v1';
  function style(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #yayaDevisViewer .ydd-head .yaya-devis-download-top{
        min-height:38px!important;padding:0 14px!important;border-radius:8px!important;
        border:1px solid #249457!important;background:#249457!important;color:#fff!important;
        font-size:12.5px!important;font-weight:800!important;white-space:nowrap!important;
        display:inline-flex!important;align-items:center!important;justify-content:center!important;
      }
    `;
    document.head.appendChild(s);
  }

  function isDownload(el){
    return el && /t[ée]l[ée]charger/i.test(String(el.textContent||'').trim());
  }

  function apply(){
    style();
    const viewer=document.getElementById('yayaDevisViewer');
    if(!viewer)return;
    const actions=viewer.querySelector('.ydd-head .ydd-actions');
    if(!actions)return;

    let btn=actions.querySelector('.yaya-devis-download-top');
    if(!btn){
      const candidates=[...document.querySelectorAll('button,a')].filter(function(el){
        return isDownload(el) && !el.closest('.ydd-head') && !el.closest('iframe');
      });
      btn=candidates.find(function(el){return el.offsetParent!==null;}) || candidates[0];
      if(!btn)return;
      btn.classList.add('yaya-devis-download-top');
      actions.insertBefore(btn,actions.firstChild);
    }
  }

  let pending=false;
  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(function(){pending=false;apply();});
  }
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',schedule,true);
  schedule();
})();
