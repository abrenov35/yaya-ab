(function(){
  'use strict';

  // Compatibilité légère : normaliser uniquement les données mail.
  // Le rendu des mails est déjà assuré par chantier-detail-section-tabs.
  // Aucun MutationObserver global ici : il ralentissait chaque ouverture et navigation.
  if(window.__yayaMailDataNormalizerV16)return;
  window.__yayaMailDataNormalizerV16=true;

  function isMailDocument(d){
    if(!d)return false;
    const upper=v=>String(v||'').trim().toUpperCase();
    if(upper(d.type)==='MAIL'||upper(d.origineMail)==='MAIL'||upper(d.origine)==='MAIL')return true;
    if(d.contenuMail||d.corpsMail||d.expediteur||d.from||d.objetMail||d.mailSubject||d.emailSubject)return true;
    return /\b(?:envoy[eé]|sent|from|objet)\s*:/i.test(String(d.titre||d.objet||''));
  }

  function canonicalId(value){
    const raw=String(value==null?'':value).trim();
    if(!raw)return '';
    try{
      if(typeof window.yayaCanonicalChantierId==='function')return String(window.yayaCanonicalChantierId(raw)||raw);
    }catch(e){}
    return raw;
  }

  function normalize(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.documents))return false;
      let changed=false;
      S.documents.forEach(d=>{
        if(!d)return;
        if(d.chantierId){
          const cid=canonicalId(d.chantierId);
          if(cid&&String(d.chantierId)!==cid){d.chantierId=cid;changed=true;}
        }
        if(isMailDocument(d)&&String(d.type||'').trim().toUpperCase()!=='MAIL'){
          d.type='MAIL';
          changed=true;
        }
      });
      return changed;
    }catch(e){return false;}
  }

  function run(allowRedispatch){
    const changed=normalize();
    if(changed&&allowRedispatch){
      setTimeout(()=>{
        try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:['documents'],source:'mail-normalizer'}}));}catch(e){}
      },0);
    }
  }

  run(false);
  setTimeout(()=>run(false),500);
  window.addEventListener('yaya:data-refreshed',()=>run(true));
})();
