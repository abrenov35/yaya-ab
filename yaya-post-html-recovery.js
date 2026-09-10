(function(){
  'use strict';

  if(window.__yayaPostHtmlRecoveryV2Installed)return;
  window.__yayaPostHtmlRecoveryV2Installed=true;
  window.__yayaPostHtmlRecoveryV1Installed=true;

  const DATASET_BY_SET={
    setChantiers:'chantiers',
    setAchats:'achats',
    setDocuments:'documents',
    setAvenants:'avenants',
    setCommandes:'commandes',
    setHeures:'heures'
  };
  const DATASET_BY_ADD={
    addChantier:'chantiers',
    addAchat:'achats',
    addDocument:'documents',
    addAvenant:'avenants',
    addCommande:'commandes'
  };
  const FIELDS={
    chantiers:['id','nom','numero','montantDevisHT','statut','notes','montantMarcheHT','modeSuivi','dateDemarrage','dateSignature'],
    achats:['id','chantierId','typeDoc','fournisseur','designation','date','montantHT','sousTraitant','lien','statutValidation'],
    documents:['id','chantierId','type','titre','sujet','date','lien'],
    avenants:['id','chantierId','libelle','montantHT','date','lien'],
    commandes:['id','chantierId','typeDoc','fournisseur','designation','date','montantHT','lien','dropboxId','dropboxPath'],
    heures:['semaine','salarieId','jour','type','ref','heures','taux']
  };

  function looksLikeHtmlJsonFailure(text){
    const s=String(text||'');
    return /Unexpected token\s*['\"]?</i.test(s) ||
      /<!DOCTYPE/i.test(s) ||
      /not valid JSON/i.test(s) ||
      /Réponse Google temporairement invalide/i.test(s);
  }

  function cleanSignatureNotes(value){
    return String(value==null?'':value)
      .replace(/\s*\[\[YAYA_SIG:\d{4}-\d{2}\]\]\s*/g,'\n')
      .replace(/\n{3,}/g,'\n\n')
      .trim();
  }

  function normDate(value){
    const s=String(value==null?'':value).trim();
    const m=s.match(/^(\d{4}-\d{2}-\d{2})/);
    return m?m[1]:s;
  }

  function normSignature(value,notes){
    let m=String(notes||'').match(/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/);
    if(m&&m[1])return m[1];
    const s=String(value==null?'':value).trim();
    m=s.match(/^(\d{4})-(\d{2})/);
    return m?m[1]+'-'+m[2]:'';
  }

  function normScalar(dataset,key,value,row){
    if(key==='chantierId'||key==='ref'){
      const id=String(value==null?'':value).trim();
      if(typeof window.yayaCanonicalChantierId==='function'){
        try{return String(window.yayaCanonicalChantierId(id)||id);}catch(e){}
      }
      return id;
    }
    if(key==='date'||key==='dateDemarrage'||key==='semaine')return normDate(value);
    if(key==='dateSignature')return normSignature(value,row&&row.notes);
    if(key==='notes')return cleanSignatureNotes(value);
    if(['montantDevisHT','montantMarcheHT','montantHT','heures','taux','jour'].includes(key)){
      const n=Number(value);
      return Number.isFinite(n)?n:0;
    }
    return String(value==null?'':value).trim();
  }

  function comparable(dataset,row){
    const fields=FIELDS[dataset]||[];
    return fields.map(function(key){return normScalar(dataset,key,row&&row[key],row);});
  }

  function sameRow(dataset,a,b){
    return JSON.stringify(comparable(dataset,a))===JSON.stringify(comparable(dataset,b));
  }

  function canonicalServerChantiers(rows){
    if(!Array.isArray(rows))return [];
    const targets=new Set(rows.map(function(r){return String(r&&r.id||'').trim();}));
    return rows.filter(function(r){
      const id=String(r&&r.id||'').trim();
      if(!id)return false;
      if(typeof window.yayaCanonicalChantierId!=='function')return true;
      let canon=id;
      try{canon=String(window.yayaCanonicalChantierId(id)||id);}catch(e){}
      return canon===id || !targets.has(canon);
    });
  }

  function verifySet(dataset,wanted,freshRows){
    if(!Array.isArray(wanted)||!Array.isArray(freshRows))return false;
    const server=dataset==='chantiers'?canonicalServerChantiers(freshRows):freshRows.slice();

    if(dataset==='heures'){
      const a=wanted.map(function(r){return JSON.stringify(comparable(dataset,r));}).sort();
      const b=server.map(function(r){return JSON.stringify(comparable(dataset,r));}).sort();
      return JSON.stringify(a)===JSON.stringify(b);
    }

    const wantedById=new Map();
    wanted.forEach(function(r){const id=String(r&&r.id||'').trim();if(id)wantedById.set(id,r);});
    const serverById=new Map();
    server.forEach(function(r){const id=String(r&&r.id||'').trim();if(id)serverById.set(id,r);});

    if(wantedById.size!==serverById.size)return false;
    for(const [id,row] of wantedById){
      const stored=serverById.get(id);
      if(!stored||!sameRow(dataset,row,stored))return false;
    }
    return true;
  }

  function verifyAdd(dataset,wanted,freshRows){
    if(!wanted||typeof wanted!=='object'||!Array.isArray(freshRows))return false;
    const id=String(wanted.id||'').trim();
    if(!id)return false;
    const stored=freshRows.find(function(r){return String(r&&r.id||'').trim()===id;});
    return !!(stored&&sameRow(dataset,wanted,stored));
  }

  async function verifyAfterAmbiguousResponse(action,data){
    const datasetSet=DATASET_BY_SET[action];
    const datasetAdd=DATASET_BY_ADD[action];
    if(!datasetSet&&!datasetAdd&&action!=='deleteChantier')return false;

    await new Promise(function(resolve){setTimeout(resolve,650);});
    const fresh=await window.apiGet(true);
    if(!fresh||typeof fresh!=='object')return false;

    if(datasetSet)return verifySet(datasetSet,data,fresh[datasetSet]);
    if(datasetAdd)return verifyAdd(datasetAdd,data,fresh[datasetAdd]);
    if(action==='deleteChantier'){
      const id=String(data&&data.id||'').trim();
      return !!(id&&Array.isArray(fresh.chantiers)&&!fresh.chantiers.some(function(c){return String(c&&c.id||'').trim()===id;}));
    }
    return false;
  }

  function actualSubmittedData(action,fallback){
    try{
      const info=window.__yayaLastSubmittedWrite;
      if(
        info&&
        String(info.action||'')===String(action||'')&&
        Number(info.at||0)>0&&
        Date.now()-Number(info.at||0)<45000
      ){
        return info.data;
      }
    }catch(e){}
    return fallback;
  }

  function install(){
    if(typeof window.apiPost!=='function'||typeof window.apiGet!=='function'){
      setTimeout(install,120);
      return;
    }
    if(window.apiPost.__yayaPostHtmlRecoveryV2)return;

    const original=window.apiPost;

    async function recoveredApiPost(action,data){
      const realToast=typeof window.toast==='function'?window.toast:null;
      let capturedTransport='';
      let proxyToast=null;

      if(realToast){
        proxyToast=function(message,isError){
          const text=String(message||'');
          if(isError&&looksLikeHtmlJsonFailure(text)){
            capturedTransport=text;
            return;
          }
          if(isError&&capturedTransport)return;
          return realToast.apply(this,arguments);
        };
        window.toast=proxyToast;
      }

      let result=false;
      let thrown=null;
      try{
        result=await original(action,data);
      }catch(e){
        thrown=e;
      }finally{
        if(proxyToast&&window.toast===proxyToast)window.toast=realToast;
      }

      if(!capturedTransport){
        try{
          const node=document.getElementById('toast');
          const text=String(node&&node.textContent||'');
          if(looksLikeHtmlJsonFailure(text)){
            capturedTransport=text;
            if(node)node.style.display='none';
          }
        }catch(e){}
      }

      if(capturedTransport&&(result===false||thrown)){
        try{
          const verifyData=actualSubmittedData(action,data);
          const confirmed=await verifyAfterAmbiguousResponse(String(action||''),verifyData);
          if(confirmed){
            try{
              if(typeof window.syncMsg==='function')window.syncMsg('✓ enregistré '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}));
            }catch(e){}
            if(realToast)realToast('✓ Enregistrement confirmé',false);
            return true;
          }
        }catch(e){
          console.warn('Vérification après réponse Google invalide impossible',e);
        }
        if(realToast)realToast('⚠ Google n’a pas confirmé l’enregistrement. Réessaie dans quelques secondes.',true);
        return false;
      }

      if(thrown)throw thrown;
      return result;
    }

    recoveredApiPost.__yayaPostHtmlRecoveryV2=true;
    recoveredApiPost.__yayaPostHtmlRecoveryV1=true;
    recoveredApiPost.__yayaWrappedApiPost=original;
    window.apiPost=recoveredApiPost;
  }

  install();
})();
