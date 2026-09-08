(function(){
  'use strict';

  const STYLE_ID='yaya-commande-linked-delete-style-v1';

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
        background:rgba(22,45,73,.48)!important;display:flex!important;
        align-items:center!important;justify-content:center!important;
        padding:16px!important;overflow:auto!important
      }
      .yaya-linked-delete-modal{
        width:min(460px,100%)!important;max-height:calc(100vh - 32px)!important;
        overflow:auto!important;margin:auto!important;background:#fff!important;
        border-radius:14px!important;padding:20px!important;
        box-shadow:0 18px 55px rgba(0,0,0,.28)!important
      }
      .yaya-linked-delete-modal h3{margin:0 0 12px!important;font-size:17px!important;color:#162d49!important}
      .yaya-linked-delete-modal p{margin:0!important;font-size:14px!important;line-height:1.5!important;color:#334155!important}
      .yaya-linked-delete-actions{display:flex!important;justify-content:flex-end!important;gap:10px!important;margin-top:18px!important;flex-wrap:wrap!important}
      .yaya-linked-delete-actions button{min-height:42px!important;padding:9px 15px!important;border-radius:8px!important;font-weight:700!important;cursor:pointer!important}
      .yaya-linked-delete-cancel,.yaya-linked-delete-keep{border:1px solid #cbd5e1!important;background:#fff!important;color:#334155!important}
      .yaya-linked-delete-confirm{border:1px solid #b42318!important;background:#b42318!important;color:#fff!important;font-weight:800!important}
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
      overlay.innerHTML='<div class="yaya-linked-delete-modal" role="dialog" aria-modal="true">'
        +'<h3>'+esc(opts.title||'Confirmation')+'</h3>'
        +'<p>'+String(opts.html||'')+'</p>'
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

    const libelle=norm(commande.designation||commande.pieceNom||commande.fournisseur||'cette commande');
    const ok=await ask({
      title:'Supprimer la commande ?',
      html:'Confirmer la suppression de <b>« '+esc(libelle)+' »</b> ?',
      cancelText:'Annuler',
      confirmText:'Supprimer'
    });
    if(!ok)return;

    const lies=linkedExpenses(commande);
    let supprimerDepense=false;
    if(lies.length){
      supprimerDepense=await ask({
        title:'Supprimer aussi dans Dépenses ?',
        html:'Cette commande a aussi été enregistrée dans <b>Dépenses</b> avec la même pièce. Voulez-vous supprimer également '+(lies.length>1?'les dépenses liées':'la dépense liée')+' ?',
        cancelText:'Non, garder la dépense',
        confirmText:'Oui, supprimer aussi'
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
      try{if(typeof toast==='function')toast(supprimerDepense?'Commande et dépense supprimées ✓':'Commande supprimée ✓');}catch(e){}
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
