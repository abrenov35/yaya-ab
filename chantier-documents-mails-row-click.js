(function(){
  'use strict';
  if(window.__yayaChantierDocumentsMailsRowClickV1)return;
  window.__yayaChantierDocumentsMailsRowClickV1=true;

  const STYLE_ID='yaya-chantier-documents-mails-row-click-v1';
  const ROW_SELECTOR=[
    '#pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row',
    '#pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row',
    '#pane-chantiers .yaya-force-mails-pane .yaya-detail-mail-row'
  ].join(',');

  function ensureStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
    style.textContent=`
      ${ROW_SELECTOR}{cursor:pointer!important;transition:background .12s ease,box-shadow .12s ease!important}
      ${ROW_SELECTOR}:hover{background:#f2f7fd!important;box-shadow:inset 3px 0 0 #2b6ea8!important}
      ${ROW_SELECTOR}:focus{outline:2px solid #77a9d4!important;outline-offset:-2px!important;background:#f2f7fd!important}
    `;
  }

  function rowId(row){
    if(!row)return '';
    const ids=[
      row.dataset&&row.dataset.rowId,
      row.dataset&&row.dataset.mailId,
      row.dataset&&row.dataset.id,
      row.querySelector('[data-row-id]')?.dataset?.rowId,
      row.querySelector('[data-mail-id]')?.dataset?.mailId,
      row.querySelector('[data-id]')?.dataset?.id
    ];
    for(const value of ids){const id=String(value||'').trim();if(id)return id;}
    const raw=[...row.querySelectorAll('[onclick]')].map(el=>String(el.getAttribute('onclick')||'')).join(' ');
    const m=raw.match(/(?:voirMessageYaya|editDocument|delDocument)\(['\"]([^'\"]+)/i);
    return m&&m[1]?String(m[1]).trim():'';
  }

  function documentData(id){
    if(!id)return null;
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.documents)){
        return S.documents.find(d=>String(d&&d.id||'')===String(id))||null;
      }
    }catch(e){}
    return null;
  }

  function directPiece(row){
    if(!row)return '';
    const dataLink=row.querySelector('[data-lien]')?.getAttribute('data-lien');
    if(String(dataLink||'').trim())return String(dataLink).trim();
    const raw=[...row.querySelectorAll('[onclick]')].map(el=>String(el.getAttribute('onclick')||'')).join(' ');
    const m=raw.match(/voirPiece\(['\"]([^'\"]+)/i);
    return m&&m[1]?String(m[1]).trim():'';
  }

  function isMail(row,d){
    if(row&&row.classList.contains('yaya-detail-mail-row'))return true;
    if(row&&row.closest('.yaya-detail-mails-pane,.yaya-force-mails-pane'))return true;
    if(!d)return false;
    const upper=v=>String(v||'').trim().toUpperCase();
    if(upper(d.type)==='MAIL'||upper(d.origineMail)==='MAIL'||upper(d.origine)==='MAIL')return true;
    return !!(d.contenuMail||d.corpsMail||d.objetMail||d.mailSubject||d.emailSubject||d.expediteur||d.from);
  }

  function openPiece(url){
    url=String(url||'').trim();
    if(!url)return false;
    try{if(typeof voirPiece==='function'){voirPiece(url);return true;}}catch(e){}
    try{if(typeof window.voirPiece==='function'){window.voirPiece(url);return true;}}catch(e){}
    window.open(url,'_blank','noopener');
    return true;
  }

  function openMail(id){
    id=String(id||'').trim();
    if(!id)return false;
    try{if(typeof voirMessageYaya==='function'){voirMessageYaya(id);return true;}}catch(e){}
    try{if(typeof window.voirMessageYaya==='function'){window.voirMessageYaya(id);return true;}}catch(e){}
    return false;
  }

  function openRow(row){
    if(!row)return false;
    const id=rowId(row);
    const d=documentData(id);

    // 1. Pièce jointe : toujours prioritaire.
    const piece=directPiece(row)||String(d&&d.lien||'').trim();
    if(piece)return openPiece(piece);

    // 2. Mail sans pièce jointe : ouvrir le corps du message.
    if(isMail(row,d)&&id)return openMail(id);

    return false;
  }

  function decorate(){
    ensureStyle();
    document.querySelectorAll(ROW_SELECTOR).forEach(row=>{
      row.setAttribute('role','button');
      row.setAttribute('tabindex','0');
      const id=rowId(row);
      const d=documentData(id);
      const piece=directPiece(row)||String(d&&d.lien||'').trim();
      row.title=piece?'Cliquer pour ouvrir la pièce jointe':'Cliquer pour lire le message';
    });

    // Titre de la section chantier.
    document.querySelectorAll('#pane-chantiers .yaya-detail-section-action-row[data-section="documents"] .yaya-detail-section-action-title').forEach(el=>{
      el.textContent='DOCUMENTS & MAILS';
    });
  }

  function handleClick(e){
    const row=e.target&&e.target.closest?e.target.closest(ROW_SELECTOR):null;
    if(!row)return;
    if(e.target.closest('button,a,input,select,textarea,label'))return;
    e.preventDefault();
    e.stopPropagation();
    openRow(row);
  }

  function handleKey(e){
    if(e.key!=='Enter'&&e.key!==' ')return;
    const row=e.target&&e.target.closest?e.target.closest(ROW_SELECTOR):null;
    if(!row)return;
    if(e.target.closest('button,a,input,select,textarea,label'))return;
    e.preventDefault();
    openRow(row);
  }

  document.addEventListener('click',handleClick,true);
  document.addEventListener('keydown',handleKey,true);

  decorate();
  [50,180,500,1200,2500].forEach(ms=>setTimeout(decorate,ms));
  const pane=document.getElementById('pane-chantiers');
  if(pane)new MutationObserver(()=>requestAnimationFrame(decorate)).observe(pane,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',()=>requestAnimationFrame(decorate));
})();
