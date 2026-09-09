(function(){
  'use strict';

  if(window.__yayaChantierExtranetGovernanceV4)return;
  window.__yayaChantierExtranetGovernanceV4=true;
  window.__yayaChantierExtranetGovernanceV3=true;
  window.__yayaChantierExtranetGovernanceV2=true;
  window.__yayaChantierExtranetGovernanceV1=true;

  const STYLE_ID='yaya-chantier-extranet-governance-v4';
  const originalOpenExisting=window.openExistingChantierModal;
  const originalDeleteExisting=window.deleteExistingChantier;
  const originalDelChantier=window.delChantier;

  function toastSafe(message,isError){
    try{
      if(typeof window.toast==='function')window.toast(message,!!isError);
      else console.log(message);
    }catch(e){}
  }

  function esc(v){
    return String(v==null?'':v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function list(){
    try{
      return Array.isArray(S&&S.chantiers)
        ?S.chantiers.filter(function(c){return c&&c.id&&!String(c.id).startsWith('__');})
        :[];
    }catch(e){return [];}
  }

  function byId(id,items){
    id=String(id||'');
    const src=Array.isArray(items)?items:list();
    return src.find(function(c){return String(c&&c.id)===id;})||null;
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

  function root(){return document.getElementById('modalRoot');}

  function forceCloseModal(){
    const r=root();
    try{if(typeof window.closeModal==='function')window.closeModal();}catch(e){}
    if(r)r.innerHTML='';
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-governance-overlay{display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;box-sizing:border-box!important;overflow:auto!important}
      .yaya-governance-modal{max-width:520px!important;margin:auto!important;position:relative!important;max-height:calc(100dvh - 36px)!important;overflow:auto!important}
      .yaya-governance-info{margin:14px 0;padding:12px 13px;border:1px solid #cbd7e6;border-radius:10px;background:#f7faff;color:#29496d;font-size:12px;line-height:1.45}
      .yaya-governance-fields{display:grid;gap:12px;margin-top:16px}
      .yaya-governance-fields label{display:grid;gap:5px;font-size:12px;font-weight:700;color:#162d49}
      .yaya-governance-signature{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,.9fr);gap:8px}
      .yaya-governance-signature .inp{width:100%!important;min-width:0!important;background:#fff!important}
      .yaya-governance-archive{background:#fff7e8!important;border:1px solid #efb86f!important;color:#9a4d00!important;font-weight:750!important}
      @media(max-width:640px){.yaya-governance-overlay{padding:12px!important}.yaya-governance-modal{max-height:calc(100dvh - 24px)!important}.yaya-governance-signature{grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr)}}
    `;
    document.head.appendChild(style);
  }

  function signatureParts(v){
    const m=String(v||'').trim().match(/^(\d{4})-(\d{2})/);
    return m?{year:m[1],month:m[2]}:{year:'',month:''};
  }

  function monthOptions(selected){
    const labels=[
      ['01','Janvier'],['02','Février'],['03','Mars'],['04','Avril'],
      ['05','Mai'],['06','Juin'],['07','Juillet'],['08','Août'],
      ['09','Septembre'],['10','Octobre'],['11','Novembre'],['12','Décembre']
    ];
    return '<option value="">Mois</option>'+labels.map(function(x){
      return '<option value="'+x[0]+'"'+(x[0]===selected?' selected':'')+'>'+x[1]+'</option>';
    }).join('');
  }

  function yearOptions(selected){
    const now=new Date().getFullYear();
    const selectedYear=parseInt(selected,10)||now;
    const start=Math.min(now-2,selectedYear);
    const end=Math.max(now+5,selectedYear);
    let html='<option value="">Année</option>';
    for(let y=start;y<=end;y++){
      const s=String(y);
      html+='<option value="'+s+'"'+(s===selected?' selected':'')+'>'+s+'</option>';
    }
    return html;
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

  function saveNameAndSignature(id){
    id=String(id||'').trim();
    const nom=document.getElementById('yayaGovNom');
    const month=document.getElementById('yayaGovSigMonth');
    const year=document.getElementById('yayaGovSigYear');
    if(!nom||!month||!year)return;

    const name=String(nom.value||'').trim();
    if(!name){toastSafe('Indique le nom du chantier',true);nom.focus();return;}
    if((month.value&&!year.value)||(!month.value&&year.value)){
      toastSafe('Choisis le mois et l’année de signature',true);
      (month.value?year:month).focus();
      return;
    }

    const signature=(month.value&&year.value)?String(year.value)+'-'+String(month.value):'';
    const current=byId(id);
    if(!current){toastSafe('Chantier introuvable',true);return;}

    const oldName=String(current.nom||'');
    const oldSignature=String(current.dateSignature||'');
    const next=list().map(function(c){return Object.assign({},c);});
    const target=byId(id,next);
    if(!target){toastSafe('Chantier introuvable',true);return;}

    target.nom=name;
    target.dateSignature=signature;

    // Mise à jour locale immédiate puis fermeture immédiate de la modale.
    current.nom=name;
    current.dateSignature=signature;
    forceCloseModal();
    try{if(typeof render==='function')render();}catch(e){}
    toastSafe('Enregistrement en cours…');

    // L'écriture serveur continue après fermeture de la modale.
    Promise.resolve().then(function(){
      if(typeof window.apiPost!=='function')return false;
      return window.apiPost('setChantiers',next);
    }).then(function(ok){
      if(!ok)throw new Error('enregistrement refusé');
      try{localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(S));}catch(e){}
      toastSafe('Nom et Signé le enregistrés ✓');
    }).catch(function(err){
      const local=byId(id);
      if(local){
        local.nom=oldName;
        local.dateSignature=oldSignature;
      }
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe('Modification impossible : '+String(err&&err.message||err),true);
    });
  }

  function showExtranetModal(id){
    const c=byId(id);
    const r=root();if(!r||!c)return;
    const sig=signatureParts(c.dateSignature);

    r.innerHTML='<div class="overlay yaya-governance-overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal yaya-governance-modal">'
      +'<h5>Modifier le chantier<button type="button" onclick="closeModal()" aria-label="Fermer">×</button></h5>'
      +'<div class="yaya-governance-info"><b>Chantier créé via l’Extranet.</b><br>Dans Yaya, seuls le <b>nom du chantier</b> et <b>Signé le</b> peuvent être corrigés.</div>'
      +'<div class="yaya-governance-fields">'
      +'<label>Nom du chantier<input class="inp" id="yayaGovNom" autocomplete="off" value="'+esc(c.nom||'')+'"></label>'
      +'<label>Signé le <span style="font-size:11px;font-weight:400;opacity:.65">mois et année</span><span class="yaya-governance-signature"><select class="inp" id="yayaGovSigMonth">'+monthOptions(sig.month)+'</select><select class="inp" id="yayaGovSigYear">'+yearOptions(sig.year)+'</select></span></label>'
      +'</div>'
      +'<div class="mfoot" style="justify-content:flex-end;gap:8px">'
      +(!isArchived(c)?'<button type="button" class="btn2 yaya-governance-archive" id="yayaGovArchiveCurrent">Archiver dans Yaya</button>':'')
      +'<button type="button" class="btn2" onclick="closeModal()">Fermer</button>'
      +'<button type="button" class="btnp go" id="yayaGovSave">Enregistrer</button>'
      +'</div></div></div>';

    const save=document.getElementById('yayaGovSave');
    if(save)save.onclick=function(){saveNameAndSignature(id);};
    const arch=document.getElementById('yayaGovArchiveCurrent');
    if(arch)arch.onclick=function(){archive(id);};
  }

  function showManageModal(){
    const r=root();if(!r)return;
    r.innerHTML='<div class="overlay yaya-governance-overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal yaya-governance-modal">'
      +'<h5>Gérer les chantiers<button type="button" onclick="closeModal()" aria-label="Fermer">×</button></h5>'
      +'<div class="yaya-governance-info">Ouvre la fiche du chantier concerné puis clique sur <b>Gérer chantier</b>.</div>'
      +'<div class="mfoot" style="justify-content:flex-end"><button type="button" class="btn2" onclick="closeModal()">Fermer</button></div>'
      +'</div></div>';
  }

  window.openExistingChantierModal=function(id){
    id=String(id||'').trim();
    if(!id){showManageModal();return;}
    if(isExtranet(id)){showExtranetModal(id);return;}
    if(typeof originalOpenExisting==='function')originalOpenExisting(id);
  };

  window.deleteExistingChantier=function(id){
    id=String(id||'').trim();
    if(isExtranet(id)){
      toastSafe('Ce chantier vient de l’Extranet : suppression impossible dans Yaya.',true);
      return Promise.resolve(false);
    }
    return typeof originalDeleteExisting==='function'?originalDeleteExisting(id):Promise.resolve(false);
  };

  window.delChantier=function(id){
    id=String(id||'').trim();
    if(isExtranet(id)){
      toastSafe('Ce chantier vient de l’Extranet : suppression impossible dans Yaya.',true);
      return Promise.resolve(false);
    }
    return typeof originalDelChantier==='function'?originalDelChantier(id):Promise.resolve(false);
  };

  window.openChantierModal=function(){showManageModal();};

  installStyle();
})();
