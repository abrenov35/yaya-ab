(function(){
  'use strict';
  if(window.__yayaMailReadActionsV6)return;
  window.__yayaMailReadActionsV6=true;

  const STYLE_ID='yaya-mail-read-actions-style-v6';
  let lastMailId='';

  function text(v){return String(v==null?'':v).trim();}
  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[ch]));
  }
  function getDoc(id){
    try{
      const docs=(typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];
      return docs.find(function(d){
        return String(d&&d.id||'')===String(id)
          && String(d&&d.type||'').trim().toUpperCase()==='MAIL';
      })||null;
    }catch(e){return null;}
  }
  function mailSender(d){
    try{if(typeof window.nomMailYaya==='function')return text(window.nomMailYaya(d));}catch(e){}
    return text(d&&(d.nomMail||d.expediteur||d.from||d.sujet))||'Expéditeur non renseigné';
  }
  function mailSubject(d){
    try{if(typeof window.objetMailYaya==='function')return text(window.objetMailYaya(d));}catch(e){}
    return text(d&&(d.objetMail||d.mailSubject||d.emailSubject||d.subject||d.objet||d.titre))||'Objet non renseigné';
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .yaya-mail-read-actions{
        display:flex!important;align-items:center!important;justify-content:space-between!important;
        gap:10px!important;margin-top:16px!important;padding-top:14px!important;
        border-top:1px solid #dce4ee!important;
      }
      #modalRoot .yaya-mail-read-actions-right{display:flex!important;gap:8px!important;margin-left:auto!important}
      #modalRoot .yaya-mail-read-edit{
        min-height:38px!important;padding:0 15px!important;border:1px solid #9fc0e4!important;
        border-radius:9px!important;background:#edf5ff!important;color:#16558f!important;
        font-weight:800!important;cursor:pointer!important;
      }
      #modalRoot .yaya-mail-read-delete{
        min-height:38px!important;padding:0 15px!important;border:1px solid #e7a39c!important;
        border-radius:9px!important;background:#fff3f2!important;color:#c92a21!important;
        font-weight:800!important;cursor:pointer!important;
      }
      #modalRoot .yaya-mail-subject-modal{
        width:min(520px,calc(100vw - 28px))!important;max-width:520px!important;
        padding:0!important;overflow:hidden!important;border-radius:16px!important;
      }
      #modalRoot .yaya-mail-subject-overlay{
        align-items:center!important;justify-content:center!important;
        padding:16px!important;overflow:auto!important;
      }
      #modalRoot .yaya-mail-subject-head{
        display:flex!important;align-items:center!important;justify-content:space-between!important;
        gap:12px!important;padding:18px 20px!important;background:#173e69!important;color:#fff!important;
      }
      #modalRoot .yaya-mail-subject-head strong{font-size:17px!important}
      #modalRoot .yaya-mail-subject-head button{
        width:34px!important;height:34px!important;padding:0!important;display:inline-flex!important;
        align-items:center!important;justify-content:center!important;border:1px solid rgba(255,255,255,.35)!important;
        border-radius:9px!important;background:rgba(255,255,255,.10)!important;color:#fff!important;
        font-size:20px!important;cursor:pointer!important;
      }
      #modalRoot .yaya-mail-subject-body{padding:20px!important;background:#fff!important}
      #modalRoot .yaya-mail-subject-body label{
        display:block!important;margin-bottom:7px!important;color:#304760!important;font-size:12px!important;font-weight:800!important;
      }
      #modalRoot .yaya-mail-subject-body #edDocTitre{
        width:100%!important;box-sizing:border-box!important;min-height:46px!important;padding:0 13px!important;
        border:1.5px solid #b8c8d9!important;border-radius:10px!important;background:#fff!important;
        color:#1e3047!important;font-size:14px!important;outline:none!important;
      }
      #modalRoot .yaya-mail-subject-body #edDocTitre:focus{
        border-color:#2f6fae!important;box-shadow:0 0 0 3px rgba(47,111,174,.13)!important;
      }
      #modalRoot .yaya-mail-subject-foot{
        display:flex!important;justify-content:flex-end!important;gap:9px!important;padding:14px 20px 18px!important;
        border-top:1px solid #e4eaf1!important;background:#f8fafc!important;
      }
      #modalRoot .yaya-mail-subject-cancel,#modalRoot .yaya-mail-subject-save{
        min-height:39px!important;padding:0 16px!important;border-radius:9px!important;font-weight:800!important;cursor:pointer!important;
      }
      #modalRoot .yaya-mail-subject-cancel{border:1px solid #c8d3df!important;background:#fff!important;color:#31465e!important}
      #modalRoot .yaya-mail-subject-save{border:1px solid #145b96!important;background:#145b96!important;color:#fff!important}
    `;
    document.head.appendChild(style);
  }

  function idFromRow(row){
    if(!row)return '';
    for(const v of [row.dataset&&row.dataset.mailId,row.dataset&&row.dataset.id]){
      if(text(v))return text(v);
    }
    const data=row.querySelector('[data-mail-id],[data-id]');
    if(data){
      const id=text(data.dataset&&(data.dataset.mailId||data.dataset.id));
      if(id)return id;
    }
    const raw=[...row.querySelectorAll('[onclick]')].map(el=>String(el.getAttribute('onclick')||'')).join(' ');
    const m=raw.match(/(?:voirMessageYaya|editDocument|delDocument)\(['"]([^'"]+)/i);
    return m&&m[1]?text(m[1]):'';
  }

  function openSubjectEditor(id){
    id=text(id);
    const d=getDoc(id);
    const root=document.getElementById('modalRoot');
    if(!d||!root)return;

    const sender=mailSender(d);
    let subject=mailSubject(d);
    if(subject==='Objet non renseigné')subject='';

    root.innerHTML=''
      +'<div class="overlay yaya-mail-subject-overlay">'
      +'<div class="modal yaya-mail-subject-modal">'
      +'<div class="yaya-mail-subject-head"><strong>Modifier l’objet</strong>'
      +'<button type="button" class="yaya-mail-subject-close" aria-label="Fermer">×</button></div>'
      +'<div class="yaya-mail-subject-body">'
      +'<input type="hidden" id="edDocCh" value="'+esc(d.chantierId||'')+'">'
      +'<input type="hidden" id="edDocType" value="'+esc(d.type||'MAIL')+'">'
      +'<input type="hidden" id="edDocSujet" value="'+esc(sender)+'">'
      +'<label for="edDocTitre">Objet du mail</label>'
      +'<input id="edDocTitre" type="text" value="'+esc(subject)+'" autocomplete="off" placeholder="Saisir l’objet du mail">'
      +'</div>'
      +'<div class="yaya-mail-subject-foot">'
      +'<button type="button" class="yaya-mail-subject-cancel">Annuler</button>'
      +'<button type="button" class="yaya-mail-subject-save">Enregistrer</button>'
      +'</div></div></div>';

    const back=()=>{if(typeof window.voirMessageYaya==='function')window.voirMessageYaya(id);};
    root.querySelector('.yaya-mail-subject-close')?.addEventListener('click',back);
    root.querySelector('.yaya-mail-subject-cancel')?.addEventListener('click',back);
    root.querySelector('.yaya-mail-subject-overlay')?.addEventListener('click',e=>{if(e.target===e.currentTarget)back();});
    root.querySelector('.yaya-mail-subject-save')?.addEventListener('click',()=>{
      const input=document.getElementById('edDocTitre');
      if(!input)return;
      if(!text(input.value)){
        try{if(typeof toast==='function')toast('Indique un objet',true);}catch(e){}
        input.focus();
        return;
      }
      if(typeof window.__yayaSaveMailSubject==='function'){
        window.__yayaSaveMailSubject(id);
        return;
      }
      if(typeof window.saveDocumentEdit==='function'){
        window.saveDocumentEdit(id);
        return;
      }
      try{if(typeof toast==='function')toast('Enregistrement indisponible',true);}catch(e){}
    });

    requestAnimationFrame(()=>document.getElementById('edDocTitre')?.focus());
  }

  function deleteFromRead(id){
    id=text(id);
    if(typeof closeModal==='function')closeModal();
    setTimeout(()=>{
      try{
        if(typeof window.delDocument==='function'){window.delDocument(id);return;}
        if(typeof delDocument==='function')delDocument(id);
      }catch(e){
        try{if(typeof toast==='function')toast('Suppression indisponible',true);}catch(_){}
      }
    },0);
  }

  function enhanceReadModal(id){
    id=text(id||lastMailId);
    if(!id)return;
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const modal=root.querySelector('.message-modal,.yaya-mail-body-modal');
    if(!modal||modal.dataset.yayaMailReadActions==='1')return;
    modal.dataset.yayaMailReadActions='1';

    const bar=document.createElement('div');
    bar.className='yaya-mail-read-actions';

    const del=document.createElement('button');
    del.type='button';
    del.className='yaya-mail-read-delete';
    del.textContent='Supprimer';
    del.addEventListener('click',()=>deleteFromRead(id));

    const right=document.createElement('div');
    right.className='yaya-mail-read-actions-right';

    const edit=document.createElement('button');
    edit.type='button';
    edit.className='yaya-mail-read-edit';
    edit.textContent='Modifier l’objet';
    edit.addEventListener('click',()=>openSubjectEditor(id));

    right.appendChild(edit);
    bar.append(del,right);
    modal.appendChild(bar);
  }

  function wrapView(){
    const current=window.voirMessageYaya;
    if(typeof current!=='function'||current.__yayaMailReadActionsV6)return;
    const wrapped=function(id){
      lastMailId=text(id);
      const result=current.apply(this,arguments);
      requestAnimationFrame(()=>enhanceReadModal(lastMailId));
      return result;
    };
    wrapped.__yayaMailReadActionsV6=true;
    window.voirMessageYaya=wrapped;
  }

  installStyle();
  wrapView();

  document.addEventListener('click',function(event){
    const target=event.target;
    if(!target||!target.closest)return;

    const direct=target.closest('[data-mail-id]');
    if(direct&&text(direct.dataset&&direct.dataset.mailId)){
      lastMailId=text(direct.dataset.mailId);
      requestAnimationFrame(()=>enhanceReadModal(lastMailId));
      return;
    }

    if(target.closest('button,a,input,select,textarea,label'))return;

    const row=target.closest('#pane-chantiers .yaya-detail-mail-row,#pane-chantiers .yaya-detail-document-row,#pane-documents .achligne.ligR');
    const id=idFromRow(row);
    if(!id)return;
    lastMailId=id;
    requestAnimationFrame(()=>enhanceReadModal(id));
  },true);
})();
