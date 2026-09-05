(function(){
  'use strict';

  if(window.__yayaPlanningUiCleanupInstalled)return;
  window.__yayaPlanningUiCleanupInstalled=true;

  const STYLE_ID='yaya-planning-ui-cleanup-style';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-planning-box,
      #editPlanningState,
      #editPlanningBtn,
      #editPlanningNote,
      #chPlanningToggle{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function cleanPlanningBlocks(){
    document.querySelectorAll('.yaya-planning-box').forEach(function(el){el.remove();});

    const toggle=document.getElementById('chPlanningToggle');
    if(toggle){
      const block=toggle.closest('div');
      if(block)block.remove();
      else toggle.remove();
    }
  }

  function installCreationModal(){
    window.openChantierModal=function(){
      const root=document.getElementById('modalRoot');
      if(!root)return;

      root.innerHTML=''
        +'<div class="overlay" onclick="if(event.target===this)closeModal()">'
        +'<div class="modal" style="max-width:520px">'
        +'<h5>Créer un chantier<button onclick="closeModal()" aria-label="Fermer">×</button></h5>'
        +'<div style="display:grid;gap:12px;margin-top:16px">'
        +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Nom du chantier<input class="inp" id="chNom" autocomplete="off" placeholder="Nom client / chantier"></label>'
        +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Signé le <span style="font-size:11px;font-weight:400;opacity:.65">mois et année uniquement</span><input class="inp" id="chSignature" type="month"></label>'
        +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Démarrage estimé <span style="font-size:11px;font-weight:400;opacity:.65">date complète — facultatif</span><input class="inp" id="chDemarrage" type="date"></label>'
        +'<label style="display:grid;gap:5px;font-size:12px;font-weight:700">Chiffre d’affaires HT <span style="font-size:11px;font-weight:400;opacity:.65">montant officiel du marché</span><input class="inp" id="chMarcheHT" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0,00 €"></label>'
        +'</div>'
        +'<div class="mfoot" style="justify-content:flex-end">'
        +'<button class="btn2" type="button" onclick="closeModal()">Annuler</button>'
        +'<button class="btnp go" type="button" id="chCreateBtn" onclick="addChantier()">Créer le chantier</button>'
        +'</div></div></div>';

      setTimeout(function(){
        const el=document.getElementById('chNom');
        if(el)el.focus();
      },0);
    };

    window.addChantier=async function(){
      const nomEl=document.getElementById('chNom');
      const sigEl=document.getElementById('chSignature');
      const demEl=document.getElementById('chDemarrage');
      const mtEl=document.getElementById('chMarcheHT');
      if(!nomEl||!sigEl||!demEl||!mtEl)return;

      const nom=String(nomEl.value||'').trim();
      const dateSignature=String(sigEl.value||'');
      const dateDemarrageEstime=String(demEl.value||'');
      const brut=String(mtEl.value||'').trim().replace(/\s/g,'').replace(',','.');

      if(!nom){
        if(typeof toast==='function')toast('Indique le nom du chantier',true);
        try{nomEl.focus();}catch(e){}
        return;
      }
      if(!/^\d{4}-\d{2}$/.test(dateSignature)){
        if(typeof toast==='function')toast('Indique le mois et l’année de signature',true);
        try{sigEl.focus();}catch(e){}
        return;
      }
      if(brut===''){
        if(typeof toast==='function')toast('Indique le chiffre d’affaires HT',true);
        try{mtEl.focus();}catch(e){}
        return;
      }

      const montantMarcheHT=Number(brut);
      if(!Number.isFinite(montantMarcheHT)||montantMarcheHT<0){
        if(typeof toast==='function')toast('Chiffre d’affaires HT invalide',true);
        try{mtEl.focus();}catch(e){}
        return;
      }

      const btn=document.getElementById('chCreateBtn');
      if(btn){
        btn.disabled=true;
        btn.textContent='Création…';
      }

      const chantier={
        id:typeof uid==='function'?uid():('ch_'+Date.now()),
        nom:nom,
        numero:'',
        montantDevisHT:0,
        montantMarcheHT:montantMarcheHT,
        dateSignature:dateSignature,
        dateDemarrageEstime:dateDemarrageEstime||'',
        statut:'En cours',
        notes:'',
        planningPresent:false,
        sourcePlanningId:''
      };

      try{
        S.chantiers.push(chantier);
        try{if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.clear==='function')expChantiers.clear();}catch(e){}
        try{tab='chantiers';}catch(e){}
        if(typeof closeModal==='function')closeModal();
        if(typeof render==='function')render();

        const ok=await apiPost('setChantiers',S.chantiers);
        if(!ok)throw new Error('Enregistrement Yaya impossible');

        if(typeof toast==='function')toast('Chantier créé ✓');
        return chantier;
      }catch(e){
        S.chantiers=S.chantiers.filter(function(c){return String(c.id)!==String(chantier.id);});
        if(typeof render==='function')render();
        if(btn){btn.disabled=false;btn.textContent='Créer le chantier';}
        if(typeof toast==='function')toast('Création impossible : '+String(e&&e.message||e),true);
        return null;
      }
    };
  }

  function observeModals(){
    const root=document.getElementById('modalRoot')||document.body;
    if(!root)return;
    const observer=new MutationObserver(function(){cleanPlanningBlocks();});
    observer.observe(root,{childList:true,subtree:true});
  }

  function install(){
    installStyle();
    installCreationModal();
    cleanPlanningBlocks();
    observeModals();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
