(function(){
  'use strict';

  let suppressionEnCours=false;
  let dernierDeclenchement=0;

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

  function confirmationCentree(id){
    return new Promise(function(resolve){
      const c=getChantier(id);
      if(!c){resolve(false);return;}

      const nb=Array.isArray(S.achats)
        ?S.achats.filter(function(a){return String(a.chantierId)===String(id);}).length
        :0;
      const hh=Array.isArray(S.heures)
        ?S.heures.filter(function(h){return h.type==='chantier'&&String(h.ref)===String(id);})
          .reduce(function(t,h){return t+(Number(h.heures)||0);},0)
        :0;

      document.querySelectorAll('.yaya-chantier-delete-overlay').forEach(function(x){x.remove();});

      const overlay=document.createElement('div');
      overlay.className='yaya-chantier-delete-overlay';
      overlay.style.cssText='position:fixed;inset:0;z-index:60000;background:rgba(15,23,42,.48);display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto;pointer-events:auto;touch-action:manipulation';
      overlay.innerHTML=''
        +'<div role="dialog" aria-modal="true" aria-labelledby="yayaChDeleteTitle" style="width:min(430px,calc(100vw - 36px));max-width:430px;background:#fff;border-radius:14px;padding:22px;box-shadow:0 22px 65px rgba(15,23,42,.30);margin:auto;position:relative">'
        +'<div id="yayaChDeleteTitle" style="font-size:18px;font-weight:800;color:#162D49;text-align:center;margin-bottom:12px">Supprimer le chantier ?</div>'
        +'<div style="font-size:14px;line-height:1.5;color:#334155;text-align:center;margin-bottom:14px">Confirmer la suppression de <b>« '+esc(c.nom||'Chantier')+' »</b> ?</div>'
        +(nb?'<div style="font-size:12.5px;line-height:1.45;color:#9a3412;margin:5px 0">• '+nb+' achat'+(nb>1?'s':'')+' / charge'+(nb>1?'s':'')+' lié'+(nb>1?'s':'')+' sera'+(nb>1?'ont':'')+' aussi supprimé'+(nb>1?'s':'')+'.</div>':'')
        +(hh?'<div style="font-size:12.5px;line-height:1.45;color:#64748b;margin:5px 0">• '+hh+' h saisies resteront dans l’historique des heures.</div>':'')
        +'<div style="font-size:12px;color:#64748b;text-align:center;margin-top:12px">Cette action est définitive dans Yaya.</div>'
        +'<div style="display:flex;gap:10px;justify-content:center;margin-top:20px">'
        +'<button type="button" data-cancel style="min-width:120px;min-height:42px;padding:9px 16px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:700;font-family:inherit;touch-action:manipulation">Annuler</button>'
        +'<button type="button" data-confirm style="min-width:120px;min-height:42px;padding:9px 16px;border-radius:8px;border:1px solid #b42318;background:#b42318;color:#fff;font-weight:800;font-family:inherit;touch-action:manipulation">Supprimer</button>'
        +'</div></div>';

      let fini=false;
      function done(value){
        if(fini)return;
        fini=true;
        if(overlay.parentNode)overlay.remove();
        resolve(value);
      }

      overlay.querySelector('[data-cancel]').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();done(false);});
      overlay.querySelector('[data-confirm]').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();done(true);});
      overlay.addEventListener('click',function(e){if(e.target===overlay)done(false);});

      document.body.appendChild(overlay);
      requestAnimationFrame(function(){
        const b=overlay.querySelector('[data-cancel]');
        if(b)b.focus({preventScroll:true});
      });
    });
  }

  async function supprimerApresValidation(id){
    id=String(id||'').trim();
    if(!id||suppressionEnCours)return;

    const c=getChantier(id);
    if(!c){
      if(typeof toast==='function')toast('Chantier introuvable',true);
      return;
    }

    const confirme=await confirmationCentree(id);
    if(!confirme)return;

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
    if(document.documentElement.dataset.yayaDeleteChantierCaptureV4==='1')return;
    document.documentElement.dataset.yayaDeleteChantierCaptureV4='1';

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
