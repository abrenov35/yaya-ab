(function(){
  'use strict';
  if(window.__yayaCommandePerformanceV1)return;
  window.__yayaCommandePerformanceV1=true;

  function endpoint(){
    try{if(typeof API!=='undefined'&&API)return String(API);}catch(e){}
    return 'https://script.google.com/macros/s/AKfycbxXBpXjWXEF-7p6vvOE3blSBc8_5e62AtQb2stHjnrGE025cOxQGy-zAguYmN2u9O4K/exec';
  }
  function toastSafe(msg,err){try{if(typeof toast==='function')toast(msg,!!err);}catch(e){}}
  function parseMontant(v){const n=Number(String(v||'').replace(/\s/g,'').replace(',','.'));return Number.isFinite(n)?n:0;}
  function updateCache(rows){
    try{const k='YAYA_CACHE_DATA_V2',raw=localStorage.getItem(k);if(!raw)return;const c=JSON.parse(raw);if(c&&typeof c==='object'){c.commandes=rows;localStorage.setItem(k,JSON.stringify(c));}}catch(e){}
  }
  function refreshAfterClose(){
    requestAnimationFrame(function(){
      try{if(typeof render==='function')render();}catch(e){}
      try{window.dispatchEvent(new Event('yaya:data-refreshed'));}catch(e){}
    });
  }
  async function post(action,data){
    const r=await fetch(endpoint(),{method:'POST',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,data:data})});
    const t=await r.text();let j;try{j=JSON.parse(t);}catch(e){throw new Error('Réponse Yaya invalide');}
    if(!j||j.ok!==true)throw new Error(String(j&&j.error||'Enregistrement impossible'));
    return j;
  }

  function patchCreate(overlay){
    if(!overlay||overlay.dataset.yayaFastSave==='1')return;
    const btn=overlay.querySelector('.yaya-commande-create-save');
    if(!btn)return;
    overlay.dataset.yayaFastSave='1';
    btn.onclick=function(e){
      e.preventDefault();e.stopPropagation();
      if(btn.disabled)return;
      const q=s=>overlay.querySelector(s);
      const chantierId=String(q('[data-field="chantierId"]')?.value||'').trim();
      const fournisseur=String(q('[data-field="fournisseur"]')?.value||'').trim();
      const designation=String(q('[data-field="designation"]')?.value||'').trim();
      const date=String(q('[data-field="date"]')?.value||'').trim()||new Date().toISOString().slice(0,10);
      const montantHT=parseMontant(q('[data-field="montantHT"]')?.value);
      if(!chantierId){alert('Choisis le chantier.');return;}
      if(!fournisseur){alert('Renseigne le fournisseur.');return;}
      if(!designation){alert('Renseigne la désignation.');return;}
      const state=overlay.querySelector('.yaya-commande-create-file-state');
      const okImport=state&&state.classList.contains('ok');
      let lien='',pieceNom='';
      if(okImport){pieceNom=String(state.textContent||'').replace(/^✓\s*/,'').replace(/\s+importé$/,'').trim();}
      try{
        const originalInput=overlay.querySelector('.yaya-commande-create-file');
        if(originalInput&&originalInput.files&&originalInput.files[0]&&!okImport){alert('Attends la fin de l’import du document.');return;}
      }catch(err){}
      // Le lien de pièce est conservé par le code d'origine si présent dans le DOM/dataset.
      lien=String(overlay.dataset.commandeLien||'');
      const row={id:'cmd_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),chantierId:chantierId,typeDoc:'Bon de commande',fournisseur:fournisseur,designation:designation,date:date,montantHT:montantHT,lien:lien,dropboxId:'',dropboxPath:'',oneDriveId:'',oneDriveWebUrl:'',statutValidation:'VALIDEE',origine:'YAYA',gmailMessageId:'',pieceNom:pieceNom,pieceEmpreinte:''};
      let rows=[];try{rows=Array.isArray(S&&S.commandes)?S.commandes.slice():[];}catch(err){}
      rows.push(row);try{S.commandes=rows;}catch(err){}updateCache(rows);
      overlay.remove();toastSafe('Commande enregistrée localement — synchronisation…');refreshAfterClose();
      post('addCommande',row).then(function(){toastSafe('Commande enregistrée ✓');}).catch(function(err){console.error('Commande add background:',err);toastSafe('Commande non synchronisée — Réessayer',true);});
    };
  }

  function patchEdit(overlay){
    if(!overlay||overlay.dataset.yayaFastSave==='1')return;
    const btn=overlay.querySelector('.yaya-commande-save');if(!btn)return;
    overlay.dataset.yayaFastSave='1';
    btn.onclick=function(e){
      e.preventDefault();e.stopPropagation();if(btn.disabled)return;
      const q=s=>overlay.querySelector(s);
      const id=String(overlay.dataset.commandeId||'');
      let current=null;try{current=(S.commandes||[]).find(c=>String(c.id||'')===id)||null;}catch(err){}
      if(!current){toastSafe('Commande introuvable',true);return;}
      const updated=Object.assign({},current,{fournisseur:String(q('[data-field="fournisseur"]')?.value||'').trim(),designation:String(q('[data-field="designation"]')?.value||'').trim(),montantHT:parseMontant(q('[data-field="montantHT"]')?.value),date:String(q('[data-field="date"]')?.value||'').trim()});
      const rows=(S.commandes||[]).map(c=>String(c.id||'')===id?updated:c);S.commandes=rows;updateCache(rows);
      overlay.remove();toastSafe('Modification enregistrée localement — synchronisation…');refreshAfterClose();
      post('setCommandes',rows).then(function(){toastSafe('Commande enregistrée ✓');}).catch(function(err){console.error('Commande edit background:',err);toastSafe('Commande non synchronisée — Réessayer',true);});
    };
  }

  function identifyEdit(){
    document.querySelectorAll('.yaya-commande-edit-overlay').forEach(function(o){
      if(!o.dataset.commandeId){
        const f=o.querySelector('[data-field="fournisseur"]'),d=o.querySelector('[data-field="designation"]'),m=o.querySelector('[data-field="montantHT"]'),dt=o.querySelector('[data-field="date"]');
        try{const c=(S.commandes||[]).find(x=>String(x.fournisseur||'')===String(f?.value||'')&&String(x.designation||x.pieceNom||'')===String(d?.value||'')&&Number(x.montantHT||0)===parseMontant(m?.value)&&String(x.date||'').slice(0,10)===String(dt?.value||''));if(c)o.dataset.commandeId=String(c.id||'');}catch(e){}
      }
      patchEdit(o);
    });
    document.querySelectorAll('.yaya-commande-create-overlay').forEach(patchCreate);
  }
  let raf=0;new MutationObserver(function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;identifyEdit();});}).observe(document.body,{childList:true,subtree:true});
  identifyEdit();
})();
