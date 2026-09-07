(function(){
  'use strict';

  if(window.__yayaCommandeAmountEditV6)return;
  window.__yayaCommandeAmountEditV6=true;

  const STYLE_ID='yaya-commande-amount-edit-v6';

  function installStyle(){
    ['yaya-commande-amount-edit-v5','yaya-commande-amount-edit-v4'].forEach(function(id){
      const old=document.getElementById(id);if(old)old.remove();
    });
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-edit,
      #pane-chantiers .yaya-detail-commandes-pane button.yaya-detail-commande-edit,
      #pane-chantiers .yaya-detail-commandes-pane button[title="Modifier"].yaya-detail-commande-edit,
      #pane-chantiers .yaya-detail-commandes-pane button[aria-label="Modifier"].yaya-detail-commande-edit,
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-view,
      #pane-chantiers .yaya-detail-commandes-pane button.yaya-detail-commande-view,
      #pane-chantiers .yaya-detail-commandes-pane button[title="Voir"].yaya-detail-commande-view,
      #pane-chantiers .yaya-detail-commandes-pane button[aria-label="Voir"].yaya-detail-commande-view{
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
        min-width:32px!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-delete,
      #pane-chantiers .yaya-detail-commandes-pane [data-yaya-commande-delete-x="1"]{
        width:30px!important;
        min-width:30px!important;
        height:30px!important;
        min-height:30px!important;
        padding:0!important;
        margin-left:8px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid #f3a0a0!important;
        border-radius:8px!important;
        background:#fff7f7!important;
        color:#e52626!important;
        font-size:20px!important;
        line-height:1!important;
        font-weight:700!important;
        box-shadow:0 1px 3px rgba(180,35,35,.08)!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-delete:hover,
      #pane-chantiers .yaya-detail-commandes-pane [data-yaya-commande-delete-x="1"]:hover{
        background:#ffeded!important;
        border-color:#eb8383!important;
        color:#d91515!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-delete::before,
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-delete::after,
      #pane-chantiers .yaya-detail-commandes-pane [data-yaya-commande-delete-x="1"]::before,
      #pane-chantiers .yaya-detail-commandes-pane [data-yaya-commande-delete-x="1"]::after{
        content:none!important;
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function hideAction(btn){
    if(!btn)return;
    btn.style.setProperty('display','none','important');
    btn.setAttribute('aria-hidden','true');
    btn.tabIndex=-1;
  }

  function prepareDelete(btn){
    if(!btn)return;
    btn.dataset.yayaCommandeDeleteX='1';
    if(String(btn.textContent||'').trim()!=='×')btn.textContent='×';
    btn.setAttribute('title','Supprimer la commande');
    btn.setAttribute('aria-label','Supprimer la commande');
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
      const view=row.querySelector('.yaya-detail-commande-view');
      const del=row.querySelector('.yaya-detail-commande-delete,button[title*="Supprimer"],button[aria-label*="Supprimer"]');

      hideAction(edit);
      hideAction(view);
      prepareDelete(del);

      if(amount&&edit){
        amount.setAttribute('role','button');
        amount.setAttribute('tabindex','0');
        amount.setAttribute('title','Modifier la commande');
        amount.setAttribute('aria-label','Modifier la commande');
        amount.dataset.commandeId=String(edit.dataset.commandeId||row.dataset.commandeId||'');
      }

      // Les zones texte ouvrent la visualisation de la pièce jointe via le bouton masqué.
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
