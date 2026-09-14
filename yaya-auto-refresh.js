(function(){
  'use strict';

  // Synchronisation automatique volontairement désactivée.
  // Les lectures initiales et les enregistrements manuels restent disponibles.
  window.__YAYA_AUTO_SYNC_STOPPED=true;
  window.__yayaSmartRefreshInstalled=true;
  window.yayaSmartRefreshNow=async function(){return null;};
})();

// Fiche chantier : regroupe visuellement « Documents » et « Mail »
// dans un seul onglet « Documents & mails », sans modifier les données.
(function(){
  'use strict';

  const STYLE_ID='yaya-documents-mails-merged-v1';

  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){
      style=document.createElement('style');
      style.id=STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent=`
      #pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="mail"]{
        display:none!important;
      }
      #pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] small{
        display:none!important;
      }
      #pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-mails-pane[data-empty="0"]{
        display:block!important;
      }
      #pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-empty-pane[data-section="mail"]{
        display:none!important;
      }
    `;
  }

  function normalizeCard(card){
    if(!card||!card.querySelector)return;
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;

    const docTab=tabs.querySelector('.yaya-detail-section-tab[data-section="documents"]');
    const mailTab=tabs.querySelector('.yaya-detail-section-tab[data-section="mail"]');

    if(docTab){
      const strong=docTab.querySelector('strong');
      if(strong&&String(strong.textContent||'').trim()!=='Documents & mails'){
        strong.textContent='Documents & mails';
      }
    }

    if(mailTab){
      mailTab.setAttribute('aria-hidden','true');
      mailTab.tabIndex=-1;
      mailTab.style.setProperty('display','none','important');
    }

    // Si un ancien état mémorisé ouvre encore « Mail », on bascule vers
    // le nouvel onglet commun afin d'enregistrer aussi ce nouvel état.
    if(card.dataset.yayaDetailSection==='mail'&&docTab){
      try{docTab.click();}catch(e){}
      if(card.dataset.yayaDetailSection==='mail'){
        card.dataset.yayaDetailSection='documents';
        docTab.classList.add('on');
        docTab.setAttribute('aria-selected','true');
        if(mailTab){
          mailTab.classList.remove('on');
          mailTab.setAttribute('aria-selected','false');
        }
      }
    }

    const active=String(card.dataset.yayaDetailSection||'');
    const mailPane=card.querySelector(':scope > .yaya-detail-mails-pane');
    if(mailPane){
      if(active==='documents'&&mailPane.dataset.empty!=='1'){
        mailPane.style.setProperty('display','block','important');
      }else{
        mailPane.style.setProperty('display','none','important');
      }
    }

    // Ne pas afficher « Aucun document » s'il existe au moins un mail.
    if(active==='documents'){
      const docPane=card.querySelector(':scope > .yaya-detail-documents-pane');
      const emptyDoc=card.querySelector(':scope > .yaya-detail-empty-pane[data-section="documents"]');
      const hasDocs=!!(docPane&&docPane.querySelector('.yaya-detail-document-row'));
      const hasMails=!!(mailPane&&mailPane.querySelector('.yaya-detail-mail-row'));
      if(emptyDoc){
        emptyDoc.dataset.empty=(hasDocs||hasMails)?'0':'1';
        if(!hasDocs&&!hasMails)emptyDoc.textContent='Aucun document ni mail';
      }
    }
  }

  function normalizeAll(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    pane.querySelectorAll('.card:has(> .yaya-detail-section-tabs)').forEach(normalizeCard);
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      scheduled=false;
      normalizeAll();
    }));
  }

  function install(){
    installStyle();
    const pane=document.getElementById('pane-chantiers');
    if(!pane){setTimeout(install,150);return;}

    normalizeAll();
    new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
    pane.addEventListener('click',function(e){
      if(e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab'))schedule();
    },false);
    window.addEventListener('yaya:data-refreshed',schedule);
    setTimeout(schedule,300);
    setTimeout(schedule,1000);
  }

  install();
})();
