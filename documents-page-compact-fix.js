(function(){
  'use strict';
  const STYLE_ID='yaya-documents-page-compact-fix';
  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
    style.textContent=`
      #pane-documents .card{overflow:hidden!important;padding:0 16px!important}
      #pane-documents .achligne.ligR{display:grid!important;grid-template-columns:170px 170px minmax(300px,1fr) 100px!important;column-gap:16px!important;align-items:center!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;padding:4px 0!important;overflow:hidden!important;box-sizing:border-box!important;border-bottom:1px solid #d9e2ec!important}
      #pane-documents .achligne.ligR>*{min-width:0!important;max-width:100%!important;box-sizing:border-box!important;margin:0!important}
      #pane-documents .achligne.ligR>span:first-child{height:34px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 10px!important;border:1px solid #c9d8e8!important;border-radius:8px!important;background:#fff!important;font-weight:700!important;font-size:11px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-documents .achligne.ligR>span:nth-child(2){display:flex!important;align-items:center!important;height:34px!important;padding:0!important;background:transparent!important;border:0!important;font-weight:700!important;font-size:12px!important;color:#071b38!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-documents .achligne.ligR .des{display:flex!important;align-items:center!important;height:34px!important;width:100%!important;font-size:11.5px!important;color:#7a8798!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.25!important}
      #pane-documents .achligne.ligR>small:nth-child(4){display:flex!important;align-items:center!important;justify-content:center!important;height:34px!important;font-size:10.5px!important;font-weight:600!important;color:#52657a!important;white-space:nowrap!important}
      @media(max-width:760px){
        #pane-documents{overflow-x:hidden!important}
        #pane-documents .card{width:100%!important;min-width:0!important;padding:0 8px!important}
        #pane-documents .achligne.ligR{grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:"type date" "chantier chantier" "objet objet"!important;column-gap:8px!important;row-gap:5px!important;height:auto!important;min-height:104px!important;max-height:none!important;padding:9px 4px!important;overflow:visible!important}
        #pane-documents .achligne.ligR>span:first-child{grid-area:type!important;justify-self:start!important;width:auto!important;max-width:100%!important}
        #pane-documents .achligne.ligR>span:nth-child(2){grid-area:chantier!important}
        #pane-documents .achligne.ligR>.des{grid-area:objet!important;height:auto!important;min-height:22px!important}
        #pane-documents .achligne.ligR>small:nth-child(4){grid-area:date!important;justify-content:flex-end!important}
      }
    `;
  }
  function docByRow(row){const id=String(row.dataset.id||'');try{if(typeof S!=='undefined'&&S&&Array.isArray(S.documents))return S.documents.find(d=>String(d.id)===id)||null;}catch(e){}return null;}
  function clean(v){return String(v||'').replace(/\s+/g,' ').trim();}
  function formatDate(v){const s=String(v||'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s.split('-').reverse().join('/'):(s||'—');}
  function isMail(d){if(!d)return false;const t=clean(d.type).toUpperCase();return t==='MAIL'||clean(d.origine).toUpperCase().startsWith('MAIL')||clean(d.origineMail).toUpperCase().startsWith('MAIL');}
  function hiddenFromFeed(d){if(!d)return true;const t=clean(d.type).toUpperCase();const id=clean(d.id);return t==='MAIL_PJ'||t==='PHOTO'||id.startsWith('__');}
  function typeOf(d){return isMail(d)?'MAIL':'DOCUMENT';}
  function chantierOf(d){try{if(d&&typeof chantierById==='function'){const c=chantierById(d.chantierId);if(c)return clean(c.nom);}}catch(e){}return clean(d&&d.chantier)||'?';}
  function objetOf(d){
    if(!d)return '';
    if(isMail(d))return clean(d.objetMail||d.objet||d.subject||d.mailSubject||d.emailSubject||d.titre||'Objet non renseigné');
    return clean(d.pieceNom||d.titre||d.sujet||d.intitule||d.nomFichier||d.fichier||'Document');
  }
  function timeOf(d,index){
    const raw=d&&(d.createdAt||d.horodatage||d.dateCreation||d.date);
    if(typeof raw==='number'&&Number.isFinite(raw))return (raw-25569)*86400000;
    const t=Date.parse(String(raw||''));
    return Number.isFinite(t)?t:index;
  }
  function compact(){
    const rows=[...document.querySelectorAll('#pane-documents .card .achligne.ligR')];
    const items=[];
    rows.forEach((row,index)=>{
      const d=docByRow(row);
      if(hiddenFromFeed(d)){row.style.setProperty('display','none','important');return;}
      items.push({row,d,index,time:timeOf(d,index)});
    });
    items.sort((a,b)=>b.time-a.time||String(b.d&&b.d.id||'').localeCompare(String(a.d&&a.d.id||'')));

    const parent=items[0]&&items[0].row.parentElement;
    if(parent&&items.every(item=>item.row.parentElement===parent)){
      const current=[...parent.children].filter(el=>items.some(item=>item.row===el));
      const wanted=items.map(item=>item.row);
      const different=current.length!==wanted.length||current.some((el,i)=>el!==wanted[i]);
      if(different)wanted.forEach(row=>parent.appendChild(row));
    }

    items.forEach(({row,d})=>{
      row.style.setProperty('display','grid','important');
      row.style.setProperty('padding','4px 0','important');
      row.style.setProperty('min-height','0','important');
      row.dataset.yayaKind=isMail(d)?'mail':'document';

      const values=[typeOf(d),chantierOf(d),objetOf(d),formatDate(d&&d.date)];
      const sig=JSON.stringify(values);
      if(row.dataset.yayaCompactSig===sig)return;
      row.dataset.yayaCompactSig=sig;
      row.dataset.yayaCompact='1';

      let first=row.children[0];
      if(!first){first=document.createElement('span');row.appendChild(first);}
      first.textContent=values[0];first.title=values[0];
      while(row.children.length>1)row.removeChild(row.children[1]);

      const chantier=document.createElement('span');chantier.textContent=values[1];chantier.title=values[1];
      const objet=document.createElement('small');objet.className='des';objet.textContent=values[2];objet.title=values[2];
      const date=document.createElement('small');date.textContent=values[3];date.title=values[3];
      row.append(chantier,objet,date);
    });
  }
  function run(){installStyle();compact();}
  run();setTimeout(run,50);setTimeout(run,250);setTimeout(run,1000);
  const root=document.getElementById('pane-documents')||document.body||document.documentElement;
  new MutationObserver(()=>requestAnimationFrame(compact)).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',compact);
})();

/* V70 — Modifier le document : Supprimer remplace Annuler. */
(function(){
  'use strict';
  if(window.__yayaDocumentEditDeleteV70)return;
  window.__yayaDocumentEditDeleteV70=true;
  let currentDocumentId='';
  function rememberFromElement(el){if(!el)return;const raw=String(el.getAttribute&&el.getAttribute('onclick')||'');const match=raw.match(/editDocument\(['\"]([^'\"]+)/);if(match&&match[1])currentDocumentId=String(match[1]);if(el.dataset&&el.dataset.rowId&&el.classList.contains('yaya-detail-document-edit'))currentDocumentId=String(el.dataset.rowId);}
  function installWrapper(){if(typeof window.editDocument!=='function')return false;if(window.editDocument.__yayaDeleteV70)return true;const original=window.editDocument;const wrapped=function(id){currentDocumentId=String(id||'');const result=original.apply(this,arguments);setTimeout(decorateModal,0);return result;};wrapped.__yayaDeleteV70=true;window.editDocument=wrapped;return true;}
  function decorateModal(){const modal=[...document.querySelectorAll('#modalRoot .modal')].find(m=>/Modifier le document/i.test(String(m.querySelector('h5')?.textContent||'')));if(!modal)return;const footer=modal.querySelector('.mfoot');if(!footer)return;let button=[...footer.querySelectorAll('button')].find(b=>/^Annuler$/i.test(String(b.textContent||'').trim()));if(!button&&footer.querySelector('[data-yaya-document-delete="1"]'))return;if(!button)return;const id=currentDocumentId;button.removeAttribute('onclick');button.dataset.yayaDocumentDelete='1';button.textContent='Supprimer';button.title='Supprimer ce document de Yaya';button.setAttribute('aria-label','Supprimer ce document de Yaya');button.style.setProperty('background','#fff3f3','important');button.style.setProperty('color','#b42318','important');button.style.setProperty('border','1px solid #efb4b4','important');button.onclick=function(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const docId=String(id||currentDocumentId||'');if(!docId){try{if(typeof toast==='function')toast('Document introuvable',true);}catch(err){}return false;}try{if(typeof closeModal==='function')closeModal();}catch(err){}setTimeout(function(){if(typeof window.delDocument==='function')window.delDocument(docId);},0);return false;};}
  document.addEventListener('click',function(e){const el=e.target&&e.target.closest?e.target.closest('[onclick*="editDocument("],.yaya-detail-document-edit[data-row-id]'):null;if(el)rememberFromElement(el);},true);
  installWrapper();setTimeout(installWrapper,50);setTimeout(installWrapper,250);
  new MutationObserver(function(){if(installWrapper())requestAnimationFrame(decorateModal);}).observe(document.documentElement,{childList:true,subtree:true});
})();
