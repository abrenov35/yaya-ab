(function(){
  'use strict';
  const id='yaya-action-buttons-style-v13';
  if(document.getElementById(id))return;

  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-chantiers .message-actions,
    #pane-chantiers .yaya-document-line > span:last-child,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child{
      display:grid!important;grid-template-columns:28px 28px 28px!important;column-gap:6px!important;align-items:center!important;justify-content:end!important;
    }
    #pane-chantiers .message-actions button.message-view-btn[onclick*="voirMessageYaya"],
    #pane-chantiers .yaya-document-line > span:last-child button[onclick*="voirPiece"],
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="voirPiece"],
    #pane-achats button[onclick*="voir" i],#pane-achats button[onclick*="open" i]{
      width:28px!important;min-width:28px!important;max-width:28px!important;height:28px!important;min-height:28px!important;padding:0!important;margin:0 2px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #a9c8e8!important;border-radius:7px!important;background:#f3f8fd!important;color:#174d7d!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:0!important;line-height:1!important;cursor:pointer!important;vertical-align:middle!important;
    }
    #pane-chantiers .message-actions button.message-view-btn[onclick*="voirMessageYaya"]::before,
    #pane-chantiers .yaya-document-line > span:last-child button[onclick*="voirPiece"]::before,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="voirPiece"]::before,
    #pane-achats button[onclick*="voir" i]::before,#pane-achats button[onclick*="open" i]::before{content:"👁"!important;font-size:15px!important;line-height:1!important;}
    #pane-chantiers .message-actions button:not([onclick*="voirMessageYaya"]):not(.x):not([onclick*="supprim" i]),
    #pane-chantiers .yaya-document-line > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i]),
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i]){
      grid-column:2!important;width:28px!important;height:28px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #a8d5b5!important;border-radius:7px!important;background:#f2faf4!important;color:#26703b!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:0!important;line-height:1!important;cursor:pointer!important;
    }
    #pane-chantiers .message-actions button:not([onclick*="voirMessageYaya"]):not(.x):not([onclick*="supprim" i])::before,
    #pane-chantiers .yaya-document-line > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i])::before,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i])::before{content:"✏️"!important;font-size:14px!important;line-height:1!important;}
    #pane-chantiers .message-actions button.x,#pane-chantiers .yaya-document-line > span:last-child button.x,#pane-chantiers :is(.ligM,.ligD) > span:last-child button.x,
    #pane-chantiers .message-actions button[onclick*="supprim" i],#pane-chantiers .yaya-document-line > span:last-child button[onclick*="supprim" i],#pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="supprim" i]{
      grid-column:3!important;width:28px!important;height:28px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #e6a7a7!important;border-radius:7px!important;background:#fff3f3!important;color:#c83c3c!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:0!important;line-height:1!important;cursor:pointer!important;
    }
    #pane-chantiers .message-actions button.x::before,#pane-chantiers .yaya-document-line > span:last-child button.x::before,#pane-chantiers :is(.ligM,.ligD) > span:last-child button.x::before,
    #pane-chantiers .message-actions button[onclick*="supprim" i]::before,#pane-chantiers .yaya-document-line > span:last-child button[onclick*="supprim" i]::before,#pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="supprim" i]::before{content:"❌"!important;font-size:13px!important;line-height:1!important;}

    #pane-chantiers .yaya-detail-charge-row{grid-template-columns:minmax(120px,1fr) 90px 110px 28px 28px 28px!important;}
    #pane-chantiers .yaya-detail-charge-edit,#pane-chantiers .yaya-detail-charge-delete{
      width:28px!important;height:28px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:7px!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;line-height:1!important;cursor:pointer!important;
    }
    #pane-chantiers .yaya-detail-charge-edit{border:1px solid #a8d5b5!important;background:#f2faf4!important;color:#26703b!important;font-size:14px!important;}
    #pane-chantiers .yaya-detail-charge-delete{border:1px solid #e6a7a7!important;background:#fff3f3!important;color:#c83c3c!important;font-size:14px!important;}
    @media(max-width:640px){#pane-chantiers .yaya-detail-charge-row{grid-template-columns:minmax(90px,1fr) 68px 88px 28px 28px 28px!important;}}
  `;
  document.head.appendChild(style);

  function achatById(id){
    try{
      if(typeof S!=='undefined'&&Array.isArray(S.achats))return S.achats.find(a=>String(a.id)===String(id))||null;
    }catch(e){}
    return null;
  }

  function addChargeActionButtons(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-charge-row').forEach(row=>{
      const view=row.querySelector('.yaya-detail-charge-view');
      if(!view)return;
      const raw=String(view.getAttribute('onclick')||'');
      const match=raw.match(/openAchat\(['\"]([^'\"]+)/);
      const achatId=(match&&match[1])?String(match[1]):String(view.dataset.achatId||'');
      if(!achatId)return;
      view.dataset.achatId=achatId;

      view.removeAttribute('onclick');
      view.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        const achat=achatById(achatId);
        const lien=String(achat&&achat.lien||'');
        if(lien&&typeof voirPiece==='function')voirPiece(lien);
      };

      let edit=row.querySelector('.yaya-detail-charge-edit');
      if(!edit){edit=document.createElement('button');edit.type='button';edit.className='yaya-detail-charge-edit';edit.title='Modifier';edit.textContent='✏️';view.insertAdjacentElement('afterend',edit);}
      let del=row.querySelector('.yaya-detail-charge-delete');
      if(!del){del=document.createElement('button');del.type='button';del.className='yaya-detail-charge-delete';del.title='Supprimer';del.textContent='🗑️';row.appendChild(del);}
    });
  }

  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;addChargeActionButtons();});}
  addChargeActionButtons();
  const pane=document.getElementById('pane-chantiers');if(pane)new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();