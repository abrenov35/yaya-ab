(function(){
  'use strict';
  if(window.__yayaCommandePerformanceV2)return;
  window.__yayaCommandePerformanceV2=true;
  function endpoint(){try{if(typeof API!=='undefined'&&API)return String(API);}catch(e){}return 'https://script.google.com/macros/s/AKfycbxXBpXjWXEF-7p6vvOE3blSBc8_5e62AtQb2stHjnrGE025cOxQGy-zAguYmN2u9O4K/exec';}
  function toastSafe(m,e){try{if(typeof toast==='function')toast(m,!!e);}catch(x){}}
  function num(v){const n=Number(String(v||'').replace(/\s/g,'').replace(',','.'));return Number.isFinite(n)?n:0;}
  function cache(rows){try{const k='YAYA_CACHE_DATA_V2',r=localStorage.getItem(k);if(!r)return;const c=JSON.parse(r);if(c&&typeof c==='object'){c.commandes=rows;localStorage.setItem(k,JSON.stringify(c));}}catch(e){}}
  function refresh(){requestAnimationFrame(function(){try{if(typeof render==='function')render();}catch(e){}try{window.dispatchEvent(new Event('yaya:data-refreshed'));}catch(e){}});}
  async function post(action,data){const r=await fetch(endpoint(),{method:'POST',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,data:data})});const t=await r.text();let j;try{j=JSON.parse(t);}catch(e){throw new Error('Réponse Yaya invalide');}if(!j||j.ok!==true)throw new Error(String(j&&j.error||'Enregistrement impossible'));return j;}

  function patchCreate(o){
    if(!o||o.dataset.yayaFastSave==='1')return;const b=o.querySelector('.yaya-commande-create-save');if(!b)return;
    const original=b.onclick;o.dataset.yayaFastSave='1';
    b.onclick=function(e){
      const file=o.querySelector('.yaya-commande-create-file');
      // Une commande avec pièce jointe garde intégralement le flux d'import existant,
      // car le lien Drive est détenu dans la fermeture du module d'origine.
      if(file&&file.files&&file.files.length){return original?original.call(this,e):undefined;}
      e.preventDefault();e.stopPropagation();if(b.disabled)return;
      const q=s=>o.querySelector(s),chantierId=String(q('[data-field="chantierId"]')?.value||'').trim(),fournisseur=String(q('[data-field="fournisseur"]')?.value||'').trim(),designation=String(q('[data-field="designation"]')?.value||'').trim(),date=String(q('[data-field="date"]')?.value||'').trim()||new Date().toISOString().slice(0,10);
      if(!chantierId){alert('Choisis le chantier.');return;}if(!fournisseur){alert('Renseigne le fournisseur.');return;}if(!designation){alert('Renseigne la désignation.');return;}
      const row={id:'cmd_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),chantierId:chantierId,typeDoc:'Bon de commande',fournisseur:fournisseur,designation:designation,date:date,montantHT:num(q('[data-field="montantHT"]')?.value),lien:'',dropboxId:'',dropboxPath:'',oneDriveId:'',oneDriveWebUrl:'',statutValidation:'VALIDEE',origine:'YAYA',gmailMessageId:'',pieceNom:'',pieceEmpreinte:''};
      let rows=[];try{rows=Array.isArray(S&&S.commandes)?S.commandes.slice():[];}catch(x){}rows.push(row);try{S.commandes=rows;}catch(x){}cache(rows);o.remove();toastSafe('Commande enregistrée localement — synchronisation…');refresh();post('addCommande',row).then(()=>toastSafe('Commande enregistrée ✓')).catch(err=>{console.error(err);toastSafe('Commande non synchronisée — Réessayer',true);});
    };
  }
  function patchEdit(o){
    if(!o||o.dataset.yayaFastSave==='1')return;const b=o.querySelector('.yaya-commande-save');if(!b)return;o.dataset.yayaFastSave='1';
    b.onclick=function(e){e.preventDefault();e.stopPropagation();if(b.disabled)return;const q=s=>o.querySelector(s),id=String(o.dataset.commandeId||'');let cur=null;try{cur=(S.commandes||[]).find(c=>String(c.id||'')===id)||null;}catch(x){}if(!cur){toastSafe('Commande introuvable',true);return;}const up=Object.assign({},cur,{fournisseur:String(q('[data-field="fournisseur"]')?.value||'').trim(),designation:String(q('[data-field="designation"]')?.value||'').trim(),montantHT:num(q('[data-field="montantHT"]')?.value),date:String(q('[data-field="date"]')?.value||'').trim()}),rows=(S.commandes||[]).map(c=>String(c.id||'')===id?up:c);S.commandes=rows;cache(rows);o.remove();toastSafe('Modification enregistrée localement — synchronisation…');refresh();post('setCommandes',rows).then(()=>toastSafe('Commande enregistrée ✓')).catch(err=>{console.error(err);toastSafe('Commande non synchronisée — Réessayer',true);});};
  }
  function apply(){document.querySelectorAll('.yaya-commande-edit-overlay').forEach(function(o){if(!o.dataset.commandeId){const f=o.querySelector('[data-field="fournisseur"]'),d=o.querySelector('[data-field="designation"]'),m=o.querySelector('[data-field="montantHT"]'),dt=o.querySelector('[data-field="date"]');try{const c=(S.commandes||[]).find(x=>String(x.fournisseur||'')===String(f?.value||'')&&String(x.designation||x.pieceNom||'')===String(d?.value||'')&&Number(x.montantHT||0)===num(m?.value)&&String(x.date||'').slice(0,10)===String(dt?.value||''));if(c)o.dataset.commandeId=String(c.id||'');}catch(e){}}patchEdit(o);});document.querySelectorAll('.yaya-commande-create-overlay').forEach(patchCreate);}
  let raf=0;new MutationObserver(function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;apply();});}).observe(document.body,{childList:true,subtree:true});apply();
})();
