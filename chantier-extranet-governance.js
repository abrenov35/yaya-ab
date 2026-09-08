(function(){
  'use strict';

  if(window.__yayaChantierExtranetGovernanceV1)return;
  window.__yayaChantierExtranetGovernanceV1=true;

  const STYLE_ID='yaya-chantier-extranet-governance-v1';
  const originalOpenExisting=window.openExistingChantierModal;
  const originalDeleteExisting=window.deleteExistingChantier;
  const originalDelChantier=window.delChantier;

  function toastSafe(message,isError){
    try{if(typeof window.toast==='function')window.toast(message,!!isError);else console.log(message);}catch(e){}
  }

  function esc(v){
    return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function list(){
    try{return Array.isArray(S&&S.chantiers)?S.chantiers.filter(function(c){return c&&c.id&&!String(c.id).startsWith('__');}):[];}catch(e){return [];}
  }

  function byId(id){
    id=String(id||'');
    return list().find(function(c){return String(c.id)===id;})||null;
  }

  function isExtranet(cOrId){
    const c=typeof cOrId==='object'&&cOrId?cOrId:byId(cOrId);
    const id=String(c&&c.id||cOrId||'').trim();
    const origine=String(c&&c.origine||c&&c.source||'').trim().toUpperCase();
    return origine==='EXTRANET'||/^C\d+$/i.test(id);
  }

  function isArchived(c){
    return String(c&&c.statut||'').trim().toLowerCase()==='archivé';
  }

  function localChantiers(){
    return list().filter(function(c){return !isExtranet(c);});
  }

  function activeChantiers(){
    return list().filter(function(c){return !isArchived(c);});
  }

  function sorted(items){
    return items.slice().sort(function(a,b){return String(a.nom||'').localeCompare(String(b.nom||''),'fr',{sensitivity:'base'});});
  }

  function options(items,placeholder){
    let html='<option value="">'+esc(placeholder)+'</option>';
    sorted(items).forEach(function(c){
      html+='<option value="'+esc(c.id)+'">'+esc(String(c.nom||'Chantier')+(isArchived(c)?' — Archivé':''))+'</option>';
    });
    return html;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-governance-overlay{display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;box-sizing:border-box!important;overflow:auto!important;}
      .yaya-governance-modal{max-width:520px!important;margin:auto!important;position:relative!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;transform:none!important;max-height:calc(100dvh - 36px)!important;overflow:auto!important;}
      .yaya-governance-info{margin:14px 0;padding:12px 13px;border:1px solid #cbd7e6;border-radius:10px;background:#f7faff;color:#29496d;font-size:12px;line-height:1.45;}
      .yaya-governance-warning{margin:14px 0;padding:12px 13px;border:1px solid #efc27a;border-radius:10px;background:#fff8e8;color:#7a4a00;font-size:12px;line-height:1.5;}
      .yaya-governance-section{display:grid;gap:6px;margin-top:14px;}
      .yaya-governance-section>label{font-size:12px;font-weight:800;color:#162d49;}
      .yaya-governance-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;}
      .yaya-governance-row select{width:100%;min-width:0;}
      .yaya-governance-archive{background:#fff7e8!important;border:1px solid #efb86f!important;color:#9a4d00!important;font-weight:750!important;}
      .yaya-extranet-note{margin:8px 0 2px;padding:9px 11px;border-radius:8px;background:#eef4ff;border:1px solid #c7d7f2;color:#29496d;font-size:11px;line-height:1.4;}
      @media(max-width:640px){.yaya-governance-overlay{padding:12px!important}.yaya-governance-modal{max-height:calc(100dvh - 24px)!important}.yaya-governance-row{grid-template-columns:1fr}.yaya-governance-row button{width:100%!important;}}
    `;
    document.head.appendChild(style);
  }

  function root(){return document.getElementById('modalRoot');}

  function closeModalSafe(){
    try{if(typeof window.closeModal==='function')window.closeModal();else{const r=root();if(r)r.innerHTML='';}}catch(e){const r=root();if(r)r.innerHTML='';}
  }

  function archive(id){
    id=String(id||'').trim();
    if(!id)return;
    if(typeof window.archiverChantier==='function'){
      window.archiverChantier(id);
      return;
    }
    const c=byId(id);
    if(!c)return;
    c.statut='Archivé';
    try{if(typeof render==='function')render();}catch(e){}
    if(typeof apiPost==='function'){
      Promise.resolve(apiPost('setChantiers',S.chantiers)).then(function(ok){
        if(ok!==false)toastSafe('Chantier archivé ✓');
      }).catch(function(){toastSafe('Archivage impossible',true);});
    }
  }

  function showManageModal(){
    const r=root();if(!r)return;
    const locals=localChantiers();
    const actifs=activeChantiers();
    r.innerHTML='<div class="overlay yaya-governance-overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal yaya-governance-modal">'
      +'<h5>Gérer les chantiers<button type="button" onclick="closeModal()" aria-label="Fermer">×</button></h5>'
      +'<div class="yaya-governance-info"><b>Nouveaux chantiers :</b> création uniquement depuis l’Extranet AB RENOV 35.<br>Les chantiers créés par l’Extranet y sont également modifiés pour le <b>nom</b>, le <b>CA HT</b> et la <b>date de signature</b>.</div>'
      +'<div class="yaya-governance-section"><label>Modifier un ancien chantier créé directement dans Yaya</label>'
      +'<select class="inp" id="yayaGovEditSelect">'+options(locals,'— Choisir un ancien chantier Yaya —')+'</select>'
      +(!locals.length?'<div style="font-size:11px;color:#6d7d91">Aucun ancien chantier Yaya à modifier.</div>':'')
      +'</div>'
      +'<div class="yaya-governance-section"><label>Archiver un chantier</label>'
      +'<div class="yaya-governance-row"><select class="inp" id="yayaGovArchiveSelect">'+options(actifs,'— Choisir un chantier à archiver —')+'</select><button type="button" class="btn2 yaya-governance-archive" id="yayaGovArchiveBtn">Archiver</button></div>'
      +'<div style="font-size:11px;color:#6d7d91">L’archivage reste possible dans Yaya pour tous les chantiers, y compris ceux créés via l’Extranet.</div>'
      +'</div>'
      +'<div class="mfoot" style="justify-content:flex-end"><button type="button" class="btn2" onclick="closeModal()">Fermer</button></div>'
      +'</div></div>';

    const edit=document.getElementById('yayaGovEditSelect');
    if(edit)edit.onchange=function(){
      const id=String(edit.value||'');
      if(id)window.openExistingChantierModal(id);
    };
    const archiveBtn=document.getElementById('yayaGovArchiveBtn');
    if(archiveBtn)archiveBtn.onclick=function(){
      const sel=document.getElementById('yayaGovArchiveSelect');
      const id=String(sel&&sel.value||'');
      if(!id){toastSafe('Choisis un chantier à archiver',true);return;}
      archive(id);
    };
  }

  function showExtranetModal(id){
    const c=byId(id);
    const r=root();if(!r)return;
    const nom=String(c&&c.nom||'Chantier');
    const montant=Number(c&&c.montantMarcheHT||c&&c.montantDevisHT||0);
    const sig=String(c&&c.dateSignature||'').trim();
    r.innerHTML='<div class="overlay yaya-governance-overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal yaya-governance-modal">'
      +'<h5>Chantier géré par l’Extranet<button type="button" onclick="closeModal()" aria-label="Fermer">×</button></h5>'
      +'<div style="font-size:15px;font-weight:800;color:#162d49;margin-top:14px">'+esc(nom)+'</div>'
      +'<div class="yaya-governance-warning"><b>Ce chantier ne peut pas être modifié ni supprimé ici.</b><br>Il a été créé via l’Extranet. Le nom, le CA HT et la date de signature doivent être modifiés dans l’Extranet afin d’éviter les écarts entre les deux systèmes.</div>'
      +'<div style="display:grid;gap:5px;font-size:12px;color:#56677d">'
      +(sig?'<div><b>Date de signature :</b> '+esc(sig)+'</div>':'')
      +(Number.isFinite(montant)?'<div><b>CA HT :</b> '+esc(montant.toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:2}))+' €</div>':'')
      +'</div>'
      +'<div class="yaya-governance-info"><b>Archivage :</b> autorisé dans Yaya pour épurer l’affichage. Il ne modifie pas les données de référence de l’Extranet.</div>'
      +'<div class="mfoot" style="justify-content:flex-end;gap:8px">'
      +(!isArchived(c)?'<button type="button" class="btn2 yaya-governance-archive" id="yayaGovArchiveCurrent">Archiver dans Yaya</button>':'')
      +'<button type="button" class="btn2" onclick="closeModal()">Fermer</button>'
      +'</div></div></div>';
    const b=document.getElementById('yayaGovArchiveCurrent');
    if(b)b.onclick=function(){archive(id);};
  }

  function sanitizeLocalModal(id){
    if(isExtranet(id)){showExtranetModal(id);return;}
    const r=root();
    const modal=r&&r.querySelector('.yaya-chantier-edit-modal');
    if(!modal)return;

    const h5=modal.querySelector('h5');
    if(h5){
      let done=false;
      h5.childNodes.forEach(function(n){if(!done&&n.nodeType===Node.TEXT_NODE){n.nodeValue='Modifier un ancien chantier Yaya';done=true;}});
    }

    const dem=document.getElementById('editChDemarrage');
    const demLabel=dem&&dem.closest('label');
    if(demLabel)demLabel.remove();

    let note=modal.querySelector('.yaya-extranet-note');
    if(!note){
      note=document.createElement('div');
      note.className='yaya-extranet-note';
      note.textContent='Seuls les anciens chantiers créés directement dans Yaya sont modifiables ici. Les nouveaux chantiers et les chantiers Extranet se gèrent dans l’Extranet.';
      const selector=modal.querySelector('.yaya-manage-selector');
      if(selector)selector.insertAdjacentElement('afterend',note);
      else if(h5)h5.insertAdjacentElement('afterend',note);
    }

    const sel=modal.querySelector('#yayaManageChantierSelect');
    if(sel){
      const current=String(id||'');
      sel.innerHTML=options(localChantiers(),'— Choisir un ancien chantier Yaya —');
      sel.value=current;
      sel.onchange=function(){const next=String(sel.value||'');if(next)window.openExistingChantierModal(next);};
      const wrap=sel.closest('.yaya-manage-selector');
      const label=wrap&&wrap.querySelector('label');
      const help=wrap&&wrap.querySelector('.yaya-manage-selector-help');
      if(label)label.textContent='Ancien chantier créé dans Yaya';
      if(help)help.textContent='Les chantiers créés via l’Extranet ne sont pas proposés ici.';
    }
  }

  window.openChantierModal=function(){
    showManageModal();
  };

  window.openExistingChantierModal=function(id){
    id=String(id||'').trim();
    if(!id){showManageModal();return;}
    if(isExtranet(id)){showExtranetModal(id);return;}
    if(typeof originalOpenExisting==='function')originalOpenExisting(id);
    requestAnimationFrame(function(){sanitizeLocalModal(id);});
    setTimeout(function(){sanitizeLocalModal(id);},25);
    setTimeout(function(){sanitizeLocalModal(id);},90);
  };

  window.deleteExistingChantier=function(id){
    id=String(id||'').trim();
    if(isExtranet(id)){
      toastSafe('Ce chantier vient de l’Extranet : suppression impossible dans Yaya.',true);
      showExtranetModal(id);
      return Promise.resolve(false);
    }
    return typeof originalDeleteExisting==='function'?originalDeleteExisting(id):Promise.resolve(false);
  };

  window.delChantier=function(id){
    id=String(id||'').trim();
    if(isExtranet(id)){
      toastSafe('Ce chantier vient de l’Extranet : suppression impossible dans Yaya.',true);
      showExtranetModal(id);
      return Promise.resolve(false);
    }
    return typeof originalDelChantier==='function'?originalDelChantier(id):Promise.resolve(false);
  };

  function protectUnexpectedExtranetEdit(){
    const modal=document.querySelector('#modalRoot .yaya-chantier-edit-modal');
    if(!modal)return;
    const sel=modal.querySelector('#yayaManageChantierSelect');
    const save=modal.querySelector('#editChSave');
    let id=String(sel&&sel.value||'').trim();
    if(!id){
      const code=String(save&&save.getAttribute('onclick')||'');
      const m=code.match(/saveExistingChantier\(['\"]([^'\"]+)/);
      id=m&&m[1]?String(m[1]):'';
    }
    if(id&&isExtranet(id))showExtranetModal(id);
  }

  function syncToolbar(){
    const btn=document.getElementById('yayaCreateChantierBtn');
    if(!btn)return;
    btn.textContent='🛠️ Gérer chantiers';
    btn.title='Modifier un ancien chantier Yaya ou archiver un chantier';
    btn.setAttribute('aria-label','Gérer les chantiers');
  }

  installStyle();
  syncToolbar();
  setInterval(syncToolbar,1200);

  const r=root();
  if(r){
    new MutationObserver(function(){protectUnexpectedExtranetEdit();}).observe(r,{childList:true,subtree:true});
  }
})();
