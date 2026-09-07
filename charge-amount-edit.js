(function(){
  'use strict';

  if(window.__yayaChargeAmountEditV2)return;
  window.__yayaChargeAmountEditV2=true;

  const STYLE_ID='yaya-charge-amount-edit-style-v2';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-charges-pane [data-yaya-charge-edit="1"],
      #pane-chantiers .yaya-charge-legacy-row [data-yaya-charge-edit="1"]{
        cursor:pointer!important;
        text-decoration:underline dotted rgba(28,43,72,.42)!important;
        text-underline-offset:3px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane [data-yaya-charge-edit="1"]:hover,
      #pane-chantiers .yaya-charge-legacy-row [data-yaya-charge-edit="1"]:hover{
        color:#8a5200!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-edit,
      #pane-chantiers .yaya-detail-charges-pane .charge-edit-btn,
      #pane-chantiers .yaya-detail-charges-pane button[onclick*="editAchat"],
      #pane-chantiers .yaya-detail-charges-pane button[title*="Modifier"],
      #pane-chantiers .yaya-detail-charges-pane button[aria-label*="Modifier"],
      #pane-chantiers .yaya-charge-legacy-row .charge-edit-btn,
      #pane-chantiers .yaya-charge-legacy-row button[onclick*="editAchat"],
      #pane-chantiers .yaya-charge-legacy-row button[title*="Modifier"],
      #pane-chantiers .yaya-charge-legacy-row button[aria-label*="Modifier"]{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function extractId(raw){
    const m=String(raw||'').match(/editAchat\(['\"]([^'\"]+)['\"]\)/);
    return m&&m[1]?String(m[1]):'';
  }

  function prepareAmount(amount,id){
    if(!amount||!id)return;
    amount.dataset.yayaChargeEdit='1';
    amount.dataset.achatId=String(id);
    amount.setAttribute('role','button');
    amount.setAttribute('tabindex','0');
    amount.setAttribute('title','Modifier la charge');
    amount.setAttribute('aria-label','Modifier la charge');
    if(amount.hasAttribute('onclick')){
      amount.dataset.yayaOldOnclick=amount.getAttribute('onclick')||'';
      amount.removeAttribute('onclick');
    }
  }

  function hideEditButtons(row){
    if(!row)return;
    row.querySelectorAll('.yaya-detail-charge-edit,.charge-edit-btn,button[onclick*="editAchat"],button[title*="Modifier"],button[aria-label*="Modifier"]').forEach(function(btn){
      // Ne masque jamais le bouton de visualisation de la pièce.
      if(btn.classList.contains('yaya-detail-charge-view')||/voir/i.test(String(btn.getAttribute('title')||'')))return;
      btn.style.setProperty('display','none','important');
      btn.setAttribute('aria-hidden','true');
      btn.setAttribute('tabindex','-1');
    });
  }

  function patchNativeRows(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row').forEach(function(row){
      const ref=row.querySelector('[data-achat-id]');
      const id=String((row.dataset&&row.dataset.achatId)||ref&&ref.dataset.achatId||'').trim();
      const amount=row.querySelector('.yaya-detail-charge-cost');

      if(id&&amount){
        row.dataset.achatId=id;
        prepareAmount(amount,id);
      }else if(amount){
        // Charge issue des heures salariés : pas de facture modifiable.
        amount.removeAttribute('data-yaya-charge-edit');
        amount.removeAttribute('role');
        amount.removeAttribute('tabindex');
        amount.removeAttribute('title');
        amount.removeAttribute('aria-label');
      }

      hideEditButtons(row);
    });
  }

  function patchLegacyRows(){
    document.querySelectorAll('#pane-chantiers .charge-edit-btn[onclick*="editAchat"],#pane-chantiers button[title*="Modifier la charge"][onclick*="editAchat"],#pane-chantiers button[aria-label*="Modifier la charge"][onclick*="editAchat"]').forEach(function(edit){
      const id=extractId(edit.getAttribute('onclick')||'');
      if(!id)return;

      const row=edit.closest('.achligne,.ligR,.charge-ligne,.charge-row,.controle-row,.yaya-detail-charge-row');
      if(!row)return;
      // Exclut explicitement les lignes de Dépenses.
      if(row.classList.contains('ligD')||row.classList.contains('yaya-detail-expense-row'))return;

      row.classList.add('yaya-charge-legacy-row');
      row.dataset.achatId=id;

      let amount=row.querySelector('.charge-montant,.yaya-detail-charge-cost,[data-yaya-charge-edit="1"]');
      if(!amount){
        const candidates=Array.from(row.querySelectorAll('b,strong'));
        amount=candidates.find(function(el){
          const txt=String(el.textContent||'');
          return /€|EUR|HT/i.test(txt)&&!el.closest('button');
        })||null;
      }
      if(amount)prepareAmount(amount,id);
      hideEditButtons(row);
    });
  }

  function patch(){
    installStyle();
    patchNativeRows();
    patchLegacyRows();
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
      ?event.target.closest('#pane-chantiers [data-yaya-charge-edit="1"]')
      :null;
    if(amount)openEditFromAmount(amount,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers [data-yaya-charge-edit="1"]')
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
