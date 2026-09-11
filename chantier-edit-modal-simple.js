(function(){
  'use strict';

  if(window.__yayaChantierEditModalSimpleV4)return;
  window.__yayaChantierEditModalSimpleV4=true;
  window.__yayaChantierEditModalSimpleV3=true;

  const STYLE_ID='yaya-chantier-edit-modal-simple-v4';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .yaya-chantier-edit-modal .yaya-manage-selector,
      #modalRoot .yaya-chantier-edit-modal .yaya-extranet-note,
      #modalRoot .yaya-chantier-edit-modal .yaya-manage-edit-title{
        display:none!important;
      }
      #modalRoot .yaya-chantier-edit-modal{
        max-width:520px!important;
      }
      #modalRoot .yaya-chantier-edit-modal h5{
        margin-bottom:14px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function setTitle(modal){
    const h5=modal&&modal.querySelector('h5');
    if(!h5)return;
    let done=false;
    h5.childNodes.forEach(function(node){
      if(!done&&node.nodeType===Node.TEXT_NODE){
        node.nodeValue='Modifier le chantier';
        done=true;
      }
    });
    if(!done)h5.insertBefore(document.createTextNode('Modifier le chantier'),h5.firstChild||null);
  }

  function removeForbiddenFields(modal){
    if(!modal)return;
    const input=modal.querySelector('#editChDemarrage');
    const label=input&&input.closest('label');
    if(label)label.remove();
    else if(input)input.remove();
  }

  function simplify(){
    installStyle();
    const modal=document.querySelector('#modalRoot .yaya-chantier-edit-modal');
    if(!modal)return;

    modal.querySelectorAll('.yaya-manage-selector,.yaya-extranet-note,.yaya-manage-edit-title').forEach(function(el){
      el.remove();
    });
    removeForbiddenFields(modal);
    setTitle(modal);
  }

  function getChantier(cid){
    try{return Array.isArray(S&&S.chantiers)?S.chantiers.find(function(c){return String(c&&c.id)===String(cid);})||null:null;}
    catch(e){return null;}
  }

  function toastSafe(message,isError){
    try{if(typeof window.toast==='function')window.toast(message,!!isError);}
    catch(e){}
  }

  function installReliableArchive(){
    window.archiverChantier=async function(cid){
      const id=String(cid||'').trim();
      const c=getChantier(id);
      if(!c){toastSafe('Chantier introuvable',true);return false;}

      if(String(c.statut||'').trim()==='Archivé'){
        toastSafe('Chantier déjà archivé');
        try{if(typeof window.closeModal==='function')window.closeModal();}catch(e){}
        return true;
      }

      const nom=String(c.nom||id).trim();
      if(!window.confirm('Archiver le chantier « '+nom+' » ?\n\nIl restera accessible dans les archives.'))return false;

      const ancienStatut=c.statut;
      c.statut='Archivé';

      try{
        if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.delete==='function'){
          expChantiers.delete(id);
        }
      }catch(e){}

      try{if(typeof window.closeModal==='function')window.closeModal();}catch(e){}
      try{if(typeof window.render==='function')window.render();}catch(e){}
      toastSafe('Archivage en cours…');

      let ok=false;
      try{
        if(typeof window.apiPost==='function'){
          ok=!!(await window.apiPost('setChantiers',S.chantiers));
        }
      }catch(e){ok=false;}

      if(ok){
        toastSafe('Chantier archivé ✓');
        return true;
      }

      c.statut=ancienStatut;
      try{if(typeof window.render==='function')window.render();}catch(e){}
      toastSafe('L’archivage du chantier a échoué',true);
      return false;
    };
  }

  function installRestrictedSave(){
    window.saveExistingChantier=async function(cid){
      const c=getChantier(cid);
      if(!c)return;

      const nom=document.getElementById('editChNom');
      const sigMonth=document.getElementById('editChSignatureMonth');
      const sigYear=document.getElementById('editChSignatureYear');
      const mt=document.getElementById('editChMarcheHT');
      if(!nom||!sigMonth||!sigYear||!mt)return;

      const name=String(nom.value||'').trim();
      if(!name){
        try{toast('Indique le nom du chantier',true);}catch(e){}
        nom.focus();
        return;
      }

      if((sigMonth.value&&!sigYear.value)||(!sigMonth.value&&sigYear.value)){
        try{toast('Choisis le mois et l’année de signature',true);}catch(e){}
        (sigMonth.value?sigYear:sigMonth).focus();
        return;
      }

      const brut=String(mt.value||'0').trim().replace(/\s/g,'').replace(',','.');
      const montant=Number(brut||0);
      if(!Number.isFinite(montant)||montant<0){
        try{toast('Chiffre d’affaires HT invalide',true);}catch(e){}
        mt.focus();
        return;
      }

      const signature=(sigMonth.value&&sigYear.value)?String(sigYear.value)+'-'+String(sigMonth.value):'';

      // Chantier créé dans Yaya : nom, Signé le et CA HT sont modifiables.
      c.nom=name;
      c.dateSignature=signature;
      c.montantMarcheHT=montant;

      const btn=document.getElementById('editChSave');
      if(btn){btn.disabled=true;btn.textContent='Enregistrement…';}

      let ok=false;
      try{ok=await apiPost('setChantiers',S.chantiers);}catch(e){ok=false;}

      if(ok){
        try{closeModal();}catch(e){}
        try{render();}catch(e){}
        try{toast('Chantier mis à jour ✓');}catch(e){}
      }else if(btn){
        btn.disabled=false;
        btn.textContent='Enregistrer';
      }
    };
  }

  function install(){
    installStyle();
    installReliableArchive();
    installRestrictedSave();
    simplify();
    const root=document.getElementById('modalRoot');
    if(!root){setTimeout(install,120);return;}
    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        simplify();
      });
    }).observe(root,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();