(function(){
  'use strict';

  const STYLE_ID='yaya-documents-view-only-css-v5';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #pane-documents button[onclick^="openDocumentModal("],
    #pane-documents button[onclick^="editDocument("],
    #pane-documents button[onclick^="delDocument("]{display:none!important}

    #pane-documents > .note{margin:8px 0 6px!important;color:#162D49!important;opacity:1!important;font-size:11px!important;font-weight:800!important;letter-spacing:0!important}
    #pane-documents > .card{margin:0!important;padding:0!important;background:#fff!important;border:0!important;border-left:0!important;border-radius:0!important;box-shadow:none!important}
    #pane-documents > .card > .achligne.ligR{min-height:70px!important;padding:13px 18px!important;border-top:1px solid #DDE3EA!important;color:#162D49!important;background:#fff!important}
    #pane-documents > .card > .achligne.ligR:last-child{border-bottom:1px solid #DDE3EA!important}

    /* Toute la ligne ouvre le document, sauf clic sur une action. */
    #pane-documents .achligne.ligR[data-yaya-doc-readable="1"]{cursor:pointer!important;transition:background .12s ease,box-shadow .12s ease!important}
    #pane-documents .achligne.ligR[data-yaya-doc-readable="1"]:hover{background:#f5f9fd!important;box-shadow:inset 3px 0 0 #2b6ea8!important}
    #pane-documents .achligne.ligR[data-yaya-doc-readable="1"]:focus{outline:2px solid #77a9d4!important;outline-offset:-2px!important;background:#f5f9fd!important}

    /* Type du document : toujours sur une seule ligne. */
    #pane-documents .achligne.ligR > .badge:nth-child(1){
      display:inline-flex!important;
      align-items:center!important;
      justify-content:flex-start!important;
      width:auto!important;
      min-width:0!important;
      max-width:100%!important;
      min-height:0!important;
      padding:0!important;
      background:transparent!important;
      color:#162D49!important;
      border:0!important;
      border-radius:0!important;
      font-size:10px!important;
      font-weight:800!important;
      line-height:1!important;
      white-space:nowrap!important;
      overflow:visible!important;
      word-break:keep-all!important;
      text-align:left!important;
      box-shadow:none!important;
      flex-shrink:0!important;
    }

    #pane-documents .achligne.ligR > .badge:nth-child(2){min-width:0!important;padding:0!important;background:transparent!important;color:#162D49!important;border:0!important;border-radius:0!important;font-size:12px!important;font-weight:800!important;text-align:left!important;box-shadow:none!important}
    #pane-documents .achligne.ligR > .badge:nth-child(3){min-width:0!important;padding:0!important;background:transparent!important;color:#162D49!important;border:0!important;border-radius:0!important;font-size:11px!important;font-weight:500!important;text-align:left!important;box-shadow:none!important}

    @media(max-width:620px){
      #pane-documents > .card > .achligne.ligR{overflow:visible!important}
      #pane-documents .achligne.ligR > .badge:nth-child(1){font-size:9px!important;padding:0!important;white-space:nowrap!important}
    }
  `;
  document.head.appendChild(style);

  function docForRow(row){
    const id=String(row?.dataset?.id||'');
    if(!id)return null;
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.documents)){
        return S.documents.find(d=>String(d?.id||'')===id)||null;
      }
    }catch(_){ }
    return null;
  }

  function openRowDocument(row){
    const d=docForRow(row);
    const lien=String(d?.lien||'').trim();
    if(!lien)return false;
    if(typeof window.voirPiece==='function'){
      window.voirPiece(lien);
      return true;
    }
    window.open(lien,'_blank','noopener');
    return true;
  }

  function decorateRows(){
    document.querySelectorAll('#pane-documents .achligne.ligR').forEach(row=>{
      const d=docForRow(row);
      const lien=String(d?.lien||'').trim();
      if(!lien)return;
      row.dataset.yayaDocReadable='1';
      row.setAttribute('role','button');
      row.setAttribute('tabindex','0');
      row.title='Cliquer pour lire le document';
      if(row.dataset.yayaDocClickBound==='1')return;
      row.dataset.yayaDocClickBound='1';
      row.addEventListener('click',e=>{
        if(e.target?.closest?.('button,a,input,select,textarea,label'))return;
        openRowDocument(row);
      });
      row.addEventListener('keydown',e=>{
        if(e.key!=='Enter'&&e.key!==' ')return;
        if(e.target?.closest?.('button,a,input,select,textarea'))return;
        e.preventDefault();
        openRowDocument(row);
      });
    });
  }

  function renameTitle(){
    const pane=document.getElementById('pane-documents');
    if(!pane)return;
    const addBtn=[...pane.querySelectorAll('button')].find(b=>/ajouter un document/i.test(String(b.textContent||'')));
    const zone=addBtn?.parentElement||pane;
    const candidates=[...zone.querySelectorAll('h1,h2,h3,h4,h5,strong,b,span,div')];
    const title=candidates.find(el=>String(el.textContent||'').trim().toUpperCase()==='DOCUMENTS');
    if(title)title.textContent='DOCUMENTS & MAILS';
  }

  function apply(){renameTitle();decorateRows();}
  apply();
  setTimeout(apply,80);
  setTimeout(apply,350);
  setTimeout(apply,1200);

  const pane=document.getElementById('pane-documents');
  if(pane){
    new MutationObserver(()=>requestAnimationFrame(apply)).observe(pane,{childList:true,subtree:true});
  }
  window.addEventListener('yaya:data-refreshed',apply);
})();
