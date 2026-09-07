(function(){
  'use strict';

  if(window.__yayaDepenseAmountEditV3)return;
  window.__yayaDepenseAmountEditV3=true;

  const STYLE_ID='yaya-depense-amount-edit-style-v3';

  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(style)return;
    style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-expenses-pane [data-yaya-depense-edit="1"],
      #pane-chantiers .ligD [data-yaya-depense-edit="1"]{
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-edit,
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-achat-edit,
      #pane-chantiers .yaya-detail-expenses-pane button[onclick*="editAchat"],
      #pane-chantiers .yaya-detail-expenses-pane button[title="Modifier"],
      #pane-chantiers .yaya-detail-expenses-pane button[aria-label="Modifier"],
      #pane-chantiers .ligD button[onclick*="editAchat"],
      #pane-chantiers .ligD button[title="Modifier"],
      #pane-chantiers .ligD button[aria-label="Modifier"]{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function extractId(raw){
    const m=String(raw||'').match(/(?:editMontantAchat|editAchat)\(['\"]([^'\"]+)['\"]\)/);
    return m&&m[1]?String(m[1]):'';
  }

  function hidePencils(row){
    if(!row)return;
    row.querySelectorAll('button').forEach(function(btn){
      const onclick=String(btn.getAttribute('onclick')||'');
      const title=String(btn.getAttribute('title')||'');
      const aria=String(btn.getAttribute('aria-label')||'');
      const text=String(btn.textContent||'').trim();
      const isEdit=/editAchat\s*\(/.test(onclick)
        || /modifier/i.test(title)
        || /modifier/i.test(aria)
        || /^(?:✏️?|✎|🖉)$/u.test(text);
      if(!isEdit)return;
      btn.style.setProperty('display','none','important');
      btn.setAttribute('aria-hidden','true');
      btn.tabIndex=-1;
    });
  }

  function prepareAmount(amount,id){
    if(!amount||!id)return;
    amount.dataset.yayaDepenseEdit='1';
    amount.dataset.achatId=String(id);
    amount.setAttribute('role','button');
    amount.setAttribute('tabindex','0');
    amount.setAttribute('title','Modifier la dépense');
    amount.setAttribute('aria-label','Modifier la dépense');

    const old=String(amount.getAttribute('onclick')||'');
    if(old){
      amount.dataset.yayaOldOnclick=old;
      amount.removeAttribute('onclick');
      try{amount.onclick=null;}catch(e){}
    }
  }

  function idForNativeRow(row){
    let id=String(row.dataset&&row.dataset.achatId||'').trim();
    if(id)return id;
    const holder=row.querySelector('[data-achat-id]');
    if(holder)id=String(holder.dataset.achatId||'').trim();
    if(id)return id;
    const edit=Array.from(row.querySelectorAll('[onclick]')).find(function(el){
      return /editAchat\s*\(/.test(String(el.getAttribute('onclick')||''));
    });
    return edit?extractId(edit.getAttribute('onclick')||''):'';
  }

  function patchNativeRows(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-row').forEach(function(row){
      const amount=row.querySelector('.yaya-detail-charge-cost');
      const id=idForNativeRow(row);
      if(amount&&id){
        row.dataset.achatId=id;
        prepareAmount(amount,id);
      }
      hidePencils(row);
    });
  }

  function patchLegacyRows(){
    document.querySelectorAll('#pane-chantiers .ligD').forEach(function(row){
      let amount=row.querySelector('[data-yaya-depense-edit="1"]');
      if(!amount){
        amount=Array.from(row.querySelectorAll('b,.editable,[onclick]')).find(function(el){
          return /editMontantAchat\s*\(/.test(String(el.getAttribute&&el.getAttribute('onclick')||''));
        })||null;
      }

      let id=amount?String(amount.dataset&&amount.dataset.achatId||'').trim():'';
      if(!id&&amount)id=extractId(amount.getAttribute('onclick')||amount.dataset.yayaOldOnclick||'');
      if(!id){
        const edit=Array.from(row.querySelectorAll('[onclick]')).find(function(el){
          return /editAchat\s*\(/.test(String(el.getAttribute('onclick')||''));
        });
        if(edit)id=extractId(edit.getAttribute('onclick')||'');
      }

      if(amount&&id)prepareAmount(amount,id);
      hidePencils(row);
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
      try{if(typeof toast==='function')toast('Modification de la dépense indisponible',true);}catch(e){}
    }
  }

  document.addEventListener('click',function(event){
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers [data-yaya-depense-edit="1"]')
      :null;
    if(amount)openEditFromAmount(amount,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers [data-yaya-depense-edit="1"]')
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
