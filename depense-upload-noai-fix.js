(function(){
  'use strict';

  if(window.__yayaDepenseUploadReliableV2)return;
  window.__yayaDepenseUploadReliableV2=true;

  const MAX_FILE_SIZE=8*1024*1024;
  const inFlight=new Map();
  const previousTraiter=typeof window.traiterAchat==='function'?window.traiterAchat:null;
  const previousLire=typeof window.lireAchat==='function'?window.lireAchat:null;

  function isSousTraitant(){
    const type=document.getElementById('acType');
    return !!type&&String(type.value||'').trim()==='Facture sous-traitant';
  }

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function statusNode(){return document.getElementById('achatEtat');}
  function setStatus(html){const el=statusNode();if(el)el.innerHTML=html;}

  function modalAchat(){
    const input=document.getElementById('achatFile');
    return input&&input.closest?input.closest('.modal'):null;
  }

  function armAutoSave(){
    const modal=modalAchat();
    if(!modal)return;
    modal.dataset.yayaUploadAutoSaveArmed='1';
    modal.dataset.yayaUploadAutoSaveDone='0';
    modal.dataset.yayaUploadAutoSaveAt=String(Date.now());
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

  async function post(action,data){
    const url=endpoint();
    if(!url)throw new Error('Import indisponible');
    const response=await fetch(url,{
      method:'POST',
      cache:'no-store',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:action,data:data})
    });
    const text=await response.text();
    let json;
    try{json=JSON.parse(text);}catch(e){throw new Error('Réponse Yaya invalide');}
    if(!json||json.ok!==true)throw new Error(String(json&&json.error||'Import impossible'));
    return json.data||{};
  }

  function saveLink(lien){
    const value=String(lien||'').trim();
    if(!value)return;
    try{achatLien=value;}catch(e){}
    try{window.achatLien=value;}catch(e){}
    const modal=modalAchat();
    if(modal)modal.dataset.yayaAchatLien=value;
  }

  function field(id,value){
    if(value===undefined||value===null||value==='')return;
    const el=document.getElementById(id);
    if(el)el.value=String(value);
  }

  function applyExtracted(data){
    data=data||{};
    field('acFour',data.fournisseur);
    field('acDes',data.designation);
    field('acDate',data.date);
    field('acMt',data.montant_ht);

    const ch=document.getElementById('acCh');
    if(ch&&!String(ch.value||'').trim()&&data.reference_chantier){
      try{
        const ref=String(data.reference_chantier||'').toLowerCase();
        const list=(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers))?S.chantiers:[];
        const found=list.find(function(c){
          const nom=String(c&&c.nom||'').toLowerCase();
          const numero=String(c&&c.numero||'').toLowerCase();
          return (nom&&(ref.includes(nom)||nom.includes(ref)))||(numero&&ref.includes(numero));
        });
        if(found)ch.value=String(found.id||'');
      }catch(e){}
    }
  }

  async function guaranteeArchive(file,base64,extracted){
    const first=extracted||{};
    let lien=String(first.lienDrive||first.lien||'').trim();
    if(lien)return lien;

    const archived=await post('archiverDevis',{
      filename:file.name,
      mimeType:file.type||'application/pdf',
      base64:base64
    });
    lien=String(archived.lienDrive||archived.lien||'').trim();
    if(!lien)throw new Error('La pièce jointe n’a pas été archivée');
    return lien;
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
      armAutoSave();
      setStatus('<span>⏳ Import de la pièce jointe en cours…</span>');

      const base64=await readBase64(file);
      if(!base64)throw new Error('Document vide ou illisible');

      let extracted={};
      try{
        extracted=await post('extraireAchat',{
          filename:file.name,
          mimeType:file.type||'application/pdf',
          base64:base64
        });
        applyExtracted(extracted);
      }catch(err){
        console.warn('Yaya — extraction dépense ignorée, archivage direct utilisé :',err);
      }

      const lien=await guaranteeArchive(file,base64,extracted);
      saveLink(lien);

      setStatus('<span style="color:var(--green)">✓ Pièce jointe enregistrée</span>');
      toastSafe('Pièce jointe enregistrée ✓');
      try{window.dispatchEvent(new CustomEvent('yaya:achat-upload-state',{detail:{state:'success',lien:lien}}));}catch(e){}
      return true;
    })().catch(function(err){
      console.error('Yaya — import dépense :',err);
      setStatus('<span style="color:var(--red)">⚠ '+String(err&&err.message||err).replace(/[<>]/g,'')+'</span>');
      toastSafe('Import impossible : '+String(err&&err.message||err),true);
      try{window.dispatchEvent(new CustomEvent('yaya:achat-upload-state',{detail:{state:'error'}}));}catch(e){}
      return false;
    }).finally(function(){
      setTimeout(function(){inFlight.delete(key);},1500);
    });

    inFlight.set(key,task);
    return task;
  }

  function traiterPatched(file){
    if(isSousTraitant()){
      if(previousTraiter)return previousTraiter(file);
      return false;
    }
    return uploadDepense(file);
  }

  function lirePatched(input){
    if(isSousTraitant()){
      if(previousLire)return previousLire(input);
      return false;
    }
    const file=input&&input.files&&input.files[0];
    try{if(input)input.value='';}catch(e){}
    if(!file)return;
    return uploadDepense(file);
  }

  window.traiterAchat=traiterPatched;
  window.lireAchat=lirePatched;
  try{traiterAchat=traiterPatched;}catch(e){}
  try{lireAchat=lirePatched;}catch(e){}

  document.addEventListener('change',function(event){
    const input=event.target;
    if(!input||input.id!=='achatFile'||isSousTraitant())return;
    const file=input.files&&input.files[0];
    if(!file)return;

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    try{input.value='';}catch(e){}
    uploadDepense(file);
  },true);
})();
