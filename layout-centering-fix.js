(function(){
  'use strict';

  const STYLE_ID='yaya-layout-centering-fix-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      html,body{
        width:100%!important;
        max-width:100%!important;
        overflow-x:hidden!important;
      }

      .hdr{
        width:100%!important;
        max-width:100vw!important;
        min-width:0!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        overscroll-behavior-x:contain!important;
        -webkit-overflow-scrolling:touch!important;
        scrollbar-width:none!important;
      }
      .hdr::-webkit-scrollbar{display:none!important}
      .hdr > .brand,
      .hdr > .tabs,
      .hdr > #yayaReloadBtn,
      .hdr > .sync{
        flex-shrink:0!important;
      }

      body > .body{
        width:min(980px,calc(100% - 24px))!important;
        max-width:980px!important;
        min-width:0!important;
        margin-left:auto!important;
        margin-right:auto!important;
      }

      #pane-chantiers,
      #pane-chantiers > .card{
        max-width:100%!important;
        min-width:0!important;
      }

      .yaya-finance-edit-modal .mfoot{
        display:flex!important;
        justify-content:flex-start!important;
        align-items:center!important;
        gap:0!important;
      }
      .yaya-finance-edit-modal .yaya-achat-single-save{
        min-width:140px!important;
        height:42px!important;
        padding:0 20px!important;
        border-radius:8px!important;
        background:#003D7A!important;
        color:#fff!important;
        border:1px solid #003D7A!important;
        font-size:14px!important;
        font-weight:700!important;
      }
    `;
    document.head.appendChild(style);
  }

  function resetPageHorizontalScroll(){
    if(window.scrollX)window.scrollTo(0,window.scrollY);
  }

  function isFinanceEditModal(modal){
    if(!modal)return false;
    if(modal.classList.contains('achat-edit-modal') || modal.classList.contains('charge-edit-modal'))return true;

    const title=modal.querySelector('h5');
    const txt=String(title&&title.textContent||'').trim();
    if(/^Modifier\s+(l[’']achat|la charge)/i.test(txt))return true;

    return !!modal.querySelector('#eaCh,#eaType,#eaFour,#eaDes,#eaDate,#eaMt');
  }

  function financeEditModals(){
    const modals=[];
    document.querySelectorAll('.overlay .modal').forEach(function(modal){
      if(!isFinanceEditModal(modal))return;
      modal.classList.add('yaya-finance-edit-modal');
      modals.push(modal);
    });
    return modals;
  }

  function simplifyFinanceEditButtons(){
    financeEditModals().forEach(function(modal){
      const candidates=[...modal.querySelectorAll('#pj-zone button,.mfoot button')];
      if(!candidates.length)return;

      const save=candidates.find(function(button){
        const txt=String(button.textContent||'').trim();
        const aria=String(button.getAttribute('aria-label')||'');
        return button.classList.contains('achat-icon-save') || /enregistrer/i.test(txt) || /enregistrer/i.test(aria) || txt==='✓';
      });

      if(!save)return;

      candidates.forEach(function(button){
        if(button!==save)button.remove();
      });

      save.textContent='Enregistrer';
      save.title='Enregistrer';
      save.setAttribute('aria-label','Enregistrer');
      save.classList.remove('achat-icon-btn','achat-icon-save','achat-icon-cancel');
      save.classList.add('yaya-achat-single-save');

      const pj=modal.querySelector('#pj-zone');
      if(pj && !pj.querySelector('button,input,select,textarea')){
        pj.style.display='none';
      }
    });
  }

  function centerTargetModals(){
    const modals=new Set(financeEditModals());

    ['acCh','acType','acFour','acMt','docFile','docCh','docLien','docEtat'].forEach(function(id){
      const field=document.getElementById(id);
      const modal=field&&field.closest('.modal');
      if(modal)modals.add(modal);
    });

    document.querySelectorAll('.overlay .modal').forEach(function(modal){
      const title=modal.querySelector('h5');
      if(title&&String(title.textContent||'').trim().startsWith('Ajouter un document')){
        modals.add(modal);
      }

      const saveDevis=[...modal.querySelectorAll('button')].find(function(button){
        return /Enregistrer le devis/i.test(String(button.textContent||''));
      });
      if(saveDevis)modals.add(modal);
    });

    modals.forEach(function(modal){
      const overlay=modal.closest('.overlay');
      if(!overlay)return;
      overlay.style.setProperty('align-items','center','important');
      overlay.style.setProperty('justify-content','center','important');
      overlay.style.setProperty('padding','16px','important');
    });
  }

  function applyModalFixes(){
    centerTargetModals();
    simplifyFinanceEditButtons();
  }

  function install(){
    if(window.matchMedia&&window.matchMedia('(max-width:760px)').matches)return;
    installStyle();
    applyModalFixes();
    requestAnimationFrame(resetPageHorizontalScroll);
    window.addEventListener('resize',resetPageHorizontalScroll,{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(resetPageHorizontalScroll,80);},{passive:true});

    const observer=new MutationObserver(applyModalFixes);
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
