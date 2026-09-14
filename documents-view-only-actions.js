(function(){
  'use strict';

  const STYLE_ID='yaya-documents-view-only-css-v9';
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

  style.textContent=`
    #pane-documents button[onclick^="openDocumentModal("],
    #pane-documents button[onclick^="editDocument("],
    #pane-documents button[onclick^="delDocument("]{display:none!important}

    #pane-documents > .note{margin:8px 0 6px!important;color:#162D49!important;opacity:1!important;font-size:11px!important;font-weight:800!important}
    #pane-documents > .card{margin:0!important;padding:0!important;background:#fff!important;border:0!important;border-radius:0!important;box-shadow:none!important}

    ${GLOBAL_ROW},${DETAIL_ROW}{
      cursor:pointer!important;
      outline:none!important;
      box-shadow:none!important;
      transition:background .12s ease!important;
    }
    ${DETAIL_ROW}{
      border-left:0!important;
      border-right:0!important;
      border-top:0!important;
      border-bottom:1px solid #dfe6ee!important;
    }
    ${GLOBAL_ROW}:hover,${DETAIL_ROW}:hover{
      background:#f4f8fc!important;
      outline:none!important;
      box-shadow:none!important;
    }
    ${GLOBAL_ROW}:focus,${DETAIL_ROW}:focus,
    ${GLOBAL_ROW}:focus-visible,${DETAIL_ROW}:focus-visible{
      outline:none!important;
      box-shadow:none!important;
    }

    .yaya-mail-body-modal .yaya-mail-body-meta{
      display:grid!important;
      gap:5px!important;
      margin:0 0 14px!important;
      padding:12px 14px!important;
      border:1px solid #d7e1ec!important;
      border-radius:10px!important;
      background:#f7f9fc!important;
      color:#24364d!important;
      font-size:12px!important;
    }
    .yaya-mail-body-modal .yaya-mail-body-content{
      max-height:58vh!important;
      overflow:auto!important;
      padding:15px 16px!important;
      border:1px solid #d7e1ec!important;
      border-radius:10px!important;
      background:#fff!important;
      color:#1f2937!important;
      font-size:13px!important;
      line-height:1.55!important;
      white-space:pre-wrap!important;
      overflow-wrap:anywhere!important;
    }
  `;

  function text(v){return String(v==null?'':v).trim();}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

  function rowId(row){
    if(!row)return '';
    const direct=[
      row.dataset&&row.dataset.id,
      row.dataset&&row.dataset.rowId,
      row.dataset&&row.dataset.mailId,
      row.dataset&&row.dataset.documentId
    ];
    for(const v of direct){const id=text(v);if(id)return id;}

    for(const sel of ['[data-row-id]','[data-mail-id]','[data-id]','[data-document-id]']){
      const el=row.querySelector(sel);
      if(!el)continue;
      const id=text(el.dataset.rowId||el.dataset.mailId||el.dataset.id||el.dataset.documentId);
      if(id)return id;
    }

    const raw=[...row.querySelectorAll('[onclick]')].map(el=>String(el.getAttribute('onclick')||'')).join(' ');
    const m=raw.match(/(?:voirMessageYaya|editDocument|delDocument)\(['\"]([^'\"]+)/i);
    return m&&m[1]?text(m[1]):'';
  }

  function dataForRow(row){
    const id=rowId(row);
    if(!id)return null;
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.documents)){
        const d=S.documents.find(x=>String(x&&x.id||'')===id);
        if(d)return d;
      }
    }catch(e){}
    try{
      if(typeof historiquePiecesYaya==='function'){
        const d=(historiquePiecesYaya()||[]).find(x=>String(x&&x.id||'')===id);
        if(d)return d;
      }
    }catch(e){}
    return null;
  }

  function directPiece(row){
    if(!row)return '';
    const dl=row.querySelector('[data-lien]');
    const dataLien=text(dl&&dl.getAttribute('data-lien'));
    if(dataLien)return dataLien;

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

  function isGmailUrl(url){
    return /^(?:https?:\/\/)?(?:mail\.)?google\.com\/mail\//i.test(text(url)) || /mail\.google\.com/i.test(text(url));
  }

  function attachmentUrl(row,d,mail){
    const explicit=[
      d&&d.lienPieceJointe,
      d&&d.pieceJointeUrl,
      d&&d.attachmentUrl,
      d&&d.fichierUrl,
      d&&d.fileUrl,
      d&&d.oneDriveWebUrl,
      d&&d.dropboxUrl
    ].map(text).find(Boolean);
    if(explicit)return explicit;

    const direct=directPiece(row);
    if(direct && (!mail || !isGmailUrl(direct)))return direct;

    const generic=text(d&&d.lien);
    if(generic && (!mail || !isGmailUrl(generic)))return generic;

    return '';
  }

  function openPiece(url){
    url=text(url);
    if(!url)return false;
    try{if(typeof voirPiece==='function'){voirPiece(url);return true;}}catch(e){}
    try{if(typeof window.voirPiece==='function'){window.voirPiece(url);return true;}}catch(e){}
    window.open(url,'_blank','noopener');
    return true;
  }

  function mailSubject(d){
    return text(d&&(d.objetMail||d.mailSubject||d.emailSubject||d.subject||d.objet||d.sujet))||'Objet non renseigné';
  }
  function mailSender(d){
    return text(d&&(d.nomMail||d.expediteur||d.from||d.sender))||'Expéditeur non renseigné';
  }
  function mailBody(d){
    if(!d)return '';
    const raw=d.contenuMail||d.corpsMail||d.bodyMail||d.mailBody||d.body||d.contenu||d.message||'';
    if(!raw)return '';
    const holder=document.createElement('div');
    holder.innerHTML=String(raw);
    return text(holder.textContent||holder.innerText||raw);
  }

  function openMailBody(d,id){
    const body=mailBody(d);
    if(body){
      const root=document.getElementById('modalRoot');
      if(!root)return false;
      const sujet=mailSubject(d);
      const sender=mailSender(d);
      const date=text(d&&d.date);
      root.innerHTML=''
        +'<div class="overlay">'
        +'<div class="modal yaya-mail-body-modal" style="max-width:760px">'
        +'<h5>'+esc(sujet)+'<button type="button" onclick="closeModal()" aria-label="Fermer">×</button></h5>'
        +'<div class="yaya-mail-body-meta"><div><b>De :</b> '+esc(sender)+'</div>'+(date?'<div><b>Date :</b> '+esc(date)+'</div>':'')+'</div>'
        +'<div class="yaya-mail-body-content">'+esc(body)+'</div>'
        +'<div class="mfoot" style="justify-content:flex-end"><button type="button" class="btnp" onclick="closeModal()">Fermer</button></div>'
        +'</div></div>';
      return true;
    }

    id=text(id);
    if(!id)return false;
    try{if(typeof voirMessageYaya==='function'){voirMessageYaya(id);return true;}}catch(e){}
    try{if(typeof window.voirMessageYaya==='function'){window.voirMessageYaya(id);return true;}}catch(e){}
    return false;
  }

  function openRow(row){
    const id=rowId(row);
    const d=dataForRow(row);
    const mail=isMail(row,d);

    // Pour un mail, un lien Gmail n'est PAS une pièce jointe : Gmail refuse l'iframe.
    const piece=attachmentUrl(row,d,mail);
    if(piece)return openPiece(piece);

    // Mail sans PJ : lecture du corps du message directement dans Yaya.
    if(id&&mail)return openMailBody(d,id);

    return false;
  }

  function decorate(){
    document.querySelectorAll(GLOBAL_ROW+','+DETAIL_ROW).forEach(row=>{
      row.removeAttribute('tabindex');
      row.removeAttribute('role');
      row.style.setProperty('outline','none','important');
      row.style.setProperty('box-shadow','none','important');
      const d=dataForRow(row);
      const mail=isMail(row,d);
      const piece=attachmentUrl(row,d,mail);
      row.title=piece?'Cliquer pour ouvrir la pièce jointe':(mail?'Cliquer pour lire le message':'Cliquer pour ouvrir');
    });

    document.querySelectorAll('#pane-chantiers .yaya-detail-section-action-row[data-section="documents"] .yaya-detail-section-action-title').forEach(el=>{
      el.textContent='DOCUMENTS & MAILS';
    });
  }

  function findRow(target){
    if(!target||!target.closest)return null;
    return target.closest(GLOBAL_ROW+','+DETAIL_ROW);
  }

  document.addEventListener('click',function(e){
    const row=findRow(e.target);
    if(!row)return;
    if(e.target.closest('button,a,input,select,textarea,label'))return;
    e.preventDefault();
    e.stopPropagation();
    openRow(row);
  },true);

  decorate();
  [50,180,500,1200,2500].forEach(ms=>setTimeout(decorate,ms));
  new MutationObserver(()=>requestAnimationFrame(decorate)).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',()=>requestAnimationFrame(decorate));
})();
