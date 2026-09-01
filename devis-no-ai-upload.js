(function(){
  'use strict';

  let noAiBackendReady=false;
  const nativeFetch=window.fetch.bind(window);
  const originalRemplacer=typeof window.remplacerPJ==='function'?window.remplacerPJ:null;

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

  function readBase64(file){
    return new Promise(function(resolve,reject){
      const rd=new FileReader();
      rd.onerror=function(){reject(new Error('Lecture du fichier impossible'));};
      rd.onload=function(){resolve(String(rd.result||'').split(',')[1]||'');};
      rd.readAsDataURL(file);
    });
  }

  async function archiveQuote(file){
    const api=apiUrl();
    if(!api)throw new Error('API Yaya indisponible');
    const base64=await readBase64(file);
    const resp=await nativeFetch(api,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({
        action:'archiverDevis',
        data:{filename:file.name,mimeType:file.type||'application/pdf',base64:base64}
      })
    });
    const j=await resp.json();
    if(!j||!j.ok)throw new Error(j&&j.error?j.error:'Archivage impossible');
    const d=j.data||{};
    if(!d.lienDrive)throw new Error(d.archiveErreur||'Fichier non archivé');
    return d.lienDrive;
  }

  async function remplacerSansIA(type,id){
    if(type!=='devis'&&type!=='avenant'){
      if(originalRemplacer)return originalRemplacer(type,id);
      return;
    }
    if(!noAiBackendReady){
      toastSafe('Archivage devis sans IA non activé côté serveur',true);
      return;
    }

    const zone=document.getElementById('pj-zone');
    const input=document.createElement('input');
    input.type='file';
    input.accept='application/pdf,image/*';
    input.style.display='none';
    document.body.appendChild(input);

    input.onchange=async function(){
      const file=input.files&&input.files[0];
      input.remove();
      if(!file)return;
      if(zone){
        zone.className='yaya-devis-fast-piece';
        zone.innerHTML='<span>Chargement du document…</span>';
      }
      try{
        const lien=await archiveQuote(file);
        if(type==='devis'){
          const c=chantier(id);if(!c)throw new Error('Chantier introuvable');
          c.notes=lien;
          if(typeof apiPost!=='function'||!await apiPost('setChantiers',S.chantiers))throw new Error('Enregistrement impossible');
          if(typeof editMontantDevis==='function')editMontantDevis(id);
        }else{
          const v=avenant(id);if(!v)throw new Error('Devis introuvable');
          v.lien=lien;
          if(typeof apiPost!=='function'||!await apiPost('setAvenants',S.avenants))throw new Error('Enregistrement impossible');
          if(typeof editAvenantComplet==='function')editAvenantComplet(id);
          else if(typeof editMontantAvenant==='function')editMontantAvenant(id);
        }
        toastSafe('Document ajouté ✓');
      }catch(e){
        if(zone){zone.className='yaya-devis-fast-piece';zone.innerHTML='<span>Échec du chargement</span>';}
        toastSafe(String(e&&e.message||e),true);
      }
    };
    input.click();
  }

  function installFetchRewrite(){
    if(window.__yayaNoAiFetchInstalled)return;
    window.__yayaNoAiFetchInstalled=true;
    window.fetch=function(input,init){
      if(noAiBackendReady&&init&&typeof init.body==='string'){
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
    if(!noAiBackendReady)return;
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

  async function probe(){
    const api=apiUrl();
    if(!api)return;
    try{
      const resp=await nativeFetch(api,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'archiverDevis',data:{probe:true}})
      });
      const j=await resp.json();
      noAiBackendReady=!!(j&&j.ok&&j.data&&j.data.supported);
    }catch(e){
      noAiBackendReady=false;
    }
    if(noAiBackendReady){
      installReplace();
      cleanAiLabels(document);
    }
  }

  installFetchRewrite();
  probe();
  new MutationObserver(function(){
    if(noAiBackendReady){installReplace();cleanAiLabels(document);}
  }).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',function(){if(noAiBackendReady)installReplace();});
})();
