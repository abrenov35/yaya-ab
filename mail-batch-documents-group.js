(function(){
  'use strict';
  if(window.__yayaMailBatchDocumentsGroupV1)return;
  window.__yayaMailBatchDocumentsGroupV1=true;

  const STYLE_ID='yaya-mail-batch-documents-group-v1';

  function text(v){return String(v==null?'':v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function docs(){
    try{return (typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];}catch(e){return [];}
  }
  function fileUrl(d){return text(d&&(d.lien||d.url||d.webUrl||d.downloadUrl));}
  function isBatchDocument(d){
    return !!d
      && upper(d.type)==='DOCUMENT'
      && upper(d.origine)==='GMAIL_ADDON_PJ'
      && !!text(d.gmailMessageId)
      && !!fileUrl(d);
  }
  function batchKey(d){
    if(!isBatchDocument(d))return '';
    return [
      text(d.chantierId),
      text(d.gmailMessageId),
      text(d.date),
      text(d.titre),
      text(d.objetMail||d.objet),
      text(d.sujet)
    ].join('|');
  }
  function docById(id){
    id=text(id);if(!id)return null;
    return docs().find(function(d){return text(d&&d.id)===id;})||null;
  }
  function idFromRow(row){
    if(!row)return '';
    const direct=text(row.dataset&&(row.dataset.id||row.dataset.docId||row.dataset.rowId));
    if(direct)return direct;
    const el=row.querySelector('[data-doc-id],[data-row-id],[data-id]');
    if(el){
      const id=text(el.dataset&&(el.dataset.docId||el.dataset.rowId||el.dataset.id));
      if(id)return id;
    }
    const raw=[].map.call(row.querySelectorAll('[onclick]'),function(el){return text(el.getAttribute('onclick'));}).join(' ');
    const match=raw.match(/(?:openDocumentModal|editDocument|delDocument|voirMessageYaya)\(['"]([^'"]+)/i);
    return match&&match[1]?text(match[1]):'';
  }
  function docFromRow(row){return docById(idFromRow(row));}

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers [data-yaya-mail-batch-hidden="1"],
      #pane-documents [data-yaya-mail-batch-hidden="1"]{display:none!important}
      #pane-chantiers [data-yaya-mail-batch-representative="1"],
      #pane-documents [data-yaya-mail-batch-representative="1"]{cursor:pointer!important}
    `;
    document.head.appendChild(style);
  }

  function restoreRow(row){
    if(!row)return;
    if(row.dataset.yayaMailBatchHidden==='1')delete row.dataset.yayaMailBatchHidden;
    delete row.dataset.yayaMailBatchRepresentative;
    delete row.dataset.yayaMailBatchRepresentativeId;
    delete row.dataset.yayaMailBatchCount;
    const type=row.querySelector('.yaya-detail-charge-hours')||row.children[0];
    if(type&&type.dataset&&type.dataset.yayaMailBatchOriginalText){
      if(text(type.textContent)!==type.dataset.yayaMailBatchOriginalText)type.textContent=type.dataset.yayaMailBatchOriginalText;
      delete type.dataset.yayaMailBatchOriginalText;
    }
  }

  function setRepresentative(row,d,count){
    row.dataset.yayaMailBatchRepresentative='1';
    row.dataset.yayaMailBatchRepresentativeId=text(d.id);
    row.dataset.yayaMailBatchCount=String(count);
    row.title='Visualiser les '+count+' pièces jointes';

    const type=row.querySelector('.yaya-detail-charge-hours')||row.children[0];
    if(type){
      if(!type.dataset.yayaMailBatchOriginalText)type.dataset.yayaMailBatchOriginalText=text(type.textContent)||'Document';
      const label=count+' PJ';
      if(text(type.textContent)!==label)type.textContent=label;
    }

    if(!row.__yayaMailBatchClickBound){
      row.__yayaMailBatchClickBound=true;
      row.addEventListener('click',function(event){
        if(this.dataset.yayaMailBatchRepresentative!=='1')return;
        if(event.target&&event.target.closest&&event.target.closest('button,a,input,select,textarea,label'))return;
        const id=text(this.dataset.yayaMailBatchRepresentativeId);
        const doc=docById(id);
        if(!doc)return;
        const viewer=window.yayaUnifiedV4Viewer;
        if(!viewer||typeof viewer.openDocument!=='function')return;
        event.preventDefault();
        event.stopPropagation();
        if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
        viewer.openDocument(id,fileUrl(doc));
      },true);
    }
  }

  function groupRows(rows){
    const groups=new Map();
    rows.forEach(function(row){
      restoreRow(row);
      const d=docFromRow(row);
      if(!isBatchDocument(d))return;
      const key=batchKey(d);if(!key)return;
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push({row:row,doc:d});
    });

    groups.forEach(function(items){
      if(items.length<2)return;
      const first=items[0];
      setRepresentative(first.row,first.doc,items.length);
      items.slice(1).forEach(function(item){item.row.dataset.yayaMailBatchHidden='1';});
    });
  }

  function apply(){
    ensureStyle();
    document.querySelectorAll('#pane-chantiers .yaya-detail-documents-pane').forEach(function(pane){
      groupRows([].slice.call(pane.querySelectorAll(':scope > .yaya-detail-document-row')));
    });
    const global=document.getElementById('pane-documents');
    if(global)groupRows([].slice.call(global.querySelectorAll('.achligne.ligR[data-id]')));
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;apply();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  ['pane-chantiers','pane-documents'].forEach(function(id){
    const root=document.getElementById(id);
    if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  });
  window.addEventListener('yaya:data-refreshed',schedule);
})();
