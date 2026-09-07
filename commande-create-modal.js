(function(){
  'use strict';

  if(window.__yayaCommandeCreateModalV1)return;
  window.__yayaCommandeCreateModalV1=true;

  const STYLE_ID='yaya-commande-create-style-v1';
  const MAX_FILE_SIZE=8*1024*1024;
  const UPLOAD_TIMEOUT=30000;

  function endpoint(){
    try{if(typeof API!=='undefined'&&API)return String(API);}catch(e){}
    return 'https://script.google.com/macros/s/AKfycbx6IwMFf2plAq7i8qf8qF6f6MMC-1-WynAqn1ZRqCZrVqHeE9a1ygSSTzp5uOf0L3bn/exec';
  }

  function esc(v){
    const d=document.createElement('div');
    d.textContent=String(v==null?'':v);
    return d.innerHTML;
  }

  function todayYmd(){
    const d=new Date();
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }

  function parseMontant(v){
    const n=Number(String(v||'').replace(/\s/g,'').replace(',','.'));
    return Number.isFinite(n)?n:0;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .yaya-commande-create-overlay{
        position:fixed!important;
        inset:0!important;
        z-index:22000!important;
        background:rgba(22,45,73,.46)!important;
        display:flex!important;
        align-items:flex-start!important;
        justify-content:center!important;
        padding:18px 12px!important;
        overflow:auto!important;
      }
      .yaya-commande-create-modal{
        width:min(520px,100%)!important;
        margin:auto!important;
        background:#fff!important;
        border-radius:14px!important;
        box-shadow:0 18px 55px rgba(0,0,0,.28)!important;
        overflow:hidden!important;
        color:#162d49!important;
      }
      .yaya-commande-create-head{
        display:flex!important;
        align-items:flex-start!important;
        justify-content:space-between!important;
        gap:12px!important;
        padding:18px 18px 12px!important;
        border-bottom:1px solid #e6ebf1!important;
      }
      .yaya-commande-create-head h3{
        margin:0!important;
        font-size:19px!important;
        line-height:1.2!important;
        color:#162d49!important;
      }
      .yaya-commande-create-head p{
        margin:5px 0 0!important;
        font-size:12.5px!important;
        color:#718096!important;
      }
      .yaya-commande-create-x{
        border:0!important;
        background:transparent!important;
        color:#596579!important;
        font-size:24px!important;
        line-height:1!important;
        padding:0 2px!important;
      }
      .yaya-commande-create-body{
        padding:14px 18px 4px!important;
      }
      .yaya-commande-create-field{
        display:block!important;
        margin:0 0 11px!important;
        font-size:12px!important;
        font-weight:700!important;
        color:#334155!important;
      }
      .yaya-commande-create-field input,
      .yaya-commande-create-field select{
        display:block!important;
        width:100%!important;
        min-height:42px!important;
        margin-top:5px!important;
        padding:9px 10px!important;
        border:1px solid #cbd5e1!important;
        border-radius:8px!important;
        background:#fff!important;
        color:#162d49!important;
        font:inherit!important;
        font-size:13.5px!important;
        box-sizing:border-box!important;
      }
      .yaya-commande-create-two{
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        gap:10px!important;
      }
      .yaya-commande-create-file-state{
        display:none!important;
        margin:0 0 10px!important;
        padding:7px 9px!important;
        border-radius:7px!important;
        background:#f4f8fc!important;
        color:#36536f!important;
        font-size:12px!important;
        line-height:1.35!important;
      }
      .yaya-commande-create-file-state.on{display:block!important}
      .yaya-commande-create-file-state.ok{background:#effaf2!important;color:#23643a!important}
      .yaya-commande-create-file-state.err{background:#fff1f1!important;color:#a83232!important}
      .yaya-commande-create-actions{
        display:grid!important;
        grid-template-columns:1fr 1fr 1fr!important;
        gap:10px!important;
        padding:14px 18px 18px!important;
        border-top:1px solid #e6ebf1!important;
      }
      .yaya-commande-create-actions button{
        min-height:42px!important;
        border-radius:8px!important;
        font-size:13px!important;
        font-weight:800!important;
        cursor:pointer!important;
      }
      .yaya-commande-create-import{background:#249457!important;border:1px solid #249457!important;color:#fff!important}
      .yaya-commande-create-save{background:#0f4f8d!important;border:1px solid #0f4f8d!important;color:#fff!important}
      .yaya-commande-create-close{background:#fff!important;border:1px solid #cbd5e1!important;color:#475569!important}
      .yaya-commande-create-actions button:disabled{opacity:.6!important;cursor:default!important}
      @media(max-width:640px){
        .yaya-commande-create-overlay{padding:10px 8px!important}
        .yaya-commande-create-modal{border-radius:11px!important}
        .yaya-commande-create-head{padding:14px 14px 10px!important}
        .yaya-commande-create-head h3{font-size:17px!important}
        .yaya-commande-create-head p{font-size:11.5px!important}
        .yaya-commande-create-body{padding:11px 14px 2px!important}
        .yaya-commande-create-field{margin-bottom:9px!important}
        .yaya-commande-create-field input,
        .yaya-commande-create-field select{min-height:40px!important;padding:8px 9px!important;font-size:13px!important}
        .yaya-commande-create-actions{padding:11px 14px 14px!important;gap:8px!important}
        .yaya-commande-create-actions button{min-height:40px!important;font-size:12.5px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function chantierOptions(selectedId){
    let list=[];
    try{list=Array.isArray(S&&S.chantiers)?S.chantiers.slice():[];}catch(e){}
    return list
      .filter(c=>String(c.statut||'')!=='Terminé'&&String(c.statut||'')!=='Archivé')
      .sort((a,b)=>String(a.nom||'').localeCompare(String(b.nom||''),'fr',{sensitivity:'base'}))
      .map(c=>'<option value="'+esc(c.id)+'"'+(String(c.id)===String(selectedId||'')?' selected':'')+'>'+esc(c.nom||'Chantier')+(c.numero?' ('+esc(c.numero)+')':'')+'</option>')
      .join('');
  }

  function readBase64(file){
    return new Promise(function(resolve,reject){
      const reader=new FileReader();
      reader.onerror=function(){reject(new Error('Lecture du fichier impossible'));};
      reader.onload=function(){resolve(String(reader.result||'').split(',')[1]||'');};
      reader.readAsDataURL(file);
    });
  }

  async function uploadFile(file){
    const base64=await readBase64(file);
    if(!base64)throw new Error('Document vide ou illisible');

    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),UPLOAD_TIMEOUT);
    try{
      const r=await fetch(endpoint(),{
        method:'POST',
        cache:'no-store',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({
          action:'extraireDocument',
          data:{
            filename:file.name,
            mimeType:file.type||'application/pdf',
            base64:base64
          }
        }),
        signal:controller.signal
      });
      const txt=await r.text();
      let j;
      try{j=JSON.parse(txt);}catch(e){throw new Error('Réponse Yaya invalide');}
      if(!j||j.ok!==true)throw new Error(String(j&&j.error||'Import impossible'));
      const d=j.data||{};
      const lien=String(d.lienDrive||d.lien||'').trim();
      if(!lien)throw new Error('Fichier non archivé');
      return {lien:lien,pieceNom:file.name};
    }catch(e){
      if(e&&e.name==='AbortError')throw new Error('Import interrompu — réessaie');
      throw e;
    }finally{
      clearTimeout(timer);
    }
  }

  async function addCommande(row){
    const r=await fetch(endpoint(),{
      method:'POST',
      cache:'no-store',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'addCommande',data:row})
    });
    const txt=await r.text();
    let j;
    try{j=JSON.parse(txt);}catch(e){throw new Error('Réponse Yaya invalide');}
    if(!j||j.ok!==true)throw new Error(String(j&&j.error||'Enregistrement impossible'));
    return j;
  }

  function persistLocal(row){
    try{
      if(typeof S!=='undefined'){
        if(!Array.isArray(S.commandes))S.commandes=[];
        S.commandes=S.commandes.filter(c=>String(c.id||'')!==String(row.id));
        S.commandes.push(row);
      }
    }catch(e){}

    try{
      const key='YAYA_CACHE_DATA_V2';
      const raw=localStorage.getItem(key);
      if(raw){
        const cached=JSON.parse(raw);
        if(cached&&typeof cached==='object'){
          const rows=Array.isArray(cached.commandes)?cached.commandes:[];
          cached.commandes=rows.filter(c=>String(c.id||'')!==String(row.id));
          cached.commandes.push(row);
          localStorage.setItem(key,JSON.stringify(cached));
        }
      }
    }catch(e){}

    try{if(typeof render==='function')render();}catch(e){}
    try{window.dispatchEvent(new Event('yaya:data-refreshed'));}catch(e){}
  }

  function makeId(){
    return 'cmd_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
  }

  function openCreate(selectedId){
    installStyle();
    document.querySelectorAll('.yaya-commande-create-overlay').forEach(x=>x.remove());

    const overlay=document.createElement('div');
    overlay.className='yaya-commande-create-overlay';
    overlay.innerHTML='<div class="yaya-commande-create-modal" role="dialog" aria-modal="true" aria-labelledby="yayaCommandeCreateTitle">'
      +'<div class="yaya-commande-create-head"><div><h3 id="yayaCommandeCreateTitle">Ajouter une commande</h3><p>Renseigne les informations de la commande.</p></div><button type="button" class="yaya-commande-create-x" aria-label="Fermer">×</button></div>'
      +'<div class="yaya-commande-create-body">'
        +'<label class="yaya-commande-create-field">Chantier *<select data-field="chantierId"><option value="">— Choisir le chantier —</option>'+chantierOptions(selectedId)+'</select></label>'
        +'<label class="yaya-commande-create-field">Fournisseur *<input data-field="fournisseur" autocomplete="organization" placeholder="Fournisseur"></label>'
        +'<label class="yaya-commande-create-field">Désignation / Objet *<input data-field="designation" placeholder="Désignation"></label>'
        +'<div class="yaya-commande-create-two">'
          +'<label class="yaya-commande-create-field">Date *<input data-field="date" type="date" value="'+todayYmd()+'"></label>'
          +'<label class="yaya-commande-create-field">Montant HT €<input data-field="montantHT" inputmode="decimal" placeholder="Montant HT €"></label>'
        +'</div>'
        +'<div class="yaya-commande-create-file-state" aria-live="polite"></div>'
        +'<input type="file" class="yaya-commande-create-file" accept="application/pdf,image/*" style="display:none">'
      +'</div>'
      +'<div class="yaya-commande-create-actions">'
        +'<button type="button" class="yaya-commande-create-import">Importer</button>'
        +'<button type="button" class="yaya-commande-create-save">Enregistrer</button>'
        +'<button type="button" class="yaya-commande-create-close">Fermer</button>'
      +'</div></div>';

    document.body.appendChild(overlay);

    const fileInput=overlay.querySelector('.yaya-commande-create-file');
    const fileState=overlay.querySelector('.yaya-commande-create-file-state');
    const importBtn=overlay.querySelector('.yaya-commande-create-import');
    const saveBtn=overlay.querySelector('.yaya-commande-create-save');
    let attachment={lien:'',pieceNom:''};
    let uploading=false;

    function close(){
      if(uploading)return;
      overlay.remove();
    }

    overlay.querySelector('.yaya-commande-create-x').onclick=close;
    overlay.querySelector('.yaya-commande-create-close').onclick=close;
    overlay.addEventListener('click',e=>{if(e.target===overlay)close();});

    importBtn.onclick=function(){
      if(uploading)return;
      fileInput.value='';
      fileInput.click();
    };

    fileInput.onchange=async function(){
      const file=fileInput.files&&fileInput.files[0];
      if(!file)return;
      if(file.size>MAX_FILE_SIZE){
        fileState.className='yaya-commande-create-file-state on err';
        fileState.textContent='Fichier trop lourd (8 Mo max).';
        return;
      }

      uploading=true;
      attachment={lien:'',pieceNom:''};
      importBtn.disabled=true;
      saveBtn.disabled=true;
      fileState.className='yaya-commande-create-file-state on';
      fileState.textContent='Import de '+file.name+'…';

      try{
        attachment=await uploadFile(file);
        fileState.className='yaya-commande-create-file-state on ok';
        fileState.textContent='✓ '+attachment.pieceNom+' importé';
      }catch(err){
        fileState.className='yaya-commande-create-file-state on err';
        fileState.textContent=String(err&&err.message||err);
      }finally{
        uploading=false;
        importBtn.disabled=false;
        saveBtn.disabled=false;
      }
    };

    saveBtn.onclick=async function(){
      if(uploading)return;

      const chantierId=String(overlay.querySelector('[data-field="chantierId"]').value||'').trim();
      const fournisseur=String(overlay.querySelector('[data-field="fournisseur"]').value||'').trim();
      const designation=String(overlay.querySelector('[data-field="designation"]').value||'').trim();
      const date=String(overlay.querySelector('[data-field="date"]').value||'').trim()||todayYmd();
      const montantHT=parseMontant(overlay.querySelector('[data-field="montantHT"]').value);

      if(!chantierId){alert('Choisis le chantier.');return;}
      if(!fournisseur){alert('Renseigne le fournisseur.');return;}
      if(!designation){alert('Renseigne la désignation.');return;}

      const row={
        id:makeId(),
        chantierId:chantierId,
        typeDoc:'Bon de commande',
        fournisseur:fournisseur,
        designation:designation,
        date:date,
        montantHT:montantHT,
        lien:String(attachment.lien||''),
        dropboxId:'',
        dropboxPath:'',
        oneDriveId:'',
        oneDriveWebUrl:'',
        statutValidation:'VALIDEE',
        origine:'YAYA',
        gmailMessageId:'',
        pieceNom:String(attachment.pieceNom||''),
        pieceEmpreinte:''
      };

      saveBtn.disabled=true;
      importBtn.disabled=true;
      try{
        await addCommande(row);
        persistLocal(row);
        overlay.remove();
        try{if(typeof toast==='function')toast('Commande enregistrée ✓');}catch(e){}
      }catch(err){
        saveBtn.disabled=false;
        importBtn.disabled=false;
        alert('Enregistrement impossible : '+String(err&&err.message||err));
      }
    };

    setTimeout(()=>{
      const first=overlay.querySelector('[data-field="fournisseur"]');
      if(first)first.focus({preventScroll:true});
    },40);
  }

  window.openCommandeForChantier=openCreate;

  function commandeIdFromButton(button){
    const toolbar=button&&button.closest?button.closest('.chantier-fin-toolbar'):null;
    if(!toolbar)return '';
    const devis=[...toolbar.querySelectorAll('button')].find(b=>String(b.getAttribute('onclick')||'').includes('openAvenant'));
    if(!devis)return '';
    const match=String(devis.getAttribute('onclick')||'').match(/openAvenant\(['"]([^'"]+)['"]\)/);
    return match&&match[1]?match[1]:'';
  }

  document.addEventListener('click',function(e){
    const button=e.target.closest&&e.target.closest('.chantier-command-btn');
    if(!button)return;
    e.preventDefault();
    e.stopPropagation();
    openCreate(commandeIdFromButton(button));
  },true);

  function retitle(){
    document.querySelectorAll('.chantier-command-btn').forEach(function(button){
      button.title='Ajouter une commande à ce chantier';
    });
  }

  retitle();
  new MutationObserver(retitle).observe(document.documentElement,{childList:true,subtree:true});
})();
