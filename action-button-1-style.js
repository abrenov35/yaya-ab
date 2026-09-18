(function(){
  'use strict';
  const id='yaya-action-buttons-style-v21';
  if(document.getElementById(id))return;

  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-chantiers .yaya-document-line > span:last-child,#pane-chantiers :is(.ligM,.ligD) > span:last-child{display:grid!important;grid-template-columns:28px 28px 28px!important;column-gap:6px!important;align-items:center!important;justify-content:end!important}
    #pane-chantiers .message-actions button.message-view-btn[onclick*="voirMessageYaya"],#pane-chantiers .yaya-document-line > span:last-child button[onclick*="voirPiece"],#pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="voirPiece"],#pane-achats button[onclick*="voir" i],#pane-achats button[onclick*="open" i]{width:28px!important;min-width:28px!important;max-width:28px!important;height:28px!important;min-height:28px!important;padding:0!important;margin:0 2px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #a9c8e8!important;border-radius:7px!important;background:#f3f8fd!important;color:#174d7d!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:0!important;line-height:1!important;cursor:pointer!important;vertical-align:middle!important}
    #pane-chantiers .message-actions button.message-view-btn[onclick*="voirMessageYaya"]::before,#pane-chantiers .yaya-document-line > span:last-child button[onclick*="voirPiece"]::before,#pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="voirPiece"]::before{content:"👁"!important;font-size:15px!important;line-height:1!important}
    #pane-achats button[onclick*="voir" i]::before,#pane-achats button[onclick*="open" i]::before{content:"👁️"!important;font-size:14px!important;line-height:1!important}
    #pane-achats button[onclick*="voir" i]::after,#pane-achats button[onclick*="open" i]::after{content:none!important;display:none!important}
    #pane-chantiers .message-actions button:not([onclick*="voirMessageYaya"]):not(.x):not([onclick*="supprim" i]),#pane-chantiers .yaya-document-line > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i]),#pane-chantiers :is(.ligM,.ligD) > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i]){grid-column:2!important;width:28px!important;height:28px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #a8d5b5!important;border-radius:7px!important;background:#f2faf4!important;color:#26703b!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:0!important;line-height:1!important;cursor:pointer!important}
    #pane-chantiers .message-actions button:not([onclick*="voirMessageYaya"]):not(.x):not([onclick*="supprim" i])::before,#pane-chantiers .yaya-document-line > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i])::before,#pane-chantiers :is(.ligM,.ligD) > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i])::before{content:"✏️"!important;font-size:14px!important;line-height:1!important}
    #pane-chantiers .message-actions button.x,#pane-chantiers .yaya-document-line > span:last-child button.x,#pane-chantiers :is(.ligM,.ligD) > span:last-child button.x,#pane-chantiers .message-actions button[onclick*="supprim" i],#pane-chantiers .yaya-document-line > span:last-child button[onclick*="supprim" i],#pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="supprim" i]{grid-column:3!important;width:28px!important;height:28px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #e6a7a7!important;border-radius:7px!important;background:#fff3f3!important;color:#c83c3c!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:0!important;line-height:1!important;cursor:pointer!important}
    #pane-chantiers .message-actions button.x::before,#pane-chantiers .yaya-document-line > span:last-child button.x::before,#pane-chantiers :is(.ligM,.ligD) > span:last-child button.x::before,#pane-chantiers .message-actions button[onclick*="supprim" i]::before,#pane-chantiers .yaya-document-line > span:last-child button[onclick*="supprim" i]::before,#pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="supprim" i]::before{content:"❌"!important;font-size:13px!important;line-height:1!important}
    #pane-chantiers .yaya-detail-charge-row{grid-template-columns:minmax(120px,1fr) 90px 110px 28px 28px 28px!important}
    #pane-chantiers .yaya-detail-document-row{grid-template-columns:minmax(120px,1fr) 90px 110px 28px 28px 28px!important}
    #pane-chantiers .yaya-detail-document-row.yaya-detail-mail-row{grid-template-columns:minmax(130px,.75fr) minmax(180px,1.25fr) 110px 28px 28px 28px!important}
    #pane-chantiers .yaya-detail-mail-row .yaya-mail-sender,#pane-chantiers .yaya-detail-mail-row .yaya-mail-subject{min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #pane-chantiers .yaya-detail-mail-row .yaya-mail-subject{text-align:left!important;color:#465a70!important;font-weight:600!important}
    #pane-chantiers .yaya-detail-charge-edit,#pane-chantiers .yaya-detail-charge-delete{width:28px!important;height:28px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:7px!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;line-height:1!important;cursor:pointer!important}
    #pane-chantiers .yaya-detail-charge-edit{border:1px solid #a8d5b5!important;background:#f2faf4!important;color:#26703b!important;font-size:14px!important}
    #pane-chantiers .yaya-detail-charge-delete{border:1px solid #e6a7a7!important;background:#fff3f3!important;color:#c83c3c!important;font-size:14px!important}

    /* CHARGES — lecture rapide et dense, sans toucher à la logique métier */
    #pane-chantiers .yaya-detail-section-action-row[data-section="charges"]{
      min-height:42px!important;
      margin:5px 0 8px!important;
      padding:6px 8px 6px 10px!important;
      background:#fffaf2!important;
      border:1px solid #eadfc9!important;
      border-left:4px solid #cf994c!important;
      border-radius:9px!important;
      box-shadow:0 1px 2px rgba(22,45,73,.035)!important;
    }
    #pane-chantiers .yaya-detail-section-action-row[data-section="charges"] .yaya-detail-section-action-title{
      color:#6f4a12!important;
      font-size:13px!important;
      font-weight:900!important;
      letter-spacing:.045em!important;
    }
    #pane-chantiers .yaya-detail-section-action-row[data-section="charges"] .yaya-detail-section-action-button{
      min-height:32px!important;
      height:32px!important;
      padding:0 11px!important;
      border-radius:8px!important;
      background:#173f69!important;
      border-color:#173f69!important;
      color:#fff!important;
      font-size:11px!important;
      font-weight:800!important;
      box-shadow:none!important;
    }
    #pane-chantiers .yaya-detail-section-action-row[data-section="charges"] .yaya-detail-section-action-button:hover{
      background:#12365b!important;
      border-color:#12365b!important;
    }
    #pane-chantiers .yaya-detail-charges-pane{
      overflow:hidden!important;
      border:1px solid #e3eaf1!important;
      border-radius:10px!important;
      background:#fff!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row{
      grid-template-columns:minmax(115px,.9fr) minmax(170px,1.35fr) 82px 105px 28px 28px!important;
      gap:10px!important;
      align-items:center!important;
      min-height:48px!important;
      padding:7px 12px!important;
      border-bottom:1px solid #e8edf2!important;
      background:#fff!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row:last-child{border-bottom:0!important}
    #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong{display:contents!important}
    #pane-chantiers .yaya-detail-charges-pane .yaya-charge-name{
      grid-column:1!important;
      min-width:0!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      white-space:nowrap!important;
      color:#17324f!important;
      font-size:12.5px!important;
      font-weight:850!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-charge-meta{
      grid-column:2!important;
      min-width:0!important;
      display:flex!important;
      align-items:center!important;
      gap:5px!important;
      overflow:hidden!important;
      color:#66788b!important;
      font-size:11px!important;
      font-weight:500!important;
      white-space:nowrap!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-charge-detail{
      min-width:0!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      white-space:nowrap!important;
      color:#53677c!important;
      font-size:11px!important;
      font-weight:600!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-charge-period{
      display:inline!important;
      flex:0 0 auto!important;
      margin:0!important;
      color:#8793a1!important;
      font-size:10.5px!important;
      font-weight:500!important;
      white-space:nowrap!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-charge-detail + .yaya-charge-period::before{
      content:"•";
      margin-right:5px;
      color:#b4bec8;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-hours{
      grid-column:3!important;
      text-align:right!important;
      color:#65778a!important;
      font-size:11.5px!important;
      font-weight:500!important;
      white-space:nowrap!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-cost{
      grid-column:4!important;
      text-align:right!important;
      color:#17324f!important;
      font-size:13.5px!important;
      font-weight:900!important;
      white-space:nowrap!important;
    }
    #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > span:empty:not(.yaya-detail-charge-hours):not(.yaya-detail-charge-cost){
      display:none!important;
    }
    .yaya-charge-delete-overlay{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(22,45,73,.48)}
    .yaya-charge-delete-modal{width:min(430px,calc(100vw - 32px));background:#fff;border-radius:16px;box-shadow:0 18px 55px rgba(0,0,0,.28);padding:26px;text-align:center;color:#162d49}
    .yaya-charge-delete-icon{width:58px;height:58px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#fff0f0;font-size:28px}
    .yaya-charge-delete-modal h3{margin:0 0 8px;font-size:21px}.yaya-charge-delete-modal p{margin:0 0 22px;font-size:13px;opacity:.72}
    .yaya-charge-delete-actions{display:flex;gap:12px}.yaya-charge-delete-actions button{flex:1;height:42px;border-radius:9px;font-size:14px;font-weight:700}
    .yaya-charge-delete-cancel{background:#fff;border:1px solid #cbd5e1;color:#162d49}.yaya-charge-delete-ok{background:#d93636;border:1px solid #d93636;color:#fff}
    @media(max-width:760px){
      #pane-chantiers .yaya-detail-charge-row,
      #pane-chantiers .yaya-detail-document-row{grid-template-columns:minmax(90px,1fr) 68px 88px 28px 28px 28px!important}
      #pane-chantiers .yaya-detail-document-row.yaya-detail-mail-row{grid-template-columns:minmax(105px,.8fr) minmax(145px,1.2fr) 82px 28px 28px 28px!important}

      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row{
        position:relative!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        grid-template-rows:auto auto!important;
        gap:3px 10px!important;
        min-height:56px!important;
        padding:8px 10px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-charge-name{
        grid-column:1!important;
        grid-row:1!important;
        font-size:12px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-cost{
        grid-column:2!important;
        grid-row:1!important;
        font-size:13px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-charge-meta{
        grid-column:1!important;
        grid-row:2!important;
        gap:4px!important;
        font-size:10.5px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-charge-detail{font-size:10.5px!important}
      #pane-chantiers .yaya-detail-charges-pane .yaya-charge-period{font-size:9.8px!important}
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-hours{
        grid-column:2!important;
        grid-row:2!important;
        font-size:10px!important;
        text-align:right!important;
        align-self:center!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-view{
        position:absolute!important;
        right:42px!important;
        bottom:5px!important;
        width:26px!important;
        height:26px!important;
        min-width:26px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-edit{
        position:absolute!important;
        right:10px!important;
        bottom:5px!important;
        width:26px!important;
        height:26px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row:has(.yaya-detail-charge-view) .yaya-charge-meta{
        padding-right:72px!important;
      }
    }

    /* Téléphone debout : grille stricte 2 x 2, aucun décalage visuel */
    @media(max-width:760px) and (orientation:portrait){
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row{
        grid-template-columns:minmax(0,1fr) auto!important;
        grid-template-rows:minmax(20px,auto) minmax(18px,auto)!important;
        gap:4px 12px!important;
        align-items:center!important;
        min-height:58px!important;
        padding:8px 12px!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-charge-name{
        grid-column:1!important;
        grid-row:1!important;
        align-self:center!important;
        text-align:left!important;
        line-height:1.15!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-cost{
        grid-column:2!important;
        grid-row:1!important;
        align-self:center!important;
        justify-self:end!important;
        text-align:right!important;
        line-height:1.15!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-charge-meta{
        grid-column:1!important;
        grid-row:2!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:4px!important;
        min-width:0!important;
        width:100%!important;
        padding-right:0!important;
        overflow:hidden!important;
        white-space:nowrap!important;
        text-align:left!important;
        line-height:1.15!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-charge-detail{
        display:inline!important;
        flex:0 1 auto!important;
        min-width:0!important;
        margin:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-charge-period{
        display:inline!important;
        flex:0 0 auto!important;
        margin:0!important;
        padding:0!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-charge-detail + .yaya-charge-period::before{
        content:"•"!important;
        margin:0 4px 0 0!important;
        color:#b4bec8!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-hours{
        grid-column:2!important;
        grid-row:2!important;
        align-self:center!important;
        justify-self:end!important;
        text-align:right!important;
        line-height:1.15!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row:has(.yaya-detail-charge-view) .yaya-charge-meta{
        padding-right:0!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-view{
        top:50%!important;
        bottom:auto!important;
        right:42px!important;
        transform:translateY(-50%)!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-edit{
        top:50%!important;
        bottom:auto!important;
        right:10px!important;
        transform:translateY(-50%)!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row:has(.yaya-detail-charge-view) .yaya-detail-charge-cost,
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row:has(.yaya-detail-charge-view) .yaya-detail-charge-hours{
        padding-right:68px!important;
      }
    }
  `;
  document.head.appendChild(style);

  function decorateChargeRows(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row').forEach(function(row){
      const strong=row.querySelector(':scope > strong');
      if(!strong)return;

      let name=strong.querySelector(':scope > .yaya-charge-name');
      if(!name){
        const direct=[...strong.childNodes].filter(function(node){
          return node.nodeType===Node.TEXT_NODE&&String(node.textContent||'').trim();
        });
        const value=direct.map(function(node){return String(node.textContent||'').trim();}).join(' ').trim();
        if(value){
          name=document.createElement('span');
          name.className='yaya-charge-name';
          name.textContent=value;
          direct.forEach(function(node){node.remove();});
          strong.insertBefore(name,strong.firstChild||null);
        }
      }

      let meta=strong.querySelector(':scope > .yaya-charge-meta');
      if(!meta){
        meta=document.createElement('span');
        meta.className='yaya-charge-meta';
        strong.appendChild(meta);
      }

      const detail=strong.querySelector(':scope > small:not(.yaya-history-date)');
      const period=strong.querySelector(':scope > .yaya-history-date');
      if(detail){
        detail.classList.add('yaya-charge-detail');
        meta.appendChild(detail);
      }
      if(period){
        period.classList.add('yaya-charge-period');
        meta.appendChild(period);
      }
      if(!meta.children.length)meta.remove();
    });
  }

  function extractAchatId(view){const stored=String(view.dataset.achatId||'');if(stored)return stored;const raw=String(view.getAttribute('onclick')||'');const match=raw.match(/openAchat\(['\"]([^'\"]+)/);return match&&match[1]?String(match[1]):'';}
  function addChargeActionButtons(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-charge-row').forEach(row=>{const view=row.querySelector('.yaya-detail-charge-view');if(!view)return;const achatId=extractAchatId(view);if(achatId)view.dataset.achatId=achatId;let edit=row.querySelector('.yaya-detail-charge-edit');if(!edit){edit=document.createElement('button');edit.type='button';edit.className='yaya-detail-charge-edit';edit.title='Modifier';edit.textContent='✏️';view.insertAdjacentElement('afterend',edit)}if(achatId)edit.dataset.achatId=achatId;let del=row.querySelector('.yaya-detail-charge-delete');if(!del){del=document.createElement('button');del.type='button';del.className='yaya-detail-charge-delete';del.title='Supprimer';del.textContent='🗑️';row.appendChild(del)}if(achatId)del.dataset.achatId=achatId;});
    decorateChargeRows();
  }
  function confirmDelete(achatId,isExpense){document.querySelector('.yaya-charge-delete-overlay')?.remove();const label=isExpense?'dépense':'charge';const overlay=document.createElement('div');overlay.className='yaya-charge-delete-overlay';overlay.innerHTML='<div class="yaya-charge-delete-modal" role="dialog" aria-modal="true"><div class="yaya-charge-delete-icon">🗑️</div><h3>Supprimer cette '+label+' ?</h3><p>Cette action est irréversible.</p><div class="yaya-charge-delete-actions"><button type="button" class="yaya-charge-delete-cancel">Annuler</button><button type="button" class="yaya-charge-delete-ok">Supprimer</button></div></div>';document.body.appendChild(overlay);const close=()=>overlay.remove();overlay.querySelector('.yaya-charge-delete-cancel').onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close()});overlay.querySelector('.yaya-charge-delete-ok').onclick=()=>{close();if(typeof delAchat==='function')delAchat(achatId)};}
  document.addEventListener('click',function(e){const edit=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-charge-edit'):null;if(!edit)return;e.preventDefault();e.stopPropagation();const achatId=String(edit.dataset.achatId||'');if(achatId&&typeof editAchat==='function')editAchat(achatId);});
  document.addEventListener('click',function(e){const del=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-charge-delete'):null;if(!del)return;e.preventDefault();e.stopPropagation();const achatId=String(del.dataset.achatId||'');if(!achatId||typeof delAchat!=='function')return;confirmDelete(achatId,!!del.closest('.yaya-detail-expense-row'));});
  let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;addChargeActionButtons()})}addChargeActionButtons();const pane=document.getElementById('pane-chantiers');if(pane)new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});window.addEventListener('yaya:data-refreshed',schedule);
})();
