(function(){
  'use strict';

  if(window.__yayaDocumentsRowClickV7)return;
  window.__yayaDocumentsRowClickV7=true;

  const STYLE_ID='yaya-documents-view-only-css-v7';
  let style=document.getElementById(STYLE_ID);
  if(!style){
    style=document.createElement('style');
    style.id=STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent=`
    #pane-documents button[onclick^="openDocumentModal("],
    #pane-documents button[onclick^="editDocument("],
    #pane-documents button[onclick^="delDocument("]{display:none!important}

    #pane-documents > .note{margin:8px 0 6px!important;color:#162D49!important;opacity:1!important;font-size:11px!important;font-weight:800!important;letter-spacing:0!important}
    #pane-documents > .card{margin:0!important;padding:0!important;background:#fff!important;border:0!important;border-left:0!important;border-radius:0!important;box-shadow:none!important}
    #pane-documents > .card > .achligne.ligR{min-height:70px!important;padding:13px 18px!important;border-top:1px solid #DDE3EA!important;color:#162D49!important;background:#fff!important}
    #pane-documents > .card > .achligne.ligR:last-child{border-bottom:1px solid #DDE3EA!important}

    /* Toutes les lignes de Documents sont des lignes de lecture. */
    #pane-documents .achligne.ligR[data-id]{cursor:pointer!important;transition:background .12s ease,box-shadow .12s ease!important}
    #pane-documents .achligne.ligR[data-id]:hover{background:#f5f9fd!important;box-shadow:inset 3px 0 0 #2b6ea8!important}
    #pane-documents .achligne.ligR[data-id]:focus{outline:2px solid #77a9d4!important;outline-offset:-2px!important;background:#f5f9fd!important}

    #pane-documents .achligne.ligR > .badge:nth-child(1){
      display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;
      width:auto!important;min-width:0!important;max-width:100%!important;min-height:0!important;padding:0!important;
      background:transparent!important;color:#162D49!important;border:0!important;border-radius:0!important;
      font-size:10px!important;font-weight:800!important;line-height:1!important;white-space:nowrap!important;
      overflow:visible!important;word-break:keep-all!important;text-align:left!important;box-shadow:none!important;flex-shrink:0!important
    }
    #pane-documents .achligne.ligR > .badge:nth-child(2){min-width:0!important;padding:0!important;background:transparent!important;color:#162D49!important;border:0!important;border-radius:0!important;font-size:12px!important;font-weight:800!important;text-align:left!important;box-shadow:none!important}
    #pane-documents .achligne.ligR > .badge:nth-child(3){min-width:0!important;padding:0!important;background:transparent!important;color:#162D49!important;border:0!important;border-radius:0!important;font-size:11px!important;font-weight:500!important;text-align:left!important;box-shadow:none!important}

    @media(max-width:620px){
      #pane-documents > .card > .achligne.ligR{overflow:visible!important}
      #pane-documents .achligne.ligR > .badge:nth-child(1){font-size:9px!important;padding:0!important;white-space:nowrap!important}
    }
  `;

  function rowId(row){
    let id=String(row&&row.dataset&&row.dataset.id||'').trim();
    if(id)return id;
    const el=row&&row.querySelector('[data-mail-id]');
    if(el&&el.dataset&&el.dataset.mailId)return String(el.dataset.mailId).trim();
    const onclick=[...(row?row.querySelectorAll('[onclick]'):[])].map(el=>String(el.getAttribute('onclick')||'')).join(' ');
    const m=onclick.match(/(?:voirMessageYaya|editDocument|delDocument)\(['\"]([^'\"]+)/i);
    return m&&m[1]?String(m[1]).trim():'';
  }

  function docForRow(row){
    const id=rowId(row);
    if(!id)return null;
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.documents)){
        const found=S.documents.find(d=>String(d&&d.id||'')===id);
        if(found)return found;
      }
    }catch(_){ }
    try{
      if(typeof historiquePiecesYaya==='function'){
        const found=(historiquePiecesYaya()||[]).find(d=>String(d&&d.id||'')===id);
        if(found)return found;
      }
    }catch(_){ }
    return null;
  }

  function nativeView(row){
    const nodes=[...(row?row.querySelectorAll('[onclick]'):[])];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      let m=raw.match(/voirPiece\(['\"]([^'\"]+)/i);
      if(m&&m[1])return {kind:'piece',value:m[1]};
      m=raw.match(/voirMessageYaya\(['\"]([^'\"]+)/i);
      if(m&&m[1])return {kind:'mail',value:m[1]};
    }
    return null;
  }

  function isMail(d,row){
    if(d){
      try{if(typeof documentIssuMailYaya==='function'&&documentIssuMailYaya(d))return true;}catch(_){ }
      const upper=v=>String(v||'').trim().toUpperCase();
      if(upper(d.type)==='MAIL'||upper(d.origine)==='MAIL'||upper(d.origineMail)==='MAIL')return true;
      if(d.contenuMail||d.corpsMail||d.objetMail||d.mailSubject||d.emailSubject||d.expediteur||d.from)return true;
    }
    const text=String(row&&row.textContent||'');
    return /Objet non renseign[eé]|\bMAIL\b/i.test(text);
  }

  function openPiece(url){
    url=String(url||'').trim();
    if(!url)return false;
    try{
      if(typeof voirPiece==='function'){voirPiece(url);return true;}
    }catch(_){ }
    try{
      if(typeof window.voirPiece==='function'){window.voirPiece(url);return true;}
    }catch(_){ }
    window.open(url,'_blank','noopener');
    return true;
  }

  function openMail(id){
    id=String(id||'').trim();
    if(!id)return false;
    try{
      if(typeof voirMessageYaya==='function'){voirMessageYaya(id);return true;}
    }catch(_){ }
    try{
      if(typeof window.voirMessageYaya==='function'){window.voirMessageYaya(id);return true;}
    }catch(_){ }
    return false;
  }

  function openRow(row){
    if(!row)return false;

    /* 1. Si la ligne contient déjà une vraie action de lecture, elle est prioritaire. */
    const native=nativeView(row);
    if(native&&native.kind==='piece')return openPiece(native.value);

    const d=docForRow(row);

    /* 2. Pièce jointe enregistrée sur le document/mail. */
    const lien=String(d&&d.lien||'').trim();
    if(lien)return openPiece(lien);

    /* 3. Mail sans PJ : ouvrir le corps du message. */
    if(native&&native.kind==='mail')return openMail(native.value);
    const id=rowId(row);
    if(id&&isMail(d,row))return openMail(id);

    return false;
  }

  function renameTitle(){
    const pane=document.getElementById('pane-documents');
    if(!pane)return;
    const walker=document.createTreeWalker(pane,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      if(String(node.nodeValue||'').trim().toUpperCase()==='DOCUMENTS'){
        node.nodeValue=String(node.nodeValue).replace(/DOCUMENTS/i,'DOCUMENTS & MAILS');
        break;
      }
    }
  }

  function decorateRows(){
    const pane=document.getElementById('pane-documents');
    if(!pane)return;
    pane.querySelectorAll('.achligne.ligR[data-id]').forEach(row=>{
      row.setAttribute('role','button');
      row.setAttribute('tabindex','0');
      const d=docForRow(row);
      row.title=(d&&String(d.lien||'').trim())?'Cliquer pour ouvrir la pièce jointe':'Cliquer pour lire';
    });
  }

  function apply(){renameTitle();decorateRows();}

  /* Délégation : reste active même si renderDocuments reconstruit toutes les lignes. */
  document.addEventListener('click',function(e){
    const row=e.target&&e.target.closest?e.target.closest('#pane-documents .achligne.ligR[data-id]'):null;
    if(!row)return;
    if(e.target.closest('button,a,input,select,textarea,label'))return;
    e.preventDefault();
    openRow(row);
  },true);

  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'&&e.key!==' ')return;
    const row=e.target&&e.target.closest?e.target.closest('#pane-documents .achligne.ligR[data-id]'):null;
    if(!row)return;
    if(e.target.closest('button,a,input,select,textarea,label'))return;
    e.preventDefault();
    openRow(row);
  },true);

  apply();
  [50,200,600,1400,2800].forEach(ms=>setTimeout(apply,ms));
  const pane=document.getElementById('pane-documents');
  if(pane)new MutationObserver(()=>requestAnimationFrame(apply)).observe(pane,{childList:true,subtree:true,characterData:true});
  window.addEventListener('yaya:data-refreshed',()=>requestAnimationFrame(apply));
})();
