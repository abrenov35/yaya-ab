(function(){
  'use strict';

  if(window.__yayaDevisNoAiUploadV11)return;
  window.__yayaDevisNoAiUploadV11=true;

  let uploading=false;
  const nativeFetch=window.fetch.bind(window);
  const originalRemplacer=typeof window.remplacerPJ==='function'?window.remplacerPJ:null;

  const MAX_FILE_SIZE=8*1024*1024;
  const IMAGE_OPTIMIZE_FROM=650*1024;
  const IMAGE_MAX_SIDE=1800;
  const IMAGE_QUALITY=0.82;
  const UPLOAD_TIMEOUT=60000;

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

  async function postAction(action,data){
    const api=apiUrl();
    if(!api)throw new Error('API Yaya indisponible');

    const controller=new AbortController();
    const timer=setTimeout(function(){controller.abort();},UPLOAD_TIMEOUT);
    try{
      const response=await nativeFetch(api,{
        method:'POST',
        cache:'no-store',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:action,data:data}),
        signal:controller.signal
      });
      if(!response.ok){
        const err=new Error('Erreur serveur '+response.status);
        err.status=response.status;
        throw err;
      }
      let json;
      try{json=await response.json();}catch(e){throw new Error('Réponse serveur invalide');}
      if(!json||!json.ok)throw new Error(String(json&&json.error||'Enregistrement serveur refusé'));
      return json;
    }catch(e){
      if(e&&e.name==='AbortError')throw new Error('Import interrompu — réessaie');
      throw e;
    }finally{
      clearTimeout(timer);
    }
  }

  async function postPayload(action,file,base64){
    return postAction(action,{
      filename:file.name,
      mimeType:file.type||'application/pdf',
      base64:base64
    });
  }

  async function freshData(){
    const api=apiUrl();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.indexOf('?')>=0?'&':'?';
    const response=await nativeFetch(api+sep+'_ts='+Date.now(),{method:'GET',cache:'no-store'});
    if(!response.ok)throw new Error('Lecture serveur impossible ('+response.status+')');
    const json=await response.json();
    if(!json||!json.ok||!json.data)throw new Error(String(json&&json.error||'Données serveur indisponibles'));
    return json.data;
  }

  function shouldFallback(err,json){
    const message=String((err&&err.message)||(json&&json.error)||'');
    const status=Number(err&&err.status)||0;
    return status===404||status===405||/action.*inconnue|action.*introuvable|archiverDevis|non gérée|non geree/i.test(message);
  }

  async function archiveQuote(file){
    const base64=await readBase64(file);
    if(!base64)throw new Error('Document vide ou illisible');

    let json=null;
    try{
      json=await postPayload('archiverDevis',file,base64);
    }catch(err){
      if(!shouldFallback(err,null))throw err;
    }

    if(!json){
      emitState('progress','devis','',"Nouvelle tentative d'import");
      json=await postPayload('extraireDevis',file,base64);
    }

    const data=json&&json.data||{};
    const lien=String(data.lienDrive||data.lien||'').trim();
    if(!lien)throw new Error(data.archiveErreur||'Fichier non archivé');
    return lien;
  }

  async function persistDevisLink(id,lien){
    const local=chantier(id);
    if(!local)throw new Error('Chantier introuvable');

    let source=null;
    try{
      const fresh=await freshData();
      if(fresh&&Array.isArray(fresh.chantiers))source=fresh.chantiers;
    }catch(e){
      console.warn('Import devis : lecture fraîche indisponible, repli local.',e);
    }
    if(!source&&typeof S!=='undefined'&&S&&Array.isArray(S.chantiers))source=S.chantiers;
    if(!source)throw new Error('Liste chantiers indisponible');

    const list=source.map(function(c){return c&&typeof c==='object'?Object.assign({},c):c;});
    const target=list.find(function(c){return String(c&&c.id||'')===String(id);});
    if(!target)throw new Error('Chantier absent du serveur');
    target.notes=lien;

    await postAction('setChantiers',list);

    let verified=false;
    try{
      const after=await freshData();
      const stored=after&&Array.isArray(after.chantiers)
        ?after.chantiers.find(function(c){return String(c&&c.id||'')===String(id);})
        :null;
      verified=!!(stored&&String(stored.notes||'').trim()===String(lien).trim());
    }catch(e){
      console.warn('Import devis : vérification serveur différée.',e);
      verified=true;
    }
    if(!verified)throw new Error('La pièce a été archivée mais son lien n’a pas été conservé');

    local.notes=lien;
    try{if(typeof render==='function')render();}catch(e){}
  }

  async function persistAvenantLink(id,lien){
    const local=avenant(id);
    if(!local)throw new Error('Devis introuvable');

    let source=null;
    try{
      const fresh=await freshData();
      if(fresh&&Array.isArray(fresh.avenants))source=fresh.avenants;
    }catch(e){
      console.warn('Import avenant : lecture fraîche indisponible, repli local.',e);
    }
    if(!source&&typeof S!=='undefined'&&S&&Array.isArray(S.avenants))source=S.avenants;
    if(!source)throw new Error('Liste devis indisponible');

    const list=source.map(function(v){return v&&typeof v==='object'?Object.assign({},v):v;});
    const target=list.find(function(v){return String(v&&v.id||'')===String(id);});
    if(!target)throw new Error('Devis absent du serveur');
    target.lien=lien;

    await postAction('setAvenants',list);
    local.lien=lien;
    try{if(typeof render==='function')render();}catch(e){}
  }

  async function persistLink(type,id,lien){
    if(type==='devis')return persistDevisLink(id,lien);
    return persistAvenantLink(id,lien);
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
        emitState('end',type,id,'');
        return;
      }

      uploading=true;
      emitState('start',type,id,'Import et archivage en cours');

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
        emitState('end',type,id,'');
      }
    };

    input.click();
  }

  function installReplace(){
    window.remplacerPJ=remplacerSansIA;
    try{remplacerPJ=remplacerSansIA;}catch(e){}
  }

  function cleanAiLabels(root){
    (root||document).querySelectorAll('.scan-zone,.scan-ok,#avEtat,#chEtat,#pj-zone,.yaya-upload-progress-title,.yaya-upload-progress-sub').forEach(function(el){
      const text=String(el.textContent||'');
      if(/scan ia|analyse ia|analyse du document|lecture ia|traitement et d.archivage/i.test(text)){
        el.innerHTML=el.innerHTML
          .replace(/Scan IA en cours\.{0,3}/gi,'Import du document en cours…')
          .replace(/Analyse IA/gi,'Import')
          .replace(/Analyse du document en cours…?/gi,'Import du document en cours…')
          .replace(/Analyse du document/gi,'Import du document')
          .replace(/Lecture IA/gi,'Import')
          .replace(/La pièce est en cours de traitement et d.archivage\.?/gi,'La pièce est en cours d’archivage.');
      }
    });
  }

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
