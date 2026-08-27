(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-edit-style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent='\n      #yayaCreateChantierBtn,#yayaCreateChantierWrap{display:none!important;}\n      #pane-chantiers button[onclick*="delChantier"],#pane-chantiers .chantier-delete-btn{display:none!important;}\n      .yaya-edit-chantier-btn{margin-left:auto!important;padding:5px 10px!important;font-size:11.5px!important;white-space:nowrap!important;}\n      .yaya-delete-chantier-modal-btn{margin-right:auto!important;background:#fff1f0!important;border:1px solid #e6a09a!important;color:#b42318!important;font-weight:750!important;}\n      .yaya-delete-chantier-modal-btn:hover{background:#fee4e2!important;border-color:#cf6d64!important;}\n      .yaya-planning-box{display:grid;gap:6px;padding:10px;border:1px solid rgba(22,45,73,.14);border-radius:8px;background:#fafbfd;}\n      .yaya-planning-state{font-size:12px;font-weight:700;}\n      .yaya-planning-note{font-size:11px;opacity:.65;line-height:1.35;}\n      @media(max-width:640px){.yaya-edit-chantier-btn{margin-left:0!important}.yaya-chantier-edit-modal{max-width:calc(100vw - 16px)!important;padding:14px!important}.yaya-delete-chantier-modal-btn{width:100%!important;margin:0 0 8px!important}.yaya-chantier-edit-modal .mfoot{flex-wrap:wrap!important}}\n    ';
    document.head.appendChild(style);
  }

  function ready(){
    try{return typeof S!=='undefined'&&Array.isArray(S.chantiers)&&typeof apiPost==='function'&&typeof render==='function';}
    catch(e){return false;}
  }

  function escAttr(v){
    return String(v==null?'':v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function getChantier(cid){
    try{return S.chantiers.find(c=>String(c.id)===String(cid))||null;}catch(e){return null;}
  }

  function cidFromCard(card){
    if(!card)return '';
    const el=card.querySelector('[onclick*="editMontantDevis"]');
    const s=el&&el.getAttribute('onclick')||'';
    const m=s.match(/editMontantDevis\(['\"]([^'\"]+)/);
    return m?m[1]:'';
  }

  function monthValue(v){
    const s=String(v||'').trim();
    let m=s.match(/^(\d{4})-(\d{2})/);
    if(m)return m[1]+'-'+m[2];
    const clean=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const y=(clean.match(/(20\d{2})/)||[])[1];
    if(!y)return '';
    const months=[['janv',1],['fevr',2],['mars',3],['avr',4],['mai',5],['juin',6],['juil',7],['aout',8],['sept',9],['oct',10],['nov',11],['dec',12]];
    const found=months.find(x=>clean.includes(x[0]));
    return found?y+'-'+String(found[1]).padStart(2,'0'):'';
  }

  function dateValue(v){
    const s=String(v||'').trim();
    const m=s.match(/^(\d{4}-\d{2}-\d{2})/);
    return m?m[1]:'';
  }

  function normaliseNom(s){
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  }

  function probablePlanning(liste,nom){
    const k=normaliseNom(nom);if(!k)return null;
    const exact=(liste||[]).find(p=>normaliseNom(p&&p.nom)===k);if(exact)return exact;
    return (liste||[]).find(p=>{const q=normaliseNom(p&&p.nom);return q&&Math.min(q.length,k.length)>=5&&(q.includes(k)||k.includes(q));})||null;
  }

  function planningRequest(params){
    return new Promise((resolve,reject)=>{
      let api='';
      try{api=PLANNING_API;}catch(e){}
      if(!api)return reject(new Error('API Planning indisponible'));
      const callback='yayaEditPlanning_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');let fini=false;
      const timer=setTimeout(()=>done(new Error('Planning indisponible')),15000);
      function done(err,data){
        if(fini)return;fini=true;clearTimeout(timer);
        if(script.parentNode)script.parentNode.removeChild(script);
        try{delete window[callback];}catch(_){window[callback]=undefined;}
        err?reject(err):resolve(data);
      }
      window[callback]=data=>done(null,data);
      script.onerror=()=>done(new Error('Impossible de joindre Planning'));
      const q=new URLSearchParams(Object.assign({},params,{callback:callback,_ts:String(Date.now())}));
      script.src=api+'?'+q.toString();script.async=true;document.head.appendChild(script);
    });
  }

  async function createPlanning(c){
    const d=c.dateDemarrageEstime||'';
    const r=await planningRequest({action:'createChantier',nom:c.nom,dateDebut:d,dateFin:d,description:'',couleur:'',dateSignature:c.dateSignature||'',typeChantier:'Rénovation'});
    if(!r||!r.success)throw new Error(r&&r.error?r.error:'Création Planning impossible');
    let pid=r.id||r.chantierId||(r.data&&r.data.id)||(r.chantier&&r.chantier.id)||'';
    if(!pid){
      try{
        const liste=await getChantiersPlanning();
        const p=probablePlanning(liste,c.nom);if(p&&p.id)pid=p.id;
      }catch(e){}
    }
    c.planningPresent=true;
    c.sourcePlanningId=pid?String(pid):'';
    c.planningNom=c.nom;
  }

  function valuesToChantier(c){
    const nom=document.getElementById('editChNom');
    const sig=document.getElementById('editChSignature');
    const dem=document.getElementById('editChDemarrage');
    const mt=document.getElementById('editChMarcheHT');
    if(!nom||!sig||!dem||!mt)return {ok:false};
    const name=nom.value.trim();
    if(!name){toast('Indique le nom du chantier',true);nom.focus();return {ok:false};}
    const brut=String(mt.value||'0').trim().replace(/\s/g,'').replace(',','.');
    const montant=Number(brut||0);
    if(!Number.isFinite(montant)||montant<0){toast('Chiffre d’affaires HT invalide',true);mt.focus();return {ok:false};}
    c.nom=name;
    c.dateSignature=sig.value||'';
    c.dateDemarrageEstime=dem.value||'';
    c.montantMarcheHT=montant;
    return {ok:true};
  }

  function refreshPlanningBox(c,message){
    const state=document.getElementById('editPlanningState');
    const btn=document.getElementById('editPlanningBtn');
    const note=document.getElementById('editPlanningNote');
    if(!state||!btn||!note)return;
    const present=!!(c.planningPresent||c.sourcePlanningId);
    if(present){
      state.textContent='✓ Présent dans Planning';
      state.style.color='var(--green)';
      btn.textContent='Présent dans Planning';btn.disabled=true;btn.style.opacity='.6';
      note.textContent=message||'Le retrait se fait uniquement par archivage dans Planning.';
    }else{
      state.textContent='— Pas présent dans Planning';
      state.style.color='var(--amber)';
      btn.textContent='Créer / rattacher au Planning';btn.disabled=false;btn.style.opacity='1';
      note.textContent=message||'Yaya vérifiera d’abord si un chantier correspondant existe déjà dans Planning.';
    }
  }

  window.saveExistingChantier=async function(cid){
    const c=getChantier(cid);if(!c)return;
    if(!valuesToChantier(c).ok)return;
    const btn=document.getElementById('editChSave');if(btn){btn.disabled=true;btn.textContent='Enregistrement…';}
    const ok=await apiPost('setChantiers',S.chantiers);
    if(ok){closeModal();render();toast('Chantier mis à jour ✓');}
    else if(btn){btn.disabled=false;btn.textContent='Enregistrer';}
  };

  window.deleteExistingChantier=async function(cid){
    const avant=S.chantiers.length;
    await delChantier(cid);
    if(S.chantiers.length<avant)closeModal();
  };

  window.sendExistingChantierToPlanning=async function(cid){
    const c=getChantier(cid);if(!c||c.planningPresent||c.sourcePlanningId)return;
    if(!valuesToChantier(c).ok)return;
    const btn=document.getElementById('editPlanningBtn');
    if(btn){btn.disabled=true;btn.textContent='Vérification du Planning…';}
    try{
      const liste=await getChantiersPlanning();
      const probable=probablePlanning(liste,c.nom);
      if(probable){
        const ok=confirm('⚠ Probable chantier déjà présent dans Planning : « '+(probable.nom||c.nom)+' ».\n\nRattacher cette fiche Yaya au chantier Planning existant ?');
        if(!ok){refreshPlanningBox(c,'Rattachement annulé. Aucun doublon n’a été créé.');return;}
        c.planningPresent=true;
        c.sourcePlanningId=probable.id?String(probable.id):'';
        c.planningNom=probable.nom||c.nom;
        await apiPost('setChantiers',S.chantiers);
        refreshPlanningBox(c,'Rattaché au chantier Planning existant : '+(probable.nom||c.nom)+'.');
        render();toast('Chantier rattaché au Planning ✓');return;
      }
      const creer=confirm('Ce chantier n’est pas trouvé dans Planning.\n\nLe créer maintenant dans Planning ?');
      if(!creer){refreshPlanningBox(c);return;}
      const saved=await apiPost('setChantiers',S.chantiers);
      if(!saved)throw new Error('Impossible d’enregistrer les modifications Yaya');
      await createPlanning(c);
      await apiPost('setChantiers',S.chantiers);
      refreshPlanningBox(c,'Chantier créé dans Planning. Le statut est maintenant verrouillé.');
      render();toast('Chantier créé dans Planning ✓');
    }catch(e){
      c.planningPresent=false;c.sourcePlanningId='';
      refreshPlanningBox(c,'Erreur : '+(e&&e.message?e.message:'Planning indisponible'));
      toast('Impossible de créer dans Planning : '+(e&&e.message?e.message:'erreur'),true);
    }
  };

  window.openExistingChantierModal=function(cid){
    const c=getChantier(cid);if(!c)return;
    const root=document.getElementById('modalRoot');if(!root)return;
    const present=!!(c.planningPresent||c.sourcePlanningId);
    root.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal yaya-chantier-edit-modal" style="max-width:520px">'
      +'<h5>Modifier le chantier<button onclick="closeModal()" aria-label="Fermer">×</button></h5>'
      +'<div style="display:grid;gap:12px;margin-top:16px">'
      +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Nom du chantier<input class="inp" id="editChNom" autocomplete="off" value="'+escAttr(c.nom||'')+'"></label>'
      +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Signé le <span style="font-size:11px;font-weight:400;opacity:.65">mois et année</span><input class="inp" id="editChSignature" type="month" value="'+escAttr(monthValue(c.dateSignature))+'"></label>'
      +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Démarrage estimé <span style="font-size:11px;font-weight:400;opacity:.65">date complète</span><input class="inp" id="editChDemarrage" type="date" value="'+escAttr(dateValue(c.dateDemarrageEstime||c.dateDebut))+'"></label>'
      +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Chiffre d’affaires HT <span style="font-size:11px;font-weight:400;opacity:.65">montant officiel du marché</span><input class="inp" id="editChMarcheHT" type="number" min="0" step="0.01" inputmode="decimal" value="'+escAttr(Number(c.montantMarcheHT)||0)+'"></label>'
      +'<div class="yaya-planning-box"><span class="yaya-planning-state" id="editPlanningState">'+(present?'✓ Présent dans Planning':'— Pas présent dans Planning')+'</span>'
      +'<button class="btn2" id="editPlanningBtn" type="button" onclick="sendExistingChantierToPlanning(\''+escAttr(cid)+'\')">'+(present?'Présent dans Planning':'Créer / rattacher au Planning')+'</button>'
      +'<span class="yaya-planning-note" id="editPlanningNote">'+(present?'Le retrait se fait uniquement par archivage dans Planning.':'Yaya vérifiera d’abord les doublons avant toute création.')+'</span></div>'
      +'</div>'
      +'<div class="mfoot" style="justify-content:flex-end"><button class="btn2 yaya-delete-chantier-modal-btn" type="button" onclick="deleteExistingChantier(\''+escAttr(cid)+'\')">Supprimer le chantier</button><button class="btn2" type="button" onclick="closeModal()">Annuler</button><button class="btnp go" id="editChSave" type="button" onclick="saveExistingChantier(\''+escAttr(cid)+'\')">Enregistrer</button></div>'
      +'</div></div>';
    refreshPlanningBox(c);
  };

  function decorateCards(){
    if(!ready())return;
    const pane=document.getElementById('pane-chantiers');if(!pane)return;
    pane.querySelectorAll('button[onclick*="delChantier"],.chantier-delete-btn').forEach(btn=>btn.remove());
    pane.querySelectorAll('.card').forEach(card=>{
      if(card.querySelector('.yaya-edit-chantier-btn'))return;
      const cid=cidFromCard(card);if(!cid)return;
      const c=getChantier(cid);if(!c||String(cid).startsWith('__'))return;
      const toolbar=card.querySelector('.chantier-fin-toolbar');
      if(!toolbar)return;
      const btn=document.createElement('button');
      btn.type='button';btn.className='btn2 yaya-edit-chantier-btn';btn.textContent='✏️ Modifier chantier';
      btn.addEventListener('click',()=>openExistingChantierModal(cid));
      toolbar.appendChild(btn);
    });
  }

  function install(){
    if(!ready())return setTimeout(install,150);
    decorateCards();
    const obs=new MutationObserver(()=>decorateCards());
    obs.observe(document.documentElement,{childList:true,subtree:true});
  }
  install();
})();
