(function(){
  'use strict';

  function collection(collectionName){
    try{
      if(typeof S!=='undefined' && S && Array.isArray(S[collectionName])) return S[collectionName];
    }catch(e){}
    return [];
  }

  function resolveId(collectionName,id){
    const found=collection(collectionName).find(x=>String(x&&x.id)===String(id));
    return found?found.id:id;
  }

  function wrap(name,collectionName){
    const original=window[name];
    if(typeof original!=='function' || original.__yayaLooseIdWrapped)return false;
    const wrapped=function(id){
      const args=[...arguments];
      args[0]=resolveId(collectionName,id);
      return original.apply(this,args);
    };
    wrapped.__yayaLooseIdWrapped=true;
    wrapped.__yayaOriginal=original;
    window[name]=wrapped;
    try{eval(name+'=window[\''+name+'\']');}catch(e){}
    return true;
  }

  function openAvenantEditor(id){
    try{
      const v=collection('avenants').find(x=>String(x&&x.id)===String(id));
      if(!v){
        if(typeof toast==='function')toast('Devis introuvable',true);
        return;
      }
      const root=document.getElementById('modalRoot');
      if(!root)return;
      const cleanId=String(v.id);
      const hasPJ=v.lien&&String(v.lien).startsWith('http');
      const safeLien=typeof esc==='function'?esc(v.lien||''):String(v.lien||'');
      const safeLib=typeof esc==='function'?esc(v.libelle||''):String(v.libelle||'');
      const pjInner=hasPJ
        ? '<span style="font-size:12px;color:#555">PJ : </span>'
          +'<button type="button" onclick="voirPiece(\''+safeLien+'\')" style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:8px;border:1px solid rgba(201,162,75,.6);background:rgba(201,162,75,.12);color:#7d630e;cursor:pointer">VOIR</button> '
          +'<button type="button" onclick="remplacerPJ(\'avenant\',\''+cleanId+'\')" style="font-size:11px;padding:3px 10px;border-radius:8px;border:1.5px solid #1c2b48;background:#fff;color:#1c2b48;cursor:pointer">Scanner / Remplacer</button>'
        : '<button type="button" onclick="remplacerPJ(\'avenant\',\''+cleanId+'\')" style="font-size:12px;padding:5px 14px;border-radius:8px;border:none;background:#1c2b48;color:#fff;cursor:pointer">+ Ajouter une PJ (scan IA)</button>';

      root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">'
        +'<h5>Modifier le devis<button type="button" onclick="closeModal()" style="margin-left:8px;padding:6px 16px;border-radius:10px;border:1.5px solid #ddd;background:#fff;color:#555;font-size:13px;font-weight:600;cursor:pointer">Fermer</button></h5>'
        +'<div class="mrow"><input class="msel" id="eavLib" value="'+safeLib+'" placeholder="Libellé du devis"></div>'
        +'<div class="mrow"><input class="mnum" id="eavMt" type="number" value="'+(Number(v.montantHT)||'')+'" placeholder="Montant HT €" style="width:140px"></div>'
        +'<div id="pj-zone" style="margin-bottom:8px;padding:8px 12px;border:1.5px dashed #ddd;border-radius:10px">'+pjInner+'</div>'
        +'<div class="mfoot"><button class="btnp go" type="button" onclick="yayaSaveAvenantDirect(\''+cleanId+'\')">Enregistrer</button><button class="btn2" type="button" onclick="closeModal()">Annuler</button></div>'
        +'</div></div>';
    }catch(err){
      console.error('Edition devis secondaire impossible',err);
      if(typeof toast==='function')toast('Impossible d’ouvrir ce devis',true);
    }
  }

  window.yayaSaveAvenantDirect=async function(id){
    const v=collection('avenants').find(x=>String(x&&x.id)===String(id));
    if(!v)return;
    const libEl=document.getElementById('eavLib');
    const mtEl=document.getElementById('eavMt');
    const lib=libEl?libEl.value.trim():'';
    if(!lib){if(typeof toast==='function')toast('Indique un libellé',true);return;}
    v.libelle=lib;
    v.montantHT=Number(mtEl&&mtEl.value)||0;
    if(typeof closeModal==='function')closeModal();
    if(typeof render==='function')render();
    if(typeof apiPost==='function'){
      const ok=await apiPost('setAvenants',S.avenants);
      if(ok&&typeof toast==='function')toast('Devis modifié ✓');
    }
  };

  function installAvenantFix(){
    window.yayaEditAvenantDirect=openAvenantEditor;
    window.editAvenantComplet=openAvenantEditor;
    window.editMontantAvenant=openAvenantEditor;
    try{editAvenantComplet=openAvenantEditor;}catch(e){}
    try{editMontantAvenant=openAvenantEditor;}catch(e){}
  }

  function install(){
    wrap('editAchat','achats');
    wrap('editMontantAchat','achats');
    wrap('saveAchat','achats');
    wrap('delAvenant','avenants');
    wrap('editDocument','documents');
    wrap('saveDocumentEdit','documents');
    wrap('delDocument','documents');
    installAvenantFix();
  }

  install();
  setTimeout(install,100);
  setTimeout(install,500);
  window.addEventListener('yaya:data-refreshed',install);
})();

/* =========================================================
   CORRECTIF ENREGISTREMENT MODALE DOCUMENT
   - un seul clic
   - pas de seconde confirmation bloquante
   - verrou temporaire pendant l'enregistrement
========================================================= */
(function(){
  'use strict';

  let saveInFlight=null;

  function resolveDocumentId(id){
    try{
      const found=(S&&Array.isArray(S.documents)?S.documents:[])
        .find(function(x){return String(x&&x.id)===String(id);});
      return found?found.id:id;
    }catch(e){
      return id;
    }
  }

  function findEditSaveButton(id){
    const root=document.getElementById('modalRoot');
    if(!root)return null;
    return Array.from(root.querySelectorAll('button')).find(function(btn){
      const oc=String(btn.getAttribute('onclick')||'');
      return /saveDocumentEdit\s*\(/.test(oc) && (!id || oc.includes(String(id)));
    }) || Array.from(root.querySelectorAll('button')).find(function(btn){
      return /^Enregistrer$/i.test(String(btn.textContent||'').trim());
    }) || null;
  }

  function setBusy(btn,busy){
    if(!btn)return;
    if(busy){
      if(!btn.dataset.yayaOriginalText)btn.dataset.yayaOriginalText=btn.textContent||'Enregistrer';
      btn.disabled=true;
      btn.setAttribute('aria-busy','true');
      btn.style.opacity='.7';
      btn.style.cursor='wait';
      btn.textContent='Enregistrement…';
    }else{
      btn.disabled=false;
      btn.removeAttribute('aria-busy');
      btn.style.opacity='';
      btn.style.cursor='';
      btn.textContent=btn.dataset.yayaOriginalText||'Enregistrer';
    }
  }

  async function directSaveDocumentEdit(id){
    const cleanId=resolveDocumentId(id);
    if(saveInFlight)return saveInFlight;

    const btn=findEditSaveButton(cleanId);
    setBusy(btn,true);

    saveInFlight=(async function(){
      try{
        if(typeof window.appliquerModificationDocument!=='function'){
          throw new Error('Fonction de sauvegarde document indisponible');
        }
        await window.appliquerModificationDocument(cleanId);
      }catch(err){
        console.error('Enregistrement document impossible',err);
        if(typeof toast==='function')toast('Enregistrement impossible',true);
        setBusy(btn,false);
        throw err;
      }finally{
        saveInFlight=null;
        setTimeout(function(){
          if(btn && btn.isConnected)setBusy(btn,false);
        },0);
      }
    })();

    return saveInFlight;
  }

  directSaveDocumentEdit.__yayaLooseIdWrapped=true;
  directSaveDocumentEdit.__yayaDirectDocumentSave=true;

  function installDirectSave(){
    window.saveDocumentEdit=directSaveDocumentEdit;
    try{saveDocumentEdit=directSaveDocumentEdit;}catch(e){}
  }

  installDirectSave();
  setTimeout(installDirectSave,120);
  setTimeout(installDirectSave,600);
  window.addEventListener('yaya:data-refreshed',installDirectSave);
})();
