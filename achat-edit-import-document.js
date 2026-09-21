(function(){
  'use strict';
  if(window.__yayaAchatEditImportDocumentV4)return;
  window.__yayaAchatEditImportDocumentV4=true;
  window.__yayaAchatEditImportDocumentV3=true;

  const MAX_FILE_SIZE=8*1024*1024;
  const STYLE_ID='yaya-achat-edit-import-document-v1';

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}
  function rows(){try{return typeof S!=='undefined'&&S&&Array.isArray(S.achats)?S.achats:[];}catch(e){return [];}}
  function findRow(id){return rows().find(function(a){return txt(a&&a.id)===txt(id);})||null;}

  function persistCache(){
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      if(cached&&typeof cached==='object'){
        cached.achats=rows().map(function(a){return Object.assign({},a);});
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
      }
    }catch(e){}
  }

  function modalId(modal){
    if(!modal)return '';
    const save=Array.from(modal.querySelectorAll('button')).find(function(b){
      return b.classList.contains('yaya-achat-single-save')||/^Enregistrer$/i.test(txt(b.textContent))||/saveAchat\s*\(/.test(String(b.getAttribute('onclick')||''));
    });
    if(!save)return '';
    let id=txt(save.dataset&&save.dataset.achatId);
    if(id)return id;
    const m=String(save.getAttribute('onclick')||'').match(/saveAchat\s*\(\s*['"]([^'"]+)['"]/);
    return txt(m&&m[1]);
  }

  function isEditModal(modal){
    return !!(modal&&modal.querySelector('#eaCh')&&modal.querySelector('#eaType')&&modal.querySelector('#eaFour')&&modal.querySelector('#eaDes')&&modal.querySelector('#eaDate')&&modal.querySelector('#eaMt'));
  }

  function applyFormToRow(modal,row){
    if(!modal||!row)return row;
    row.chantierId=txt(modal.querySelector('#eaCh')&&modal.querySelector('#eaCh').value);
    row.typeDoc=txt(modal.querySelector('#eaType')&&modal.querySelector('#eaType').value);
    row.fournisseur=txt(modal.querySelector('#eaFour')&&modal.querySelector('#eaFour').value);
    row.designation=txt(modal.querySelector('#eaDes')&&modal.querySelector('#eaDes').value);
    row.date=txt(modal.querySelector('#eaDate')&&modal.querySelector('#eaDate').value);
    row.montantHT=Number(String((modal.querySelector('#eaMt')&&modal.querySelector('#eaMt').value)||'0').replace(',','.'))||0;
    if(row.typeDoc==='Facture sous-traitant')row.sousTraitant=row.fournisseur;
    else if('sousTraitant' in row)row.sousTraitant='';
    return row;
  }

  function queueRow(id){
    persistCache();
    try{
      if(typeof window.__yayaFinanceQueueCurrent==='function'){
        window.__yayaFinanceQueueCurrent({upsertIds:[txt(id)]});
        if(typeof window.__yayaFinanceFlushPending==='function'){
          setTimeout(function(){window.__yayaFinanceFlushPending();},0);
        }
        return true;
      }
    }catch(e){}
    return false;
  }

  function closeModalNow(modal){
    const overlay=modal&&modal.closest?modal.closest('.overlay'):null;
    try{if(typeof window.closeModal==='function')window.closeModal();else if(typeof closeModal==='function')closeModal();}catch(e){}
    try{if(overlay&&overlay.isConnected)overlay.remove();}catch(e){}
  }

  function readBase64(file){
    return new Promise(function(resolve,reject){
      const rd=new FileReader();
      rd.onerror=function(){reject(new Error('Lecture du fichier impossible'));};
      rd.onload=function(){
        const b64=String(rd.result||'').split(',')[1]||'';
        if(!b64){reject(new Error('Document vide ou illisible'));return;}
        resolve(b64);
      };
      rd.readAsDataURL(file);
    });
  }

  async function archive(file){
    const api=typeof API!=='undefined'?String(API||''):'';
    if(!api)throw new Error('API Yaya indisponible');
    const base64=await readBase64(file);
    const r=await fetch(api,{
      method:'POST',
      cache:'no-store',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({
        action:'archiverDevis',
        data:{filename:String(file.name||'document.pdf'),mimeType:String(file.type||'application/pdf'),base64:base64}
      })
    });
    const raw=await r.text();
    if(!r.ok)throw new Error('Import HTTP '+r.status);
    let j;try{j=JSON.parse(raw);}catch(e){throw new Error('Réponse serveur invalide');}
    if(!j||j.ok!==true)throw new Error(String(j&&j.error||'Import impossible'));
    const d=j.data||{};
    const lien=txt(d.lienDrive||d.lien);
    if(!lien)throw new Error(String(d.archiveErreur||'Lien du document absent'));
    return lien;
  }

  async function importDocument(id,file){
    try{
      const lien=await archive(file);
      const row=findRow(id);
      if(!row)throw new Error('Achat introuvable après import');
      row.lien=lien;
      queueRow(id);
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe('Document rattaché à l’achat ✓');
    }catch(e){
      console.error('Yaya achat — import document :',e);
      toastSafe('Import du document impossible : '+String(e&&e.message||e),true);
    }
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #modalRoot .achat-edit-modal .yaya-achat-edit-import-doc{
        background:#eef6ff!important;
        color:#145c96!important;
        border:1px solid #9fc4e4!important;
      }
      #modalRoot .achat-edit-modal .yaya-achat-edit-import-doc:hover{
        background:#dfedfa!important;
        border-color:#7dabd2!important;
      }
      #modalRoot .achat-edit-modal .yaya-finance-edit-actions{
        grid-template-columns:repeat(auto-fit,minmax(125px,1fr))!important;
      }
      @media(max-width:640px){
        #modalRoot .achat-edit-modal .yaya-finance-edit-actions{
          grid-template-columns:1fr 1fr!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function resetStaleEditUploadLock(modal){
    if(!modal||!isEditModal(modal))return;

    // Cette modale utilise son propre input d'import et se ferme dès qu'un fichier est choisi.
    // Aucun verrou global ne doit donc survivre à une réouverture de la modale.
    modal.dataset.yayaUploadBusy='0';
    modal.dataset.yayaAchatUploadBusy='0';
    delete modal.dataset.yayaChargeUploadSoft;
    modal.classList.remove('yaya-upload-modal-busy');

    const progress=document.getElementById('yaya-upload-progress-overlay');
    if(progress)progress.remove();

    modal.querySelectorAll('button').forEach(function(btn){
      if(btn.dataset.yayaUploadLockSaved==='1'){
        btn.disabled=btn.dataset.yayaUploadWasDisabled==='1';
        if(btn.dataset.yayaUploadOriginalText)btn.textContent=btn.dataset.yayaUploadOriginalText;
      }
      if(btn.dataset.yayaGlobalUploadSaved==='1'){
        btn.disabled=btn.dataset.yayaGlobalUploadDisabled==='1';
        if(btn.dataset.yayaGlobalUploadText)btn.textContent=btn.dataset.yayaGlobalUploadText;
      }

      btn.removeAttribute('aria-busy');
      btn.removeAttribute('aria-disabled');
      btn.style.removeProperty('pointer-events');
      btn.style.removeProperty('opacity');
      btn.style.removeProperty('cursor');

      delete btn.dataset.yayaUploadLockSaved;
      delete btn.dataset.yayaUploadWasDisabled;
      delete btn.dataset.yayaUploadOriginalText;
      delete btn.dataset.yayaGlobalUploadSaved;
      delete btn.dataset.yayaGlobalUploadDisabled;
      delete btn.dataset.yayaGlobalUploadText;
    });
  }

  function armImportButton(modal,btn,input){
    if(!modal||!btn||!input)return;
    resetStaleEditUploadLock(modal);
    btn.disabled=false;
    btn.removeAttribute('disabled');
    btn.removeAttribute('aria-disabled');
    btn.removeAttribute('aria-busy');
    btn.style.removeProperty('pointer-events');
    btn.style.removeProperty('opacity');
    btn.style.removeProperty('cursor');
    btn.textContent='Importer document';

    // Toujours pointer vers l'input actuellement présent dans la modale.
    // Cela évite un bouton visuellement actif mais relié à un ancien input supprimé.
    btn.__yayaAchatEditImportInput=input;
    btn.__yayaAchatEditImportModal=modal;

    if(btn.__yayaAchatEditImportArmedV4)return;
    btn.__yayaAchatEditImportArmedV4=true;
    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      const liveModal=btn.__yayaAchatEditImportModal||modal;
      const liveInput=btn.__yayaAchatEditImportInput
        ||(liveModal&&liveModal.querySelector('.yaya-achat-edit-import-input'));
      resetStaleEditUploadLock(liveModal);
      btn.disabled=false;
      btn.removeAttribute('disabled');
      if(!liveInput){
        toastSafe('Import impossible : sélecteur de fichier introuvable',true);
        return;
      }
      try{liveInput.value='';}catch(_){}
      liveInput.click();
    },true);
  }

  function bindImportInput(modal,btn,input,id){
    if(!modal||!btn||!input||!id)return;
    input.onchange=function(){
      const file=input.files&&input.files[0];
      input.value='';
      resetStaleEditUploadLock(modal);
      if(!file){
        armImportButton(modal,btn,input);
        return;
      }
      if(file.size>MAX_FILE_SIZE){
        toastSafe('Fichier trop lourd (8 Mo max)',true);
        return;
      }

      const row=findRow(id);
      if(!row){
        toastSafe('Achat introuvable',true);
        return;
      }

      applyFormToRow(modal,row);
      queueRow(id);
      try{if(typeof render==='function')render();}catch(e){}

      closeModalNow(modal);
      toastSafe('Import du document lancé — vous pouvez continuer');
      setTimeout(function(){importDocument(id,file);},0);
    };
  }

  function enhance(modal){
    if(!isEditModal(modal))return;
    resetStaleEditUploadLock(modal);
    const id=modalId(modal);
    if(!id)return;
    const save=Array.from(modal.querySelectorAll('button')).find(function(b){
      return b.classList.contains('yaya-achat-single-save')||/^Enregistrer$/i.test(txt(b.textContent));
    });
    if(!save)return;
    const foot=save.closest('.yaya-finance-edit-actions,.mfoot')||save.parentElement;
    if(!foot)return;
    const existing=foot.querySelector('.yaya-achat-edit-import-doc');
    if(existing){
      let existingInput=modal.querySelector('.yaya-achat-edit-import-input');
      if(!existingInput){
        existingInput=document.createElement('input');
        existingInput.type='file';
        existingInput.accept='application/pdf,image/*';
        existingInput.style.display='none';
        existingInput.className='yaya-achat-edit-import-input';
        foot.appendChild(existingInput);
      }
      armImportButton(modal,existing,existingInput);
      bindImportInput(modal,existing,existingInput,id);
      return;
    }

    const input=document.createElement('input');
    input.type='file';
    input.accept='application/pdf,image/*';
    input.style.display='none';
    input.className='yaya-achat-edit-import-input';

    const btn=document.createElement('button');
    btn.type='button';
    btn.className='yaya-achat-edit-import-doc';
    btn.textContent='Importer document';
    btn.title='Importer ou remplacer la pièce jointe de cet achat';
    btn.disabled=false;

    armImportButton(modal,btn,input);
    bindImportInput(modal,btn,input,id);

    foot.insertBefore(btn,save.nextSibling);
    foot.appendChild(input);
  }

  function apply(){
    ensureStyle();
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.querySelectorAll('.overlay .modal').forEach(enhance);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();

  const root=document.getElementById('modalRoot');
  if(root){
    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){raf=0;apply();});
    }).observe(root,{childList:true,subtree:true});
  }

  setTimeout(apply,100);
  setTimeout(apply,500);
})();
