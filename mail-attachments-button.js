(function(){
  'use strict';
  if(window.__yayaMailAttachmentsButtonV1)return;
  window.__yayaMailAttachmentsButtonV1=true;

  const TYPE='MAIL_PJ';
  const BUTTON_CLASS='yaya-mail-pj-button';
  const MODAL_CLASS='yaya-mail-pj-list-overlay';
  const STYLE_ID='yaya-mail-pj-style-v1';

  function text(v){return String(v==null?'':v).trim();}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function docs(){
    try{return (typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];}catch(e){return [];}
  }
  function upper(v){return text(v).toUpperCase();}
  function isAttachment(d){return !!d&&upper(d.type)===TYPE;}
  function docById(id){id=text(id);return docs().find(function(d){return text(d&&d.id)===id;})||null;}
  function attachmentsForMail(mailId){
    mailId=text(mailId);
    if(!mailId)return [];
    return docs().filter(function(d){
      return isAttachment(d)&&text(d.sujet)===mailId&&!!text(d.lien);
    });
  }
  function mailIdFromModal(modal){
    if(!modal)return '';
    const el=modal.querySelector('[data-yaya-mail-delete],[data-yaya-mail-edit]');
    if(!el)return '';
    return text(el.dataset.yayaMailDelete||el.dataset.yayaMailEdit||'');
  }
  function openPiece(d){
    if(!d)return;
    const url=text(d.lien);if(!url)return;
    try{window.__yayaPreviewDocumentId=text(d.id);}catch(e){}
    try{if(typeof window.voirPiece==='function'){window.voirPiece(url);return;}}catch(e){}
    try{if(typeof voirPiece==='function'){voirPiece(url);return;}}catch(e){}
    window.open(url,'_blank','noopener');
  }
  function fileLabel(d){return text(d.pieceNom||d.titre||d.nomFichier||d.filename||d.sujet)||'Pièce jointe';}

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      #modalRoot .${BUTTON_CLASS}{border:1px solid #c99b2f!important;background:#fff8e6!important;color:#765400!important;font-weight:900!important}
      #modalRoot .${BUTTON_CLASS}[data-count]:not([data-count="1"])::after{content:' (' attr(data-count) ')'!important}
      #modalRoot .${MODAL_CLASS}{position:fixed!important;inset:0!important;z-index:2147483646!important;background:rgba(16,28,45,.42)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;box-sizing:border-box!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-list-modal{width:min(640px,calc(100vw - 28px))!important;max-height:min(76vh,720px)!important;overflow:hidden!important;background:#fff!important;border-radius:12px!important;box-shadow:0 18px 55px rgba(16,28,45,.28)!important;display:flex!important;flex-direction:column!important}
      #modalRoot .${MODAL_CLASS} h5{display:flex!important;align-items:center!important;justify-content:space-between!important;margin:0!important;padding:14px 16px!important;border-bottom:1px solid #dfe6ee!important;color:#162d49!important;font-size:15px!important}
      #modalRoot .${MODAL_CLASS} h5 button{border:0!important;background:transparent!important;font-size:23px!important;line-height:1!important;cursor:pointer!important;color:#53657a!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-list{overflow:auto!important;padding:10px 12px 14px!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-item{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:10px!important;align-items:center!important;padding:10px 4px!important;border-bottom:1px solid #edf1f5!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-item:last-child{border-bottom:0!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-name{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#24364d!important;font-size:13px!important;font-weight:700!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-view{min-height:36px!important;padding:0 14px!important;border:1px solid #17639f!important;border-radius:8px!important;background:#17639f!important;color:#fff!important;font-weight:800!important;cursor:pointer!important}
      #pane-documents .achligne.ligR[data-yaya-mail-pj-hidden="1"],
      #pane-chantiers [data-yaya-mail-pj-hidden="1"]{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function closeList(){
    const overlay=document.querySelector('#modalRoot .'+MODAL_CLASS);
    if(overlay)overlay.remove();
  }

  function openList(mailId){
    const list=attachmentsForMail(mailId);
    if(!list.length)return;
    if(list.length===1){openPiece(list[0]);return;}
    const root=document.getElementById('modalRoot');if(!root)return;
    closeList();
    const overlay=document.createElement('div');overlay.className=MODAL_CLASS;
    overlay.innerHTML=''
      +'<div class="yaya-mail-pj-list-modal" role="dialog" aria-modal="true" aria-label="Pièces jointes du mail">'
      +'<h5>Pièces jointes du mail<button type="button" class="yaya-mail-pj-close" aria-label="Fermer">×</button></h5>'
      +'<div class="yaya-mail-pj-list">'
      +list.map(function(d){return '<div class="yaya-mail-pj-item"><div class="yaya-mail-pj-name" title="'+esc(fileLabel(d))+'">'+esc(fileLabel(d))+'</div><button type="button" class="yaya-mail-pj-view" data-doc-id="'+esc(text(d.id))+'">Voir</button></div>';}).join('')
      +'</div></div>';
    root.appendChild(overlay);
    overlay.addEventListener('click',function(e){
      if(e.target===overlay||e.target.closest('.yaya-mail-pj-close')){e.preventDefault();closeList();return;}
      const btn=e.target.closest('.yaya-mail-pj-view');if(!btn)return;
      e.preventDefault();
      const d=docById(btn.dataset.docId);if(d)openPiece(d);
    });
  }

  function injectButton(){
    const modal=document.querySelector('#modalRoot .yaya-mail-body-modal');
    if(!modal)return;
    const mailId=mailIdFromModal(modal);if(!mailId)return;
    const list=attachmentsForMail(mailId);
    const actions=modal.querySelector('.yaya-read-actions');if(!actions)return;
    let btn=actions.querySelector('.'+BUTTON_CLASS);
    if(!list.length){if(btn)btn.remove();return;}
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';btn.className=BUTTON_CLASS;btn.textContent='PJ';
      const close=actions.querySelector('.btnp');
      if(close)actions.insertBefore(btn,close);else actions.appendChild(btn);
      btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openList(mailId);});
    }
    btn.dataset.count=String(list.length);
    btn.title=list.length===1?'Visualiser la pièce jointe':'Voir les '+list.length+' pièces jointes';
  }

  function hideAttachmentRows(root){
    if(!root||!root.querySelectorAll)return;
    const rows=[];
    if(root.matches&&root.matches('[data-id]'))rows.push(root);
    root.querySelectorAll('[data-id]').forEach(function(r){rows.push(r);});
    rows.forEach(function(row){
      const id=text(row.dataset&&row.dataset.id);if(!id)return;
      const d=docById(id);if(!isAttachment(d))return;
      row.dataset.yayaMailPjHidden='1';
    });
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;ensureStyle();injectButton();
      hideAttachmentRows(document.getElementById('pane-documents'));
      hideAttachmentRows(document.getElementById('pane-chantiers'));
    });
  }

  ensureStyle();
  const modalRoot=document.getElementById('modalRoot');
  if(modalRoot)new MutationObserver(schedule).observe(modalRoot,{childList:true,subtree:true});
  ['pane-documents','pane-chantiers'].forEach(function(id){
    const pane=document.getElementById(id);if(pane)new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
  });
  window.addEventListener('yaya:data-refreshed',schedule);
  schedule();
})();
