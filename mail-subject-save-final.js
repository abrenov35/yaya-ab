(function(){
  'use strict';
  if(window.__yayaMailSubjectSaveFinalV2)return;
  window.__yayaMailSubjectSaveFinalV2=true;
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
  async function freshDocuments(){
    if(typeof apiGet!=='function')throw new Error('Lecture serveur indisponible');
    const data=await apiGet(true);
    if(!data||!Array.isArray(data.documents))throw new Error('Documents serveur indisponibles');
    return data.documents.map(row=>Object.assign({},row));
  }
  function replaceDocuments(rows){
    if(typeof S==='undefined'||!S)throw new Error('État Yaya indisponible');
    S.documents=(rows||[]).map(row=>Object.assign({},row));
    updateCache();
  }
  function subjectMatches(row,subject){
    if(!row)return false;
    const wanted=text(subject);
    if([row.objetMail,row.mailSubject,row.emailSubject,row.subject,row.objet].some(value=>text(value)===wanted))return true;
    const match=String(row.titre||'').match(/^\s*(?:objet|subject)\s*:\s*([^\r\n]+)/i);
    return text(row.titre)===wanted||!!(match&&text(match[1])===wanted);
  }
  function toastSafe(message,error){try{if(typeof toast==='function')toast(message,!!error);}catch(e){}}
  function showUpdatedMail(id){
    try{if(typeof render==='function')render();}catch(e){}
    requestAnimationFrame(function(){
      try{if(typeof window.voirMessageYaya==='function')window.voirMessageYaya(String(id));}catch(e){}
    });
  }

  const authoritativeSave=async function(id){
    if(saving)return false;
    const row=getMail(id),input=document.getElementById('edDocTitre');
    if(!row||!input)return false;
    const subject=text(input.value);
    if(!subject){toastSafe('Indique un objet',true);input.focus();return false;}

    toastSafe('Enregistrement de l’objet…');

    saving=true;
    try{
      if(typeof apiPost!=='function')throw new Error('API indisponible');
      const latest=await freshDocuments();
      const remote=latest.find(item=>String(item&&item.id||'')===String(id));
      if(!remote)throw new Error('Mail absent du serveur — aucune donnée écrasée');
      applySubject(remote,subject);
      const ok=await apiPost('setDocuments',latest);
      if(ok===false)throw new Error('Écriture refusée');

      const verified=await freshDocuments();
      const saved=verified.find(item=>String(item&&item.id||'')===String(id));
      if(!subjectMatches(saved,subject))throw new Error('Objet non confirmé par le serveur');
      replaceDocuments(verified);
      showUpdatedMail(id);
      toastSafe('Objet du mail enregistré ✓');
      try{window.dispatchEvent(new CustomEvent('yaya:mail-subject-saved',{detail:{id:String(id),subject:subject}}));}catch(e){}
      return true;
    }catch(error){
      console.error('Yaya — objet du mail non enregistré :',error);
      toastSafe('Objet non enregistré — aucune autre donnée modifiée',true);
      return false;
    }finally{saving=false;}
  };

  /* Empêche les anciens installateurs différés de remplacer ce gestionnaire. */
  authoritativeSave.__yayaMailSubjectFinal=true;
  authoritativeSave.__yayaDirectSave=true;
  authoritativeSave.__yayaBackgroundV1=true;
  window.__yayaSaveMailSubject=authoritativeSave;
  window.saveDocumentEdit=authoritativeSave;
  try{saveDocumentEdit=authoritativeSave;}catch(e){}
})();
