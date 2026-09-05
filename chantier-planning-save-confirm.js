(function(){
  'use strict';

  const pending=new Map();

  function getChantier(cid){
    try{return Array.isArray(S&&S.chantiers)?S.chantiers.find(function(c){return String(c.id)===String(cid);})||null:null;}catch(e){return null;}
  }

  function normaliseNom(s){
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  }

  function probablePlanning(liste,nom){
    const k=normaliseNom(nom);if(!k)return null;
    const exact=(liste||[]).find(function(p){return normaliseNom(p&&p.nom)===k;});
    if(exact)return exact;
    return (liste||[]).find(function(p){
      const q=normaliseNom(p&&p.nom);
      return q&&Math.min(q.length,k.length)>=5&&(q.includes(k)||k.includes(q));
    })||null;
  }

  function readForm(){
    const nom=document.getElementById('editChNom');
    const sig=document.getElementById('editChSignature');
    const dem=document.getElementById('editChDemarrage');
    const mt=document.getElementById('editChMarcheHT');
    if(!nom||!sig||!mt)return {ok:false};
    const name=String(nom.value||'').trim();
    if(!name){if(typeof toast==='function')toast('Indique le nom du chantier',true);try{nom.focus();}catch(e){}return {ok:false};}
    const montant=Number(String(mt.value||'0').trim().replace(/\s/g,'').replace(',','.'));
    if(!Number.isFinite(montant)||montant<0){if(typeof toast==='function')toast('Chiffre d’affaires HT invalide',true);try{mt.focus();}catch(e){}return {ok:false};}
    return {ok:true,nom:name,dateSignature:String(sig.value||''),dateDemarrageEstime:dem?String(dem.value||''):'',montantMarcheHT:montant};
  }

  function applyForm(c,data){
    c.nom=data.nom;
    c.dateSignature=data.dateSignature;
    c.dateDemarrageEstime=data.dateDemarrageEstime;
    c.montantMarcheHT=data.montantMarcheHT;
  }

  function setBox(state,message){
    const el=document.getElementById('editPlanningState');
    const btn=document.getElementById('editPlanningBtn');
    const note=document.getElementById('editPlanningNote');
    if(el){el.textContent=state;el.style.color='var(--green)';}
    if(btn){btn.disabled=true;btn.style.opacity='.7';btn.textContent='Prêt — valider avec Enregistrer';}
    if(note)note.textContent=message;
  }

  function planningRequest(params){
    return new Promise(function(resolve,reject){
      let api='';
      try{api=PLANNING_API;}catch(e){}
      if(!api)return reject(new Error('API Planning indisponible'));
      const callback='yayaPlanningSave_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      let fini=false;
      const timer=setTimeout(function(){done(new Error('Planning indisponible'));},15000);
      function done(err,data){
        if(fini)return;fini=true;clearTimeout(timer);
        if(script.parentNode)script.parentNode.removeChild(script);
        try{delete window[callback];}catch(e){window[callback]=undefined;}
        err?reject(err):resolve(data);
      }
      window[callback]=function(data){done(null,data);};
      script.onerror=function(){done(new Error('Impossible de joindre Planning'));};
      const q=new URLSearchParams(Object.assign({},params,{callback:callback,_ts:String(Date.now())}));
      script.src=api+'?'+q.toString();
      script.async=true;
      document.head.appendChild(script);
    });
  }

  async function createPlanning(c){
    const d=c.dateDemarrageEstime||'';
    const r=await planningRequest({action:'createChantier',nom:c.nom,dateDebut:d,dateFin:d,description:'',couleur:'',dateSignature:c.dateSignature||'',typeChantier:'Rénovation'});
    if(!r||!r.success)throw new Error(r&&r.error?r.error:'Création Planning impossible');
    let pid=r.id||r.chantierId||(r.data&&r.data.id)||(r.chantier&&r.chantier.id)||'';
    if(!pid){
      try{
        const list=await getChantiersPlanning();
        const match=probablePlanning(list,c.nom);
        if(match&&match.id)pid=match.id;
      }catch(e){}
    }
    c.planningPresent=true;
    c.sourcePlanningId=pid?String(pid):'';
    c.planningNom=c.nom;
  }

  window.sendExistingChantierToPlanning=async function(cid){
    const c=getChantier(cid);if(!c)return;
    const form=readForm();if(!form.ok)return;
    const btn=document.getElementById('editPlanningBtn');
    if(btn){btn.disabled=true;btn.textContent='Vérification du Planning…';}
    try{
      const list=await getChantiersPlanning();
      const match=probablePlanning(list,form.nom);
      if(match){
        pending.set(String(cid),{type:'attach',match:match,form:form});
        setBox('✓ Chantier trouvé dans Planning','Rattachement prêt avec « '+(match.nom||form.nom)+' ». Cliquez Enregistrer pour valider.');
      }else{
        pending.set(String(cid),{type:'create',form:form});
        setBox('✓ Création Planning prête','Aucun chantier correspondant trouvé. Cliquez Enregistrer pour créer/rattacher ce chantier dans Planning.');
      }
    }catch(e){
      pending.delete(String(cid));
      if(btn){btn.disabled=false;btn.textContent='Créer / rattacher au Planning';btn.style.opacity='1';}
      const state=document.getElementById('editPlanningState');
      const note=document.getElementById('editPlanningNote');
      if(state){state.textContent='Planning non vérifié';state.style.color='var(--amber)';}
      if(note)note.textContent='Vérification Planning impossible : '+String(e&&e.message||e);
      if(typeof toast==='function')toast('Planning indisponible',true);
    }
  };

  window.saveExistingChantier=async function(cid){
    const c=getChantier(cid);if(!c)return;
    const form=readForm();if(!form.ok)return;
    const btn=document.getElementById('editChSave');
    if(btn){btn.disabled=true;btn.textContent='Enregistrement…';}

    const backup={
      nom:c.nom,dateSignature:c.dateSignature,dateDemarrageEstime:c.dateDemarrageEstime,
      montantMarcheHT:c.montantMarcheHT,planningPresent:c.planningPresent,
      sourcePlanningId:c.sourcePlanningId,planningNom:c.planningNom
    };

    try{
      applyForm(c,form);
      const action=pending.get(String(cid));
      if(action&&action.type==='attach'){
        c.planningPresent=true;
        c.sourcePlanningId=action.match&&action.match.id?String(action.match.id):'';
        c.planningNom=(action.match&&action.match.nom)||c.nom;
      }else if(action&&action.type==='create'){
        await createPlanning(c);
      }

      const ok=await apiPost('setChantiers',S.chantiers);
      if(!ok)throw new Error('Enregistrement Yaya impossible');

      pending.delete(String(cid));
      if(typeof closeModal==='function')closeModal();
      if(typeof render==='function')render();
      if(typeof toast==='function')toast('Chantier mis à jour ✓');
    }catch(e){
      Object.assign(c,backup);
      if(btn){btn.disabled=false;btn.textContent='Enregistrer';}
      if(typeof toast==='function')toast('Enregistrement impossible : '+String(e&&e.message||e),true);
    }
  };

  function wrapOpen(){
    const original=window.openExistingChantierModal;
    if(typeof original!=='function'||original.__yayaPlanningSaveConfirm)return false;
    const wrapped=function(cid){
      pending.delete(String(cid));
      return original.apply(this,arguments);
    };
    wrapped.__yayaPlanningSaveConfirm=true;
    if(original.__planningStatusFixedV2)wrapped.__planningStatusFixedV2=true;
    window.openExistingChantierModal=wrapped;
    return true;
  }

  function install(){
    if(!wrapOpen())setTimeout(install,180);
  }
  install();
})();
