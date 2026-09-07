(function(){
  'use strict';

  if(window.__yayaDepenseAmountEditV4)return;
  window.__yayaDepenseAmountEditV4=true;

  const STYLE_ID='yaya-depense-amount-edit-style-v4';

  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(style)return;
    style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-expenses-pane [data-yaya-depense-edit="1"],
      #pane-chantiers .ligD [data-yaya-depense-edit="1"],
      #pane-chantiers .yaya-detail-expenses-pane [data-yaya-depense-view="1"],
      #pane-chantiers .ligD [data-yaya-depense-view="1"]{
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane [data-yaya-depense-view="1"]:hover,
      #pane-chantiers .ligD [data-yaya-depense-view="1"]:hover{
        opacity:.72!important;
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

  function prepareViewTarget(el){
    if(!el)return;
    el.dataset.yayaDepenseView='1';
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    el.setAttribute('title','Voir la pièce jointe');
    el.setAttribute('aria-label','Voir la pièce jointe');
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
    return Array.from(row.querySelectorAll('button,a,[onclick]')).find(function(el){
      const onclick=String(el.getAttribute&&el.getAttribute('onclick')||'');
      const href=String(el.getAttribute&&el.getAttribute('href')||'');
      return /voirPiece\s*\(/.test(onclick)||/^https?:/i.test(href);
    })||null;
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

      const view=nativeViewButton(row);
      const supplier=row.querySelector('strong');
      const type=row.querySelector('.yaya-detail-charge-hours');
      if(view){
        prepareViewTarget(supplier);
        prepareViewTarget(type);
      }else{
        [supplier,type].forEach(function(el){
          if(!el)return;
          delete el.dataset.yayaDepenseView;
          el.removeAttribute('role');
          el.removeAttribute('tabindex');
          el.removeAttribute('title');
          el.removeAttribute('aria-label');
        });
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

      const view=legacyViewTarget(row);
      if(view){
        const cells=Array.from(row.children||[]);
        cells.forEach(function(el,index){
          if(el===amount)return;
          if(index<=2)prepareViewTarget(el);
        });
      }
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

  function openViewFromText(target,event){
    const row=target&&target.closest?target.closest('.yaya-detail-expense-row,.ligD'):null;
    if(!row)return;
    const view=row.classList.contains('yaya-detail-expense-row')?nativeViewButton(row):legacyViewTarget(row);
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
      ?event.target.closest('#pane-chantiers [data-yaya-depense-edit="1"]')
      :null;
    if(amount){openEditFromAmount(amount,event);return;}

    const viewTarget=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers [data-yaya-depense-view="1"]')
      :null;
    if(viewTarget)openViewFromText(viewTarget,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const amount=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers [data-yaya-depense-edit="1"]')
      :null;
    if(amount){openEditFromAmount(amount,event);return;}

    const viewTarget=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers [data-yaya-depense-view="1"]')
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
