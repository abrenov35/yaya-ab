(function(){
  'use strict';

  if(window.__yayaMarcheDevisActionV1)return;
  window.__yayaMarcheDevisActionV1=true;

  const STYLE_ID='yaya-marche-devis-action-v1';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Étape 1 de la refonte : le devis quitte uniquement la barre générale. */
      #pane-chantiers .chantier-fin-toolbar > button[onclick*="openAvenant"]{
        display:none!important;
      }

      /* L'action reste disponible uniquement dans la section MARCHÉ. */
      .yaya-detail-section-action-row[data-section="marche"]{
        align-items:center!important;
      }
      .yaya-detail-section-action-row[data-section="marche"] .yaya-detail-section-action-button{
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

  function ensureMarcheAction(card){
    if(!card)return;
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;

    let row=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="marche"]');
    if(!row){
      const cid=chantierId(card);
      if(!cid)return;
      row=document.createElement('div');
      row.className='yaya-detail-section-node yaya-detail-section-action-row';
      row.dataset.section='marche';
      row.innerHTML='<strong class="yaya-detail-section-action-title">Marché</strong><button type="button" class="yaya-detail-section-action-button">＋ Ajouter un devis</button>';
      const button=row.querySelector('.yaya-detail-section-action-button');
      button.addEventListener('click',function(){
        if(typeof window.openAvenant==='function')window.openAvenant(cid);
        else if(typeof openAvenant==='function')openAvenant(cid);
      });
      tabs.insertAdjacentElement('afterend',row);
      return;
    }

    const title=row.querySelector('.yaya-detail-section-action-title');
    const button=row.querySelector('.yaya-detail-section-action-button');
    if(title)title.textContent='Marché';
    if(button)button.textContent='＋ Ajouter un devis';
  }

  function apply(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    pane.querySelectorAll('.card').forEach(ensureMarcheAction);
  }

  const pane=document.getElementById('pane-chantiers');
  if(pane&&!pane.dataset.yayaMarcheDevisObserved){
    pane.dataset.yayaMarcheDevisObserved='1';
    new MutationObserver(apply).observe(pane,{childList:true,subtree:true});
  }

  window.addEventListener('yaya:data-refreshed',apply);
  setTimeout(apply,0);
  setTimeout(apply,250);
  setTimeout(apply,800);
})();
