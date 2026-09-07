(function(){
  'use strict';

  if(window.__yayaChargeAmountEditV1)return;
  window.__yayaChargeAmountEditV1=true;

  const STYLE_ID='yaya-charge-amount-edit-style-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-cost[data-yaya-charge-edit="1"]{
        cursor:pointer!important;
        text-decoration:underline dotted rgba(28,43,72,.42)!important;
        text-underline-offset:3px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-cost[data-yaya-charge-edit="1"]:hover{
        color:#8a5200!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-edit,
      #pane-chantiers .yaya-detail-charges-pane .charge-edit-btn,
      #pane-chantiers .yaya-detail-charges-pane button[onclick*="editAchat"]{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function prepareAmount(amount,id){
    if(!amount||!id)return;
    amount.dataset.yayaChargeEdit='1';
    amount.dataset.achatId=String(id);
    amount.setAttribute('role','button');
    amount.setAttribute('tabindex','0');
    amount.setAttribute('title','Modifier la charge');
    amount.setAttribute('aria-label','Modifier la charge');
  }

  function patch(){
    installStyle();

    document.querySelectorAll('#pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row').forEach(function(row){
      const ref=row.querySelector('[data-achat-id]');
      const id=String((row.dataset&&row.dataset.achatId)||ref&&ref.dataset.achatId||'').trim();
      const amount=row.querySelector('.yaya-detail-charge-cost');

      if(id&&amount){
        row.dataset.achatId=id;
        prepareAmount(amount,id);
      }

      row.querySelectorAll('.yaya-detail-charge-edit,.charge-edit-btn,button[onclick*="editAchat"]').forEach(function(btn){
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
      if(typeof editAchat==='function')editAchat(id);
    }catch(err){
      try{if(typeof toast==='function')toast('Modification de la charge indisponible',true);}catch(e){}
    }
  }

  document.addEventListener('click',function(event){
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-cost[data-yaya-charge-edit="1"]')
      :null;
    if(amount)openEditFromAmount(amount,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-cost[data-yaya-charge-edit="1"]')
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
