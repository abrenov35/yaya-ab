(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-manage-modal-style-v4';
  ['yaya-chantier-manage-modal-style-v3'].forEach(function(id){
    const old=document.getElementById(id);if(old)old.remove();
  });
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-edit-chantier-btn{display:none!important;}
      .hdr .tabs #yayaCreateChantierBtn{min-width:142px!important;}
      #yaya-archive-warning{z-index:40000!important;pointer-events:auto!important;}

      .yaya-manage-selector{
        display:grid!important;
        gap:5px!important;
        margin-top:14px!important;
        margin-bottom:12px!important;
        padding:12px!important;
        border:1px solid #cbd7e6!important;
        border-radius:10px!important;
        background:#f7faff!important;
      }
      .yaya-manage-selector label{font-size:12px!important;font-weight:800!important;color:#29496d!important;}
      .yaya-manage-selector select{width:100%!important;min-width:0!important;background:#fff!important;}
      .yaya-manage-selector-help{
        display:block!important;
        margin-top:1px!important;
        color:#6d7d91!important;
        font-size:10.5px!important;
        font-weight:500!important;
        line-height:1.35!important;
      }
      .yaya-manage-new-separator{
        display:grid!important;
        grid-template-columns:1fr auto 1fr!important;
        align-items:center!important;
        gap:10px!important;
        margin:8px 0 4px!important;
        color:#7a8796!important;
        font-size:10px!important;
        font-weight:800!important;
        text-transform:uppercase!important;
      }
      .yaya-manage-new-separator:before,
      .yaya-manage-new-separator:after{
        content:''!important;
        height:1px!important;
        background:#d7dee8!important;
      }
      .yaya-manage-new-title,
      .yaya-manage-edit-title{
        margin:2px 0 0!important;
        padding:0!important;
        color:#162d49!important;
        font-size:13px!important;
        font-weight:800!important;
      }
      .yaya-manage-edit-title{
        margin:5px 0 2px!important;
        padding-top:3px!important;
      }
      .yaya-chantier-edit-modal .yaya-chantier-import-row{display:none!important;}

      .yaya-chantier-edit-modal .mfoot,
      .yaya-manage-create-modal .mfoot{
        display:grid!important;
        grid-template-columns:repeat(5,minmax(0,1fr))!important;
        gap:7px!important;
        align-items:stretch!important;
      }
      .yaya-chantier-edit-modal .mfoot>button,
      .yaya-manage-create-modal .mfoot>button{
        width:100%!important;min-width:0!important;margin:0!important;padding:10px 5px!important;
        white-space:nowrap!important;font-size:10.5px!important;line-height:1.15!important;font-weight:750!important;
        opacity:1!important;cursor:pointer!important;
      }
      .yaya-manage-import-btn{
        background:#eef6ff!important;border:1px solid #8db8e6!important;color:#0b5fa5!important;
      }
      .yaya-delete-chantier-modal-btn{
        background:#fff1f0!important;border:1px solid #e6a09a!important;color:#b42318!important;
      }
      .yaya-archive-chantier-modal-btn{
        background:#fff7e8!important;border:1px solid #efb86f!important;color:#9a4d00!important;
      }
      .yaya-manage-import-btn:hover{background:#deefff!important;}
      .yaya-delete-chantier-modal-btn:hover{background:#fee4e2!important;}
      .yaya-archive-chantier-modal-btn:hover{background:#ffefd2!important;}

      @media(max-width:640px){
        .hdr .tabs #yayaCreateChantierBtn{min-width:auto!important;padding-left:10px!important;padding-right:10px!important;}
        .yaya-chantier-edit-modal .mfoot,.yaya-manage-create-modal .mfoot{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:5px!important;}
        .yaya-chantier-edit-modal .mfoot>button,.yaya-manage-create-modal .mfoot>button{padding:9px 3px!important;font-size:9.5px!important;letter-spacing:-.01em!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function escHtml(v){
    return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function currentChantierId(){
    try{return String(focusChantier||'').trim();}catch(e){return '';}
  }

  function extractCid(modal){
    const save=modal&&modal.querySelector('#editChSave');
    const onclick=String(save&&save.getAttribute('onclick')||'');
    const match=onclick.match(/saveExistingChantier\(['\"]([^'\"]+)/);
    return match&&match[1]?match[1]:'';
  }

  function chantierOptions(selectedId){
    let list=[];
    try{list=Array.isArray(S&&S.chantiers)?S.chantiers.slice():[];}catch(e){}
    list=list.filter(function(c){return c&&c.id&&!String(c.id).startsWith('__');});
    list.sort(function(a,b){return String(a.nom||'').localeCompare(String(b.nom||''),'fr',{sensitivity:'base'});});
    let html='<option value="">— Choisir un chantier —</option>';
    list.forEach(function(c){
      const id=String(c.id||'');
      const nom=String(c.nom||'Chantier');
      const suffix=String(c.statut||'')==='Archivé'?' — Archivé':'';
      html+='<option value="'+escHtml(id)+'"'+(id===String(selectedId||'')?' selected':'')+'>'+escHtml(nom+suffix)+'</option>';
    });
    return html;
  }

  function setModalTitle(modal,text){
    const h5=modal&&modal.querySelector('h5');
    if(!h5)return;
    let done=false;
    h5.childNodes.forEach(function(node){
      if(!done&&node.nodeType===Node.TEXT_NODE){node.nodeValue=text;done=true;}
    });
    if(!done)h5.insertBefore(document.createTextNode(text),h5.firstChild||null);
  }

  function setSelectorLabel(modal,text){
    const label=modal&&modal.querySelector('.yaya-manage-selector label');
    if(label)label.textContent=text;
  }

  function setSelectorHelp(modal,text){
    const wrap=modal&&modal.querySelector('.yaya-manage-selector');
    if(!wrap)return;
    let help=wrap.querySelector('.yaya-manage-selector-help');
    if(!help){
      help=document.createElement('span');
      help.className='yaya-manage-selector-help';
      const select=wrap.querySelector('#yayaManageChantierSelect');
      if(select)select.insertAdjacentElement('afterend',help);else wrap.appendChild(help);
    }
    help.textContent=text;
  }

  function addSelector(modal,selectedId){
    if(!modal)return;
    let wrap=modal.querySelector('.yaya-manage-selector');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='yaya-manage-selector';
      wrap.innerHTML='<label for="yayaManageChantierSelect">Chantier</label><select class="inp" id="yayaManageChantierSelect"></select><span class="yaya-manage-selector-help"></span>';
      const h5=modal.querySelector('h5');
      if(h5&&h5.nextSibling)modal.insertBefore(wrap,h5.nextSibling);else if(h5)modal.appendChild(wrap);else modal.insertBefore(wrap,modal.firstChild||null);
    }
    const select=wrap.querySelector('#yayaManageChantierSelect');
    if(!select)return;
    select.innerHTML=chantierOptions(selectedId);
    select.value=String(selectedId||'');
    select.onchange=function(){
      const id=String(select.value||'');
      if(id&&typeof window.openExistingChantierModal==='function')window.openExistingChantierModal(id);
      else if(typeof window.openChantierModal==='function')window.openChantierModal();
      requestAnimationFrame(decorateAnyModal);
      setTimeout(decorateAnyModal,20);
    };
  }

  function addEditSectionTitle(modal){
    const nom=modal&&modal.querySelector('#editChNom');
    const nomLabel=nom&&nom.closest('label');
    const parent=nomLabel&&nomLabel.parentElement;
    if(!parent||modal.querySelector('.yaya-manage-edit-title'))return;
    const title=document.createElement('div');
    title.className='yaya-manage-edit-title';
    title.textContent='2. Modifier les informations du chantier';
    parent.insertBefore(title,nomLabel);
  }

  function separateCreateOptions(modal){
    setSelectorLabel(modal,'Vous voulez plutôt modifier un chantier existant ?');
    setSelectorHelp(modal,'Choisissez-le ici : la modale basculera automatiquement en mode modification.');
    const nom=document.getElementById('chNom');
    const nomLabel=nom&&nom.closest('label');
    const parent=nomLabel&&nomLabel.parentElement;
    if(!parent)return;

    if(!modal.querySelector('.yaya-manage-new-separator')){
      const sep=document.createElement('div');
      sep.className='yaya-manage-new-separator';
      sep.textContent='OU';
      parent.insertBefore(sep,nomLabel);
    }
    if(!modal.querySelector('.yaya-manage-new-title')){
      const title=document.createElement('div');
      title.className='yaya-manage-new-title';
      title.textContent='Nouveau chantier à créer';
      parent.insertBefore(title,nomLabel);
    }
  }

  function selectedManageId(){
    const select=document.getElementById('yayaManageChantierSelect');
    return String(select&&select.value||'').trim();
  }

  function requireExisting(action){
    const id=selectedManageId();
    if(id)return id;
    if(typeof window.toast==='function')window.toast('Choisis un chantier existant pour '+action,true);
    return '';
  }

  function elevateArchiveWarning(){
    const warning=document.getElementById('yaya-archive-warning');
    if(!warning)return false;
    if(warning.parentNode!==document.body)document.body.appendChild(warning);
    warning.style.setProperty('position','fixed','important');
    warning.style.setProperty('inset','0','important');
    warning.style.setProperty('z-index','40000','important');
    warning.style.setProperty('pointer-events','auto','important');
    return true;
  }

  function makeButton(text,cls,handler){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='btn2 '+cls;
    btn.textContent=text;
    btn.addEventListener('click',handler);
    return btn;
  }

  function archiveButton(cid){
    return makeButton('Archiver','yaya-archive-chantier-modal-btn',function(event){
      event.preventDefault();event.stopPropagation();
      if(typeof window.archiverChantier!=='function')return;
      window.archiverChantier(cid);
      elevateArchiveWarning();requestAnimationFrame(elevateArchiveWarning);setTimeout(elevateArchiveWarning,40);
    });
  }

  function importButton(cid){
    return makeButton('📎 Importer','yaya-manage-import-btn',function(){
      if(typeof window.openDocumentModal==='function')window.openDocumentModal(cid);
    });
  }

  function decorateEditModal(modal){
    if(!modal||modal.dataset.yayaManageReady==='1')return;
    const cid=extractCid(modal);if(!cid)return;
    modal.classList.add('yaya-manage-modal');
    setModalTitle(modal,'Modifier un chantier existant');
    addSelector(modal,cid);
    setSelectorLabel(modal,'1. Choisir le chantier à modifier');
    setSelectorHelp(modal,'Le chantier sélectionné ici est celui qui sera modifié. Choisissez-en un autre pour changer de chantier.');
    addEditSectionTitle(modal);
    const foot=modal.querySelector('.mfoot');if(!foot)return;
    const del=foot.querySelector('.yaya-delete-chantier-modal-btn');
    const save=foot.querySelector('#editChSave');
    const cancel=foot.querySelector('#editChCancel');
    if(!del||!save||!cancel)return;
    del.textContent='Supprimer';save.textContent='Enregistrer';cancel.textContent='Annuler';
    let importer=modal.querySelector('.yaya-chantier-import-btn');
    if(importer){
      importer.removeAttribute('onclick');
      importer.onclick=function(){if(typeof window.openDocumentModal==='function')window.openDocumentModal(cid);};
      importer.classList.add('yaya-manage-import-btn');importer.textContent='📎 Importer';
    }else importer=importButton(cid);
    let archive=foot.querySelector('.yaya-archive-chantier-modal-btn');
    if(!archive)archive=archiveButton(cid);else archive.textContent='Archiver';
    foot.replaceChildren(importer,del,archive,cancel,save);
    modal.dataset.yayaManageReady='1';
  }

  function decorateCreateModal(modal){
    if(!modal||modal.dataset.yayaManageReady==='1'||!modal.querySelector('#chCreateBtn'))return;
    modal.classList.add('yaya-manage-create-modal','yaya-manage-modal');
    setModalTitle(modal,'Créer un nouveau chantier');
    addSelector(modal,'');
    separateCreateOptions(modal);
    const foot=modal.querySelector('.mfoot');
    const create=modal.querySelector('#chCreateBtn');
    if(!foot||!create)return;
    const cancel=[...foot.querySelectorAll('button')].find(function(btn){return String(btn.textContent||'').trim().toLowerCase()==='annuler';});
    if(!cancel)return;
    create.textContent='Créer le chantier';

    const importer=makeButton('📎 Importer','yaya-manage-import-btn',function(){
      const id=requireExisting('importer une pièce');
      if(id&&typeof window.openDocumentModal==='function')window.openDocumentModal(id);
    });
    const supprimer=makeButton('Supprimer','yaya-delete-chantier-modal-btn',function(){
      const id=requireExisting('supprimer');
      if(id&&typeof window.deleteExistingChantier==='function')window.deleteExistingChantier(id);
    });
    const archiver=makeButton('Archiver','yaya-archive-chantier-modal-btn',function(event){
      event.preventDefault();event.stopPropagation();
      const id=requireExisting('archiver');
      if(id&&typeof window.archiverChantier==='function'){
        window.archiverChantier(id);
        elevateArchiveWarning();requestAnimationFrame(elevateArchiveWarning);setTimeout(elevateArchiveWarning,40);
      }
    });

    foot.replaceChildren(importer,supprimer,archiver,cancel,create);
    modal.dataset.yayaManageReady='1';
  }

  function decorateAnyModal(){
    const root=document.getElementById('modalRoot');if(!root)return;
    const edit=root.querySelector('.yaya-chantier-edit-modal');
    if(edit){decorateEditModal(edit);return;}
    const createBtn=root.querySelector('#chCreateBtn');
    const create=createBtn&&createBtn.closest('.modal');
    if(create)decorateCreateModal(create);
  }

  function removeLegacyEditButtons(){
    document.querySelectorAll('.yaya-edit-chantier-btn').forEach(function(btn){btn.remove();});
    document.querySelectorAll('button').forEach(function(btn){
      const txt=String(btn.textContent||'').replace(/\s+/g,' ').trim();
      if(txt==='✏️ Modifier chantier'||txt==='Modifier chantier')btn.remove();
    });
  }

  function syncManageToolbar(){
    const btn=document.getElementById('yayaCreateChantierBtn');if(!btn)return false;
    if(String(btn.textContent||'').trim()!=='🛠️ Gérer chantier')btn.textContent='🛠️ Gérer chantier';
    btn.title='Ajouter ou modifier un chantier';btn.setAttribute('aria-label','Gérer chantier');removeLegacyEditButtons();return true;
  }

  function manageChantier(){
    const cid=currentChantierId();
    if(cid&&typeof window.openExistingChantierModal==='function')window.openExistingChantierModal(cid);
    else if(typeof window.openChantierModal==='function')window.openChantierModal();
    requestAnimationFrame(decorateAnyModal);setTimeout(decorateAnyModal,20);
  }

  document.addEventListener('click',function(event){
    const btn=event.target&&event.target.closest?event.target.closest('#yayaCreateChantierBtn'):null;
    if(!btn)return;
    event.preventDefault();event.stopPropagation();if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();manageChantier();
  },true);

  function installToolbarObserver(){
    const header=document.querySelector('.hdr');if(!header){setTimeout(installToolbarObserver,120);return;}
    if(header.dataset.yayaManageToolbarObserved!=='1'){
      header.dataset.yayaManageToolbarObserved='1';
      new MutationObserver(syncManageToolbar).observe(header,{childList:true,subtree:true});
    }
    syncManageToolbar();
  }

  function installModalObserver(){
    const root=document.getElementById('modalRoot')||document.documentElement;
    new MutationObserver(function(){removeLegacyEditButtons();decorateAnyModal();}).observe(root,{childList:true,subtree:true});
    decorateAnyModal();
  }

  removeLegacyEditButtons();installToolbarObserver();installModalObserver();
  setTimeout(syncManageToolbar,250);setTimeout(syncManageToolbar,800);
})();
