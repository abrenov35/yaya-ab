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