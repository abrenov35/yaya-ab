(function(){
  'use strict';

  if(window.__yayaChargeAmountEditV3)return;
  window.__yayaChargeAmountEditV3=true;

  const STYLE_ID='yaya-charge-amount-edit-style-v3';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-charges-pane [data-yaya-charge-edit="1"],
      #pane-chantiers .yaya-charge-legacy-row [data-yaya-charge-edit="1"],
      #pane-chantiers .yaya-detail-charges-pane [data-yaya-charge-view="1"],
      #pane-chantiers .yaya-charge-legacy-row [data-yaya-charge-view="1"]{
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-detail-charges-pane [data-yaya-charge-edit="1"],
      #pane-chantiers .yaya-charge-legacy-row [data-yaya-charge-edit="1"]{
        text-decoration:underline dotted rgba(28,43,72,.42)!important;
        text-underline-offset:3px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane [data-yaya-charge-edit="1"]:hover,
      #pane-chantiers .yaya-charge-legacy-row [data-yaya-charge-edit="1"]:hover{
        color:#8a5200!important;
      }
      #pane-chantiers .yaya-detail-charges-pane [data-yaya-charge-view="1"]:hover,
      #pane-chantiers .yaya-charge-legacy-row [data-yaya-charge-view="1"]:hover{
        opacity:.72!important;
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
      try{amount.onclick=null;}catch(e){}
    }
  }

  function prepareViewTarget(el){
    if(!el)return;
    el.dataset.yayaChargeView='1';
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    el.setAttribute('title','Voir la pièce jointe');
    el.setAttribute('aria-label','Voir la pièce jointe');
  }

  function clearViewTarget(el){
    if(!el)return;
    delete el.dataset.yayaChargeView;
    el.removeAttribute('role');
    el.removeAttribute('tabindex');
    el.removeAttribute('title');
    el.removeAttribute('aria-label');
  }

  function hideEditButtons(row){
    if(!row)return;
    row.querySelectorAll('.yaya-detail-charge-edit,.charge-edit-btn,button[onclick*="editAchat"],button[title*="Modifier"],button[aria-label*="Modifier"]').forEach(function(btn){
      if(btn.classList.contains('yaya-detail-charge-view')||/voir/i.test(String(btn.getAttribute('title')||'')))return;
      btn.style.setProperty('display','none','important');
      btn.setAttribute('aria-hidden','true');
      btn.setAttribute('tabindex','-1');
    });
  }

  function nativeViewButton(row){
    if(!row)return null;
    const btn=row.querySelector('.yaya-detail-charge-view[data-achat-id],.yaya-detail-charge-view[data-lien]');
    if(!btn||btn.disabled)return null;
    const lien=String(btn.dataset&&btn.dataset.lien||'').trim();
    if(!lien||!/^https?:/i.test(lien))return null;
    return btn;
  }

  function legacyViewTarget(row){
    if(!row)return null;
    return Array.from(row.querySelectorAll('.yaya-detail-charge-view,button,a,[onclick]')).find(function(el){
      if(el.disabled)return false;
      const onclick=String(el.getAttribute&&el.getAttribute('onclick')||'');
      const href=String(el.getAttribute&&el.getAttribute('href')||'');
      const lien=String(el.dataset&&el.dataset.lien||'');
      return /voirPiece\s*\(/.test(onclick)||/^https?:/i.test(href)||/^https?:/i.test(lien);
    })||null;
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
        amount.removeAttribute('data-yaya-charge-edit');
        amount.removeAttribute('role');
        amount.removeAttribute('tabindex');
        amount.removeAttribute('title');
        amount.removeAttribute('aria-label');
      }

      const view=nativeViewButton(row);
      const supplier=row.querySelector('strong');
      const type=row.querySelector('.yaya-detail-charge-hours');
      if(view){
        prepareViewTarget(supplier);
        prepareViewTarget(type);
      }else{
        clearViewTarget(supplier);
        clearViewTarget(type);
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

      const view=legacyViewTarget(row);
      const viewTargets=Array.from(row.querySelectorAll('.charge-fournisseur,.charge-designation,.badge.b-df,.des,.yaya-detail-charge-hours,.badge.b-doc'));
      if(view)viewTargets.forEach(prepareViewTarget);
      else viewTargets.forEach(clearViewTarget);

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

  function openViewFromText(target,event){
    const row=target&&target.closest?target.closest('.yaya-detail-charge-row,.yaya-charge-legacy-row,.ligR,.charge-ligne,.charge-row,.controle-row'):null;
    if(!row)return;

    const view=row.classList.contains('yaya-detail-charge-row')&&row.closest('.yaya-detail-charges-pane')
      ?nativeViewButton(row)
      :legacyViewTarget(row);
    if(!view)return;

    if(event){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    }
    try{view.click();}catch(e){}
  }

  document.addEventListener('click',function(event){
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers [data-yaya-charge-edit="1"]')
      :null;
    if(amount){openEditFromAmount(amount,event);return;}

    const viewTarget=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers [data-yaya-charge-view="1"]')
      :null;
    if(viewTarget)openViewFromText(viewTarget,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers [data-yaya-charge-edit="1"]')
      :null;
    if(amount){openEditFromAmount(amount,event);return;}

    const viewTarget=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers [data-yaya-charge-view="1"]')
      :null;
    if(viewTarget)openViewFromText(viewTarget,event);
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
