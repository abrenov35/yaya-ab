(function(){
  'use strict';

  if(window.__yayaMailSubjectEditV2)return;
  window.__yayaMailSubjectEditV2=true;

  const STYLE_ID='yaya-mail-subject-edit-style-v2';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    ['yaya-mail-subject-edit-style-v1'].forEach(function(id){
      const old=document.getElementById(id);if(old)old.remove();
    });
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-mails-pane .yaya-mail-subject[data-yaya-mail-edit="1"],
      #pane-chantiers .yaya-detail-mails-pane .yaya-mail-sender[data-yaya-mail-view="1"]{
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-detail-mails-pane .yaya-mail-subject[data-yaya-mail-edit="1"]:hover,
      #pane-chantiers .yaya-detail-mails-pane .yaya-mail-sender[data-yaya-mail-view="1"]:hover{
        text-decoration:underline!important;
        text-underline-offset:3px!important;
      }
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-edit{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function documentForId(id){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.documents))return null;
      return S.documents.find(function(row){return String(row&&row.id||'')===String(id||'');})||null;
    }catch(e){return null;}
  }

  function httpLink(value){
    const link=String(value||'').trim();
    if(!/^https?:/i.test(link))return '';
    if(/mail\.google\.com/i.test(link))return '';
    return link;
  }

  function linkFromObject(obj){
    if(!obj||typeof obj!=='object')return '';
    const candidates=[
      obj.lienPieceJointe,obj.lienPJ,obj.pjLien,obj.pieceJointeUrl,obj.attachmentUrl,
      obj.oneDriveWebUrl,obj.lienDrive,obj.webUrl,obj.url,obj.lien
    ];
    for(const value of candidates){
      const link=httpLink(value);
      if(link)return link;
    }
    return '';
  }

  function attachmentLink(id){
    const doc=documentForId(id);
    if(!doc)return '';

    const direct=linkFromObject(doc);
    if(direct)return direct;

    const arrays=[doc.piecesJointes,doc.piecesJointesMail,doc.attachments,doc.pj];
    for(const list of arrays){
      if(!Array.isArray(list))continue;
      for(const item of list){
        const link=typeof item==='string'?httpLink(item):linkFromObject(item);
        if(link)return link;
      }
    }
    return '';
  }

  function clearView(sender){
    if(!sender)return;
    delete sender.dataset.yayaMailView;
    delete sender.dataset.mailId;
    sender.removeAttribute('role');
    sender.removeAttribute('tabindex');
    sender.removeAttribute('aria-label');
    sender.setAttribute('title',String(sender.textContent||'').trim());
  }

  function prepare(row){
    if(!row)return;
    const subject=row.querySelector('.yaya-mail-subject');
    const sender=row.querySelector('.yaya-mail-sender');
    const edit=row.querySelector('.yaya-detail-document-edit[data-mail-id]');
    const view=row.querySelector('.yaya-detail-document-view[data-mail-id]');
    const id=String((edit&&edit.dataset.mailId)||(view&&view.dataset.mailId)||'').trim();
    if(!subject||!id)return;

    subject.dataset.yayaMailEdit='1';
    subject.dataset.mailId=id;
    subject.setAttribute('role','button');
    subject.setAttribute('tabindex','0');
    subject.setAttribute('title','Modifier le mail');
    subject.setAttribute('aria-label','Modifier le mail');

    if(sender){
      const lien=attachmentLink(id);
      if(lien){
        sender.dataset.yayaMailView='1';
        sender.dataset.mailId=id;
        sender.setAttribute('role','button');
        sender.setAttribute('tabindex','0');
        sender.setAttribute('title','Voir la pièce jointe');
        sender.setAttribute('aria-label','Voir la pièce jointe');
      }else{
        clearView(sender);
      }
    }

    if(edit){
      edit.style.setProperty('display','none','important');
      edit.setAttribute('aria-hidden','true');
    }
  }

  function patch(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row').forEach(prepare);
  }

  function stop(event){
    if(!event)return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
  }

  function openEdit(subject,event){
    const id=String(subject&&subject.dataset&&subject.dataset.mailId||'').trim();
    if(!id)return;
    stop(event);

    try{
      if(typeof window.editDocument==='function'){
        window.editDocument(id);
        return;
      }
      if(typeof editDocument==='function')editDocument(id);
    }catch(err){
      try{if(typeof toast==='function')toast('Modification du mail indisponible',true);}catch(e){}
    }
  }

  function openAttachment(sender,event){
    const id=String(sender&&sender.dataset&&sender.dataset.mailId||'').trim();
    const lien=attachmentLink(id);
    if(!lien){clearView(sender);return;}
    stop(event);

    try{
      if(typeof window.voirPiece==='function'){
        window.voirPiece(lien);
        return;
      }
      if(typeof voirPiece==='function'){
        voirPiece(lien);
        return;
      }
      window.open(lien,'_blank','noopener');
    }catch(err){
      try{window.open(lien,'_blank','noopener');}catch(e){}
    }
  }

  document.addEventListener('click',function(event){
    const subject=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-mails-pane .yaya-mail-subject[data-yaya-mail-edit="1"]')
      :null;
    if(subject){openEdit(subject,event);return;}

    const sender=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-mails-pane .yaya-mail-sender[data-yaya-mail-view="1"]')
      :null;
    if(sender)openAttachment(sender,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const subject=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-mails-pane .yaya-mail-subject[data-yaya-mail-edit="1"]')
      :null;
    if(subject){openEdit(subject,event);return;}

    const sender=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-mails-pane .yaya-mail-sender[data-yaya-mail-view="1"]')
      :null;
    if(sender)openAttachment(sender,event);
  },true);

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;patch();});
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
