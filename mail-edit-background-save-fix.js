(function(){
  'use strict';
  if(window.__yayaMailEditBackgroundSaveV1)return;
  window.__yayaMailEditBackgroundSaveV1=true;

  function docs(){try{return (typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];}catch(e){return [];}}
  function toastSafe(msg,err){try{if(typeof toast==='function')toast(msg,!!err);}catch(e){}}
  function syncCache(d){try{const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');if(!raw)return;const c=JSON.parse(raw);if(!c||!Array.isArray(c.documents))return;const i=c.documents.findIndex(x=>String(x.id)===String(d.id));if(i>=0)c.documents[i]=Object.assign({},c.documents[i],d);localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(c));}catch(e){}}
  function isMail(d){if(!d)return false;const u=v=>String(v||'').trim().toUpperCase();return u(d.type)==='MAIL'||u(d.origineMail)==='MAIL'||u(d.origine)==='MAIL'||!!(d.nomMail||d.expediteur||d.from||d.objetMail||d.mailSubject||d.emailSubject||d.contenuMail||d.corpsMail||d.mailBody);}
  function body(d){try{if(typeof window.contenuMailYaya==='function')return String(window.contenuMailYaya(d)||'');}catch(e){}return String(d.contenuMail||d.corpsMail||d.contenu||d.body||d.mailBody||'');}
  function title(obj,corps){const o=String(obj||'').trim()||'Objet non renseigné';const b=String(corps||'').trim();if(!b)return o;if(/^\s*(?:objet|subject)\s*:/i.test(b))return b.replace(/^\s*(?:objet|subject)\s*:[^\r\n]*/i,'Objet : '+o);return 'Objet : '+o+'\n\n'+b;}

  const previous=window.saveDocumentEdit;
  window.saveDocumentEdit=function(id){
    const d=docs().find(x=>String(x.id)===String(id));
    if(!d||!isMail(d)){return typeof previous==='function'?previous(id):undefined;}
    const ch=document.getElementById('edDocCh'),type=document.getElementById('edDocType'),sender=document.getElementById('edDocSujet'),object=document.getElementById('edDocTitre');
    if(!ch||!type||!sender||!object)return;

    const corps=body(d),objet=String(object.value||'').trim(),exp=String(sender.value||'').trim();
    d.chantierId=String(ch.value||'');d.type=String(type.value||'Mail');d.sujet=exp;d.nomMail=exp;d.objetMail=objet;d.origineMail='MAIL';
    if(corps){d.contenuMail=corps;d.titre=title(objet,corps);}else d.titre=objet;

    syncCache(d);
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    try{if(typeof render==='function')render();}catch(e){}
    try{window.dispatchEvent(new Event('yaya:data-refreshed'));}catch(e){}
    toastSafe('Mail modifié — synchronisation…');

    Promise.resolve().then(async function(){
      if(typeof apiPost!=='function')throw new Error('API indisponible');
      const ok=await apiPost('setDocuments',docs());
      if(!ok)throw new Error('Enregistrement refusé');
      syncCache(d);toastSafe('Mail enregistré ✓');
    }).catch(function(err){
      console.error('Mail sync background:',err);
      // Ne jamais annuler la modification locale : elle reste visible et dans le cache.
      toastSafe('Mail modifié localement — synchronisation à réessayer',true);
    });
  };
})();
