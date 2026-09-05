(function(){
  'use strict';

  if(window.__yayaDevisNoAiUploadV7)return;
  window.__yayaDevisNoAiUploadV7=true;

  let uploading=false;
  const nativeFetch=window.fetch.bind(window);
  const originalRemplacer=typeof window.remplacerPJ==='function'?window.remplacerPJ:null;

  const MAX_FILE_SIZE=8*1024*1024;
  const IMAGE_OPTIMIZE_FROM=650*1024;
  const IMAGE_MAX_SIDE=1800;
  const IMAGE_QUALITY=0.82;
  const UPLOAD_TIMEOUT=30000;

  function apiUrl(){
    try{return typeof API!=='undefined'?API:'';}catch(e){return '';}
  }

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function emitState(state,type,id,message){
    try{
      window.dispatchEvent(new CustomEvent('yaya:quote-upload-state',{
        detail:{state:state,type:String(type||''),id:String(id||''),message:String(message||'')}
      }));
    }catch(e){}
  }

  function chantier(id){
    try{
      return Array.isArray(S&&S.chantiers)
        ?S.chantiers.find(function(c){return String(c&&c.id)===String(id);})||null
        :null;
    }catch(e){return null;}
  }

  function avenant(id){
    try{
      return Array.isArray(S&&S.avenants)
        ?S.avenants.find(function(v){return String(v&&v.id)===String(id);})||null
        :null;
    }catch(e){return null;}
  }

  function isImage(file){
    return !!(file&&String(file.type||'').toLowerCase().startsWith('image/'));
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

  function decodeImage(file){
    if(typeof createImageBitmap==='function'){
      return createImageBitmap(file).catch(function(){return imageElement(file);});
    }
    return imageElement(file);
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
      canvas.width=w;
      canvas.height=h;
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx)return file;
      ctx.fillStyle='#fff';
      ctx.fillRect(0,0,w,h);
      ctx.drawImage(source,0,0,w,h);

      const blob=await new Promise(function(resolve){
        canvas.toBlob(resolve,'image/jpeg',IMAGE_QUALITY);
      });
      if(!blob||blob.size>=file.size*0.92)return file;

      const base=String(file.name||'devis').replace(/\.[^.]+$/,'')||'devis';
      return new File([blob],base+'.jpg',{
        type:'image/jpeg',
        lastModified:file.lastModified||Date.now()
      });
    }catch(e){
      return file;
    }finally{
      try{if(source&&typeof source.close==='function')source.close();}catch(e){}
    }
  }

  function readBase64(file){
    return new Promise(function(resolve,reject){
      const reader=new FileReader();
      reader.onerror=function(){reject(new Error('Lecture du fichier impossible'));};
      reader.onload=function(){
        const value=String(reader.result||'');
        resolve(value.split(',')[1]||'');
      };
      reader.readAsDataURL(file);
    });
  }

  async function postPayload(action,file,base64){
    const api=apiUrl();
    if(!api)throw new Error('API Yaya indisponible');

    const controller=new AbortController();
    const timer=setTimeout(function(){controller.abort();},UPLOAD_TIMEOUT);

    try{
      const response=await nativeFetch(api,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({
          action:action,
          data:{
            filename:file.name,
            mimeType:file.type||'application/pdf',
            base64:base64
          }
        }),
        signal:controller.signal
      });

      if(!response.ok)throw new Error('Erreur serveur '+response.status);
      let json;
      try{json=await response.json();}catch(e){throw new Error('Réponse serveur invalide');}
      return json;
    }catch(e){
      if(e&&e.name==='AbortError')throw new Error('Envoi trop long — opération libérée après 30 secondes');
      throw e;
    }finally{
      clearTimeout(timer);
    }
  }

  async function archiveQuote(file){
    const base64=await readBase64(file);
    if(!base64)throw new Error('Document vide ou illisible');

    let json=await postPayload('archiverDevis',file,base64);

    if(!json||!json.ok){
      const message=String(json&&json.error||'Archivage impossible');
      if(/action inconnue.*archiverDevis/i.test(message)){
        // Compatibilité immédiate avec le serveur actuellement déployé.
        // extraireDevis archive aussi la pièce et renvoie lienDrive.
        json=await postPayload('extraireDevis',file,base64);
      }
    }

    if(!json||!json.ok)throw new Error(String(json&&json.error||'Archivage impossible'));
    const data=json.data||{};
    if(!data.lienDrive)throw new Error(data.archiveErreur||'Fichier non archivé');
    return data.lienDrive;
  }

  async function persistLink(type,id,lien){
    if(type==='devis'){
      const c=chantier(id);
      if(!c)throw new Error('Chantier introuvable');
      const previous=c.notes;
      c.notes=lien;
      try{
        const ok=typeof apiPost==='function'?await apiPost('setChantiers',S.chantiers):false;
        if(!ok)throw new Error('Enregistrement impossible');
      }catch(e){
        c.notes=previous;
        throw e;
      }
      return;
    }

    const v=avenant(id);
    if(!v)throw new Error('Devis introuvable');
    const previous=v.lien;
    v.lien=lien;
    try{
      const ok=typeof apiPost==='function'?await apiPost('setAvenants',S.avenants):false;
      if(!ok)throw new Error('Enregistrement impossible');
    }catch(e){
      v.lien=previous;
      throw e;
    }
  }

  function remplacerSansIA(type,id){
    if(type!=='devis'&&type!=='avenant'){
      if(originalRemplacer)return originalRemplacer(type,id);
      return;
    }

    if(uploading){
      toastSafe('Un document est déjà en cours d’envoi');
      return;
    }

    const input=document.createElement('input');
    input.type='file';
    input.accept='application/pdf,image/*';
    input.style.display='none';
    document.body.appendChild(input);

    input.onchange=async function(){
      let file=input.files&&input.files[0];
      input.remove();
      if(!file)return;

      if(file.size>MAX_FILE_SIZE){
        toastSafe('Fichier trop lourd (8 Mo max)',true);
        emitState('error',type,id,'Fichier trop lourd (8 Mo max)');
        return;
      }

      uploading=true;
      emitState('start',type,id,'Import en cours');

      const modal=document.querySelector('.yaya-devis-fast-modal');
      const save=modal&&modal.querySelector('#yayaFastSave');
      if(save)save.disabled=true;

      try{
        file=await optimizeFile(file);
        if(file.size>MAX_FILE_SIZE)throw new Error('Fichier trop lourd (8 Mo max)');

        const lien=await archiveQuote(file);
        await persistLink(type,id,lien);

        toastSafe('Document ajouté ✓');
        emitState('success',type,id,'Document ajouté');
      }catch(e){
        const message=String(e&&e.message||e);
        toastSafe(message,true);
        emitState('error',type,id,message);
      }finally{
        uploading=false;
        if(save&&save.isConnected)save.disabled=false;
        emitState('end',type,id,'');
      }
    };

    input.click();
  }

  function installSafeFetchRewrite(){
    if(window.__yayaNoAiSafeFetchInstalled)return;
    window.__yayaNoAiSafeFetchInstalled=true;

    window.fetch=async function(input,init){
      if(
        typeof input==='string'&&
        input===apiUrl()&&
        init&&
        typeof init.body==='string'
      ){
        try{
          const originalBody=JSON.parse(init.body);
          if(originalBody&&originalBody.action==='extraireDevis'){
            const noAiBody=Object.assign({},originalBody,{action:'archiverDevis'});
            const noAiInit=Object.assign({},init,{body:JSON.stringify(noAiBody)});
            const first=await nativeFetch(input,noAiInit);
            try{
              const probe=await first.clone().json();
              const message=String(probe&&probe.error||'');
              if(probe&&probe.ok)return first;
              if(/action inconnue.*archiverDevis/i.test(message)){
                return nativeFetch(input,init);
              }
            }catch(e){}
            return first;
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
      const text=String(el.textContent||'');
      if(/scan ia|analyse ia|analyse du document|lecture ia/i.test(text)){
        el.innerHTML=el.innerHTML
          .replace(/Scan IA en cours\.{0,3}/gi,'Chargement du document…')
          .replace(/Analyse IA/gi,'Chargement')
          .replace(/Analyse du document/gi,'Chargement du document')
          .replace(/Lecture IA/gi,'Chargement');
      }
    });
  }

  installSafeFetchRewrite();
  installReplace();
  cleanAiLabels(document);

  new MutationObserver(function(){
    installReplace();
    cleanAiLabels(document);
  }).observe(document.documentElement,{childList:true,subtree:true});

  window.addEventListener('yaya:data-refreshed',function(){
    installReplace();
    cleanAiLabels(document);
  });
})();