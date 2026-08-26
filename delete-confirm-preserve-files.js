(function(){
  'use strict';

  function confirmationSuppression(type){
    return new Promise(function(resolve){
      const isDoc=type==='document';
      const overlay=document.createElement('div');
      overlay.className='yaya-delete-preserve-overlay';
      overlay.style.cssText='position:fixed;inset:0;background:rgba(22,45,73,.45);z-index:9500;display:flex;align-items:center;justify-content:center;padding:16px';
      overlay.innerHTML=''
        +'<div style="background:#fff;border-radius:14px;padding:22px;max-width:390px;width:100%;box-shadow:0 14px 45px rgba(0,0,0,.22);text-align:left">'
        +'<div style="font-size:16px;font-weight:800;color:#162D49;margin-bottom:10px">Supprimer '+(isDoc?'ce document':'cette dépense')+' de Yaya ?</div>'
        +'<div style="font-size:13px;line-height:1.5;color:#556579;margin-bottom:16px">'
        +'<b style="color:#2E7D46">Suppression Yaya uniquement.</b><br>'
        +'Le fichier restera conservé dans le dossier chantier sur Dropbox / Drive. Il ne sera pas supprimé ni déplacé.'
        +'</div>'
        +'<div style="display:flex;gap:9px;justify-content:flex-end">'
        +'<button type="button" data-yaya-delete-cancel style="padding:9px 14px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:700;cursor:pointer">Annuler</button>'
        +'<button type="button" data-yaya-delete-ok style="padding:9px 14px;border-radius:8px;border:0;background:#dc2626;color:#fff;font-weight:700;cursor:pointer">Supprimer de Yaya</button>'
        +'</div></div>';

      function close(value){
        if(overlay.parentNode)overlay.parentNode.removeChild(overlay);
        resolve(value);
      }

      overlay.querySelector('[data-yaya-delete-cancel]').onclick=function(){close(false);};
      overlay.querySelector('[data-yaya-delete-ok]').onclick=function(){close(true);};
      overlay.onclick=function(e){if(e.target===overlay)close(false);};
      document.body.appendChild(overlay);
      setTimeout(function(){
        const btn=overlay.querySelector('[data-yaya-delete-cancel]');
        if(btn)btn.focus();
      },0);
    });
  }

  window.delDocument=async function(id){
    if(!Array.isArray(S.documents)||!S.documents.some(function(x){return String(x.id)===String(id);} ))return;
    const ok=await confirmationSuppression('document');
    if(!ok)return;
    S.documents=S.documents.filter(function(x){return String(x.id)!==String(id);});
    render();
    if(await apiPost('setDocuments',S.documents)){
      toast('Document supprimé de Yaya — fichier conservé dans le dossier chantier ✓');
    }
  };

  window.delAchat=async function(id){
    if(!Array.isArray(S.achats)||!S.achats.some(function(x){return String(x.id)===String(id);} ))return;
    const ok=await confirmationSuppression('depense');
    if(!ok)return;
    S.achats=S.achats.filter(function(x){return String(x.id)!==String(id);});
    render();
    if(await apiPost('setAchats',S.achats)){
      toast('Dépense supprimée de Yaya — fichier conservé dans le dossier chantier ✓');
    }
  };
})();
