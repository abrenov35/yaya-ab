(function(){
  'use strict';
  if(window.__yayaMailDevisPersistenceVerifyV3)return;
  window.__yayaMailDevisPersistenceVerifyV3=true;

  function toastSafe(m,e){try{if(typeof toast==='function')toast(m,!!e);}catch(_) {}}
  function same(a,b){return String(a==null?'':a).trim()===String(b==null?'':b).trim();}

  async function verifyMail(id,subject){
    if(typeof window.apiGet!=='function')throw new Error('API indisponible');
    const fresh=await window.apiGet(true);
    const d=fresh&&Array.isArray(fresh.documents)?fresh.documents.find(x=>String(x&&x.id)===String(id)):null;
    if(!d)throw new Error('mail absent après écriture');
    const serverSubject=d.objetMail||d.mailSubject||d.emailSubject||d.subject||d.objet||'';
    if(!same(serverSubject,subject))throw new Error('objet non confirmé par Sheet');
    return fresh;
  }

  window.addEventListener('yaya:mail-edit-local',function(ev){
    const d=ev&&ev.detail||{};if(!d.id||typeof window.apiPost!=='function')return;
    const rows=(typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];
    toastSafe('Synchronisation du mail…');
    window.apiPost('setDocuments',rows)
      .then(function(ok){if(ok===false)throw new Error('écriture Documents refusée');return verifyMail(d.id,d.subject);})
      .then(function(){toastSafe('Mail enregistré dans Sheet ✓');})
      .catch(function(err){console.error('Mail persistence:',err);toastSafe('Mail non synchronisé — réessayer',true);});
  });

  function packMeta(label,description){
    const l=String(label||'').trim();
    const d=String(description||'').trim();
    return d?l+' [[YAYA_DESC:'+encodeURIComponent(d)+']]':l;
  }

  function deepestApiPost(){
    let fn=window.apiPost;
    const seen=[];
    while(typeof fn==='function'&&typeof fn.__yayaWrappedApiPost==='function'&&!seen.includes(fn)){
      seen.push(fn);
      fn=fn.__yayaWrappedApiPost;
    }
    return typeof fn==='function'?fn:null;
  }

  function currentAvenantFromModal(){
    const modal=document.querySelector('.yaya-devis-fast-modal');
    if(!modal||!modal.querySelector('#eavLib'))return null;
    const lib=modal.querySelector('#eavLib');
    const desc=modal.querySelector('#eavDesc');
    const mt=modal.querySelector('#eavMt');
    if(!lib||!desc||!mt)return null;
    const label=String(lib.value||'').trim();
    if(!label)return {error:'Indique un libellé',focus:lib};
    const packed=packMeta(label,desc.value);
    const amount=Number(String(mt.value||'0').replace(',','.'))||0;
    const rows=(typeof S!=='undefined'&&S&&Array.isArray(S.avenants))?S.avenants:[];
    let row=null;
    if(typeof window.__yayaEditingAvenantId!=='undefined'){
      row=rows.find(r=>String(r&&r.id)===String(window.__yayaEditingAvenantId));
    }
    if(!row){
      const candidates=rows.filter(r=>{
        const m=Number(r&&r.montantHT||0);
        return String(r&&r.libelle||'')===packed||m===amount;
      });
      if(candidates.length===1)row=candidates[0];
    }
    return row?{row:row,libelle:packed,montantHT:amount}:null;
  }

  let activeId='';
  document.addEventListener('click',function(ev){
    const trigger=ev.target&&ev.target.closest?ev.target.closest('[onclick*="editAvenantComplet"],[onclick*="editMontantAvenant"],[onclick*="yayaEditAvenantDirect"]'):null;
    if(!trigger)return;
    const code=String(trigger.getAttribute('onclick')||'');
    const m=code.match(/(?:editAvenantComplet|editMontantAvenant|yayaEditAvenantDirect)\s*\(\s*['\"]([^'\"]+)/);
    if(m)activeId=m[1];
  },true);

  document.addEventListener('click',function(ev){
    const b=ev.target&&ev.target.closest?ev.target.closest('.yaya-devis-fast-modal #yayaFastSave'):null;
    if(!b||!document.querySelector('.yaya-devis-fast-modal #eavLib'))return;

    ev.preventDefault();
    ev.stopPropagation();
    if(typeof ev.stopImmediatePropagation==='function')ev.stopImmediatePropagation();
    if(b.dataset.yayaSaving==='1')return;

    const rows=(typeof S!=='undefined'&&S&&Array.isArray(S.avenants))?S.avenants:[];
    const row=rows.find(r=>String(r&&r.id)===String(activeId));
    const lib=document.getElementById('eavLib');
    const desc=document.getElementById('eavDesc');
    const mt=document.getElementById('eavMt');
    if(!row||!lib||!desc||!mt){toastSafe('Devis introuvable — recharge la page',true);return;}
    const label=String(lib.value||'').trim();
    if(!label){toastSafe('Indique un libellé',true);lib.focus();return;}

    const packed=packMeta(label,desc.value);
    const amount=Number(String(mt.value||'0').replace(',','.'))||0;
    const transport=deepestApiPost();
    if(!transport){toastSafe('API indisponible',true);return;}

    b.dataset.yayaSaving='1';
    b.disabled=true;
    b.textContent='Enregistrement…';

    Promise.resolve(transport('updateAvenant',{id:row.id,libelle:packed,montantHT:amount}))
      .then(function(ok){
        if(ok===false)throw new Error('écriture refusée');
        row.libelle=packed;
        row.montantHT=amount;
        try{if(typeof closeModal==='function')closeModal();}catch(e){}
        try{if(typeof render==='function')render();}catch(e){}
        toastSafe('Devis enregistré ✓');
      })
      .catch(function(err){
        console.error('updateAvenant:',err);
        b.dataset.yayaSaving='0';
        b.disabled=false;
        b.textContent='Enregistrer';
        toastSafe('Devis non enregistré',true);
      });
  },true);
})();
