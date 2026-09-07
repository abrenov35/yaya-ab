(function(){
  'use strict';

  if(window.__yayaDocumentUploadNoAiFixV2)return;
  window.__yayaDocumentUploadNoAiFixV2=true;

  const MAX_FILE_SIZE=8*1024*1024;
  const UPLOAD_TIMEOUT=30000;
  const nativeFetch=window.fetch.bind(window);

  function endpoint(){
    try{return typeof API!=='undefined'&&API?String(API):'';}catch(e){return '';}
  }

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function documentModal(){
    const root=document.getElementById('modalRoot');
    if(!root)return null;
    return Array.from(root.querySelectorAll('.modal')).find(function(modal){
      return !!(modal.querySelector('#docFile')&&modal.querySelector('#docEtat'));
    })||null;
  }

  function normalizeLinkInputs(modal){
    if(!modal)return null;
    const links=Array.from(modal.querySelectorAll('input#docLien'));
    if(!links.length){
      const input=document.createElement('input');
      input.type='hidden';
      input.id='docLien';
      modal.appendChild(input);
      return input;
    }

    const keep=links[0];
    const current=links.map(function(el){return String(el.value||'').trim();}).find(Boolean)||String(modal.dataset.yayaAttachmentLien||'').trim();
    if(current)keep.value=current;
    links.slice(1).forEach(function(el){el.remove();});
    return keep;
  }

  function setDocumentLink(lien){
    const value=String(lien||'').trim();
    const modal=documentModal();
    if(!modal)return;
    const input=normalizeLinkInputs(modal);
    if(input)input.value=value;
    modal.dataset.yayaAttachmentLien=value;
  }

  function setState(state,message){
    const modal=documentModal();
    const etat=modal?modal.querySelector('#docEtat'):document.getElementById('docEtat');
    if(!etat)return;
    etat.dataset.yayaUploadState=state||'';
    etat.textContent=message||'';
    if(state==='success'){
      etat.style.setProperty('display','block','important');
      etat.style.setProperty('margin','10px 0','important');
      etat.style.setProperty('padding','9px 11px','important');
      etat.style.setProperty('border','1px solid #b9dfc6','important');
      etat.style.setProperty('border-radius','7px','important');
      etat.style.setProperty('background','#eef9f2','important');
      etat.style.setProperty('color','#237443','important');
      etat.style.setProperty('font-weight','750','important');
    }else if(state==='error'){
      etat.style.setProperty('display','block','important');
      etat.style.setProperty('margin','10px 0','important');
      etat.style.setProperty('padding','9px 11px','important');
      etat.style.setProperty('border','1px solid #efb7b7','important');
      etat.style.setProperty('border-radius','7px','important');
      etat.style.setProperty('background','#fff2f2','important');
      etat.style.setProperty('color','#b42318','important');
      etat.style.setProperty('font-weight','700','important');
    }else{
      etat.style.removeProperty('border');
      etat.style.removeProperty('background');
      etat.style.removeProperty('color');
      etat.style.removeProperty('font-weight');
      etat.style.removeProperty('padding');
      etat.style.removeProperty('border-radius');
    }
  }

  function readBase64(file){
    return new Promise(function(resolve,reject){
      const reader=new FileReader();
      reader.onerror=function(){reject(new Error('Lecture du fichier impossible'));};
      reader.onload=function(){resolve(String(reader.result||'').split(',')[1]||'');};
      reader.readAsDataURL(file);
    });
  }

  async function archive(file){
    const api=endpoint();
    if(!api)throw new Error('API Yaya indisponible');

    const base64=await readBase64(file);
    if(!base64)throw new Error('Document vide ou illisible');

    const controller=new AbortController();
    const timer=setTimeout(function(){controller.abort();},UPLOAD_TIMEOUT);
    try{
      const response=await nativeFetch(api,{
        method:'POST',
        cache:'no-store',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({
          action:'archiverDevis',
          data:{filename:file.name,mimeType:file.type||'application/pdf',base64:base64}
        }),
        signal:controller.signal
      });
      if(!response.ok)throw new Error('Erreur serveur '+response.status);
      const text=await response.text();
      let json;
      try{json=JSON.parse(text);}catch(e){throw new Error('Réponse Yaya invalide');}
      if(!json||json.ok!==true)throw new Error(String(json&&json.error||'Import impossible'));
      const data=json.data||{};
      const lien=String(data.lienDrive||data.lien||'').trim();
      if(!lien)throw new Error(String(data.archiveErreur||'Fichier non archivé'));
      return lien;
    }catch(e){
      if(e&&e.name==='AbortError')throw new Error('Import interrompu — réessaie');
      throw e;
    }finally{
      clearTimeout(timer);
    }
  }

  async function traiterDocumentSansIA(file){
    if(!file)return;
    if(file.size>MAX_FILE_SIZE){
      setState('error','Fichier trop lourd (8 Mo max).');
      toastSafe('Fichier trop lourd (8 Mo max)',true);
      return;
    }

    setDocumentLink('');
    setState('progress','⏳ Import de la pièce jointe en cours…');

    try{
      const lien=await archive(file);
      setDocumentLink(lien);

      const modal=documentModal();
      const titre=modal?modal.querySelector('#docTitre'):document.getElementById('docTitre');
      if(titre&&!String(titre.value||'').trim()){
        titre.value=String(file.name||'Document').replace(/\.[^.]+$/,'').trim()||'Document';
      }

      setState('success','✓ Pièce jointe enregistrée');
      try{
        window.dispatchEvent(new CustomEvent('yaya:document-upload-state',{detail:{state:'success',lien:lien}}));
      }catch(e){}
    }catch(err){
      const message=String(err&&err.message||err);
      setDocumentLink('');
      setState('error','⚠ '+message);
      toastSafe(message,true);
      try{
        window.dispatchEvent(new CustomEvent('yaya:document-upload-state',{detail:{state:'error',message:message}}));
      }catch(e){}
    }
  }

  function lireDocumentSansIA(input){
    const file=input&&input.files&&input.files[0];
    if(input)input.value='';
    if(file)traiterDocumentSansIA(file);
  }

  function normalizeCurrentModal(){
    const modal=documentModal();
    if(modal)normalizeLinkInputs(modal);
  }

  window.addEventListener('yaya:document-upload-state',function(e){
    const detail=e&&e.detail||{};
    if(detail.state==='success'&&detail.lien)setDocumentLink(detail.lien);
  });

  const root=document.getElementById('modalRoot');
  if(root){
    new MutationObserver(normalizeCurrentModal).observe(root,{childList:true,subtree:true});
  }
  normalizeCurrentModal();

  window.lireDocument=lireDocumentSansIA;
  window.traiterDocument=traiterDocumentSansIA;
  try{lireDocument=lireDocumentSansIA;}catch(e){}
  try{traiterDocument=traiterDocumentSansIA;}catch(e){}
})();
