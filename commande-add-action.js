(function(){
  'use strict';

  if(window.__yayaCommandeSectionActionV1)return;
  window.__yayaCommandeSectionActionV1=true;

  const STYLE_ID='yaya-commande-section-action-v1';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .chantier-fin-toolbar > .chantier-command-btn{
        display:none!important;
      }
      .yaya-detail-section-action-row[data-section="commandes"]{
        align-items:center!important;
      }
      .yaya-detail-section-action-row[data-section="commandes"] .yaya-detail-section-action-button{
        margin-left:auto!important;
        background:#f7f9fb!important;
        border:1px solid #c7d2df!important;
        color:#29445f!important;
        box-shadow:none!important;
        font-weight:700!important;
      }
    `;
    document.head.appendChild(style);
  }

  function chantierId(card){
    if(!card)return '';
    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|editMontantDevis|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]);
    }
    try{
      if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);
    }catch(e){}
    return '';
  }

  function ensureCommandeAction(card){
    if(!card)return;
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;

    let row=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="commandes"]');
    if(!row){
      const cid=chantierId(card);
      if(!cid)return;
      row=document.createElement('div');
      row.className='yaya-detail-section-node yaya-detail-section-action-row';
      row.dataset.section='commandes';
      row.innerHTML='<strong class="yaya-detail-section-action-title">Commande</strong><button type="button" class="yaya-detail-section-action-button">＋ Ajouter une commande</button>';
      const button=row.querySelector('.yaya-detail-section-action-button');
      button.addEventListener('click',function(){
        if(typeof window.openCommandeForChantier==='function')window.openCommandeForChantier(cid);
      });
      tabs.insertAdjacentElement('afterend',row);
      return;
    }

    const title=row.querySelector('.yaya-detail-section-action-title');
    const button=row.querySelector('.yaya-detail-section-action-button');
    if(title)title.textContent='Commande';
    if(button)button.textContent='＋ Ajouter une commande';
  }

  function apply(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    pane.querySelectorAll('.card').forEach(ensureCommandeAction);
  }

  const pane=document.getElementById('pane-chantiers');
  if(pane&&!pane.dataset.yayaCommandeSectionObserved){
    pane.dataset.yayaCommandeSectionObserved='1';
    new MutationObserver(apply).observe(pane,{childList:true,subtree:true});
  }

  window.addEventListener('yaya:data-refreshed',apply);
  setTimeout(apply,0);
  setTimeout(apply,250);
  setTimeout(apply,800);
})();
