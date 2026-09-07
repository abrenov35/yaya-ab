(function(){
  'use strict';

  if(window.__yayaCommandeAmountEditV1)return;
  window.__yayaCommandeAmountEditV1=true;

  const STYLE_ID='yaya-commande-amount-edit-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-edit{
        display:none!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-charge-cost{
        cursor:pointer!important;
        text-decoration:underline dotted rgba(28,43,72,.42)!important;
        text-underline-offset:3px!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-charge-cost:hover{
        color:#0f4f8d!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane .yaya-commande-actions{
        width:auto!important;
        min-width:68px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function patch(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-row').forEach(function(row){
      const amount=row.querySelector('.yaya-detail-charge-cost');
      const edit=row.querySelector('.yaya-detail-commande-edit');
      if(!amount||!edit)return;

      amount.setAttribute('role','button');
      amount.setAttribute('tabindex','0');
      amount.setAttribute('title','Modifier la commande');
      amount.setAttribute('aria-label','Modifier la commande');
      amount.dataset.commandeId=String(edit.dataset.commandeId||row.dataset.commandeId||'');
    });
  }

  function openFromAmount(amount,event){
    const row=amount&&amount.closest?amount.closest('.yaya-detail-commande-row'):null;
    const edit=row?row.querySelector('.yaya-detail-commande-edit'):null;
    if(!edit)return;

    if(event){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    }

    edit.click();
  }

  document.addEventListener('click',function(event){
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-commandes-pane .yaya-detail-charge-cost')
      :null;
    if(!amount)return;
    openFromAmount(amount,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-commandes-pane .yaya-detail-charge-cost')
      :null;
    if(!amount)return;
    openFromAmount(amount,event);
  },true);

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      patch();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
