(function(){
  'use strict';

  let suppressionEnCours=false;
  let dernierDeclenchement=0;

  function ready(){
    try{
      return typeof S!=='undefined' && Array.isArray(S.chantiers) &&
        typeof apiPost==='function' && typeof render==='function';
    }catch(e){return false;}
  }

  function getChantier(id){
    try{
      return S.chantiers.find(function(c){return String(c.id)===String(id);})||null;
    }catch(e){return null;}
  }

  function idDepuisBouton(btn){
    if(!btn)return '';
    let id=String(btn.dataset.yayaChantierId||'').trim();
    if(id)return id;

    const code=String(btn.getAttribute('onclick')||'');
    let m=code.match(/deleteExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    if(m&&m[1])return m[1];

    const modal=btn.closest('.yaya-chantier-edit-modal,.modal');
    const save=modal&&modal.querySelector('[onclick*="saveExistingChantier"]');
    const saveCode=String(save&&save.getAttribute('onclick')||'');
    m=saveCode.match(/saveExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    return m&&m[1]?m[1]:'';
  }

  function estBoutonSuppression(target){
    if(!target||!target.closest)return null;
    const btn=target.closest('button');
    if(!btn)return null;
    if(btn.classList.contains('yaya-delete-chantier-modal-btn'))return btn;
    if(!btn.closest('.yaya-chantier-edit-modal'))return null;
    const texte=String(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    return texte==='supprimer le chantier'?btn:null;
  }

  function confirmationNative(id){
    const c=getChantier(id);
    if(!c)return false;
    const nb=Array.isArray(S.achats)
      ?S.achats.filter(function(a){return String(a.chantierId)===String(id);}).length
      :0;
    const hh=Array.isArray(S.heures)
      ?S.heures.filter(function(h){return h.type==='chantier'&&String(h.ref)===String(id);})
        .reduce(function(t,h){return t+(Number(h.heures)||0);},0)
      :0;

    let msg='Supprimer le chantier « '+String(c.nom||'Chantier')+' » ?';
    if(nb)msg+='\n\n• Ses '+nb+' achat(s) / charge(s) seront supprimés aussi.';
    if(hh)msg+='\n• Ses '+hh+' h saisies resteront dans l’historique des heures.';
    msg+='\n\nCette action est définitive dans Yaya.';
    return window.confirm(msg);
  }

  async function supprimerApresValidation(id){
    id=String(id||'').trim();
    if(!id||suppressionEnCours)return;

    const c=getChantier(id);
    if(!c){
      if(typeof toast==='function')toast('Chantier introuvable',true);
      return;
    }

    if(!confirmationNative(id))return;

    suppressionEnCours=true;
    const oldChantiers=S.chantiers.slice();
    const oldAchats=Array.isArray(S.achats)?S.achats.slice():[];
    const oldAvenants=Array.isArray(S.avenants)?S.avenants.slice():[];

    S.chantiers=S.chantiers.filter(function(x){return String(x.id)!==id;});
    if(Array.isArray(S.achats)){
      S.achats=S.achats.filter(function(a){return String(a.chantierId)!==id;});
    }
    const hadAv=Array.isArray(S.avenants)&&S.avenants.some(function(v){return String(v.chantierId)===id;});
    if(Array.isArray(S.avenants)){
      S.avenants=S.avenants.filter(function(v){return String(v.chantierId)!==id;});
    }

    try{
      if(typeof closeModal==='function')closeModal();
      render();

      const ok1=await apiPost('setChantiers',S.chantiers);
      const ok2=await apiPost('setAchats',S.achats);
      let ok3=true;
      if(hadAv)ok3=await apiPost('setAvenants',S.avenants);

      if(!(ok1&&ok2&&ok3))throw new Error('enregistrement incomplet');
      if(typeof toast==='function')toast('Chantier supprimé ✓');
    }catch(e){
      S.chantiers=oldChantiers;
      S.achats=oldAchats;
      S.avenants=oldAvenants;
      render();
      if(typeof toast==='function')toast('Suppression impossible : aucune donnée n’a été supprimée',true);
    }finally{
      suppressionEnCours=false;
    }
  }

  function intercepter(event){
    const btn=estBoutonSuppression(event.target);
    if(!btn)return;

    const id=idDepuisBouton(btn);
    if(!id)return;

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    const now=Date.now();
    if(now-dernierDeclenchement<700)return;
    dernierDeclenchement=now;
    supprimerApresValidation(id);
  }

  function installCapture(){
    if(document.documentElement.dataset.yayaDeleteChantierCaptureV3==='1')return;
    document.documentElement.dataset.yayaDeleteChantierCaptureV3='1';

    window.addEventListener('pointerup',function(event){
      const btn=estBoutonSuppression(event.target);
      if(!btn)return;
      intercepter(event);
    },true);

    window.addEventListener('click',function(event){
      const btn=estBoutonSuppression(event.target);
      if(!btn)return;
      intercepter(event);
    },true);
  }

  function marquerBoutons(){
    document.querySelectorAll('.yaya-delete-chantier-modal-btn').forEach(function(btn){
      const id=idDepuisBouton(btn);
      if(id)btn.dataset.yayaChantierId=id;
      btn.style.setProperty('pointer-events','auto','important');
      btn.style.setProperty('touch-action','manipulation','important');
    });
  }

  function install(){
    if(!ready())return setTimeout(install,120);
    window.deleteExistingChantier=supprimerApresValidation;
    installCapture();
    marquerBoutons();

    const obs=new MutationObserver(function(){
      marquerBoutons();
      if(window.deleteExistingChantier!==supprimerApresValidation){
        window.deleteExistingChantier=supprimerApresValidation;
      }
    });
    obs.observe(document.documentElement,{childList:true,subtree:true});
  }

  install();
})();

(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-planning-save-confirm]'))return;
  const s=document.createElement('script');
  s.src='chantier-planning-save-confirm.js?v=planning-save-1';
  s.async=false;
  s.setAttribute('data-yaya-planning-save-confirm','1');
  document.head.appendChild(s);
})();
