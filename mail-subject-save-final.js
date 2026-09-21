(function(){
  'use strict';
  if(window.__yayaMailSubjectSaveFinalV1)return;
  window.__yayaMailSubjectSaveFinalV1=true;

  const CACHE_KEY='YAYA_CACHE_DATA_V2';
  let saving=false;

  function text(value){return String(value==null?'':value).trim();}
  function documents(){try{return typeof S!=='undefined'&&S&&Array.isArray(S.documents)?S.documents:[];}catch(e){return [];}}
  function getMail(id){return documents().find(row=>String(row&&row.id||'')===String(id))||null;}
  function body(row){
    try{if(typeof window.contenuMailYaya==='function')return String(window.contenuMailYaya(row)||'');}catch(e){}
    return String(row&&(row.contenuMail||row.corpsMail||row.contenu||row.body||row.mailBody)||'');
  }
  function durableTitle(subject,mailBody){
    const wanted=text(subject)||'Objet non renseigné';
    const raw=String(mailBody||'').trim();
    if(!raw)return wanted;
    if(/^\s*(?:objet|subject)\s*:/i.test(raw))return raw.replace(/^\s*(?:objet|subject)\s*:[^\r\n]*/i,'Objet : '+wanted);
    return 'Objet : '+wanted+'\n\n'+raw;
  }
  function applySubject(row,subject){
    const value=text(subject),mailBody=body(row);
    row.objetMail=value;row.mailSubject=value;row.emailSubject=value;row.subject=value;row.objet=value;
    row.messageSubject=value;row.gmailSubject=value;row.subjectMail=value;row.titreMail=value;row.intitule=value;
    row.origineMail='MAIL';
    if(mailBody){row.contenuMail=mailBody;row.titre=durableTitle(value,mailBody);}else row.titre=value;
  }
  function updateCache(){
    try{
      const cache=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')||{};
      cache.documents=documents().map(row=>Object.assign({},row));
      localStorage.setItem(CACHE_KEY,JSON.stringify(cache));
    }catch(e){}
  }
  function toastSafe(message,error){try{if(typeof toast==='function')toast(message,!!error);}catch(e){}}
  function showUpdatedMail(id){
    try{if(typeof render==='function')render();}catch(e){}
    requestAnimationFrame(function(){
      try{if(typeof window.voirMessageYaya==='function')window.voirMessageYaya(String(id));}catch(e){}
    });
  }

  window.saveDocumentEdit=async function(id){
    if(saving)return false;
    const row=getMail(id),input=document.getElementById('edDocTitre');
    if(!row||!input)return false;
    const subject=text(input.value);
    if(!subject){toastSafe('Indique un objet',true);input.focus();return false;}

    const previous=Object.assign({},row);
    applySubject(row,subject);
    updateCache();
    showUpdatedMail(id);
    toastSafe('Enregistrement de l’objet…');

    saving=true;
    try{
      if(typeof apiPost!=='function')throw new Error('API indisponible');
      const ok=await apiPost('setDocuments',documents());
      if(ok===false)throw new Error('Écriture refusée');
      applySubject(row,subject);
      updateCache();
      showUpdatedMail(id);
      toastSafe('Objet du mail enregistré ✓');
      try{window.dispatchEvent(new CustomEvent('yaya:mail-subject-saved',{detail:{id:String(id),subject:subject}}));}catch(e){}
      return true;
    }catch(error){
      Object.keys(row).forEach(key=>delete row[key]);Object.assign(row,previous);
      updateCache();
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe('Objet non enregistré — réessayez',true);
      return false;
    }finally{saving=false;}
  };
  window.saveDocumentEdit.__yayaMailSubjectFinal=true;
})();
