(function(){
  'use strict';

  if(window.__yayaDevisAmountClickEditV2)return;
  window.__yayaDevisAmountClickEditV2=true;

  const STYLE_ID='yaya-devis-amount-click-edit-style-v2';

  function installStyle(){
    const old=document.getElementById('yaya-devis-amount-click-edit-style-v1');
    if(old)old.remove();
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-document-edit{display:none!important;}
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row .yaya-detail-charge-cost{cursor:pointer!important;text-decoration:none!important;}
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row .yaya-detail-charge-cost:hover{opacity:.72!important;text-decoration:none!important;}
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row .yaya-detail-charge-cost:focus{outline:2px solid #9eb8d2!important;outline-offset:2px!important;border-radius:4px!important;text-decoration:none!important;}
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row .yaya-detail-document-delete{margin-left:10px!important;font-size:0!important;color:#d92d20!important;}
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row .yaya-detail-document-delete::before{content:'×'!important;display:block!important;font-family:Arial,sans-serif!important;font-size:22px!important;font-weight:700!important;line-height:1!important;color:#d92d20!important;}
      @media(max-width:640px){#pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row .yaya-detail-document-delete{margin-left:6px!important;}}
    `;
    document.head.appendChild(style);
  }

  function contextFromRow(row){
    if(!row)return null;
    const edit=row.querySelector('.yaya-detail-document-edit');
    if(!edit)return null;
    const id=String(edit.dataset.rowId||'').trim();
    const kind=String(edit.dataset.kind||'').trim();
    if(!id)return null;
    return {id:id,kind:kind};
  }

  function openEdit(row){
    const ctx=contextFromRow(row);
    if(!ctx)return;
    if(ctx.kind==='main'){
      if(typeof window.editMontantDevis==='function'){window.editMontantDevis(ctx.id);return;}
      try{if(typeof editMontantDevis==='function')editMontantDevis(ctx.id);}catch(e){}
      return;
    }
    if(typeof window.editMontantAvenant==='function'){window.editMontantAvenant(ctx.id);return;}
    try{if(typeof editMontantAvenant==='function')editMontantAvenant(ctx.id);}catch(e){}
  }

  function decorate(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row').forEach(function(row){
      const amount=row.querySelector('.yaya-detail-charge-cost');
      const edit=row.querySelector('.yaya-detail-document-edit');
      if(edit){edit.setAttribute('aria-hidden','true');edit.tabIndex=-1;}
      const del=row.querySelector('.yaya-detail-document-delete');
      if(del){del.setAttribute('title','Supprimer');del.setAttribute('aria-label','Supprimer');}
      if(!amount||!contextFromRow(row))return;
      amount.classList.add('yaya-devis-clickable-amount');
      amount.setAttribute('role','button');
      amount.setAttribute('tabindex','0');
      amount.setAttribute('title','Modifier ce devis');
      amount.setAttribute('aria-label','Modifier ce devis');
    });
  }

  document.addEventListener('click',function(event){
    const amount=event.target&&event.target.closest?event.target.closest('#pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row .yaya-detail-charge-cost'):null;
    if(!amount)return;
    const row=amount.closest('.yaya-detail-market-row');if(!row)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();openEdit(row);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const amount=event.target&&event.target.closest?event.target.closest('#pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row .yaya-detail-charge-cost'):null;
    if(!amount)return;
    const row=amount.closest('.yaya-detail-market-row');if(!row)return;
    event.preventDefault();event.stopPropagation();openEdit(row);
  },true);

  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;decorate();});}
  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
