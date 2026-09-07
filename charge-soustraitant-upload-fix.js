(function(){
  'use strict';

  if(window.__yayaChargeSousTraitantUploadFixV1)return;
  window.__yayaChargeSousTraitantUploadFixV1=true;

  const MAX_FILE_SIZE=8*1024*1024;
  const originalTraiterAchat=typeof window.traiterAchat==='function'?window.traiterAchat:null;
  const originalLireAchat=typeof window.lireAchat==='function'?window.lireAchat:null;

  function isSousTraitant(){
    const type=document.getElementById('acType');
    return !!type && String(type.value||'').trim()==='Facture sous-traitant';
  }

  function modalAchat(){
    const type=document.getElementById('acType');
    return type&&type.closest?type.closest('.modal'):null;
  }

  function setTitle(){
    const modal=modalAchat();
    if(!modal)return;
    const h=modal.querySelector('h5,h3,h2');
    if(!h)return;

    if(!h.dataset.yayaOriginalChargeTitle){
      h.dataset.yayaOriginalChargeTitle=String(h.childNodes&&h.childNodes.length?h.childNodes[0].nodeValue||h.textContent||'':'').trim()||'Enregistrer un achat / une facture';
    }

    const wanted=isSousTraitant()?'Ajouter une charge sous-traitant':h.dataset.yayaOriginalChargeTitle;
    let textNode=null;
    for(const node of h.childNodes){
      if(node.nodeType===Node.TEXT_NODE){textNode=node;break;}
    }
    if(textNode)textNode.nodeValue=wanted;
    else h.insertBefore(document.createTextNode(wanted),h.firstChild);
  }

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function setStatus(html){
    const etat=document.getElementById('achatEtat');
    if(!etat)return;
    etat.innerHTML=html;
  }

  function endpoint(){
    try{if(typeof API!=='undefined'&&API)return String(API);}catch(e){}
    return '';
  }

  function readBase64(file){
    return new Promise(function(resolve,reject){
      const reader=new FileReader();
      reader.onerror=function(){reject(new Error('Lecture du fichier impossible'));};
      reader.onload=function(){resolve(String(reader.result||'').split(',')[1]||'');};
      reader.readAsDataURL(file);
    });
  }

  async function archiveSousTraitant(file){
    if(!file)return;
    if(file.size>MAX_FILE_SIZE){
      toastSafe('Fichier trop lourd (8 Mo max)',true);
      setStatus('<span style="color:var(--red)">⚠ Fichier trop lourd (8 Mo max)</span>');
      return;
    }

    const url=endpoint();
    if(!url){
      toastSafe('Import indisponible',true);
      return;
    }

    setStatus('<span>⏳ Import de la pièce jointe en cours…</span>');

    try{
      const base64=await readBase64(file);
      if(!base64)throw new Error('Document vide ou illisible');

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

      try{achatLien=lien;}catch(e){window.achatLien=lien;}
      setStatus('<span style="color:var(--green)">✓ Pièce jointe enregistrée</span>');
      toastSafe('Pièce jointe enregistrée ✓');
    }catch(err){
      console.error('Yaya — import charge sous-traitant :',err);
      setStatus('<span style="color:var(--red)">⚠ '+String(err&&err.message||err).replace(/[<>]/g,'')+'</span>');
      toastSafe('Import impossible : '+String(err&&err.message||err),true);
    }
  }

  function traiterPatched(file){
    if(isSousTraitant())return archiveSousTraitant(file);
    if(originalTraiterAchat)return originalTraiterAchat(file);
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

  function patch(){
    if(!modalAchat())return;
    setTitle();
  }

  document.addEventListener('change',function(e){
    if(e.target&&e.target.id==='acType')setTitle();
  },true);

  let raf=0;
  new MutationObserver(function(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;patch();});
  }).observe(document.documentElement,{childList:true,subtree:true,characterData:true});

  setTimeout(patch,0);
})();

/* Commandes : le montant ouvre la modification et le crayon reste masqué. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-commande-amount-edit="1"]'))return;
  const s=document.createElement('script');
  s.src='commande-amount-edit.js?v=commande-amount-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-commande-amount-edit','1');
  document.head.appendChild(s);
})();

/* Dépenses : le montant ouvre la modification et le crayon reste masqué. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-depense-amount-edit="1"]'))return;
  const s=document.createElement('script');
  s.src='depense-amount-edit.js?v=depense-amount-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-depense-amount-edit','1');
  document.head.appendChild(s);
})();

/* Charges sous-traitant : le montant ouvre la modification et le crayon reste masqué. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-charge-amount-edit="1"]'))return;
  const s=document.createElement('script');
  s.src='charge-amount-edit.js?v=charge-amount-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-charge-amount-edit','1');
  document.head.appendChild(s);
})();
