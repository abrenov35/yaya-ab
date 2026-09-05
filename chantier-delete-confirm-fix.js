(function(){
  'use strict';

  let suppressionEnCours=false;

  function esc(v){
    return String(v==null?'':v)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  function ready(){
    try{
      return typeof S!=='undefined' && Array.isArray(S.chantiers) &&
        typeof apiPost==='function' && typeof render==='function';
    }catch(e){return false;}
  }

  function chantier(id){
    return S.chantiers.find(function(c){return String(c.id)===String(id);})||null;
  }

  function demanderConfirmation(id){
    return new Promise(function(resolve){
      const c=chantier(id);
      if(!c){resolve(false);return;}

      const nb=Array.isArray(S.achats)?S.achats.filter(function(a){return String(a.chantierId)===String(id);}).length:0;
      const hh=Array.isArray(S.heures)?S.heures.filter(function(h){return h.type==='chantier'&&String(h.ref)===String(id);}).reduce(function(t,h){return t+(Number(h.heures)||0);},0):0;

      const overlay=document.createElement('div');
      overlay.className='yaya-chantier-delete-overlay';
      overlay.style.cssText='position:fixed;inset:0;z-index:50000;background:rgba(22,45,73,.58);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto';
      overlay.innerHTML=''
        +'<div role="dialog" aria-modal="true" aria-labelledby="yayaChDeleteTitle" style="width:min(430px,100%);background:#fff;border-radius:14px;padding:20px;box-shadow:0 18px 55px rgba(0,0,0,.28);margin:auto">'
        +'<div id="yayaChDeleteTitle" style="font-size:17px;font-weight:800;color:#162D49;margin-bottom:10px">Supprimer le chantier ?</div>'
        +'<div style="font-size:14px;line-height:1.5;color:#334155;margin-bottom:14px">Confirmer la suppression de <b>« '+esc(c.nom||'Chantier')+' »</b> ?</div>'
        +(nb?'<div style="font-size:12.5px;color:#9a3412;margin-bottom:5px">• '+nb+' charge'+(nb>1?'s':'')+' liée'+(nb>1?'s':'')+' sera'+(nb>1?'ont':'')+' aussi supprimée'+(nb>1?'s':'')+'.</div>':'')
        +(hh?'<div style="font-size:12.5px;color:#64748b;margin-bottom:12px">• '+hh+' h saisies resteront dans l’historique des heures.</div>':'')
        +'<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap">'
        +'<button type="button" data-cancel style="padding:9px 15px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:700">Annuler</button>'
        +'<button type="button" data-confirm style="padding:9px 15px;border-radius:8px;border:1px solid #b42318;background:#b42318;color:#fff;font-weight:800">Supprimer</button>'
        +'</div></div>';

      function done(value){
        if(overlay.parentNode)overlay.remove();
        resolve(value);
      }
      overlay.querySelector('[data-cancel]').onclick=function(){done(false);};
      overlay.querySelector('[data-confirm]').onclick=function(){done(true);};
      overlay.onclick=function(e){if(e.target===overlay)done(false);};
      document.body.appendChild(overlay);
      setTimeout(function(){const b=overlay.querySelector('[data-cancel]');if(b)b.focus();},0);
    });
  }

  async function supprimerApresValidation(id){
    if(suppressionEnCours)return;
    const c=chantier(id);if(!c)return;

    const ok=await demanderConfirmation(id);
    if(!ok)return;

    suppressionEnCours=true;
    const oldChantiers=S.chantiers.slice();
    const oldAchats=Array.isArray(S.achats)?S.achats.slice():[];
    const oldAvenants=Array.isArray(S.avenants)?S.avenants.slice():[];

    S.chantiers=S.chantiers.filter(function(x){return String(x.id)!==String(id);});
    if(Array.isArray(S.achats))S.achats=S.achats.filter(function(a){return String(a.chantierId)!==String(id);});
    const hadAv=Array.isArray(S.avenants)&&S.avenants.some(function(v){return String(v.chantierId)===String(id);});
    if(Array.isArray(S.avenants))S.avenants=S.avenants.filter(function(v){return String(v.chantierId)!==String(id);});

    try{
      if(typeof closeModal==='function')closeModal();
      render();
      const ok1=await apiPost('setChantiers',S.chantiers);
      const ok2=await apiPost('setAchats',S.achats);
      let ok3=true;
      if(hadAv)ok3=await apiPost('setAvenants',S.avenants);
      if(ok1&&ok2&&ok3){
        if(typeof toast==='function')toast('Chantier supprimé ✓');
      }else{
        throw new Error('enregistrement incomplet');
      }
    }catch(e){
      S.chantiers=oldChantiers;
      S.achats=oldAchats;
      S.avenants=oldAvenants;
      render();
      if(typeof toast==='function')toast('Suppression annulée : impossible d’enregistrer',true);
    }finally{
      suppressionEnCours=false;
    }
  }

  function install(){
    if(!ready())return setTimeout(install,120);
    window.deleteExistingChantier=supprimerApresValidation;
  }

  install();
})();
