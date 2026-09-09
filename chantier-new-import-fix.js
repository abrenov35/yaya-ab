(function(){
  'use strict';

  if(window.__yayaNewChantierImportFixV1)return;
  window.__yayaNewChantierImportFixV1=true;

  const MAX_FILE_SIZE=8*1024*1024;
  let pendingFile=null;
  let attachRunning=false;

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function apiUrl(){
    try{return typeof API!=='undefined'?String(API||''):'';}catch(e){return '';}
  }

  function currentChantierIds(){
    try{
      return new Set((Array.isArray(S&&S.chantiers)?S.chantiers:[]).map(function(c){return String(c&&c.id||'');}));
    }catch(e){return new Set();}
  }

  function findNewChantier(beforeIds,wantedName){
    let list=[];
    try{list=Array.isArray(S&&S.chantiers)?S.chantiers:[];}catch(e){}
    const added=list.filter(function(c){return c&&c.id&&!beforeIds.has(String(c.id));});
    if(!added.length)return null;
    const wanted=String(wantedName||'').trim().toLowerCase();
    return added.find(function(c){return String(c.nom||'').trim().toLowerCase()===wanted;})||added[added.length-1]||null;
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

  async function archiveFile(file){
    const api=apiUrl();
    if(!api)throw new Error('API Yaya indisponible');
    const base64=await readBase64(file);
    if(!base64)throw new Error('Document vide ou illisible');

    const response=await fetch(api,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({
        action:'archiverDevis',
        data:{
          filename:String(file.name||'document.pdf'),
          mimeType:String(file.type||'application/pdf'),
          base64:base64
        }
      })
    });

    if(!response.ok)throw new Error('Erreur serveur '+response.status);
    const json=await response.json();
    if(!json||!json.ok)throw new Error(String(json&&json.error||'Archivage impossible'));
    const data=json.data||{};
    if(!data.lienDrive)throw new Error(String(data.archiveErreur||'Fichier non archivé'));
    return String(data.lienDrive);
  }

  function selectPendingFile(button){
    const input=document.createElement('input');
    input.type='file';
    input.accept='application/pdf,image/*';
    input.style.display='none';
    document.body.appendChild(input);

    input.onchange=function(){
      const file=input.files&&input.files[0];
      input.remove();
      if(!file)return;
      if(file.size>MAX_FILE_SIZE){
        toastSafe('Fichier trop lourd (8 Mo max)',true);
        return;
      }
      pendingFile=file;
      if(button){
        button.textContent='📎 '+String(file.name||'Pièce');
        button.title='Pièce prête à être jointe au nouveau chantier';
      }
      toastSafe('Pièce sélectionnée — elle sera jointe à la création du chantier ✓');
    };

    input.click();
  }

  async function attachPendingFile(chantier,file){
    if(!chantier||!chantier.id||!file||attachRunning)return;
    attachRunning=true;
    try{
      const lien=await archiveFile(file);
      if(!Array.isArray(S.documents))S.documents=[];
      const baseName=String(file.name||'Document').replace(/\.[^.]+$/,'').trim()||'Document';
      const date=(typeof isoDate==='function')?isoDate(new Date()):new Date().toISOString().slice(0,10);
      S.documents.unshift({
        id:typeof uid==='function'?uid():('doc_'+Date.now()),
        chantierId:String(chantier.id),
        type:'Divers',
        titre:baseName,
        sujet:String(file.name||baseName),
        date:date,
        lien:lien
      });
      const ok=typeof apiPost==='function'?await apiPost('setDocuments',S.documents):false;
      if(!ok)throw new Error('Pièce non enregistrée dans Yaya');
      pendingFile=null;
      if(typeof render==='function')render();
      toastSafe('Chantier créé et pièce jointe ✓');
    }catch(e){
      toastSafe('Chantier créé, mais import de la pièce impossible : '+String(e&&e.message||e),true);
    }finally{
      attachRunning=false;
    }
  }

  function monitorCreation(beforeIds,wantedName,file,attempt){
    const chantier=findNewChantier(beforeIds,wantedName);
    if(chantier){
      setTimeout(function(){
        let stillThere=false;
        try{stillThere=Array.isArray(S&&S.chantiers)&&S.chantiers.some(function(c){return String(c&&c.id)===String(chantier.id);});}catch(e){}
        if(stillThere)attachPendingFile(chantier,file);
      },1200);
      return;
    }
    if(attempt>=40)return;
    setTimeout(function(){monitorCreation(beforeIds,wantedName,file,attempt+1);},100);
  }

  document.addEventListener('click',function(event){
    const target=event.target&&event.target.closest?event.target.closest('button'):null;
    if(!target)return;

    const createModal=target.closest('.yaya-manage-create-modal');
    if(!createModal)return;

    if(target.classList.contains('yaya-manage-import-btn')){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
      selectPendingFile(target);
      return;
    }

    if(target.id==='chCreateBtn'){
      if(!pendingFile)return;
      const file=pendingFile;
      const beforeIds=currentChantierIds();
      const nom=document.getElementById('chNom');
      const wantedName=String(nom&&nom.value||'').trim();
      setTimeout(function(){monitorCreation(beforeIds,wantedName,file,0);},0);
      return;
    }

    if(String(target.textContent||'').trim().toLowerCase()==='annuler'){
      pendingFile=null;
    }
  },true);

  document.addEventListener('change',function(event){
    const select=event.target;
    if(!select||select.id!=='yayaManageChantierSelect')return;
    if(String(select.value||''))pendingFile=null;
  },true);
})();

// V2 — fiabilise les écritures Sheet : les actions idempotentes "set*"
// sont retentées automatiquement avant d'afficher une erreur à l'utilisateur.
(function(){
  'use strict';

  if(window.__yayaApiPostRetryV1Installed)return;
  window.__yayaApiPostRetryV1Installed=true;

  if(typeof window.apiPost!=='function')return;

  function wait(ms){
    return new Promise(function(resolve){setTimeout(resolve,ms);});
  }

  function setSync(message){
    try{if(typeof syncMsg==='function')syncMsg(message);}catch(e){}
  }

  function showError(message){
    try{if(typeof toast==='function')toast(message,true);}catch(e){}
  }

  window.apiPost=async function(action,data){
    const actionName=String(action||'');
    const retryable=/^set[A-Z]/.test(actionName);
    const maxAttempts=retryable?3:1;
    const delays=[0,650,1500];
    let lastError=null;

    setSync('enregistrement…');

    for(let attempt=1;attempt<=maxAttempts;attempt++){
      if(attempt>1){
        setSync('nouvelle tentative '+attempt+'/'+maxAttempts+'…');
        await wait(delays[attempt-1]||500);
      }

      try{
        const controller=new AbortController();
        const timer=setTimeout(function(){controller.abort();},15000);
        let response;

        try{
          response=await fetch(API,{
            method:'POST',
            headers:{'Content-Type':'text/plain;charset=utf-8'},
            body:JSON.stringify({action:action,data:data}),
            cache:'no-store',
            signal:controller.signal
          });
        }finally{
          clearTimeout(timer);
        }

        if(!response.ok){
          throw new Error('HTTP '+response.status);
        }

        const text=await response.text();
        let json;
        try{
          json=JSON.parse(text);
        }catch(e){
          throw new Error('réponse Google temporairement invalide');
        }

        if(!json||!json.ok){
          throw new Error(String(json&&json.error||'erreur script'));
        }

        setSync('✓ enregistré '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}));
        return true;
      }catch(error){
        lastError=error;
        if(attempt<maxAttempts)continue;
      }
    }

    setSync('');
    const detail=String(lastError&&lastError.message||'erreur réseau');

    if(retryable){
      showError('⚠ Enregistrement non confirmé après 3 tentatives — réessaie dans quelques secondes. ('+detail+')');
    }else{
      showError('⚠ Échec d’enregistrement — réessaie dans quelques secondes. ('+detail+')');
    }

    try{console.warn('Yaya apiPost : écriture non confirmée',actionName,lastError);}catch(e){}
    return false;
  };
})();
