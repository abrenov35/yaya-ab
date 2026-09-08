(function(){
  'use strict';

  const STYLE_ID='yaya-commande-linked-delete-style-v2';

  function esc(v){
    const d=document.createElement('div');
    d.textContent=String(v==null?'':v);
    return d.innerHTML;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .yaya-linked-delete-overlay{
        position:fixed!important;inset:0!important;z-index:26000!important;
        background:rgba(22,45,73,.58)!important;display:flex!important;
        align-items:center!important;justify-content:center!important;
        padding:16px!important;overflow:auto!important
      }
      .yaya-linked-delete-modal{
        width:min(480px,100%)!important;max-height:calc(100vh - 32px)!important;
        overflow:auto!important;margin:auto!important;background:#fff!important;
        border-radius:14px!important;padding:20px!important;
        box-shadow:0 18px 55px rgba(0,0,0,.32)!important
      }
      .yaya-linked-delete-modal h3{margin:0 0 12px!important;font-size:18px!important;color:#162d49!important}
      .yaya-linked-delete-modal p{margin:0!important;font-size:14px!important;line-height:1.5!important;color:#334155!important}
      .yaya-linked-delete-modal-linked{
        border:3px solid #d97706!important;
        background:#fffdf8!important;
        box-shadow:0 22px 65px rgba(120,53,15,.32)!important
      }
      .yaya-linked-delete-modal-linked h3{
        color:#9a3412!important;font-size:20px!important;font-weight:900!important;
        margin-bottom:14px!important
      }
      .yaya-linked-delete-warning{
        border:2px solid #f59e0b!important;background:#fff7ed!important;
        border-radius:11px!important;padding:14px 15px!important;margin:0 0 16px!important
      }
      .yaya-linked-delete-warning-title{
        display:block!important;margin:0 0 8px!important;color:#b42318!important;
        font-size:15px!important;font-weight:900!important;letter-spacing:.02em!important
      }
      .yaya-linked-delete-warning strong{color:#7c2d12!important}
      .yaya-linked-delete-choice-label{
        display:block!important;margin-top:12px!important;padding-top:10px!important;
        border-top:1px solid #fdba74!important;color:#7c2d12!important;
        font-size:12px!important;font-weight:900!important;text-transform:uppercase!important
      }
      .yaya-linked-delete-actions{display:flex!important;justify-content:flex-end!important;gap:10px!important;margin-top:18px!important;flex-wrap:wrap!important}
      .yaya-linked-delete-actions button{min-height:44px!important;padding:10px 16px!important;border-radius:9px!important;font-weight:800!important;cursor:pointer!important}
      .yaya-linked-delete-cancel,.yaya-linked-delete-keep{border:1px solid #b8c5d4!important;background:#f8fafc!important;color:#26364b!important}
      .yaya-linked-delete-modal-linked .yaya-linked-delete-cancel{
        border:2px solid #5b7fa3!important;background:#eef5fb!important;color:#173d63!important
      }
      .yaya-linked-delete-confirm{border:1px solid #b42318!important;background:#b42318!important;color:#fff!important;font-weight:900!important}
      .yaya-linked-delete-modal-linked .yaya-linked-delete-confirm{
        border:2px solid #b42318!important;background:#c5221f!important;color:#fff!important
      }
      @media(max-width:640px){
        .yaya-linked-delete-modal{padding:17px!important}
        .yaya-linked-delete-actions{display:grid!important;grid-template-columns:1fr!important}
        .yaya-linked-delete-actions button{width:100%!important}
      }
    `;
    document.head.appendChild(s);
  }

  function endpoint(){
    try{if(typeof API!=='undefined'&&API)return String(API);}catch(e){}
    return 'https://script.google.com/macros/s/AKfycbx6IwMFf2plAq7i8qf8qF6f6MMC-1-WynAqn1ZRqCZrVqHeE9a1ygSSTzp5uOf0L3bn/exec';
  }

  async function postRows(action,rows){
    if(typeof apiPost==='function'){
      const ok=await apiPost(action,rows);
      if(ok)return true;
      throw new Error('Enregistrement Yaya refusé');
    }
    const r=await fetch(endpoint(),{
      method:'POST',cache:'no-store',
      body:JSON.stringify({action:action,data:rows})
    });
    const txt=await r.text();
    let json;
    try{json=JSON.parse(txt);}catch(e){throw new Error('Réponse Yaya invalide');}
    if(!json||json.ok!==true)throw new Error((json&&json.error)||'Enregistrement impossible');
    return true;
  }

  function commandeById(id){
    try{
      return Array.isArray(S&&S.commandes)
        ? (S.commandes.find(function(c){return String(c&&c.id||'')===String(id);})||null)
        : null;
    }catch(e){return null;}
  }

  function norm(v){return String(v==null?'':v).trim();}
  function amount(v){const n=Number(String(v==null?'':v).replace(/\s/g,'').replace(',','.'));return Number.isFinite(n)?n:0;}

  function linkedExpenses(commande){
    let achats=[];
    try{achats=Array.isArray(S&&S.achats)?S.achats:[];}catch(e){return [];}
    const cid=norm(commande&&commande.id);
    const chantierId=norm(commande&&commande.chantierId);
    const lien=norm(commande&&commande.lien);
    const montant=amount(commande&&commande.montantHT);
    const designation=norm(commande&&commande.designation||commande&&commande.pieceNom).toLowerCase();

    return achats.filter(function(a){
      if(cid&&norm(a&&a.commandeId)===cid)return true;
      if(!lien||norm(a&&a.lien)!==lien)return false;
      if(chantierId&&norm(a&&a.chantierId)!==chantierId)return false;
      if(!/commande/i.test(norm(a&&a.typeDoc)))return false;
      if(Math.abs(amount(a&&a.montantHT)-montant)>0.009)return false;
      const ad=norm(a&&a.designation).toLowerCase();
      if(designation&&ad&&designation!==ad)return false;
      return true;
    });
  }

  function ask(opts){
    installStyle();
    document.querySelectorAll('.yaya-linked-delete-overlay').forEach(function(x){x.remove();});
    return new Promise(function(resolve){
      const overlay=document.createElement('div');
      overlay.className='yaya-linked-delete-overlay';
      const linked=opts.variant==='linked';
      overlay.innerHTML='<div class="yaya-linked-delete-modal'+(linked?' yaya-linked-delete-modal-linked':'')+'" role="dialog" aria-modal="true">'
        +'<h3>'+esc(opts.title||'Confirmation')+'</h3>'
        +(linked?'<div class="yaya-linked-delete-warning">'+String(opts.html||'')+'</div>':'<p>'+String(opts.html||'')+'</p>')
        +'<div class="yaya-linked-delete-actions">'
        +'<button type="button" class="yaya-linked-delete-cancel">'+esc(opts.cancelText||'Annuler')+'</button>'
        +'<button type="button" class="yaya-linked-delete-confirm">'+esc(opts.confirmText||'Confirmer')+'</button>'
        +'</div></div>';
      function done(value){if(overlay.parentNode)overlay.remove();resolve(value);}
      overlay.querySelector('.yaya-linked-delete-cancel').onclick=function(){done(false);};
      overlay.querySelector('.yaya-linked-delete-confirm').onclick=function(){done(true);};
      overlay.addEventListener('click',function(e){if(e.target===overlay)done(false);});
      document.body.appendChild(overlay);
      setTimeout(function(){const b=overlay.querySelector('.yaya-linked-delete-cancel');if(b)b.focus();},0);
    });
  }

  function saveCache(){
    try{
      const key='YAYA_CACHE_DATA_V2';
      const raw=localStorage.getItem(key);
      const cached=raw?JSON.parse(raw):{};
      if(!cached||typeof cached!=='object')return;
      cached.commandes=Array.isArray(S&&S.commandes)?S.commandes:[];
      cached.achats=Array.isArray(S&&S.achats)?S.achats:[];
      localStorage.setItem(key,JSON.stringify(cached));
    }catch(e){}
  }

  async function deleteCommande(id){
    const commande=commandeById(id);
    if(!commande)return;

    const lies=linkedExpenses(commande);
    const libelle=norm(commande.designation||commande.pieceNom||commande.fournisseur||'cette commande');
    const ok=await ask({
      title:lies.length?'1/2 — Supprimer la commande ?':'Supprimer la commande ?',
      html:'Confirmer la suppression de <b>« '+esc(libelle)+' »</b> ?'+(lies.length?'<br><br><b>Une deuxième question concernera ensuite la dépense liée.</b>':''),
      cancelText:'Annuler',
      confirmText:'Supprimer la commande'
    });
    if(!ok)return;

    let supprimerDepense=false;
    if(lies.length){
      supprimerDepense=await ask({
        variant:'linked',
        title:'⚠️ 2/2 — DÉPENSE LIÉE',
        html:'<span class="yaya-linked-delete-warning-title">ATTENTION : CE N’EST PAS UNE CONFIRMATION DE LA COMMANDE</span>'
          +'<b>La commande sera supprimée dans tous les cas.</b><br><br>'
          +'Cette commande existe aussi dans <b>Dépenses</b> avec la même pièce.<br>'
          +'Voulez-vous conserver '+(lies.length>1?'les dépenses liées':'la dépense liée')+' ou '+(lies.length>1?'les supprimer aussi':'la supprimer aussi')+' ?'
          +'<span class="yaya-linked-delete-choice-label">Choisissez maintenant ce qu’il faut faire dans Dépenses</span>',
        cancelText:'GARDER LA DÉPENSE',
        confirmText:'SUPPRIMER AUSSI LA DÉPENSE'
      });
    }

    try{
      const nextCommandes=(S.commandes||[]).filter(function(c){return norm(c&&c.id)!==norm(id);});
      const idsLies=new Set(lies.map(function(a){return norm(a&&a.id);}));
      const nextAchats=supprimerDepense
        ? (S.achats||[]).filter(function(a){return !idsLies.has(norm(a&&a.id));})
        : (S.achats||[]);

      await postRows('setCommandes',nextCommandes);
      if(supprimerDepense&&lies.length)await postRows('setAchats',nextAchats);

      S.commandes=nextCommandes;
      if(supprimerDepense)S.achats=nextAchats;
      saveCache();
      try{if(typeof render==='function')render();}catch(e){}
      try{window.dispatchEvent(new Event('yaya:data-refreshed'));}catch(e){}
      try{if(typeof toast==='function')toast(supprimerDepense?'Commande et dépense supprimées ✓':'Commande supprimée — dépense conservée ✓');}catch(e){}
    }catch(err){
      alert('Suppression impossible : '+String(err&&err.message||err));
    }
  }

  document.addEventListener('click',function(e){
    const del=e.target&&e.target.closest?e.target.closest('.yaya-detail-commande-delete'):null;
    if(!del)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    deleteCommande(del.dataset.commandeId);
  },true);
})();
