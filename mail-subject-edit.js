(function(){
  'use strict';

  if(window.__yayaMailSubjectEditV1)return;
  window.__yayaMailSubjectEditV1=true;

  const STYLE_ID='yaya-mail-subject-edit-style-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-mails-pane .yaya-mail-subject[data-yaya-mail-edit="1"]{
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-detail-mails-pane .yaya-mail-subject[data-yaya-mail-edit="1"]:hover{
        text-decoration:underline!important;
        text-underline-offset:3px!important;
      }
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-edit{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function prepare(row){
    if(!row)return;
    const subject=row.querySelector('.yaya-mail-subject');
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

    if(edit){
      edit.style.setProperty('display','none','important');
      edit.setAttribute('aria-hidden','true');
    }
  }

  function patch(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row').forEach(prepare);
  }

  function openEdit(subject,event){
    const id=String(subject&&subject.dataset&&subject.dataset.mailId||'').trim();
    if(!id)return;

    if(event){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    }

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

  document.addEventListener('click',function(event){
    const subject=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-mails-pane .yaya-mail-subject[data-yaya-mail-edit="1"]')
      :null;
    if(subject)openEdit(subject,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const subject=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-mails-pane .yaya-mail-subject[data-yaya-mail-edit="1"]')
      :null;
    if(subject)openEdit(subject,event);
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
