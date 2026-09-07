(function(){
  'use strict';

  if(window.__yayaDepenseAmountEditV1)return;
  window.__yayaDepenseAmountEditV1=true;

  const STYLE_ID='yaya-depense-amount-edit-style-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-charge-cost[data-yaya-depense-edit="1"]{
        cursor:pointer!important;
        text-decoration:underline!important;
        text-decoration-style:dotted!important;
        text-underline-offset:3px!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-charge-cost[data-yaya-depense-edit="1"]:hover{
        opacity:.72!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-edit,
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-achat-edit,
      #pane-chantiers .yaya-detail-expenses-pane button[onclick*="editAchat"]{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function patch(){
    installStyle();

    document.querySelectorAll('#pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-row').forEach(function(row){
      const view=row.querySelector('[data-achat-id]');
      const id=String((row.dataset&&row.dataset.achatId)||view&&view.dataset.achatId||'').trim();
      const amount=row.querySelector('.yaya-detail-charge-cost');
      if(!amount||!id)return;

      row.dataset.achatId=id;
      amount.dataset.yayaDepenseEdit='1';
      amount.dataset.achatId=id;
      amount.setAttribute('role','button');
      amount.setAttribute('tabindex','0');
      amount.setAttribute('title','Modifier la dépense');
      amount.setAttribute('aria-label','Modifier la dépense');

      row.querySelectorAll('.yaya-detail-expense-edit,.yaya-detail-achat-edit,button[onclick*="editAchat"]').forEach(function(btn){
        btn.style.setProperty('display','none','important');
        btn.setAttribute('aria-hidden','true');
      });
    });
  }

  function openEditFromAmount(amount,event){
    const id=String(amount&&amount.dataset&&amount.dataset.achatId||'').trim();
    if(!id)return;

    if(event){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    }

    try{
      if(typeof window.editAchat==='function'){
        window.editAchat(id);
        return;
      }
      if(typeof editAchat==='function'){
        editAchat(id);
      }
    }catch(err){
      try{if(typeof toast==='function')toast('Modification de la dépense indisponible',true);}catch(e){}
    }
  }

  document.addEventListener('click',function(event){
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-expenses-pane .yaya-detail-charge-cost[data-yaya-depense-edit="1"]')
      :null;
    if(amount)openEditFromAmount(amount,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-expenses-pane .yaya-detail-charge-cost[data-yaya-depense-edit="1"]')
      :null;
    if(amount)openEditFromAmount(amount,event);
  },true);

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      patch();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
