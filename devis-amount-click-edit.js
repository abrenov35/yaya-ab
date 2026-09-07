(function(){
  'use strict';

  if(window.__yayaDevisAmountClickEditV7)return;
  window.__yayaDevisAmountClickEditV7=true;

  const STYLE_ID='yaya-devis-amount-click-edit-style-v7';

  function installStyle(){
    ['yaya-devis-amount-click-edit-style-v1','yaya-devis-amount-click-edit-style-v2','yaya-devis-amount-click-edit-style-v3','yaya-devis-amount-click-edit-style-v4','yaya-devis-amount-click-edit-style-v5','yaya-devis-amount-click-edit-style-v6'].forEach(function(id){
      const old=document.getElementById(id);if(old)old.remove();
    });
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-document-edit,
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-document-view,
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-charge-hours{
        display:none!important;
      }

      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) 90px 46px!important;
        align-items:center!important;
        column-gap:14px!important;
        width:100%!important;
        min-height:54px!important;
        padding:9px 12px!important;
        margin:0!important;
        box-sizing:border-box!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > strong{
        grid-column:1!important;
        min-width:0!important;
        min-height:30px!important;
        display:flex!important;
        align-items:center!important;
        gap:5px 12px!important;
        flex-wrap:wrap!important;
        line-height:1.3!important;
        font-size:0!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-market-label{
        color:#1c2b48!important;
        font-size:13.5px!important;
        font-weight:800!important;
        line-height:1.3!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-market-description{
        display:inline!important;
        margin:0!important;
        color:#596579!important;
        font-size:12px!important;
        font-weight:500!important;
        line-height:1.3!important;
        white-space:normal!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-market-inline-date{
        display:inline!important;
        margin:0 0 0 auto!important;
        padding-left:14px!important;
        color:#7a8798!important;
        font-size:10.5px!important;
        font-weight:500!important;
        line-height:1.3!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-charge-cost{
        grid-column:2!important;
        justify-self:end!important;
        text-align:right!important;
        min-width:0!important;
        cursor:pointer!important;
        text-decoration:none!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-charge-cost:hover{
        opacity:.72!important;
        text-decoration:none!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-charge-cost:focus{
        outline:2px solid #9eb8d2!important;
        outline-offset:2px!important;
        border-radius:4px!important;
        text-decoration:none!important;
      }

      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-document-delete,
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-initial-devis-delete{
        grid-column:3!important;
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
          grid-template-columns:minmax(0,1fr) 72px 38px!important;
          column-gap:8px!important;
          min-height:52px!important;
          padding:8px 9px!important;
        }
        #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > strong{
          gap:4px 8px!important;
        }
        #pane-chantiers .yaya-detail-markets-pane .yaya-market-inline-date{
          padding-left:8px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function unpackMeta(value){
    const raw=String(value||'').trim();
    const match=raw.match(/\s*\[\[YAYA_DESC:([^\]]*)\]\]\s*$/);
    if(!match)return {label:raw,description:''};
    let description='';
    try{description=decodeURIComponent(match[1]||'');}catch(e){description=String(match[1]||'');}
    return {label:raw.slice(0,match.index).trim(),description:description};
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

  function quoteMetaFromContext(ctx,strong){
    let raw='';
    try{
      if(ctx&&typeof S!=='undefined'&&S){
        if(ctx.kind==='main'&&Array.isArray(S.chantiers)){
          const c=S.chantiers.find(function(x){return String(x&&x.id)===String(ctx.id);});
          if(c)raw=String(c.numero||'');
        }else if(Array.isArray(S.avenants)){
          const v=S.avenants.find(function(x){return String(x&&x.id)===String(ctx.id);});
          if(v)raw=String(v.libelle||'');
        }
      }
    }catch(e){}

    if(!raw&&strong){
      raw=String(strong.childNodes&&strong.childNodes[0]&&strong.childNodes[0].nodeType===Node.TEXT_NODE
        ?strong.childNodes[0].nodeValue
        :strong.textContent||'').trim();
    }
    return unpackMeta(raw);
  }

  function normalizeMarketText(row){
    const strong=row.querySelector('strong');
    const ctx=contextFromRow(row);
    if(!strong||!ctx)return;

    const existingDate=strong.querySelector('.yaya-history-date,.yaya-market-inline-date');
    const date=String(existingDate&&existingDate.textContent||'').trim();
    const meta=quoteMetaFromContext(ctx,strong);
    const label=String(meta.label||'Devis').trim()||'Devis';
    const description=String(meta.description||'').trim();

    const signature=[label,description,date].join('|');
    const labels=strong.querySelectorAll(':scope > .yaya-market-label');
    const descriptions=strong.querySelectorAll(':scope > .yaya-market-description');
    const dates=strong.querySelectorAll(':scope > .yaya-market-inline-date');
    const structureOk=labels.length===1
      && descriptions.length===(description?1:0)
      && dates.length===(date?1:0);

    if(strong.dataset.yayaMarketInlineSignature===signature&&structureOk)return;

    strong.innerHTML=''
      +'<span class="yaya-market-label">'+escapeHtml(label)+'</span>'
      +(description?'<span class="yaya-market-description">'+escapeHtml(description)+'</span>':'')
      +(date?'<span class="yaya-market-inline-date">'+escapeHtml(date)+'</span>':'');
    strong.dataset.yayaMarketInlineSignature=signature;
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
      normalizeMarketText(row);
      const amount=row.querySelector('.yaya-detail-charge-cost');
      const edit=row.querySelector('.yaya-detail-document-edit');
      const view=row.querySelector('.yaya-detail-document-view');
      const type=row.querySelector('.yaya-detail-charge-hours');
      if(edit){edit.setAttribute('aria-hidden','true');edit.tabIndex=-1;}
      if(view){view.setAttribute('aria-hidden','true');view.tabIndex=-1;}
      if(type){type.setAttribute('aria-hidden','true');}
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
