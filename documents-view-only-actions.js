(function(){
  'use strict';

  const STYLE_ID='yaya-documents-view-only-css-v8';
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
      transition:background .12s ease,box-shadow .12s ease!important;
    }
    ${GLOBAL_ROW}:hover,${DETAIL_ROW}:hover{
      background:#eef5fc!important;
      box-shadow:inset 3px 0 0 #2b6ea8!important;
    }
    ${GLOBAL_ROW}:focus,${DETAIL_ROW}:focus{
      outline:2px solid #77a9d4!important;
      outline-offset:-2px!important;
      background:#eef5fc!important;
    }
  `;

  function text(v){return String(v==null?'':v).trim();}

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

  function openPiece(url){
    url=text(url);
    if(!url)return false;
    try{if(typeof voirPiece==='function'){voirPiece(url);return true;}}catch(e){}
    try{if(typeof window.voirPiece==='function'){window.voirPiece(url);return true;}}catch(e){}
    window.open(url,'_blank','noopener');
    return true;
  }

  function openMail(id){
    id=text(id);
    if(!id)return false;
    try{if(typeof voirMessageYaya==='function'){voirMessageYaya(id);return true;}}catch(e){}
    try{if(typeof window.voirMessageYaya==='function'){window.voirMessageYaya(id);return true;}}catch(e){}
    return false;
  }

  function openRow(row){
    const id=rowId(row);
    const d=dataForRow(row);

    // Une pièce jointe est toujours prioritaire.
    const piece=directPiece(row)||text(d&&d.lien);
    if(piece)return openPiece(piece);

    // Mail sans pièce jointe : on ouvre le corps du message.
    if(id&&isMail(row,d))return openMail(id);

    return false;
  }

  function decorate(){
    document.querySelectorAll(GLOBAL_ROW+','+DETAIL_ROW).forEach(row=>{
      row.setAttribute('role','button');
      row.setAttribute('tabindex','0');
      const d=dataForRow(row);
      const piece=directPiece(row)||text(d&&d.lien);
      row.title=piece?'Cliquer pour ouvrir la pièce jointe':'Cliquer pour lire le message';
    });

    // Titre de la section dans la fiche chantier.
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

  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'&&e.key!==' ')return;
    const row=findRow(e.target);
    if(!row)return;
    if(e.target.closest('button,a,input,select,textarea,label'))return;
    e.preventDefault();
    openRow(row);
  },true);

  decorate();
  [50,180,500,1200,2500].forEach(ms=>setTimeout(decorate,ms));
  new MutationObserver(()=>requestAnimationFrame(decorate)).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',()=>requestAnimationFrame(decorate));
})();
