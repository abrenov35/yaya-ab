(function(){
  'use strict';

  const STYLE_ID='yaya-documents-view-only-css-v11';
  let style=document.getElementById(STYLE_ID);
  if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}

  const GLOBAL_ROW='#pane-documents .achligne.ligR[data-id]';
  const DETAIL_ROW=[
    '#pane-chantiers .yaya-detail-document-row',
    '#pane-chantiers .yaya-detail-mail-row',
    '#pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row',
    '#pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row',
    '#pane-chantiers .yaya-force-mails-pane .yaya-detail-mail-row'
  ].join(',');
  const ROW_SELECTOR=GLOBAL_ROW+','+DETAIL_ROW;

  style.textContent=`
    #pane-documents button[onclick^="openDocumentModal("],
    #pane-documents button[onclick^="editDocument("],
    #pane-documents button[onclick^="delDocument("]{display:none!important}

    #pane-documents > .note{margin:8px 0 6px!important;color:#162D49!important;opacity:1!important;font-size:11px!important;font-weight:800!important}
    #pane-documents > .card{margin:0!important;padding:0!important;background:#fff!important;border:0!important;border-radius:0!important;box-shadow:none!important}

    ${ROW_SELECTOR}{cursor:pointer!important;outline:none!important;box-shadow:none!important;transition:background .08s ease!important}
    ${DETAIL_ROW}{border-left:0!important;border-right:0!important;border-top:0!important;border-bottom:1px solid #dfe6ee!important}
    ${GLOBAL_ROW}:hover,${DETAIL_ROW}:hover{background:#f4f8fc!important;outline:none!important;box-shadow:none!important}
    ${GLOBAL_ROW}:focus,${DETAIL_ROW}:focus,${GLOBAL_ROW}:focus-visible,${DETAIL_ROW}:focus-visible{outline:none!important;box-shadow:none!important}

    /* Dans la fiche chantier, aucune action sur les lignes : tout passe par la modale. */
    #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-view,
    #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-edit,
    #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-delete,
    #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-view,
    #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-edit,
    #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-delete,
    #pane-chantiers .yaya-force-mails-pane .yaya-detail-document-view,
    #pane-chantiers .yaya-force-mails-pane .yaya-detail-document-edit,
    #pane-chantiers .yaya-force-mails-pane .yaya-detail-document-delete{display:none!important}

    #pane-chantiers .yaya-detail-mails-pane[data-empty="0"]::before{
      content:'1 - MAIL';display:block!important;margin:4px 0 0!important;padding:8px 10px!important;
      background:#f3eaf8!important;border-bottom:1px solid #dac9e7!important;color:#68418a!important;
      font-size:11px!important;font-weight:900!important;letter-spacing:.04em!important;
    }
    #pane-chantiers .yaya-detail-documents-pane[data-empty="0"]::before{
      content:'2 - DOCUMENTS';display:block!important;margin:8px 0 0!important;padding:8px 10px!important;
      background:#eaf3fb!important;border-bottom:1px solid #c8daea!important;color:#285f96!important;
      font-size:11px!important;font-weight:900!important;letter-spacing:.04em!important;
    }
    #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row{
      grid-template-columns:minmax(170px,.85fr) minmax(260px,1.8fr) 105px!important;
    }
    #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row{
      grid-template-columns:minmax(260px,1.8fr) minmax(120px,.7fr) 105px!important;
    }

    .yaya-mail-body-modal .yaya-mail-body-meta,
    .yaya-document-read-modal .yaya-document-read-meta{
      display:grid!important;gap:5px!important;margin:0 0 14px!important;padding:12px 14px!important;
      border:1px solid #d7e1ec!important;border-radius:10px!important;background:#f7f9fc!important;color:#24364d!important;font-size:12px!important
    }
    .yaya-mail-body-modal .yaya-mail-body-content{
      max-height:58vh!important;overflow:auto!important;padding:15px 16px!important;border:1px solid #d7e1ec!important;
      border-radius:10px!important;background:#fff!important;color:#1f2937!important;font-size:13px!important;line-height:1.55!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important
    }
    #modalRoot .yaya-read-actions{display:flex!important;align-items:center!important;gap:9px!important;margin-top:15px!important;padding-top:13px!important;border-top:1px solid #e0e7ef!important}
    #modalRoot .yaya-read-actions .yaya-delete{margin-right:auto!important;border:1px solid #e2a29b!important;background:#fff3f2!important;color:#c72d24!important}
    #modalRoot .yaya-read-actions .yaya-edit{border:1px solid #a9c6e4!important;background:#eef6ff!important;color:#245d91!important}
    #modalRoot .yaya-read-actions .yaya-open{border:1px solid #17639f!important;background:#17639f!important;color:#fff!important}
    #modalRoot .yaya-read-actions button{min-height:39px!important;padding:0 15px!important;border-radius:8px!important;font-weight:800!important;cursor:pointer!important}
    #modalRoot .yaya-mail-subject-modal{width:min(520px,calc(100vw - 28px))!important;max-width:520px!important}
    #modalRoot .yaya-mail-subject-body{padding:14px 0 4px!important}
    #modalRoot .yaya-mail-subject-body label{display:block!important;margin-bottom:7px!important;font-size:12px!important;font-weight:800!important;color:#304760!important}
    #modalRoot .yaya-mail-subject-body input{width:100%!important;box-sizing:border-box!important;min-height:44px!important;padding:0 12px!important;border:1px solid #afc0d2!important;border-radius:9px!important;font-size:14px!important}
    @media(max-width:640px){
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row,
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row{grid-template-columns:minmax(120px,1fr) minmax(150px,1.35fr) 82px!important;gap:7px!important}
      #modalRoot .yaya-read-actions{flex-wrap:wrap!important}
      #modalRoot .yaya-read-actions button{flex:1 1 125px!important}
      #modalRoot .yaya-read-actions .yaya-delete{margin-right:0!important}
    }
  `;

  function text(v){return String(v==null?'':v).trim();}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

  function rowId(row){
    if(!row)return '';
    const direct=[row.dataset&&row.dataset.id,row.dataset&&row.dataset.rowId,row.dataset&&row.dataset.mailId,row.dataset&&row.dataset.documentId,row.dataset&&row.dataset.docId];
    for(const v of direct){const id=text(v);if(id)return id;}
    for(const sel of ['[data-row-id]','[data-mail-id]','[data-doc-id]','[data-id]','[data-document-id]']){
      const el=row.querySelector(sel);if(!el)continue;
      const id=text(el.dataset.rowId||el.dataset.mailId||el.dataset.docId||el.dataset.id||el.dataset.documentId);if(id)return id;
    }
    const raw=[...row.querySelectorAll('[onclick]')].map(el=>String(el.getAttribute('onclick')||'')).join(' ');
    const m=raw.match(/(?:voirMessageYaya|editDocument|delDocument)\(['\"]([^'\"]+)/i);
    return m&&m[1]?text(m[1]):'';
  }

  function dataForId(id){
    id=text(id);if(!id)return null;
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.documents)){
        const d=S.documents.find(x=>String(x&&x.id||'')===id);if(d)return d;
      }
    }catch(e){}
    try{
      if(typeof historiquePiecesYaya==='function'){
        const d=(historiquePiecesYaya()||[]).find(x=>String(x&&x.id||'')===id);if(d)return d;
      }
    }catch(e){}
    return null;
  }

  function directPiece(row){
    if(!row)return '';
    const dl=row.querySelector('[data-lien]');
    const dataLien=text(dl&&dl.getAttribute('data-lien'));if(dataLien)return dataLien;
    const raw=[...row.querySelectorAll('[onclick]')].map(el=>String(el.getAttribute('onclick')||'')).join(' ');
    const m=raw.match(/voirPiece\(['\"]([^'\"]+)/i);
    return m&&m[1]?text(m[1]):'';
  }

  function isMail(row,d){
    if(row&&row.classList.contains('yaya-detail-mail-row'))return true;
    if(row&&row.closest('.yaya-detail-mails-pane,.yaya-force-mails-pane'))return true;
    if(d){
      try{if(typeof documentIssuMailYaya==='function'&&documentIssuMailYaya(d))return true;}catch(e){}
      const upper=v=>String(v||'').trim().toUpperCase();
      if(upper(d.type)==='MAIL'||upper(d.origine)==='MAIL'||upper(d.origineMail)==='MAIL')return true;
      if(d.contenuMail||d.corpsMail||d.objetMail||d.mailSubject||d.emailSubject||d.expediteur||d.from)return true;
    }
    return /Objet non renseign[eé]|\bMAIL\b/i.test(String(row&&row.textContent||''));
  }

  function isGmailUrl(url){return /mail\.google\.com/i.test(text(url));}

  function attachmentUrl(row,d,mail){
    const explicit=[d&&d.lienPieceJointe,d&&d.pieceJointeUrl,d&&d.attachmentUrl,d&&d.fichierUrl,d&&d.fileUrl,d&&d.oneDriveWebUrl,d&&d.dropboxUrl].map(text).find(Boolean);
    if(explicit)return explicit;
    const direct=directPiece(row);if(direct&&(!mail||!isGmailUrl(direct)))return direct;
    const generic=text(d&&d.lien);if(generic&&(!mail||!isGmailUrl(generic)))return generic;
    return '';
  }

  function openPiece(url){
    url=text(url);if(!url)return false;
    try{if(typeof voirPiece==='function'){voirPiece(url);return true;}}catch(e){}
    try{if(typeof window.voirPiece==='function'){window.voirPiece(url);return true;}}catch(e){}
    window.open(url,'_blank','noopener');return true;
  }

  function closeThen(fn){
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    setTimeout(fn,0);
  }

  function deleteDocument(id){
    id=text(id);if(!id)return;
    closeThen(()=>{
      try{if(typeof window.delDocument==='function'){window.delDocument(id);return;}}catch(e){}
      try{if(typeof delDocument==='function')delDocument(id);}catch(e){}
    });
  }

  function editDocumentFromModal(id){
    id=text(id);if(!id)return;
    closeThen(()=>{
      try{if(typeof window.editDocument==='function'){window.editDocument(id);return;}}catch(e){}
      try{if(typeof editDocument==='function')editDocument(id);}catch(e){}
    });
  }

  function docTitle(d,row){
    return text(d&&(d.pieceNom||d.nomFichier||d.filename||d.titre||d.objet||d.sujet))
      || text(row&&row.querySelector('strong')&&row.querySelector('strong').childNodes[0]&&row.querySelector('strong').childNodes[0].textContent)
      || 'Document chantier';
  }

  function openDocumentModalRead(row,d,id,url){
    const root=document.getElementById('modalRoot');if(!root)return false;
    const title=docTitle(d,row);
    const type=text(d&&(d.type||d.typeDoc))||'Document';
    const date=text(d&&d.date);
    const source=text(d&&(d.sujet||d.fournisseur||d.origine));
    root.innerHTML=''
      +'<div class="overlay">'
      +'<div class="modal yaya-document-read-modal" style="max-width:700px">'
      +'<h5>'+esc(title)+'<button type="button" onclick="closeModal()" aria-label="Fermer">×</button></h5>'
      +'<div class="yaya-document-read-meta">'
      +'<div><b>Type :</b> '+esc(type)+'</div>'
      +(date?'<div><b>Date :</b> '+esc(date)+'</div>':'')
      +(source?'<div><b>Référence :</b> '+esc(source)+'</div>':'')
      +'</div>'
      +'<div class="yaya-read-actions">'
      +'<button type="button" class="yaya-delete" data-yaya-doc-delete="'+esc(id)+'">Supprimer</button>'
      +'<button type="button" class="yaya-edit" data-yaya-doc-edit="'+esc(id)+'">Modifier</button>'
      +(url?'<button type="button" class="yaya-open" data-yaya-doc-open="'+esc(url)+'" data-yaya-doc-open-id="'+esc(id)+'">Voir le document</button>':'')
      +'<button type="button" class="btnp" onclick="closeModal()">Fermer</button>'
      +'</div></div></div>';
    return true;
  }

  function mailSubject(d){return text(d&&(d.objetMail||d.mailSubject||d.emailSubject||d.subject||d.objet||d.sujet))||'Objet non renseigné';}
  function mailSender(d){return text(d&&(d.nomMail||d.expediteur||d.from||d.sender))||'Expéditeur non renseigné';}
  function mailBody(d){
    if(!d)return '';
    const raw=d.contenuMail||d.corpsMail||d.bodyMail||d.mailBody||d.body||d.contenu||d.message||'';
    if(!raw)return '';
    const holder=document.createElement('div');holder.innerHTML=String(raw);
    return text(holder.textContent||holder.innerText||raw);
  }

  function openMailSubjectEditor(d,id){
    const root=document.getElementById('modalRoot');if(!root||!d)return false;
    const sender=mailSender(d);
    let subject=mailSubject(d);if(subject==='Objet non renseigné')subject='';
    root.innerHTML=''
      +'<div class="overlay">'
      +'<div class="modal yaya-mail-subject-modal">'
      +'<h5>Modifier l’objet<button type="button" class="yaya-mail-subject-cancel" aria-label="Fermer">×</button></h5>'
      +'<div class="yaya-mail-subject-body">'
      +'<input type="hidden" id="edDocCh" value="'+esc(d.chantierId||'')+'">'
      +'<input type="hidden" id="edDocType" value="'+esc(d.type||'MAIL')+'">'
      +'<input type="hidden" id="edDocSujet" value="'+esc(sender)+'">'
      +'<label for="edDocTitre">Objet du mail</label>'
      +'<input id="edDocTitre" type="text" value="'+esc(subject)+'" autocomplete="off" placeholder="Saisir l’objet du mail">'
      +'</div>'
      +'<div class="mfoot">'
      +'<button type="button" class="btn2 yaya-mail-subject-cancel">Annuler</button>'
      +'<button type="button" class="btnp yaya-mail-subject-save">Enregistrer</button>'
      +'</div></div></div>';
    root.querySelectorAll('.yaya-mail-subject-cancel').forEach(btn=>btn.addEventListener('click',()=>openMailBody(d,id)));
    root.querySelector('.yaya-mail-subject-save')?.addEventListener('click',()=>{
      const input=document.getElementById('edDocTitre');
      if(!input||!text(input.value)){try{if(typeof toast==='function')toast('Indique un objet',true);}catch(e){};input&&input.focus();return;}
      try{if(typeof window.__yayaSaveMailSubject==='function'){window.__yayaSaveMailSubject(id);return;}}catch(e){}
      try{if(typeof window.saveDocumentEdit==='function'){window.saveDocumentEdit(id);return;}}catch(e){}
      try{if(typeof saveDocumentEdit==='function')saveDocumentEdit(id);}catch(e){}
    });
    requestAnimationFrame(()=>document.getElementById('edDocTitre')?.focus());
    return true;
  }

  function openMailBody(d,id){
    const body=mailBody(d);
    if(body){
      const root=document.getElementById('modalRoot');if(!root)return false;
      const sujet=mailSubject(d),sender=mailSender(d),date=text(d&&d.date);
      root.innerHTML=''
        +'<div class="overlay">'
        +'<div class="modal yaya-mail-body-modal" data-yaya-mail-read-actions="1" style="max-width:760px">'
        +'<h5>'+esc(sujet)+'<button type="button" onclick="closeModal()" aria-label="Fermer">×</button></h5>'
        +'<div class="yaya-mail-body-meta"><div><b>De :</b> '+esc(sender)+'</div>'+(date?'<div><b>Date :</b> '+esc(date)+'</div>':'')+'</div>'
        +'<div class="yaya-mail-body-content">'+esc(body)+'</div>'
        +'<div class="yaya-read-actions">'
        +'<button type="button" class="yaya-delete" data-yaya-mail-delete="'+esc(id)+'">Supprimer</button>'
        +'<button type="button" class="yaya-edit" data-yaya-mail-edit="'+esc(id)+'">Modifier l’objet</button>'
        +'<button type="button" class="btnp" onclick="closeModal()">Fermer</button>'
        +'</div></div></div>';
      return true;
    }
    id=text(id);if(!id)return false;
    try{if(typeof voirMessageYaya==='function'){voirMessageYaya(id);return true;}}catch(e){}
    try{if(typeof window.voirMessageYaya==='function'){window.voirMessageYaya(id);return true;}}catch(e){}
    return false;
  }

  function openRow(row){
    const id=rowId(row);
    const d=dataForId(id);
    const mail=isMail(row,d);
    const piece=attachmentUrl(row,d,mail);
    if(mail&&id)return openMailBody(d,id);
    if(row&&row.closest('#pane-chantiers')&&id)return openDocumentModalRead(row,d,id,piece);
    if(piece)return openPiece(piece);
    return false;
  }

  function decorateRoot(root){
    if(!root||!root.querySelectorAll)return;
    const rows=[];
    if(root.matches&&root.matches(ROW_SELECTOR))rows.push(root);
    root.querySelectorAll(ROW_SELECTOR).forEach(row=>rows.push(row));
    rows.forEach(row=>{
      if(row.dataset.yayaDocClickReady==='1')return;
      row.dataset.yayaDocClickReady='1';
      row.removeAttribute('tabindex');row.removeAttribute('role');
      row.style.setProperty('outline','none','important');row.style.setProperty('box-shadow','none','important');
      const id=rowId(row),d=dataForId(id),mail=isMail(row,d);
      row.title=mail?'Cliquer pour lire le message':(row.closest('#pane-chantiers')?'Cliquer pour ouvrir le document':'Cliquer pour ouvrir');
    });
  }

  function renameTitle(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-section-action-row[data-section="documents"] .yaya-detail-section-action-title').forEach(el=>{
      if(el.textContent!=='DOCUMENTS & MAILS')el.textContent='DOCUMENTS & MAILS';
    });
  }

  function findRow(target){return target&&target.closest?target.closest(ROW_SELECTOR):null;}

  document.addEventListener('click',function(e){
    const open=e.target&&e.target.closest?e.target.closest('[data-yaya-doc-open]'):null;
    if(open){
      e.preventDefault();e.stopPropagation();
      window.__yayaPreviewDocumentId=text(open.dataset.yayaDocOpenId||'');
      openPiece(open.dataset.yayaDocOpen);
      return;
    }

    const editDoc=e.target&&e.target.closest?e.target.closest('[data-yaya-doc-edit]'):null;
    if(editDoc){e.preventDefault();e.stopPropagation();editDocumentFromModal(editDoc.dataset.yayaDocEdit);return;}

    const delDoc=e.target&&e.target.closest?e.target.closest('[data-yaya-doc-delete]'):null;
    if(delDoc){e.preventDefault();e.stopPropagation();deleteDocument(delDoc.dataset.yayaDocDelete);return;}

    const editMail=e.target&&e.target.closest?e.target.closest('[data-yaya-mail-edit]'):null;
    if(editMail){
      e.preventDefault();e.stopPropagation();
      const id=text(editMail.dataset.yayaMailEdit),d=dataForId(id);openMailSubjectEditor(d,id);return;
    }

    const delMail=e.target&&e.target.closest?e.target.closest('[data-yaya-mail-delete]'):null;
    if(delMail){e.preventDefault();e.stopPropagation();deleteDocument(delMail.dataset.yayaMailDelete);return;}

    const row=findRow(e.target);if(!row)return;
    if(e.target.closest('button,a,input,select,textarea,label'))return;
    e.preventDefault();e.stopPropagation();openRow(row);
  },true);

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      const p1=document.getElementById('pane-documents');
      const p2=document.getElementById('pane-chantiers');
      if(p1)decorateRoot(p1);
      if(p2)decorateRoot(p2);
      renameTitle();
    });
  }

  function observePane(pane){
    if(!pane||pane.dataset.yayaDocObserver==='1')return;
    pane.dataset.yayaDocObserver='1';
    new MutationObserver(function(mutations){
      for(const m of mutations){
        if(m.addedNodes&&m.addedNodes.length){schedule();return;}
      }
    }).observe(pane,{childList:true,subtree:true});
  }

  schedule();
  setTimeout(function(){observePane(document.getElementById('pane-documents'));observePane(document.getElementById('pane-chantiers'));schedule();},80);
  window.addEventListener('yaya:data-refreshed',schedule);
})();

(function(){
  'use strict';
  if(window.__yayaMailReadActionsLoaderV6)return;
  window.__yayaMailReadActionsLoaderV6=true;
  const s=document.createElement('script');
  s.src='mail-subject-edit.js?v=mailreadactions-8';
  s.async=false;
  s.onerror=()=>console.error('Yaya : chargement actions mail V6 impossible');
  document.head.appendChild(s);
})();
