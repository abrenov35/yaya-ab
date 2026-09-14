(function(){
  'use strict';

  if(window.__yayaMailEditPersistV2)return;
  window.__yayaMailEditPersistV2=true;

  const originalSave=typeof window.saveDocumentEdit==='function'?window.saveDocumentEdit:null;
  const PENDING_KEY='YAYA_MAIL_EDIT_PENDING_V2';
  const CACHE_KEY='YAYA_CACHE_DATA_V2';

  function text(v){return String(v==null?'':v).trim();}
  function docs(){
    try{return (typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];}catch(e){return [];}
  }
  function getDoc(id){return docs().find(d=>String(d&&d.id||'')===String(id))||null;}
  function isMail(d){
    if(!d)return false;
    const up=v=>String(v||'').trim().toUpperCase();
    if(up(d.type)==='MAIL'||up(d.origine)==='MAIL'||up(d.origineMail)==='MAIL')return true;
    return !!(d.nomMail||d.expediteur||d.from||d.objetMail||d.mailSubject||d.emailSubject||d.contenuMail||d.corpsMail||d.mailBody||d.emailBody||d.messageBody);
  }
  function mailBody(d){
    try{if(typeof window.contenuMailYaya==='function')return String(window.contenuMailYaya(d)||'');}catch(e){}
    return String(d&&(d.contenuMail||d.corpsMail||d.bodyMail||d.mailBody||d.body||d.contenu||d.message)||'');
  }
  function durableTitle(object,body){
    const obj=text(object)||'Objet non renseigné';
    const raw=String(body||'').trim();
    if(!raw)return obj;
    if(/^\s*(?:objet|subject)\s*:/i.test(raw))return raw.replace(/^\s*(?:objet|subject)\s*:[^\r\n]*/i,'Objet : '+obj);
    return 'Objet : '+obj+'\n\n'+raw;
  }

  function readPending(){
    try{return JSON.parse(localStorage.getItem(PENDING_KEY)||'{}')||{};}catch(e){return {};}
  }
  function writePending(map){
    try{
      if(map&&Object.keys(map).length)localStorage.setItem(PENDING_KEY,JSON.stringify(map));
      else localStorage.removeItem(PENDING_KEY);
    }catch(e){}
  }
  function setPending(id,edit){const map=readPending();map[String(id)]=edit;writePending(map);}
  function clearPending(id){const map=readPending();delete map[String(id)];writePending(map);}

  function applyEdit(row,edit){
    if(!row||!edit)return row;
    row.chantierId=String(edit.chantierId||'');
    row.type=String(edit.type||'MAIL');
    row.sujet=String(edit.sender||'').trim();
    row.nomMail=row.sujet;
    row.objetMail=String(edit.object||'').trim();
    row.origineMail='MAIL';
    if(edit.body){
      row.contenuMail=String(edit.body);
      row.titre=durableTitle(edit.object,edit.body);
    }else row.titre=String(edit.object||'').trim();
    return row;
  }

  function cacheDocuments(rows){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')||{};
      cached.documents=(rows||[]).map(r=>({...r}));
      localStorage.setItem(CACHE_KEY,JSON.stringify(cached));
    }catch(e){}
  }

  function applyPendingLocally(){
    const map=readPending();
    if(!Object.keys(map).length)return false;
    let changed=false;
    const rows=docs();
    Object.keys(map).forEach(id=>{
      const row=rows.find(d=>String(d&&d.id||'')===String(id));
      if(row){applyEdit(row,map[id]);changed=true;}
    });
    if(changed)cacheDocuments(rows);
    return changed;
  }

  function getApi(){
    try{return (typeof API==='string'&&API)?API:'';}catch(e){return '';}
  }
  async function fetchLatestDocuments(){
    const api=getApi();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),10000);
    try{
      const r=await fetch(api+sep+'tabs=documents&_mail_edit='+Date.now(),{method:'GET',cache:'no-store',signal:ctrl.signal});
      const j=await r.json();
      if(!j||!j.ok)throw new Error(j&&j.error||'Réponse Yaya invalide');
      const rows=j.data&&Array.isArray(j.data.documents)?j.data.documents:null;
      if(!rows)throw new Error('Documents serveur indisponibles');
      return rows.map(row=>({...row}));
    }finally{clearTimeout(timer);}
  }

  function matches(row,edit){
    if(!row||!edit)return false;
    const wanted=text(edit.object);
    const direct=[row.objetMail,row.mailSubject,row.emailSubject,row.subject,row.objet].map(text);
    if(direct.some(v=>v===wanted))return true;
    const title=String(row.titre||'').trim();
    if(title===wanted)return true;
    const m=title.match(/^\s*(?:objet|subject)\s*:\s*([^\r\n]+)/i);
    return !!(m&&text(m[1])===wanted);
  }

  function replaceLocal(rows){
    try{
      if(typeof S!=='undefined'&&S)S.documents=(rows||[]).map(r=>({...r}));
      applyPendingLocally();
      cacheDocuments(docs());
    }catch(e){}
  }

  async function postRows(rows){
    if(typeof apiPost!=='function')throw new Error('Enregistrement Yaya indisponible');
    const ok=await apiPost('setDocuments',rows);
    if(!ok)throw new Error('Enregistrement refusé');
    return true;
  }

  async function persistMailEdit(id,edit){
    setPending(id,edit);
    applyEdit(getDoc(id),edit);
    cacheDocuments(docs());
    try{if(typeof render==='function')render();}catch(e){}

    window.__yayaWriteInFlight=(Number(window.__yayaWriteInFlight)||0)+1;
    try{
      let latest;
      try{latest=await fetchLatestDocuments();}
      catch(e){latest=docs().map(r=>({...r}));}

      let remote=latest.find(d=>String(d&&d.id||'')===String(id));
      if(!remote){
        const local=getDoc(id);
        if(!local)throw new Error('Mail introuvable');
        remote={...local};latest.unshift(remote);
      }
      applyEdit(remote,edit);
      await postRows(latest);

      // Vérification réelle côté serveur. Si une ancienne version revient,
      // on fusionne l'édition dans la dernière liste serveur et on réécrit une fois.
      let verified=await fetchLatestDocuments();
      let check=verified.find(d=>String(d&&d.id||'')===String(id));
      if(!matches(check,edit)){
        check=verified.find(d=>String(d&&d.id||'')===String(id));
        if(!check){check={...(getDoc(id)||{}),id:String(id)};verified.unshift(check);}
        applyEdit(check,edit);
        await postRows(verified);
        await new Promise(r=>setTimeout(r,250));
        verified=await fetchLatestDocuments();
        check=verified.find(d=>String(d&&d.id||'')===String(id));
      }

      if(matches(check,edit)){
        clearPending(id);
        replaceLocal(verified);
        try{if(typeof render==='function')render();}catch(e){}
        try{if(typeof toast==='function')toast('Mail modifié ✓');}catch(e){}
        try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:['documents'],source:'mail-edit-persist'}}));}catch(e){}
        return true;
      }

      // Ne jamais laisser une synchro écraser visuellement la modification
      // tant que le serveur n'a pas confirmé la nouvelle valeur.
      replaceLocal(verified);
      try{if(typeof render==='function')render();}catch(e){}
      try{if(typeof toast==='function')toast('Mail modifié — synchronisation à confirmer',true);}catch(e){}
      return false;
    }catch(e){
      applyPendingLocally();
      try{if(typeof render==='function')render();}catch(err){}
      try{if(typeof toast==='function')toast('Modification conservée localement — synchronisation en attente',true);}catch(err){}
      console.warn('Yaya mail edit persist:',e);
      return false;
    }finally{
      window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||1)-1);
    }
  }

  window.saveDocumentEdit=async function(id){
    const d=getDoc(id);
    if(!d||!isMail(d)){
      if(originalSave)return originalSave.apply(this,arguments);
      return;
    }

    const ch=document.getElementById('edDocCh');
    const type=document.getElementById('edDocType');
    const sender=document.getElementById('edDocSujet');
    const object=document.getElementById('edDocTitre');
    if(!object)return;

    const edit={
      chantierId:String(ch?ch.value:d.chantierId||''),
      type:String(type?type.value:d.type||'MAIL'),
      sender:String(sender?sender.value:(d.nomMail||d.sujet||'')).trim(),
      object:String(object.value||'').trim(),
      body:mailBody(d)
    };
    if(!edit.object){try{if(typeof toast==='function')toast('Indique un objet',true);}catch(e){};object.focus();return;}

    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    return persistMailEdit(String(id),edit);
  };

  // Une synchro serveur ne doit plus remettre l'ancien objet pendant qu'une
  // modification est encore en attente de confirmation.
  window.addEventListener('yaya:data-refreshed',function(){
    if(applyPendingLocally()){
      try{if(typeof render==='function' && !document.querySelector('#modalRoot .overlay'))requestAnimationFrame(()=>render());}catch(e){}
    }
  });

  applyPendingLocally();
})();
