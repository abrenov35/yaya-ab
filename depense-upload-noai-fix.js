(function(){
  'use strict';

  if(window.__yayaDepenseUploadNoAiV1)return;
  window.__yayaDepenseUploadNoAiV1=true;

  const MAX_FILE_SIZE=8*1024*1024;
  const previousTraiter=typeof window.traiterAchat==='function'?window.traiterAchat:null;
  const inFlight=new Map();

  function isSousTraitant(){
    const type=document.getElementById('acType');
    return !!type&&String(type.value||'').trim()==='Facture sous-traitant';
  }

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function setStatus(html){
    const etat=document.getElementById('achatEtat');
    if(etat)etat.innerHTML=html;
  }

  function endpoint(){
    try{if(typeof API!=='undefined'&&API)return String(API);}catch(e){}
    return '';
  }

  function fileKey(file){
    return [file&&file.name||'',file&&file.size||0,file&&file.lastModified||0].join('|');
  }

  function readBase64(file){
    return new Promise(function(resolve,reject){
      const reader=new FileReader();
      reader.onerror=function(){reject(new Error('Lecture du fichier impossible'));};
      reader.onload=function(){resolve(String(reader.result||'').split(',')[1]||'');};
      reader.readAsDataURL(file);
    });
  }

  function saveLink(lien){
    try{achatLien=lien;}catch(e){window.achatLien=lien;}
    try{window.achatLien=lien;}catch(e){}
  }

  async function uploadDepense(file){
    if(!file)return false;
    if(file.size>MAX_FILE_SIZE){
      setStatus('<span style="color:var(--red)">⚠ Fichier trop lourd (8 Mo max)</span>');
      toastSafe('Fichier trop lourd (8 Mo max)',true);
      return false;
    }

    const key=fileKey(file);
    if(inFlight.has(key))return inFlight.get(key);

    const task=(async function(){
      const url=endpoint();
      if(!url)throw new Error('Import indisponible');

      setStatus('<span>⏳ Import de la pièce jointe en cours…</span>');
      try{
        window.dispatchEvent(new CustomEvent('yaya:achat-upload-state',{detail:{state:'start'}}));
      }catch(e){}

      const base64=await readBase64(file);
      if(!base64)throw new Error('Document vide ou illisible');

      // Dépenses : archivage direct de la pièce. On ne dépend plus de l'analyse OpenAI
      // pour obtenir le lien, ce qui évite le sablier sans pièce jointe enregistrée.
      const response=await fetch(url,{
        method:'POST',
        cache:'no-store',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({
          action:'archiverDevis',
          data:{
            filename:file.name,
            mimeType:file.type||'application/pdf',
            base64:base64
          }
        })
      });

      const text=await response.text();
      let json;
      try{json=JSON.parse(text);}catch(e){throw new Error('Réponse Yaya invalide');}
      if(!json||json.ok!==true)throw new Error(String(json&&json.error||'Import impossible'));

      const data=json.data||{};
      const lien=String(data.lienDrive||data.lien||'').trim();
      if(!lien)throw new Error('Le fichier n’a pas été archivé');

      saveLink(lien);
      setStatus('<span style="color:var(--green)">✓ Pièce jointe enregistrée</span>');
      toastSafe('Pièce jointe enregistrée ✓');
      try{
        window.dispatchEvent(new CustomEvent('yaya:achat-upload-state',{detail:{state:'success',lien:lien}}));
      }catch(e){}
      return true;
    })().catch(function(err){
      console.error('Yaya — import dépense :',err);
      setStatus('<span style="color:var(--red)">⚠ '+String(err&&err.message||err).replace(/[<>]/g,'')+'</span>');
      toastSafe('Import impossible : '+String(err&&err.message||err),true);
      try{
        window.dispatchEvent(new CustomEvent('yaya:achat-upload-state',{detail:{state:'error'}}));
      }catch(e){}
      return false;
    }).finally(function(){
      setTimeout(function(){inFlight.delete(key);},1500);
    });

    inFlight.set(key,task);
    return task;
  }

  function traiterPatched(file){
    // Le flux sous-traitant conserve son correctif dédié existant.
    if(isSousTraitant()&&previousTraiter)return previousTraiter(file);
    return uploadDepense(file);
  }

  function lirePatched(input){
    const file=input&&input.files&&input.files[0];
    try{if(input)input.value='';}catch(e){}
    if(!file)return;
    return traiterPatched(file);
  }

  window.traiterAchat=traiterPatched;
  window.lireAchat=lirePatched;
  try{traiterAchat=traiterPatched;}catch(e){}
  try{lireAchat=lirePatched;}catch(e){}

  // Filet de sécurité : même si une ancienne liaison onchange reste en cache,
  // le fichier sélectionné est archivé une seule fois grâce au dédoublonnage inFlight.
  document.addEventListener('change',function(event){
    const input=event.target;
    if(!input||input.id!=='achatFile'||isSousTraitant())return;
    const file=input.files&&input.files[0];
    if(!file)return;
    setTimeout(function(){uploadDepense(file);},0);
  },true);
})();
