(function(){
  'use strict';

  if(window.__yayaDevisAmountClickEditV3)return;
  window.__yayaDevisAmountClickEditV3=true;

  const STYLE_ID='yaya-devis-amount-click-edit-style-v3';

  function installStyle(){
    ['yaya-devis-amount-click-edit-style-v1','yaya-devis-amount-click-edit-style-v2'].forEach(function(id){
      const old=document.getElementById(id);if(old)old.remove();
    });
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-document-edit{display:none!important;}

      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) 120px 90px 46px!important;
        align-items:center!important;
        column-gap:12px!important;
        width:100%!important;
        min-height:46px!important;
        padding:7px 10px!important;
        margin:0!important;
        box-sizing:border-box!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > strong{
        grid-column:1!important;
        min-width:0!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-charge-hours{
        grid-column:2!important;
        justify-self:end!important;
        text-align:right!important;
        min-width:0!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-charge-cost{
        grid-column:3!important;
        justify-self:end!important;
        text-align:right!important;
        min-width:0!important;
        cursor:pointer!important;
        text-decoration:none!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-charge-cost:hover{
        opacity:.72!important;
        text-decoration:none!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-charge-cost:focus{
        outline:2px solid #9eb8d2!important;
        outline-offset:2px!important;
        border-radius:4px!important;
        text-decoration:none!important;
      }

      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-document-delete,
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-initial-devis-delete{
        grid-column:4!important;
        justify-self:center!important;
        align-self:center!important;
        width:30px!important;
        min-width:30px!important;
        max-width:30px!important;
        height:30px!important;
        min-height:30px!important;
        padding:0!important;
        margin:0!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid #f3a0a0!important;
        border-radius:8px!important;
        background:#fff7f7!important;
        color:#e52626!important;
        font-size:0!important;
        line-height:1!important;
        font-weight:700!important;
        box-shadow:0 1px 3px rgba(180,35,35,.08)!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-document-delete::before,
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-initial-devis-delete::before{
        content:'×'!important;
        display:block!important;
        font-family:Arial,sans-serif!important;
        font-size:20px!important;
        font-weight:700!important;
        line-height:1!important;
        color:#e52626!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-document-delete:hover,
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-initial-devis-delete:hover{
        background:#ffeded!important;
        border-color:#eb8383!important;
      }

      @media(max-width:640px){
        #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row{
          grid-template-columns:minmax(0,1fr) 84px 72px 38px!important;
          column-gap:7px!important;
          padding:7px 8px!important;
        }
      }
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
