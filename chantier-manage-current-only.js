(function(){
  'use strict';

  if(window.__yayaChantierManageCurrentOnlyV1)return;
  window.__yayaChantierManageCurrentOnlyV1=true;

  const STYLE_ID='yaya-manage-current-only-style';
  let installed=false;
  let syncing=false;

  function root(){return document.getElementById('modalRoot');}

  function currentChantierId(){
    try{
      if(typeof focusChantier==='undefined'||focusChantier==null)return '';
      if(typeof focusChantier==='object'&&focusChantier.id!=null)return String(focusChantier.id).trim();
      return String(focusChantier||'').trim();
    }catch(e){return '';}
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-manage-info-overlay{display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;box-sizing:border-box!important;overflow:auto!important;}
      .yaya-manage-info-modal{width:min(460px,calc(100vw - 36px))!important;max-width:460px!important;margin:auto!important;position:relative!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;transform:none!important;}
      .yaya-manage-info-box{margin:14px 0;padding:13px 14px;border:1px solid #cbd7e6;border-radius:10px;background:#f7faff;color:#29496d;font-size:12px;line-height:1.5;}
      @media(max-width:640px){.yaya-manage-info-overlay{padding:12px!important}.yaya-manage-info-modal{width:calc(100vw - 24px)!important;}}
    `;
    document.head.appendChild(style);
  }

  function showInfo(){
    installStyle();
    const r=root();
    if(!r)return;
    r.innerHTML='<div class="overlay yaya-manage-info-overlay" onclick="if(event.target===this)closeModal()">'
      +'<div class="modal yaya-manage-info-modal">'
      +'<h5>Gérer un chantier<button type="button" onclick="closeModal()" aria-label="Fermer">×</button></h5>'
      +'<div class="yaya-manage-info-box"><b>Ouvre d’abord la fiche du chantier concerné.</b><br>La gestion d’un chantier est accessible uniquement depuis sa fiche. Depuis la liste des chantiers, ouvre le chantier concerné, puis clique sur <b>Gérer chantier</b>.</div>'
      +'<div class="mfoot" style="justify-content:flex-end"><button type="button" class="btn2" onclick="closeModal()">Fermer</button></div>'
      +'</div></div>';
  }

  function lockCurrentLocalModal(){
    const modal=document.querySelector('#modalRoot .yaya-chantier-edit-modal');
    if(!modal)return;
    const selector=modal.querySelector('.yaya-manage-selector');
    if(selector)selector.remove();
    const note=modal.querySelector('.yaya-extranet-note');
    if(note)note.textContent='Tu modifies le chantier actuellement ouvert. Les nouveaux chantiers et les chantiers Extranet se gèrent dans l’Extranet.';
  }

  function syncButton(){
    if(syncing)return;
    syncing=true;
    try{
      const btn=document.getElementById('yayaCreateChantierBtn');
      if(!btn)return;
      const title=currentChantierId()?'Gérer le chantier actuellement ouvert':'Ouvre une fiche chantier pour gérer le chantier';
      if(btn.textContent!=='🛠️ Gérer chantier')btn.textContent='🛠️ Gérer chantier';
      if(btn.title!==title)btn.title=title;
      if(btn.getAttribute('aria-label')!==title)btn.setAttribute('aria-label',title);
    }finally{
      syncing=false;
    }
  }

  function install(){
    if(installed)return;
    if(!window.__yayaChantierExtranetGovernanceV1||typeof window.openExistingChantierModal!=='function'){
      setTimeout(install,80);
      return;
    }
    installed=true;

    window.openChantierModal=function(){
      const id=currentChantierId();
      if(!id){
        showInfo();
        return;
      }
      window.openExistingChantierModal(id);
      setTimeout(lockCurrentLocalModal,110);
      setTimeout(lockCurrentLocalModal,240);
    };

    syncButton();
    setInterval(syncButton,700);

    const header=document.querySelector('.hdr');
    if(header){
      new MutationObserver(function(){requestAnimationFrame(syncButton);}).observe(header,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['title','aria-label']});
    }
  }

  installStyle();
  install();
})();

/* Consommables : la dépense automatique participe aux totaux mais sa ligne technique n'est pas affichée. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-consumables-auto-row-hide-v1]'))return;
  const s=document.createElement('script');
  s.src='consumables-auto-row-hide.js?v=auto-row-hide-1-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-consumables-auto-row-hide-v1','1');
  document.head.appendChild(s);
})();

/* Extranet : évite la double relecture réseau qui pouvait laisser Enregistrer bloqué. */
(function(){
  'use strict';
  if(window.__yayaExtranetSaveUnblockV1)return;
  window.__yayaExtranetSaveUnblockV1=true;

  function chantierList(){
    try{return Array.isArray(S&&S.chantiers)?S.chantiers:[];}catch(e){return [];}
  }

  function isExtranet(c){
    const id=String(c&&c.id||'').trim();
    const origine=String(c&&c.origine||c&&c.source||'').trim().toUpperCase();
    return origine==='EXTRANET'||/^C\d+$/i.test(id);
  }

  function currentId(){
    try{
      const raw=(typeof focusChantier!=='undefined')?focusChantier:'';
      const id=(raw&&typeof raw==='object'&&raw.id!=null)?raw.id:raw;
      const s=String(id||'').trim();
      const c=chantierList().find(function(x){return String(x&&x.id)===s;});
      if(c&&isExtranet(c))return s;
    }catch(e){}

    const nomEl=document.getElementById('yayaGovNom');
    const nom=String(nomEl&&nomEl.value||'').trim();
    if(!nom)return '';
    const matches=chantierList().filter(function(c){
      return isExtranet(c)&&String(c&&c.nom||'').trim()===nom;
    });
    return matches.length===1?String(matches[0].id):'';
  }

  function toastSafe(msg,err){
    try{if(typeof toast==='function')toast(msg,!!err);}catch(e){}
  }

  async function saveFast(btn){
    const id=currentId();
    if(!id)return false;

    const nomEl=document.getElementById('yayaGovNom');
    const month=document.getElementById('yayaGovSigMonth');
    const year=document.getElementById('yayaGovSigYear');
    if(!nomEl||!month||!year)return false;

    const nom=String(nomEl.value||'').trim();
    if(!nom){toastSafe('Indique le nom du chantier',true);nomEl.focus();return true;}
    if((month.value&&!year.value)||(!month.value&&year.value)){
      toastSafe('Choisis le mois et l’année de signature',true);
      (month.value?year:month).focus();
      return true;
    }

    const signature=(month.value&&year.value)?String(year.value)+'-'+String(month.value):'';
    const before=chantierList().map(function(c){return c&&typeof c==='object'?Object.assign({},c):c;});
    const working=before.map(function(c){return c&&typeof c==='object'?Object.assign({},c):c;});
    const target=working.find(function(c){return String(c&&c.id)===id;});
    if(!target){toastSafe('Chantier introuvable',true);return true;}

    target.nom=nom;
    target.dateSignature=signature;

    btn.disabled=true;
    btn.textContent='Enregistrement…';

    try{
      S.chantiers=working;
      const ok=await apiPost('setChantiers',working);
      if(!ok)throw new Error('enregistrement refusé');
      try{if(typeof closeModal==='function')closeModal();}catch(e){}
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe('Nom et Signé le enregistrés ✓',false);
      return true;
    }catch(err){
      S.chantiers=before;
      try{if(typeof render==='function')render();}catch(e){}
      if(document.contains(btn)){
        btn.disabled=false;
        btn.textContent='Enregistrer';
      }
      toastSafe('Modification impossible : '+String(err&&err.message||err),true);
      return true;
    }
  }

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('#yayaGovSave'):null;
    if(!btn)return;
    const id=currentId();
    if(!id)return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    saveFast(btn);
  },true);
})();
