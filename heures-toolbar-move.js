(function(){
  'use strict';

  const STYLE_ID='yaya-hours-toolbar-move-style';
  let syncing=false;

  function norm(v){
    return String(v||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim()
      .toUpperCase();
  }

  function isHoursButton(el){
    if(!(el instanceof HTMLButtonElement))return false;
    const txt=norm(el.textContent);
    return txt==='HEURES' || txt.endsWith(' HEURES') || txt.includes('HEURES');
  }

  function removeMailTab(tabs){
    if(!tabs)return;
    tabs.querySelectorAll('#yayaMailsTab, .tab[data-tab="mails"], .tab[data-tab="mail"]').forEach(b=>b.remove());
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .hdr .tabs .yaya-hours-toolbar-btn{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:6px!important;
        min-height:38px!important;
        padding:7px 13px!important;
        border:1px solid rgba(255,255,255,.35)!important;
        border-radius:7px!important;
        background:#294796!important;
        color:#fff!important;
        font-size:13px!important;
        font-weight:700!important;
        line-height:1!important;
        white-space:nowrap!important;
        box-shadow:none!important;
      }
      .hdr .tabs .yaya-hours-toolbar-btn:hover{background:#3453a2!important}
      @media(max-width:760px){
        .hdr .tabs .yaya-hours-toolbar-btn{
          min-height:36px!important;
          padding:6px 10px!important;
          font-size:12px!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function moveHours(){
    if(syncing)return;
    syncing=true;
    try{
      const tabs=document.querySelector('.hdr .tabs');
      if(!tabs)return;
      removeMailTab(tabs);
      const buttons=[...document.querySelectorAll('button')].filter(isHoursButton);
      if(!buttons.length)return;
      let toolbarBtn=buttons.find(b=>tabs.contains(b));
      const outside=buttons.filter(b=>!tabs.contains(b));
      if(!toolbarBtn && outside.length){
        toolbarBtn=outside.shift();
        toolbarBtn.classList.add('tab','yaya-hours-toolbar-btn');
        toolbarBtn.setAttribute('data-yaya-hours-toolbar','1');
        tabs.appendChild(toolbarBtn);
      }
      if(toolbarBtn){
        toolbarBtn.classList.add('tab','yaya-hours-toolbar-btn');
        toolbarBtn.setAttribute('data-yaya-hours-toolbar','1');
      }
      outside.forEach(b=>b.remove());
      removeMailTab(tabs);
    }finally{
      syncing=false;
    }
  }

  function install(){
    installStyle();
    moveHours();
    const obs=new MutationObserver(()=>{
      clearTimeout(window.__yayaHoursToolbarTimer);
      window.__yayaHoursToolbarTimer=setTimeout(moveHours,0);
    });
    obs.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(moveHours,120);
    setTimeout(moveHours,500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();

(function(){
  if(document.querySelector('script[data-yaya-achat-st-modal-fix]'))return;
  const s=document.createElement('script');
  s.src='achat-soustraitant-modal-fix.js?v=stmodal-1';
  s.async=false;
  s.setAttribute('data-yaya-achat-st-modal-fix','1');
  document.head.appendChild(s);
})();

(function(){
  function loadCommandeActions(){
    document.querySelectorAll('script[data-yaya-commande-actions]').forEach(x=>x.remove());
    const s=document.createElement('script');
    s.src='commande-actions.js?v=commande-actions-5';
    s.async=false;
    s.setAttribute('data-yaya-commande-actions','1');
    document.head.appendChild(s);
  }
  setTimeout(loadCommandeActions,0);
})();

(function(){
  'use strict';

  let cleaning=false;

  function cleanCommandeButtons(){
    if(cleaning)return;
    cleaning=true;
    try{
      document.querySelectorAll('.yaya-detail-commande-row').forEach(function(row){
        row.querySelectorAll('button').forEach(function(btn){
          if(!btn.closest('.yaya-commande-actions'))btn.remove();
        });
      });
    }finally{
      cleaning=false;
    }
  }

  cleanCommandeButtons();

  const root=document.getElementById('pane-chantiers')||document.documentElement;
  const obs=new MutationObserver(function(){
    clearTimeout(window.__yayaCommandeButtonCleanupTimer);
    window.__yayaCommandeButtonCleanupTimer=setTimeout(cleanCommandeButtons,0);
  });
  obs.observe(root,{childList:true,subtree:true});

  window.addEventListener('yaya:data-refreshed',cleanCommandeButtons);
  setTimeout(cleanCommandeButtons,50);
  setTimeout(cleanCommandeButtons,250);
  setTimeout(cleanCommandeButtons,800);
})();

(function(){
  'use strict';

  const STYLE_ID='yaya-commande-eye-only-style';

  function installEyeStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .yaya-detail-commande-view{
        font-size:15px!important;
        line-height:1!important;
        text-indent:0!important;
      }
      .yaya-detail-commande-view::before{
        content:none!important;
        display:none!important;
      }
    `;
    document.head.appendChild(s);
  }

  function forceEyeOnly(){
    installEyeStyle();
    document.querySelectorAll('.yaya-detail-commande-view').forEach(function(btn){
      if(btn.textContent!=='👁')btn.textContent='👁';
      btn.title='Voir';
      btn.setAttribute('aria-label','Voir');
    });
  }

  forceEyeOnly();
  const root=document.getElementById('pane-chantiers')||document.documentElement;
  const obs=new MutationObserver(function(){
    clearTimeout(window.__yayaCommandeEyeTimer);
    window.__yayaCommandeEyeTimer=setTimeout(forceEyeOnly,0);
  });
  obs.observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',forceEyeOnly);
  setTimeout(forceEyeOnly,50);
  setTimeout(forceEyeOnly,250);
  setTimeout(forceEyeOnly,800);
})();
