(function(){
  'use strict';

  const CONFIRM_ID='yaya-delete-chantier-confirm';
  let suppressionEnCours=false;

  function toastMsg(message,isError){
    try{
      if(typeof window.toast==='function')window.toast(message,!!isError);
      else if(isError)console.error(message);
      else console.log(message);
    }catch(e){}
  }

  function getChantier(id){
    try{
      return Array.isArray(S&&S.chantiers)
        ?S.chantiers.find(function(c){return String(c&&c.id)===String(id);})||null
        :null;
    }catch(e){return null;}
  }

  function countAchats(id){
    try{
      return Array.isArray(S&&S.achats)
        ?S.achats.filter(function(a){return String(a&&a.chantierId)===String(id);}).length
        :0;
    }catch(e){return 0;}
  }

  function countHeures(id){
    try{
      if(typeof window.heuresChantier==='function')return Number(window.heuresChantier(id))||0;
      if(typeof heuresChantier==='function')return Number(heuresChantier(id))||0;
    }catch(e){}
    return 0;
  }

  function closeConfirm(){
    const old=document.getElementById(CONFIRM_ID);
    if(old)old.remove();
  }

  function askConfirmation(id){
    closeConfirm();
    const c=getChantier(id);
    if(!c){
      toastMsg('Chantier introuvable',true);
      return Promise.resolve(false);
    }

    const nb=countAchats(id);
    const hh=countHeures(id);

    return new Promise(function(resolve){
      const overlay=document.createElement('div');
      overlay.id=CONFIRM_ID;
      overlay.style.cssText='position:fixed;inset:0;z-index:50000;background:rgba(22,45,73,.52);display:flex;align-items:center;justify-content:center;padding:18px;';

      const box=document.createElement('div');
      box.setAttribute('role','dialog');
      box.setAttribute('aria-modal','true');
      box.style.cssText='width:min(430px,100%);background:#fff;border-radius:14px;padding:20px;box-shadow:0 18px 55px rgba(0,0,0,.30);color:#162d49;font-family:inherit;';

      const title=document.createElement('div');
      title.textContent='Supprimer ce chantier ?';
      title.style.cssText='font-size:18px;font-weight:800;margin-bottom:10px;';

      const text=document.createElement('div');
      text.style.cssText='font-size:14px;line-height:1.5;color:#344861;';
      const strong=document.createElement('strong');
      strong.textContent=String(c.nom||'Chantier');
      text.appendChild(document.createTextNode('Le chantier « '));
      text.appendChild(strong);
      text.appendChild(document.createTextNode(' » sera supprimé de Yaya.'));

      if(nb){
        const p=document.createElement('div');
        p.style.marginTop='8px';
        p.textContent='• '+nb+' achat'+(nb>1?'s':'')+' lié'+(nb>1?'s':'')+' sera'+(nb>1?'ont':'')+' également supprimé'+(nb>1?'s':'')+'.';
        text.appendChild(p);
      }
      if(hh){
        const p=document.createElement('div');
        p.style.marginTop='4px';
        p.textContent='• '+hh+' h saisies resteront dans l’historique des heures.';
        text.appendChild(p);
      }

      const warning=document.createElement('div');
      warning.textContent='Cette action est définitive.';
      warning.style.cssText='margin-top:12px;font-size:12.5px;font-weight:700;color:#b42318;';

      const actions=document.createElement('div');
      actions.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px;';

      const cancel=document.createElement('button');
      cancel.type='button';
      cancel.textContent='Annuler';
      cancel.style.cssText='min-height:44px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#162d49;font:inherit;font-weight:700;cursor:pointer;';

      const confirm=document.createElement('button');
      confirm.type='button';
      confirm.textContent='Supprimer';
      confirm.style.cssText='min-height:44px;border:1px solid #b42318;border-radius:9px;background:#b42318;color:#fff;font:inherit;font-weight:800;cursor:pointer;';

      let finished=false;
      function finish(value){
        if(finished)return;
        finished=true;
        document.removeEventListener('keydown',onKey,true);
        closeConfirm();
        resolve(value);
      }
      function onKey(e){
        if(e.key==='Escape'){
          e.preventDefault();
          finish(false);
        }
      }

      cancel.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();finish(false);});
      confirm.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        confirm.disabled=true;
        confirm.textContent='Suppression…';
        finish(true);
      });
      overlay.addEventListener('click',function(e){if(e.target===overlay)finish(false);});
      document.addEventListener('keydown',onKey,true);

      actions.append(cancel,confirm);
      box.append(title,text,warning,actions);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      requestAnimationFrame(function(){try{cancel.focus();}catch(e){}});
    });
  }

  async function persistDeletion(id){
    if(suppressionEnCours)return false;
    suppressionEnCours=true;

    const oldChantiers=Array.isArray(S.chantiers)?S.chantiers.slice():[];
    const oldAchats=Array.isArray(S.achats)?S.achats.slice():[];
    const oldAvenants=Array.isArray(S.avenants)?S.avenants.slice():[];

    const hadAvenants=oldAvenants.some(function(v){return String(v&&v.chantierId)===String(id);});

    try{
      S.chantiers=oldChantiers.filter(function(x){return String(x&&x.id)!==String(id);});
      S.achats=oldAchats.filter(function(a){return String(a&&a.chantierId)!==String(id);});
      S.avenants=oldAvenants.filter(function(v){return String(v&&v.chantierId)!==String(id);});

      if(typeof render==='function')render();

      const ok1=await apiPost('setChantiers',S.chantiers);
      const ok2=ok1?await apiPost('setAchats',S.achats):false;
      const ok3=(ok1&&ok2&&hadAvenants)?await apiPost('setAvenants',S.avenants):true;

      if(!(ok1&&ok2&&ok3))throw new Error('Enregistrement incomplet');

      try{
        if(typeof window.closeModal==='function')window.closeModal();
        else if(typeof closeModal==='function')closeModal();
      }catch(e){}

      toastMsg('Chantier supprimé ✓',false);
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
      return true;
    }catch(err){
      S.chantiers=oldChantiers;
      S.achats=oldAchats;
      S.avenants=oldAvenants;
      try{
        await apiPost('setChantiers',oldChantiers);
        await apiPost('setAchats',oldAchats);
        if(hadAvenants)await apiPost('setAvenants',oldAvenants);
      }catch(e){}
      if(typeof render==='function')render();
      toastMsg('Suppression non enregistrée — chantier conservé',true);
      console.error('Suppression chantier:',err);
      return false;
    }finally{
      suppressionEnCours=false;
    }
  }

  async function supprimerChantier(id){
    id=String(id||'').trim();
    if(!id||suppressionEnCours)return false;
    if(!getChantier(id)){
      toastMsg('Chantier introuvable',true);
      return false;
    }

    const confirmed=await askConfirmation(id);
    if(!confirmed)return false;
    return persistDeletion(id);
  }

  function install(){
    window.delChantier=supprimerChantier;
    window.deleteExistingChantier=supprimerChantier;
  }

  closeConfirm();
  install();
  window.addEventListener('yaya:data-refreshed',install);
})();
