(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-manage-modal-style-v1';
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
        margin-bottom:4px!important;
      }
      .yaya-manage-selector label{
        font-size:12px!important;
        font-weight:700!important;
      }
      .yaya-manage-selector select{
        width:100%!important;
        min-width:0!important;
      }

      .yaya-chantier-edit-modal .yaya-chantier-import-row{display:none!important;}

      .yaya-chantier-edit-modal .mfoot,
      .yaya-manage-create-modal .mfoot{
        display:grid!important;
        grid-template-columns:repeat(5,minmax(0,1fr))!important;
        gap:7px!important;
        align-items:stretch!important;
      }
      .yaya-chantier-edit-modal .mfoot > button,
      .yaya-manage-create-modal .mfoot > button{
        width:100%!important;
        min-width:0!important;
        margin:0!important;
        padding:10px 5px!important;
        white-space:nowrap!important;
        font-size:10.5px!important;
        line-height:1.15!important;
      }
      .yaya-archive-chantier-modal-btn{
        background:#fff7e8!important;
        border:1px solid #efb86f!important;
        color:#9a4d00!important;
        font-weight:750!important;
      }
      .yaya-delete-chantier-modal-btn{
        background:#fff1f0!important;
        border:1px solid #e6a09a!important;
        color:#b42318!important;
        font-weight:750!important;
      }
      .yaya-manage-import-btn{font-weight:750!important;}
      .yaya-manage-disabled{
        opacity:.38!important;
        cursor:not-allowed!important;
      }

      @media(max-width:640px){
        .hdr .tabs #yayaCreateChantierBtn{
          min-width:auto!important;
          padding-left:10px!important;
          padding-right:10px!important;
        }
        .yaya-chantier-edit-modal .mfoot,
        .yaya-manage-create-modal .mfoot{
          grid-template-columns:repeat(3,minmax(0,1fr))!important;
          gap:5px!important;
        }
        .yaya-chantier-edit-modal .mfoot > button,
        .yaya-manage-create-modal .mfoot > button{
          padding:9px 3px!important;
          font-size:9.5px!important;
          letter-spacing:-.01em!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function escHtml(v){
    return String(v==null?'':v)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
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
    try{
      list=Array.isArray(S&&S.chantiers)?S.chantiers.slice():[];
    }catch(e){}
    list=list.filter(function(c){
      return c&&c.id&&!String(c.id).startsWith('__');
    });
    list.sort(function(a,b){
      return String(a.nom||'').localeCompare(String(b.nom||''),'fr',{sensitivity:'base'});
    });

    let html='<option value="">＋ Nouveau chantier</option>';
    list.forEach(function(c){
      const id=String(c.id||'');
      const nom=String(c.nom||'Chantier');
      const suffix=String(c.statut||'')==='Archivé'?' — Archivé':'';
      html+='<option value="'+escHtml(id)+'"'+(id===String(selectedId||'')?' selected':'')+'>'+escHtml(nom+suffix)+'</option>';
    });
    return html;
  }

  function setUnifiedTitle(modal){
    const h5=modal&&modal.querySelector('h5');
    if(!h5)return;
    let done=false;
    h5.childNodes.forEach(function(node){
      if(!done&&node.nodeType===Node.TEXT_NODE){
        node.nodeValue='Ajouter / modifier un chantier';
        done=true;
      }
    });
    if(!done)h5.insertBefore(document.createTextNode('Ajouter / modifier un chantier'),h5.firstChild||null);
  }

  function addSelector(modal,selectedId){
    if(!modal)return;
    let wrap=modal.querySelector('.yaya-manage-selector');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='yaya-manage-selector';
      wrap.innerHTML='<label for="yayaManageChantierSelect">Chantier</label><select class="inp" id="yayaManageChantierSelect"></select>';
      const h5=modal.querySelector('h5');
      if(h5&&h5.nextSibling)modal.insertBefore(wrap,h5.nextSibling);
      else if(h5)modal.appendChild(wrap);
      else modal.insertBefore(wrap,modal.firstChild||null);
    }

    const select=wrap.querySelector('#yayaManageChantierSelect');
    if(!select)return;
    select.innerHTML=chantierOptions(selectedId);
    select.value=String(selectedId||'');
    select.onchange=function(){
      const id=String(select.value||'');
      if(id&&typeof window.openExistingChantierModal==='function'){
        window.openExistingChantierModal(id);
      }else if(typeof window.openChantierModal==='function'){
        window.openChantierModal();
      }
      requestAnimationFrame(decorateAnyModal);
    };
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

  function archiveButton(cid){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='btn2 yaya-archive-chantier-modal-btn';
    btn.textContent='Archiver';
    btn.addEventListener('click',function(event){
      event.preventDefault();
      event.stopPropagation();
      if(typeof window.archiverChantier!=='function')return;
      window.archiverChantier(cid);
      elevateArchiveWarning();
      requestAnimationFrame(elevateArchiveWarning);
      setTimeout(elevateArchiveWarning,40);
    });
    return btn;
  }

  function importButton(cid){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='btn2 yaya-manage-import-btn';
    btn.textContent='📎 Importer';
    btn.addEventListener('click',function(){
      if(typeof window.openDocumentModal==='function')window.openDocumentModal(cid);
    });
    return btn;
  }

  function disabledButton(text,title){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='btn2 yaya-manage-disabled';
    btn.textContent=text;
    btn.disabled=true;
    btn.title=title||'';
    return btn;
  }

  function decorateEditModal(modal){
    if(!modal||modal.dataset.yayaManageReady==='1')return;
    const cid=extractCid(modal);
    if(!cid)return;

    modal.classList.add('yaya-manage-modal');
    setUnifiedTitle(modal);
    addSelector(modal,cid);

    const foot=modal.querySelector('.mfoot');
    if(!foot)return;
    const del=foot.querySelector('.yaya-delete-chantier-modal-btn');
    const save=foot.querySelector('#editChSave');
    const cancel=foot.querySelector('#editChCancel');
    if(!del||!save||!cancel)return;

    del.textContent='Supprimer';
    save.textContent='Enregistrer';
    cancel.textContent='Annuler';

    let importer=modal.querySelector('.yaya-chantier-import-btn');
    if(importer){
      importer.removeAttribute('onclick');
      importer.onclick=function(){
        if(typeof window.openDocumentModal==='function')window.openDocumentModal(cid);
      };
      importer.classList.add('yaya-manage-import-btn');
      importer.textContent='📎 Importer';
    }else{
      importer=importButton(cid);
    }

    let archive=foot.querySelector('.yaya-archive-chantier-modal-btn');
    if(!archive)archive=archiveButton(cid);
    else archive.textContent='Archiver';

    foot.replaceChildren(importer,del,archive,cancel,save);
    modal.dataset.yayaManageReady='1';
  }

  function decorateCreateModal(modal){
    if(!modal||modal.dataset.yayaManageReady==='1'||!modal.querySelector('#chCreateBtn'))return;
    modal.classList.add('yaya-manage-create-modal','yaya-manage-modal');
    setUnifiedTitle(modal);
    addSelector(modal,'');

    const foot=modal.querySelector('.mfoot');
    const create=modal.querySelector('#chCreateBtn');
    if(!foot||!create)return;

    const cancel=[...foot.querySelectorAll('button')].find(function(btn){
      return String(btn.textContent||'').trim().toLowerCase()==='annuler';
    })||disabledButton('Annuler');

    create.textContent='Créer le chantier';
    foot.replaceChildren(
      disabledButton('📎 Importer','Disponible après création du chantier'),
      disabledButton('Supprimer','Sélectionne un chantier existant'),
      disabledButton('Archiver','Sélectionne un chantier existant'),
      cancel,
      create
    );
    modal.dataset.yayaManageReady='1';
  }

  function decorateAnyModal(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
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
    const btn=document.getElementById('yayaCreateChantierBtn');
    if(!btn)return false;
    if(String(btn.textContent||'').trim()!=='🛠️ Gérer chantier')btn.textContent='🛠️ Gérer chantier';
    btn.title='Ajouter ou modifier un chantier';
    btn.setAttribute('aria-label','Gérer chantier');
    removeLegacyEditButtons();
    return true;
  }

  function manageChantier(){
    const cid=currentChantierId();
    if(cid&&typeof window.openExistingChantierModal==='function'){
      window.openExistingChantierModal(cid);
    }else if(typeof window.openChantierModal==='function'){
      window.openChantierModal();
    }
    requestAnimationFrame(decorateAnyModal);
    setTimeout(decorateAnyModal,20);
  }

  document.addEventListener('click',function(event){
    const btn=event.target&&event.target.closest?event.target.closest('#yayaCreateChantierBtn'):null;
    if(!btn)return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    manageChantier();
  },true);

  function installToolbarObserver(){
    const header=document.querySelector('.hdr');
    if(!header){setTimeout(installToolbarObserver,120);return;}
    if(header.dataset.yayaManageToolbarObserved!=='1'){
      header.dataset.yayaManageToolbarObserved='1';
      new MutationObserver(syncManageToolbar).observe(header,{childList:true,subtree:true});
    }
    syncManageToolbar();
  }

  function installModalObserver(){
    const root=document.getElementById('modalRoot')||document.documentElement;
    new MutationObserver(function(){
      removeLegacyEditButtons();
      decorateAnyModal();
    }).observe(root,{childList:true,subtree:true});
    decorateAnyModal();
  }

  removeLegacyEditButtons();
  installToolbarObserver();
  installModalObserver();
  setTimeout(syncManageToolbar,250);
  setTimeout(syncManageToolbar,800);
})();
