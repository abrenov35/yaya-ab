(function(){
  'use strict';

  if(window.__yayaAchatsConcurrencyGuardV1)return;
  window.__yayaAchatsConcurrencyGuardV1=true;

  let installed=false;
  let baseline=[];
  let originalApiPost=null;
  let originalApiGet=null;

  function cloneRows(rows){
    try{return JSON.parse(JSON.stringify(Array.isArray(rows)?rows:[]));}
    catch(e){return (Array.isArray(rows)?rows:[]).map(function(x){return Object.assign({},x||{});});}
  }

  function idOf(row){return String(row&&row.id||'');}

  function stable(row){
    if(!row||typeof row!=='object')return '';
    const keys=Object.keys(row).sort();
    const out={};
    keys.forEach(function(k){out[k]=row[k];});
    try{return JSON.stringify(out);}catch(e){return String(row);}
  }

  function mapById(rows){
    const m=new Map();
    (rows||[]).forEach(function(row){
      const id=idOf(row);
      if(id)m.set(id,row);
    });
    return m;
  }

  function snapshotFromState(){
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.achats)){
        baseline=cloneRows(S.achats);
        return true;
      }
    }catch(e){}
    return false;
  }

  function saveLocal(rows){
    const copy=cloneRows(rows);
    baseline=copy;
    try{
      if(typeof S!=='undefined'&&S)S.achats=cloneRows(copy);
    }catch(e){}
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      cached.achats=cloneRows(copy);
      localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
    }catch(e){}
  }

  function chantierExistsLocally(chantierId){
    const id=String(chantierId||'');
    if(!id)return true;
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return true;
      return S.chantiers.some(function(c){return String(c&&c.id||'')===id;});
    }catch(e){return true;}
  }

  async function safeSetAchats(submitted){
    const target=cloneRows(submitted);
    const before=cloneRows(baseline);
    const beforeMap=mapById(before);
    const targetMap=mapById(target);

    let fresh;
    try{
      fresh=await originalApiGet(true);
    }catch(err){
      console.error('Yaya — setAchats bloqué : lecture fraîche impossible',err);
      try{if(typeof toast==='function')toast('Enregistrement différé : données serveur non relues',true);}catch(e){}
      return false;
    }

    if(!fresh||!Array.isArray(fresh.achats)){
      console.error('Yaya — setAchats bloqué : achats serveur absents');
      try{if(typeof toast==='function')toast('Enregistrement différé : liste achats indisponible',true);}catch(e){}
      return false;
    }

    const freshRows=cloneRows(fresh.achats);
    const freshMap=mapById(freshRows);

    // Une suppression est volontaire seulement si l'ID existait dans le dernier
    // état serveur connu par CE navigateur et a disparu de la cible.
    const removedIds=new Set();
    beforeMap.forEach(function(row,id){
      if(!targetMap.has(id))removedIds.add(id);
    });

    // Une suppression de chantier retire volontairement ses achats liés.
    freshRows.forEach(function(row){
      const id=idOf(row);
      if(id&&!targetMap.has(id)&&!chantierExistsLocally(row&&row.chantierId)){
        removedIds.add(id);
      }
    });

    const mergedMap=new Map();
    freshRows.forEach(function(row){
      const id=idOf(row);
      if(id&&!removedIds.has(id))mergedMap.set(id,row);
    });

    // Ne réécrire que les lignes ajoutées/modifiées localement. Les lignes
    // inchangées conservent leur version fraîche du serveur.
    targetMap.forEach(function(row,id){
      const old=beforeMap.get(id);
      const changed=!old||stable(old)!==stable(row);
      if(changed||!freshMap.has(id))mergedMap.set(id,row);
    });

    const merged=Array.from(mergedMap.values());
    const ok=await originalApiPost('setAchats',merged);
    if(ok){
      saveLocal(merged);
      try{window.dispatchEvent(new CustomEvent('yaya:achats-safe-write'));}catch(e){}
    }
    return ok;
  }

  function install(){
    if(installed)return true;
    if(typeof window.apiPost!=='function'&&typeof apiPost!=='function')return false;
    if(typeof window.apiGet!=='function'&&typeof apiGet!=='function')return false;

    originalApiPost=window.apiPost||apiPost;
    originalApiGet=window.apiGet||apiGet;
    snapshotFromState();

    const wrappedGet=async function(forceNetwork){
      const data=await originalApiGet.apply(this,arguments);
      if(data&&Array.isArray(data.achats))baseline=cloneRows(data.achats);
      return data;
    };

    const wrappedPost=async function(action,data){
      if(String(action)==='setAchats')return safeSetAchats(data);
      const ok=await originalApiPost.apply(this,arguments);
      if(ok&&String(action)==='addAchat'&&data&&data.id){
        const m=mapById(baseline);
        m.set(String(data.id),cloneRows([data])[0]);
        baseline=Array.from(m.values());
      }
      return ok;
    };

    window.apiGet=wrappedGet;
    window.apiPost=wrappedPost;
    try{apiGet=wrappedGet;}catch(e){}
    try{apiPost=wrappedPost;}catch(e){}

    installed=true;
    console.log('Yaya — protection achats concurrents V1 active');
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(function(){
      tries++;
      if(install()||tries>=100)clearInterval(timer);
    },100);
  }

  window.addEventListener('yaya:data-refreshed',function(){
    snapshotFromState();
  });
})();
