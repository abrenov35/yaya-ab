(function(){
  'use strict';
  if(window.__yayaMailDevisPersistenceVerifyV2)return;
  window.__yayaMailDevisPersistenceVerifyV2=true;

  function toastSafe(m,e){try{if(typeof toast==='function')toast(m,!!e);}catch(_) {}}
  function same(a,b){return String(a==null?'':a).trim()===String(b==null?'':b).trim();}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}

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

  let beforeAvenants=null;

  document.addEventListener('click',function(ev){
    const b=ev.target&&ev.target.closest?ev.target.closest('.yaya-devis-fast-modal #yayaFastSave'):null;
    if(!b)return;
    const modal=b.closest('.yaya-devis-fast-modal');
    if(!modal||!modal.querySelector('#eavLib'))return;
    try{beforeAvenants=clone((typeof S!=='undefined'&&S&&Array.isArray(S.avenants))?S.avenants:[]);}catch(e){beforeAvenants=null;}
  },true);

  function install(){
    if(typeof window.apiPost!=='function'){setTimeout(install,150);return;}
    if(window.apiPost.__yayaTargetedDevisV2)return;
    const previous=window.apiPost;

    function targetedApiPost(action,data){
      if(String(action)!=='setAvenants'||!Array.isArray(data)||!Array.isArray(beforeAvenants)){
        return previous(action,data);
      }
      const base=new Map(beforeAvenants.map(function(r){return [String(r&&r.id||''),r];}));
      const changed=data.filter(function(r){
        const old=base.get(String(r&&r.id||''));
        return old&&(String(old.libelle||'')!==String(r&&r.libelle||'')||Number(old.montantHT||0)!==Number(r&&r.montantHT||0));
      });
      beforeAvenants=null;
      if(changed.length!==1)return previous(action,data);
      const r=changed[0];
      return previous('updateAvenant',{id:r.id,libelle:r.libelle||'',montantHT:Number(r.montantHT||0)});
    }

    targetedApiPost.__yayaTargetedDevisV2=true;
    targetedApiPost.__yayaWrappedApiPost=previous;
    window.apiPost=targetedApiPost;
  }

  install();
  setTimeout(install,500);
})();
