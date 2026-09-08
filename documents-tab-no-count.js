(function(){
  'use strict';

  const STYLE_ID='yaya-documents-tab-no-count';
  let style=document.getElementById(STYLE_ID);
  if(!style){
    style=document.createElement('style');
    style.id=STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent=`
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="marche"] small,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="commandes"] small,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="depenses"] small,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="charges"] small,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="documents"] small,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="mail"] small{
      display:inline-flex!important;
      font-size:0!important;
    }

    #pane-chantiers .yaya-detail-section-tab[data-section="marche"] small[data-yaya-count]::after,
    #pane-chantiers .yaya-detail-section-tab[data-section="commandes"] small[data-yaya-count]::after,
    #pane-chantiers .yaya-detail-section-tab[data-section="depenses"] small[data-yaya-count]::after,
    #pane-chantiers .yaya-detail-section-tab[data-section="charges"] small[data-yaya-count]::after,
    #pane-chantiers .yaya-detail-section-tab[data-section="documents"] small[data-yaya-count]::after,
    #pane-chantiers .yaya-detail-section-tab[data-section="mail"] small[data-yaya-count]::after{
      content:attr(data-yaya-count);
      font-size:10.5px!important;
      line-height:1!important;
    }

    @media(max-width:760px){
      #pane-chantiers .yaya-detail-section-tab[data-section="marche"] small[data-yaya-count]::after,
      #pane-chantiers .yaya-detail-section-tab[data-section="commandes"] small[data-yaya-count]::after,
      #pane-chantiers .yaya-detail-section-tab[data-section="depenses"] small[data-yaya-count]::after,
      #pane-chantiers .yaya-detail-section-tab[data-section="charges"] small[data-yaya-count]::after,
      #pane-chantiers .yaya-detail-section-tab[data-section="documents"] small[data-yaya-count]::after,
      #pane-chantiers .yaya-detail-section-tab[data-section="mail"] small[data-yaya-count]::after{
        font-size:10px!important;
      }
    }
  `;

  function setCount(card,key,paneSelector,rowSelector){
    const tab=card.querySelector(':scope > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="'+key+'"]');
    if(!tab)return;

    const small=tab.querySelector('small');
    if(!small)return;

    const pane=card.querySelector(':scope > '+paneSelector);
    const count=pane?pane.querySelectorAll(rowSelector).length:0;
    const value=String(count);

    if(small.getAttribute('data-yaya-count')!==value){
      small.setAttribute('data-yaya-count',value);
    }
  }

  function hideAchatDocumentCount(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    pane.querySelectorAll('.kpis .stat').forEach(stat=>{
      const label=stat.querySelector('small');
      if(!label||String(label.textContent||'').trim().toLowerCase()!=='achats')return;

      const sub=stat.querySelector('.sub');
      if(!sub)return;

      const text=String(sub.textContent||'').trim();
      if(/^\d+\s+(?:doc|document)/i.test(text)){
        sub.style.setProperty('display','none','important');
      }
    });
  }

  function updateCounts(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    pane.querySelectorAll('.card:has(> .yaya-detail-section-tabs)').forEach(card=>{
      setCount(card,'marche','.yaya-detail-markets-pane',':scope > .yaya-detail-market-row');
      setCount(card,'commandes','.yaya-detail-commandes-pane',':scope > .yaya-detail-commande-row');
      setCount(card,'depenses','.yaya-detail-expenses-pane',':scope > .yaya-detail-expense-row');
      setCount(card,'charges','.yaya-detail-charges-pane',':scope > .yaya-detail-charge-row');
      setCount(card,'documents','.yaya-detail-documents-pane',':scope > .yaya-detail-document-row');
      setCount(card,'mail','.yaya-detail-mails-pane',':scope > .yaya-detail-mail-row');
    });

    hideAchatDocumentCount();
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      updateCounts();
    });
  }

  function install(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane){
      setTimeout(install,150);
      return;
    }

    updateCounts();
    new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
    window.addEventListener('yaya:data-refreshed',schedule);
  }

  install();
})();

// Dépenses chantier : affectation manuelle de stock consommé.
(function(){
  if(document.querySelector('script[data-yaya-stock-expense-loader-v1]'))return;
  const s=document.createElement('script');
  s.src='stock-expense-button.js?v=stockexpense-1';
  s.async=false;
  s.setAttribute('data-yaya-stock-expense-loader-v1','1');
  document.head.appendChild(s);
})();

// Aligne « Ajouter une dépense » et « Stock » côte à côte, y compris sur mobile.
(function(){
  const id='yaya-stock-buttons-align-v1';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-chantiers .yaya-stock-action-buttons{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:flex-end!important;
      gap:7px!important;
      width:auto!important;
      margin-left:auto!important;
      flex:0 0 auto!important;
      flex-wrap:nowrap!important;
    }
    #pane-chantiers .yaya-stock-action-buttons > .yaya-detail-section-action-button{
      margin:0!important;
      width:auto!important;
      flex:0 0 auto!important;
    }
    @media(max-width:640px){
      #pane-chantiers .yaya-stock-action-buttons{
        width:auto!important;
        margin-left:auto!important;
        gap:6px!important;
        flex-wrap:nowrap!important;
      }
      #pane-chantiers .yaya-stock-action-buttons > .yaya-detail-section-action-button{
        margin:0!important;
      }
    }
  `;
  document.head.appendChild(style);
})();

// Fiche Dépenses : le type de pièce est déjà visible dans la pièce jointe.
// On retire donc sa colonne de la liste pour donner plus de place à l'intitulé.
(function(){
  const id='yaya-depense-hide-type-column-v1';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-chantiers .yaya-detail-expense-row{
      grid-template-columns:minmax(120px,1fr) 110px 28px!important;
    }
    #pane-chantiers .yaya-detail-expense-row > .yaya-detail-charge-hours{
      display:none!important;
    }
    @media(max-width:640px){
      #pane-chantiers .yaya-detail-expense-row{
        grid-template-columns:minmax(90px,1fr) 88px 28px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();

// Fiche Dépenses : ancienne tentative de colonne date directe.
// Conservée pour compatibilité avec les lignes qui contiennent encore yaya-history-date.
(function(){
  const STYLE_ID='yaya-depense-date-column-v1';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-expense-row{
        grid-template-columns:minmax(250px,1fr) 92px 92px 28px!important;
        column-gap:12px!important;
      }
      #pane-chantiers .yaya-detail-expense-row > .yaya-expense-date-column{
        display:block!important;
        width:92px!important;
        min-width:92px!important;
        color:#6f7f94!important;
        font-size:10.5px!important;
        font-weight:600!important;
        line-height:1!important;
        text-align:right!important;
        white-space:nowrap!important;
      }
      @media(max-width:640px){
        #pane-chantiers .yaya-detail-expense-row{
          grid-template-columns:minmax(145px,1fr) 78px 78px 28px!important;
          column-gap:7px!important;
        }
        #pane-chantiers .yaya-detail-expense-row > .yaya-expense-date-column{
          width:78px!important;
          min-width:78px!important;
          font-size:10px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function placeDates(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    pane.querySelectorAll('.yaya-detail-expense-row').forEach(function(row){
      if(row.querySelector(':scope > .yaya-expense-date-column'))return;

      const source=row.querySelector('strong .yaya-history-date');
      if(!source)return;

      const date=document.createElement('span');
      date.className='yaya-expense-date-column';
      date.textContent=String(source.textContent||'').trim();
      source.remove();

      const amount=row.querySelector(':scope > .yaya-detail-charge-cost');
      if(amount)row.insertBefore(date,amount);
      else row.appendChild(date);
    });
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      placeDates();
    });
  }

  function install(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane){setTimeout(install,120);return;}
    placeDates();
    new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
    window.addEventListener('yaya:data-refreshed',schedule);
  }

  install();
})();

// Fiche Dépenses : vraie ligne unique fournisseur / description / date / montant / suppression.
// depense-amount-edit.js reconstruit le libellé et remet la date dans <strong> ;
// on force donc ce bloc en grille interne afin que la date ne puisse plus passer dessous.
(function(){
  const STYLE_ID='yaya-depense-true-single-line-v2';
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row{
      grid-template-columns:minmax(0,1fr) 92px 36px!important;
      column-gap:14px!important;
      align-items:center!important;
    }
    #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > strong{
      display:grid!important;
      grid-template-columns:max-content minmax(0,1fr) 92px!important;
      align-items:center!important;
      gap:0 12px!important;
      min-width:0!important;
      width:100%!important;
      flex-wrap:nowrap!important;
      font-size:0!important;
    }
    #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > strong > .yaya-depense-supplier{
      grid-column:1!important;
      min-width:0!important;
      white-space:nowrap!important;
    }
    #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > strong > .yaya-depense-description{
      grid-column:2!important;
      display:block!important;
      min-width:0!important;
      margin:0!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
    }
    #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > strong > .yaya-depense-inline-date{
      grid-column:3!important;
      display:block!important;
      width:92px!important;
      min-width:92px!important;
      margin:0!important;
      padding:0!important;
      text-align:right!important;
      white-space:nowrap!important;
    }
    #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row:has(.yaya-depense-inline-date) > .yaya-expense-date-column{
      display:none!important;
    }
    #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > .yaya-detail-charge-hours,
    #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > .yaya-detail-charge-view{
      display:none!important;
    }
    #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > .yaya-detail-charge-cost{
      grid-column:2!important;
      width:92px!important;
      min-width:92px!important;
      text-align:right!important;
      white-space:nowrap!important;
    }
    #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > .yaya-finance-delete-x{
      grid-column:3!important;
      justify-self:end!important;
      margin-left:0!important;
    }
    @media(max-width:640px){
      #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row{
        grid-template-columns:minmax(0,1fr) 70px 32px!important;
        column-gap:8px!important;
      }
      #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > strong{
        grid-template-columns:minmax(72px,auto) minmax(0,1fr) 76px!important;
        gap:0 7px!important;
      }
      #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > strong > .yaya-depense-supplier{
        max-width:96px!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > strong > .yaya-depense-inline-date{
        width:76px!important;
        min-width:76px!important;
        font-size:10px!important;
      }
      #pane-chantiers .card .yaya-detail-expenses-pane .yaya-detail-expense-row > .yaya-detail-charge-cost{
        width:70px!important;
        min-width:70px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();