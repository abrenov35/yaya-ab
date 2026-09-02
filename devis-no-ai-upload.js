(function(){
  'use strict';

  let uploading=false;
  const nativeFetch=window.fetch.bind(window);
  const originalRemplacer=typeof window.remplacerPJ==='function'?window.remplacerPJ:null;

  const MAX_FILE_SIZE=8*1024*1024;
  const IMAGE_OPTIMIZE_FROM=650*1024;
  const IMAGE_MAX_SIDE=1800;
  const IMAGE_QUALITY=0.82;

  function apiUrl(){
    try{return typeof API!=='undefined'?API:'';}catch(e){return '';}
  }

  function toastSafe(msg,err){
    try{if(typeof toast==='function')toast(msg,!!err);}catch(e){}
  }

  function chantier(id){
    try{return Array.isArray(S&&S.chantiers)?S.chantiers.find(function(c){return String(c&&c.id)===String(id);})||null:null;}catch(e){return null;}
  }

  function avenant(id){
    try{return Array.isArray(S&&S.avenants)?S.avenants.find(function(v){return String(v&&v.id)===String(id);})||null:null;}catch(e){return null;}
  }

  function isImage(file){
    return !!(file&&String(file.type||'').toLowerCase().startsWith('image/'));
  }

  function decodeImage(file){
    if(typeof createImageBitmap==='function'){
      return createImageBitmap(file).catch(function(){return imageElement(file);});
    }
    return imageElement(file);
  }

  function imageElement(file){
    return new Promise(function(resolve,reject){
      const url=URL.createObjectURL(file);
      const img=new Image();
      img.onload=function(){URL.revokeObjectURL(url);resolve(img);};
      img.onerror=function(){URL.revokeObjectURL(url);reject(new Error('Image illisible'));};
      img.src=url;
    });
  }

  async function optimizeFile(file){
    if(!isImage(file)||file.size<IMAGE_OPTIMIZE_FROM)return file;
    let source=null;
    try{
      source=await decodeImage(file);
      const sw=Number(source.width||source.naturalWidth)||0;
      const sh=Number(source.height||source.naturalHeight)||0;
      if(!sw||!sh)return file;
      const ratio=Math.min(1,IMAGE_MAX_SIDE/Math.max(sw,sh));
      const w=Math.max(1,Math.round(sw*ratio));
      const h=Math.max(1,Math.round(sh*ratio));
      const canvas=document.createElement('canvas');
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx)return file;
      ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
      ctx.drawImage(source,0,0,w,h);
      const blob=await new Promise(function(resolve){canvas.toBlob(resolve,'image/jpeg',IMAGE_QUALITY);});
      if(!blob||blob.size>=file.size*0.92)return file;
      const base=String(file.name||'devis').replace(/\.[^.]+$/,'')||'devis';
      return new File([blob],base+'.jpg',{type:'image/jpeg',lastModified:file.lastModified||Date.now()});
    }catch(e){
      return file;
    }finally{
      try{if(source&&typeof source.close==='function')source.close();}catch(e){}
    }
  }

  function readBase64(file){
    return new Promise(function(resolve,reject){
      const rd=new FileReader();
      rd.onerror=function(){reject(new Error('Lecture du fichier impossible'));};
      rd.onload=function(){resolve(String(rd.result||'').split(',')[1]||'');};
      rd.readAsDataURL(file);
    });
  }

  async function postQuoteFile(file,action){
    const api=apiUrl();
    if(!api)throw new Error('API Yaya indisponible');
    const base64=await readBase64(file);
    const resp=await nativeFetch(api,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({
        action:action,
        data:{filename:file.name,mimeType:file.type||'application/pdf',base64:base64}
      })
    });
    const j=await resp.json();
    if(!j||!j.ok){
      const message=j&&j.error?j.error:'Archivage impossible';
      if(/action inconnue.*archiverDevis/i.test(message))throw new Error('Le serveur Yaya doit être mis à jour pour joindre les devis sans IA.');
      throw new Error(message);
    }
    const d=j.data||{};
    if(!d.lienDrive)throw new Error(d.archiveErreur||'Fichier non archivé');
    return d.lienDrive;
  }

  function archiveQuote(file){
    return postQuoteFile(file,'archiverDevis');
  }

  async function remplacerSansIA(type,id){
    if(type!=='devis'&&type!=='avenant'){
      if(originalRemplacer)return originalRemplacer(type,id);
      return;
    }

    if(uploading){toastSafe('Un document est déjà en cours d’envoi');return;}
    const zone=document.getElementById('pj-zone');
    const modal=zone&&zone.closest('.modal');
    const input=document.createElement('input');
    input.type='file';
    input.accept='application/pdf,image/*';
    input.style.display='none';
    document.body.appendChild(input);

    input.onchange=async function(){
      let file=input.files&&input.files[0];
      input.remove();
      if(!file)return;
      if(uploading)return;
      if(file.size>MAX_FILE_SIZE){toastSafe('Fichier trop lourd (8 Mo max)',true);return;}

      uploading=true;
      const save=modal&&modal.querySelector('#yayaFastSave');
      if(save)save.disabled=true;

      function reopen(edit){
        if(!modal||!modal.isConnected||typeof edit!=='function')return;
        const draft=Array.from(modal.querySelectorAll('input[id]')).map(function(el){return {id:el.id,value:el.value};});
        edit(id);
        draft.forEach(function(saved){const el=document.getElementById(saved.id);if(el)el.value=saved.value;});
      }

      try{
        if(zone){
          zone.className='scan-zone';
          zone.innerHTML='<span>Préparation du document…</span>';
        }

        file=await optimizeFile(file);

        if(file.size>MAX_FILE_SIZE)throw new Error('Fichier trop lourd (8 Mo max)');

        if(zone){
          zone.className='scan-zone';
          zone.innerHTML='<span>Envoi du document…</span>';
        }

        const lien=await archiveQuote(file);

        if(type==='devis'){
          const c=chantier(id);if(!c)throw new Error('Chantier introuvable');
          const previous=c.notes;
          c.notes=lien;

          // Réouverture immédiate : l'opérateur n'attend plus l'écriture complète du tableau.
          if(typeof editMontantDevis==='function')reopen(editMontantDevis);

          try{
            if(typeof apiPost!=='function'||!await apiPost('updateChantier',c))throw new Error('Enregistrement impossible');
          }catch(error){
            c.notes=previous;
            throw error;
          }
        }else{
          const v=avenant(id);if(!v)throw new Error('Devis introuvable');
          const previous=v.lien;
          v.lien=lien;

          if(typeof editAvenantComplet==='function')reopen(editAvenantComplet);
          else if(typeof editMontantAvenant==='function')reopen(editMontantAvenant);

          try{
            if(typeof apiPost!=='function'||!await apiPost('setAvenants',S.avenants))throw new Error('Enregistrement impossible');
          }catch(error){
            v.lien=previous;
            throw error;
          }
        }

        toastSafe('Document ajouté ✓');
      }catch(e){
        if(zone&&zone.isConnected){
          zone.className='yaya-devis-fast-piece';
          zone.innerHTML='<span>Échec du chargement — réessaie</span>';
        }
        toastSafe(String(e&&e.message||e),true);
      }finally{
        uploading=false;
        if(save&&save.isConnected)save.disabled=false;
      }
    };

    input.click();
  }

  function installFetchRewrite(){
    if(window.__yayaNoAiFetchInstalled)return;
    window.__yayaNoAiFetchInstalled=true;
    window.fetch=function(input,init){
      if(typeof input==='string'&&input===apiUrl()&&init&&typeof init.body==='string'){
        try{
          const body=JSON.parse(init.body);
          if(body&&body.action==='extraireDevis'){
            body.action='archiverDevis';
            init=Object.assign({},init,{body:JSON.stringify(body)});
          }
        }catch(e){}
      }
      return nativeFetch(input,init);
    };
  }

  function installReplace(){
    window.remplacerPJ=remplacerSansIA;
    try{remplacerPJ=remplacerSansIA;}catch(e){}
  }

  function cleanAiLabels(root){
    (root||document).querySelectorAll('.scan-zone,.scan-ok,#avEtat,#chEtat,#pj-zone').forEach(function(el){
      const txt=String(el.textContent||'');
      if(/scan ia|analyse ia|analyse du document|lecture ia/i.test(txt)){
        el.innerHTML=el.innerHTML
          .replace(/Scan IA en cours\.{0,3}/gi,'Chargement en cours…')
          .replace(/Analyse du document\.{0,3}/gi,'Archivage du document…')
          .replace(/Analyse par IA\.{0,3}/gi,'Archivage du document…');
      }
    });
  }

  installFetchRewrite();
  installReplace();
  new MutationObserver(function(){
    installReplace();
    cleanAiLabels(document);
  }).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',function(){
    installReplace();
    cleanAiLabels(document);
  });
})();
