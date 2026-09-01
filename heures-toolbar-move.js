(function(){
  'use strict';

  const STYLE_ID='yaya-hours-toolbar-move-style';
  let syncing=false;
  let moveTimer=0;

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

  function scheduleMove(delay){
    clearTimeout(moveTimer);
    moveTimer=setTimeout(moveHours,Number(delay)||0);
  }

  function install(){
    installStyle();
    moveHours();

    // La barre d'en-tête est la seule zone qui nous intéresse ici.
    // On évite de surveiller document.documentElement en permanence.
    const header=document.querySelector('.hdr');
    if(header){
      const obs=new MutationObserver(function(records){
        if(records.some(r=>r.addedNodes.length||r.removedNodes.length))scheduleMove(0);
      });
      obs.observe(header,{childList:true,subtree:true});
    }

    window.addEventListener('yaya:data-refreshed',function(){scheduleMove(0);});
    document.addEventListener('click',function(e){
      if(e.target&&e.target.closest&&e.target.closest('.hdr .tabs button'))scheduleMove(0);
    },true);

    scheduleMove(120);
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
  'use strict';

  const STYLE_ID='yaya-marche-eye-color-style';
  let eyeTimer=0;

  function installMarcheEyeStyle(){
    let s=document.getElementById(STYLE_ID);
    if(!s){
      s=document.createElement('style');
      s.id=STYLE_ID;
      document.head.appendChild(s);
    }
    s.textContent=`
      .yaya-detail-markets-pane button::before,
      .yaya-detail-markets-pane button::after,
      [data-section="marche"] button::before,
      [data-section="marche"] button::after{
        content:none!important;
        display:none!important;
      }
    `;
  }

  function forceMarcheEyeColor(){
    installMarcheEyeStyle();
    document.querySelectorAll('.yaya-detail-markets-pane button, [data-section="marche"] button').forEach(function(btn){
      const t=String(btn.title||btn.getAttribute('aria-label')||btn.textContent||'').toLowerCase();
      if(t.includes('voir')||t.includes('œil')||t.includes('oeil')){
        btn.textContent='👁️';
        btn.style.setProperty('font-size','16px','important');
      }
    });
  }

  function scheduleEye(delay){
    clearTimeout(eyeTimer);
    eyeTimer=setTimeout(forceMarcheEyeColor,Number(delay)||0);
  }

  forceMarcheEyeColor();

  // Plus de MutationObserver sur tout #pane-chantiers : on agit uniquement
  // lors d'un rafraîchissement de données ou quand l'onglet Marché est ouvert.
  window.addEventListener('yaya:data-refreshed',function(){scheduleEye(0);});
  document.addEventListener('click',function(e){
    const tab=e.target&&e.target.closest?e.target.closest('.yaya-detail-section-tab[data-section="marche"]'):null;
    if(tab)scheduleEye(0);
  },true);

  scheduleEye(50);
  setTimeout(forceMarcheEyeColor,250);
})();
