(function(){
  'use strict';
  if(window.__yayaMailDevisPersistenceVerifyV1)return;
  window.__yayaMailDevisPersistenceVerifyV1=true;

  function toastSafe(m,e){try{if(typeof toast==='function')toast(m,!!e);}catch(_) {}}
  function same(a,b){return String(a==null?'':a).trim()===String(b==null?'':b).trim();}
  function api(){return typeof window.apiPost==='function'&&typeof window.apiGet==='function';}

  async function verifyMail(id,subject){
    if(!api())throw new Error('API indisponible');
    const fresh=await window.apiGet(true);
    const d=fresh&&Array.isArray(fresh.documents)?fresh.documents.find(x=>String(x&&x.id)===String(id)):null;
    if(!d)throw new Error('mail absent après écriture');
    const serverSubject=d.objetMail||d.mailSubject||d.emailSubject||d.subject||d.objet||'';
    if(!same(serverSubject,subject))throw new Error('objet non confirmé par Sheet');
    return fresh;
  }

  async function persistMail(id,subject){
    if(!api())throw new Error('API indisponible');
    const rows=(typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];
    const ok=await window.apiPost('setDocuments',rows);
    if(ok===false)throw new Error('écriture Documents refusée');
    return verifyMail(id,subject);
  }

  window.addEventListener('yaya:mail-edit-local',function(ev){
    const d=ev&&ev.detail||{};if(!d.id)return;
    toastSafe('Synchronisation du mail…');
    persistMail(d.id,d.subject).then(function(){toastSafe('Mail enregistré dans Sheet ✓');}).catch(function(err){console.error('Mail persistence:',err);toastSafe('Mail non synchronisé — réessayer',true);});
  });

  function devisContext(modal){
    if(!modal)return null;
    const btn=[...modal.querySelectorAll('button')].find(b=>/saveAvenantComplet\s*\(/.test(String(b.getAttribute('onclick')||'')));
    if(btn){const m=String(btn.getAttribute('onclick')||'').match(/saveAvenantComplet\s*\(\s*['\"]([^'\"]+)/);if(m)return {kind:'avenant',id:m[1]};}
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return {kind:'main',id:String(focusChantier)};}catch(e){}
    return null;
  }

  async function persistDevis(ctx){
    if(!ctx||!api())throw new Error('contexte/API indisponible');
    if(ctx.kind==='avenant'){
      const local=(S.avenants||[]).find(v=>String(v&&v.id)===String(ctx.id));if(!local)throw new Error('devis introuvable');
      const ok=await window.apiPost('setAvenants',S.avenants);if(ok===false)throw new Error('écriture devis refusée');
      const fresh=await window.apiGet(true);const server=(fresh.avenants||[]).find(v=>String(v&&v.id)===String(ctx.id));
      if(!server||!same(server.libelle,local.libelle)||Number(server.montantHT||0)!==Number(local.montantHT||0))throw new Error('devis non confirmé par Sheet');
    }else{
      const local=(S.chantiers||[]).find(v=>String(v&&v.id)===String(ctx.id));if(!local)throw new Error('chantier introuvable');
      const ok=await window.apiPost('setChantiers',S.chantiers);if(ok===false)throw new Error('écriture chantier refusée');
      const fresh=await window.apiGet(true);const server=(fresh.chantiers||[]).find(v=>String(v&&v.id)===String(ctx.id));
      if(!server||!same(server.numero,local.numero)||Number(server.montantDevisHT||0)!==Number(local.montantDevisHT||0))throw new Error('devis principal non confirmé par Sheet');
    }
  }

  document.addEventListener('click',function(ev){
    const b=ev.target&&ev.target.closest?ev.target.closest('.yaya-devis-fast-modal button'):null;if(!b||!/enregistrer/i.test(String(b.textContent||'')))return;
    const modal=b.closest('.yaya-devis-fast-modal');const ctx=devisContext(modal);if(!ctx)return;
    setTimeout(function(){toastSafe('Synchronisation du devis…');persistDevis(ctx).then(()=>toastSafe('Devis enregistré dans Sheet ✓')).catch(err=>{console.error('Devis persistence:',err);toastSafe('Devis non synchronisé — réessayer',true);});},80);
  },true);
})();
