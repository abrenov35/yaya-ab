(function(){
  'use strict';

  if(window.__yayaMailSubjectEditV5)return;
  window.__yayaMailSubjectEditV5=true;

  const STYLE_ID='yaya-mail-subject-edit-style-v5';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    ['yaya-mail-subject-edit-style-v1','yaya-mail-subject-edit-style-v2','yaya-mail-subject-edit-style-v3','yaya-mail-subject-edit-style-v4'].forEach(function(id){
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
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-edit,
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-view{
        display:none!important;
      }
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-delete{
        margin-left:8px!important;
        color:#d92d20!important;
        border-color:#f1a8a1!important;
        background:#fff7f6!important;
        font-weight:700!important;
        font-size:0!important;
      }
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-delete::before{
        content:'×'!important;
        font-size:20px!important;
        line-height:1!important;
        color:#d92d20!important;
      }
      #modalRoot .modal[data-yaya-mail-edit-modal="1"] #edDocType,
      #modalRoot .modal[data-yaya-mail-edit-modal="1"] .mrow[data-yaya-mail-type-row="1"]{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function prepare(row){
    if(!row)return;
    const subject=row.querySelector('.yaya-mail-subject');
    const sender=row.querySelector('.yaya-mail-sender');
    const edit=row.querySelector('.yaya-detail-document-edit[data-mail-id]');
    const view=row.querySelector('.yaya-detail-document-view[data-mail-id]');
    const del=row.querySelector('.yaya-detail-document-delete');
    const id=String((edit&&edit.dataset.mailId)||(view&&view.dataset.mailId)||'').trim();
    if(!subject||!id)return;

    subject.dataset.yayaMailEdit='1';
    subject.dataset.mailId=id;
    subject.setAttribute('role','button');
    subject.setAttribute('tabindex','0');
    subject.setAttribute('title','Modifier le mail');
    subject.setAttribute('aria-label','Modifier le mail');

    if(sender){
      sender.dataset.yayaMailView='1';
      sender.dataset.mailId=id;
      sender.setAttribute('role','button');
      sender.setAttribute('tabindex','0');
      sender.setAttribute('title','Voir le mail');
      sender.setAttribute('aria-label','Voir le mail');
    }

    if(edit){
      edit.style.setProperty('display','none','important');
      edit.setAttribute('aria-hidden','true');
    }
    if(view){
      view.style.setProperty('display','none','important');
      view.setAttribute('aria-hidden','true');
      view.tabIndex=-1;
    }
    if(del){
      del.setAttribute('title','Supprimer');
      del.setAttribute('aria-label','Supprimer');
    }
  }

  function patchMailEditModal(){
    const type=document.getElementById('edDocType');
    if(!type)return;
    if(String(type.value||'').trim().toUpperCase()!=='MAIL')return;

    const modal=type.closest('.modal');
    if(!modal)return;
    modal.dataset.yayaMailEditModal='1';

    const row=type.closest('.mrow');
    if(row){
      row.dataset.yayaMailTypeRow='1';
      row.style.setProperty('display','none','important');
    }else{
      type.style.setProperty('display','none','important');
    }
  }

  function patch(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row').forEach(prepare);
    patchMailEditModal();
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
        setTimeout(patchMailEditModal,0);
        return;
      }
      if(typeof editDocument==='function'){
        editDocument(id);
        setTimeout(patchMailEditModal,0);
      }
    }catch(err){
      try{if(typeof toast==='function')toast('Modification du mail indisponible',true);}catch(e){}
    }
  }

  function openMail(sender,event){
    const id=String(sender&&sender.dataset&&sender.dataset.mailId||'').trim();
    if(!id)return;
    stop(event);

    try{
      if(typeof window.voirMessageYaya==='function'){
        window.voirMessageYaya(id);
        return;
      }
      if(typeof voirMessageYaya==='function'){
        voirMessageYaya(id);
        return;
      }
      const row=sender.closest('.yaya-detail-mail-row');
      const view=row&&row.querySelector('.yaya-detail-document-view[data-mail-id]');
      if(view)view.click();
    }catch(err){
      try{if(typeof toast==='function')toast('Visualisation du mail indisponible',true);}catch(e){}
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
    if(sender)openMail(sender,event);
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
    if(sender)openMail(sender,event);
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
