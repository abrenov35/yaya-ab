(function(){
  'use strict';

  if(window.__yayaCommandeAmountEditV2)return;
  window.__yayaCommandeAmountEditV2=true;

  const STYLE_ID='yaya-commande-amount-edit-v2';

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
        text-decoration:none!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-charge-cost:hover{
        color:#0f4f8d!important;
        text-decoration:none!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane [data-yaya-commande-view-text="1"]{
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane [data-yaya-commande-view-text="1"]:hover{
        color:#0f4f8d!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane .yaya-commande-actions{
        width:auto!important;
        min-width:68px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function prepareViewText(el,row){
    if(!el||!row)return;
    const view=row.querySelector('.yaya-detail-commande-view:not(:disabled)');
    if(!view)return;
    el.dataset.yayaCommandeViewText='1';
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    el.setAttribute('title','Voir la commande');
    el.setAttribute('aria-label','Voir la commande');
  }

  function patch(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-row').forEach(function(row){
      const amount=row.querySelector('.yaya-detail-charge-cost');
      const edit=row.querySelector('.yaya-detail-commande-edit');

      if(amount&&edit){
        amount.setAttribute('role','button');
        amount.setAttribute('tabindex','0');
        amount.setAttribute('title','Modifier la commande');
        amount.setAttribute('aria-label','Modifier la commande');
        amount.dataset.commandeId=String(edit.dataset.commandeId||row.dataset.commandeId||'');
      }

      // Les zones texte ouvrent la visualisation de la pièce jointe.
      prepareViewText(row.querySelector('strong'),row);
      prepareViewText(row.querySelector('.yaya-detail-charge-hours'),row);
    });
  }

  function stopEvent(event){
    if(!event)return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
  }

  function openFromAmount(amount,event){
    const row=amount&&amount.closest?amount.closest('.yaya-detail-commande-row'):null;
    const edit=row?row.querySelector('.yaya-detail-commande-edit'):null;
    if(!edit)return;
    stopEvent(event);
    edit.click();
  }

  function viewFromText(text,event){
    const row=text&&text.closest?text.closest('.yaya-detail-commande-row'):null;
    const view=row?row.querySelector('.yaya-detail-commande-view:not(:disabled)'):null;
    if(!view)return;
    stopEvent(event);
    view.click();
  }

  document.addEventListener('click',function(event){
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-commandes-pane .yaya-detail-charge-cost')
      :null;
    if(amount){
      openFromAmount(amount,event);
      return;
    }

    const text=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-commandes-pane [data-yaya-commande-view-text="1"]')
      :null;
    if(text)viewFromText(text,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;

    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-commandes-pane .yaya-detail-charge-cost')
      :null;
    if(amount){
      openFromAmount(amount,event);
      return;
    }

    const text=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-commandes-pane [data-yaya-commande-view-text="1"]')
      :null;
    if(text)viewFromText(text,event);
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
