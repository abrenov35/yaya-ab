(function(){
  'use strict';

  if(window.__yayaHoursPersistenceV1Installed)return;
  window.__yayaHoursPersistenceV1Installed=true;

  const PENDING_KEY='YAYA_PENDING_HOURS_V1';
  const CACHE_KEY='YAYA_CACHE_DATA_V2';
  let recoveryRunning=false;
  let syncQueue=Promise.resolve();
  let retryTimer=0;
  let lastPendingWarningAt=0;

  function clone(value){
    try{return JSON.parse(JSON.stringify(value));}catch(e){return value;}
  }

  function weekOf(row){
    try{return normaliserSemaineHeure(row&&row.semaine);}catch(e){return String(row&&row.semaine||'').slice(0,10);}
  }

  function workerOf(row){
    return String(row&&(
      row.salarieId??row.ouvrierId??row.equipeId??row.workerId??row.ouvrier??''
    ));
  }

  function normalizedRow(row){
    return {
      semaine:weekOf(row),
      salarieId:workerOf(row),
      jour:Number(row&&row.jour)||0,
      type:String(row&&row.type||''),
      ref:String(row&&row.ref||''),
      heures:Number(row&&row.heures)||0,
      taux:(row&&row.taux==null)?'':Number(row.taux)||0
    };
  }

  function rowSignature(row){
    const h=normalizedRow(row);
    return [h.semaine,h.salarieId,h.jour,h.type,h.ref,h.heures,h.taux].join('|');
  }

  function sameRows(a,b){
    const left=(Array.isArray(a)?a:[]).map(rowSignature).sort();
    const right=(Array.isArray(b)?b:[]).map(rowSignature).sort();
    return JSON.stringify(left)===JSON.stringify(right);
  }

  function readPending(){
    try{
      const parsed=JSON.parse(localStorage.getItem(PENDING_KEY)||'{"items":{}}');
      if(!parsed||typeof parsed!=='object')return {items:{}};
      if(!parsed.items||typeof parsed.items!=='object')parsed.items={};
      return parsed;
    }catch(e){return {items:{}};}
  }

  function writePending(store){
    try{
      if(!store||!Object.keys(store.items||{}).length)localStorage.removeItem(PENDING_KEY);
      else localStorage.setItem(PENDING_KEY,JSON.stringify(store));
    }catch(e){}
  }

  function hasPending(){
    return Object.keys(readPending().items||{}).length>0;
  }

  function itemKey(week,sid){return String(week)+'|'+String(sid);}

  function putPending(week,sid,rows,validated){
    const store=readPending();
    store.items[itemKey(week,sid)]={
      semaine:String(week),
      salarieId:String(sid),
      lignes:(Array.isArray(rows)?rows:[]).map(normalizedRow),
      validee:!!validated,
      savedAt:Date.now()
    };
    writePending(store);
    return store;
  }

  function pendingItemsForWeek(store,week){
    return Object.values(store&&store.items||{}).filter(function(item){
      return item&&String(item.semaine)===String(week);
    });
  }

  function mergePendingIntoHours(hours,store){
    let merged=Array.isArray(hours)?hours.slice():[];
    Object.values(store&&store.items||{}).forEach(function(item){
      if(!item)return;
      const week=String(item.semaine||'');
      const sid=String(item.salarieId||'');
      merged=merged.filter(function(row){
        return !(weekOf(row)===week&&workerOf(row)===sid&&Number(row.jour)>=0&&Number(row.jour)<=4);
      });
      merged=merged.concat((Array.isArray(item.lignes)?item.lignes:[]).map(normalizedRow));
    });
    return merged;
  }

  function weekPayload(remoteHours,store,week){
    const edits=pendingItemsForWeek(store,week);
    const editedWorkers=new Set(edits.map(function(item){return String(item.salarieId);}));
    const rows=(Array.isArray(remoteHours)?remoteHours:[]).filter(function(row){
      return weekOf(row)===String(week)&&!editedWorkers.has(workerOf(row));
    }).map(normalizedRow);
    edits.forEach(function(item){
      (Array.isArray(item.lignes)?item.lignes:[]).forEach(function(row){rows.push(normalizedRow(row));});
    });
    return rows;
  }

  function cacheCurrent(){
    try{
      if(typeof S==='undefined'||!S)return;
      localStorage.setItem(CACHE_KEY,JSON.stringify(S));
      if(window.__yayaCache&&typeof window.__yayaCache.write==='function'){
        window.__yayaCache.write(S,null);
      }
    }catch(e){}
  }

  async function fetchFresh(){
    const sep=String(API||'').includes('?')?'&':'?';
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},18000);
    try{
      const response=await fetch(
        API+sep+'_hours_persist='+Date.now()+'&_yaya_force=1',
        {method:'GET',cache:'no-store',signal:ctrl.signal}
      );
      const text=await response.text();
      if(/^\s*</.test(text))throw new Error('Réponse Google temporairement invalide');
      const json=JSON.parse(text);
      if(!json||json.ok!==true)throw new Error(json&&json.error||'Lecture impossible');
      return json.data||{};
    }finally{clearTimeout(timer);}
  }

  function clearConfirmed(store,remoteHours){
    const latest=readPending();
    let changed=false;
    Object.keys(store.items||{}).forEach(function(key){
      const item=store.items[key];
      const actual=(Array.isArray(remoteHours)?remoteHours:[]).filter(function(row){
        return weekOf(row)===String(item.semaine)&&workerOf(row)===String(item.salarieId)&&Number(row.jour)>=0&&Number(row.jour)<=4;
      });
      if(sameRows(actual,item.lignes)){
        const latestItem=latest.items&&latest.items[key];
        // Ne jamais supprimer une nouvelle saisie du même salarié arrivée
        // pendant que la précédente était encore en cours de contrôle.
        if(!latestItem||Number(latestItem.savedAt)!==Number(item.savedAt)||!sameRows(latestItem.lignes,item.lignes))return;
        delete latest.items[key];
        delete store.items[key];
        changed=true;
      }
    });
    if(changed)writePending(latest);
    return changed;
  }

  async function savePendingWeek(week,store){
    const before=await fetchFresh();
    const payload=weekPayload(before.heures,store,week);
    const edits=pendingItemsForWeek(store,week);
    const validated=edits.some(function(item){return item.validee;});
    const ok=await apiPost('setSemaine',{semaine:week,lignes:payload,validee:validated});
    if(!ok){
      // Google peut avoir effectué l'écriture tout en renvoyant une page HTML
      // temporaire. Une lecture de contrôle évite alors de demander une saisie
      // inutile à l'utilisateur.
      await new Promise(function(resolve){setTimeout(resolve,600);});
      try{
        const afterAmbiguous=await fetchFresh();
        clearConfirmed(store,Array.isArray(afterAmbiguous.heures)?afterAmbiguous.heures:[]);
        if(!pendingItemsForWeek(store,week).length)return afterAmbiguous;
      }catch(e){}
      return null;
    }

    let fresh=null;
    const waits=[250,750,1500];
    for(let i=0;i<waits.length;i++){
      await new Promise(function(resolve){setTimeout(resolve,waits[i]);});
      try{
        fresh=await fetchFresh();
        clearConfirmed(store,Array.isArray(fresh.heures)?fresh.heures:[]);
        if(!pendingItemsForWeek(store,week).length)return fresh;
      }catch(e){if(i===waits.length-1)throw e;}
    }
    return null;
  }

  async function flushPending(){
    if(recoveryRunning)return;
    const store=readPending();
    if(!Object.keys(store.items||{}).length){
      window.yayaHoursPending=false;
      return;
    }

    recoveryRunning=true;
    window.yayaHoursPending=true;
    const weeks=[...new Set(Object.values(store.items).map(function(item){return String(item.semaine||'');}).filter(Boolean))];
    let allConfirmed=true;

    for(const week of weeks){
      try{
        const fresh=await savePendingWeek(week,store);
        if(!fresh)allConfirmed=false;
        else if(typeof S!=='undefined'&&Array.isArray(fresh.heures)){
          // Une autre saisie peut avoir été faite pendant le contrôle : elle
          // reste prioritaire grâce à la file locale persistante.
          S.heures=mergePendingIntoHours(fresh.heures,readPending());
        }
      }catch(e){allConfirmed=false;}
    }

    recoveryRunning=false;
    window.yayaHoursPending=hasPending();
    cacheCurrent();
    if(typeof render==='function')render();

    if(allConfirmed&&!window.yayaHoursPending){
      if(typeof toast==='function')toast('Heures synchronisées avec le Sheet ✓');
    }else if(window.yayaHoursPending){
      const now=Date.now();
      if(now-lastPendingWarningAt>30000&&typeof toast==='function'){
        lastPendingWarningAt=now;
        toast('Synchronisation des heures en attente — nouvelle tentative automatique',true);
      }
      queueSync(8000);
    }
  }

  function queueSync(delay){
    const launch=function(){
      retryTimer=0;
      syncQueue=syncQueue.then(flushPending,flushPending);
    };
    if(Number(delay)>0){
      if(retryTimer)return;
      retryTimer=setTimeout(launch,Number(delay));
      return;
    }
    if(retryTimer){clearTimeout(retryTimer);retryTimer=0;}
    launch();
  }

  function installSave(){
    if(typeof window.yayaSaveWeek!=='function'||typeof window.openYayaWeekHours!=='function'){
      setTimeout(installSave,120);
      return;
    }
    if(window.yayaSaveWeek.__yayaPersistentHoursV1)return;

    async function persistentSaveWeek(){
      if(!yayaWeekCtx||yayaWeekSaving)return;
      const ctx=yayaWeekCtx;
      const rows=[...document.querySelectorAll('#yayaWeekRows .yaya-week-select')].map(function(sel,r){
        return {
          affectation:sel.value,
          hours:[0,1,2,3,4].map(function(d){
            const input=document.querySelector('.yaya-week-hours[data-row="'+r+'"][data-day="'+d+'"]');
            return Number(input&&input.value)||0;
          })
        };
      });
      if(rows.some(function(row){return row.hours.some(function(h){return h>0;})&&!row.affectation;})){
        if(typeof toast==='function')toast('Choisis le chantier ou le motif pour chaque ligne renseignée',true);
        return;
      }

      const semaine=typeof wk==='function'?wk():yayaIso(yayaMonday(ctx.dates[0]));
      const sid=String(ctx.workerId);
      const salarie=yayaGetWorkers().find(function(x){return String(x.id)===sid;})||{};
      const taux=Number(salarie.tauxHoraire)||0;
      const fresh=[];
      rows.forEach(function(row){
        if(!row.affectation)return;
        const motif=row.affectation.startsWith('MOTIF:');
        const ref=motif?row.affectation.slice(6):row.affectation;
        row.hours.forEach(function(hours,jour){
          if(hours<=0)return;
          fresh.push(normalizedRow({
            semaine:semaine,salarieId:sid,jour:jour,type:motif?'np':'chantier',ref:ref,heures:hours,taux:taux
          }));
        });
      });

      yayaWeekSaving=true;
      window.yayaHoursPending=true;
      const btn=document.getElementById('yayaWeekSaveBtn');
      if(btn){btn.disabled=true;btn.textContent='Enregistré ✓';}

      let store=putPending(semaine,sid,fresh,typeof isValidated==='function'?isValidated():false);
      if(typeof S!=='undefined')S.heures=mergePendingIntoHours(S.heures,store);
      cacheCurrent();
      yayaWeekSaving=false;
      closeModal();
      if(typeof render==='function')render();
      if(typeof toast==='function')toast('Heures prises en compte ✓ — synchronisation en arrière-plan');
      queueSync(0);
    }

    persistentSaveWeek.__yayaPersistentHoursV1=true;
    window.yayaSaveWeek=persistentSaveWeek;
    try{yayaSaveWeek=persistentSaveWeek;}catch(e){}
  }

  async function recoverPending(){
    const store=readPending();
    if(!Object.keys(store.items||{}).length)return;
    if(typeof S==='undefined'||!S||!Array.isArray(S.heures)||typeof apiPost!=='function'){
      setTimeout(recoverPending,400);
      return;
    }

    window.yayaHoursPending=true;
    S.heures=mergePendingIntoHours(S.heures,store);
    cacheCurrent();
    if(typeof render==='function')render();
    queueSync(0);
  }

  installSave();
  setTimeout(recoverPending,900);
  window.addEventListener('focus',function(){setTimeout(recoverPending,500);});
})();
