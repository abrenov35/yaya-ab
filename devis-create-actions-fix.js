(function(){
  'use strict';
  const STYLE_ID='yaya-devis-create-actions-fix-v6';
  function installStyle(){
    ['yaya-devis-create-actions-fix-v1','yaya-devis-create-actions-fix-v2','yaya-devis-create-actions-fix-v3','yaya-devis-create-actions-fix-v4','yaya-devis-create-actions-fix-v5'].forEach(function(id){const old=document.getElementById(id);if(old)old.remove();});
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      .yaya-devis-create-actions{display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;flex-wrap:nowrap!important;margin-top:18px!important}
      .yaya-devis-create-actions>button{position:static!important;width:auto!important;min-width:0!important;max-width:none!important;height:42px!important;min-height:42px!important;margin:0!important;padding:0 20px!important;flex:0 0 auto!important;white-space:nowrap!important}
      .yaya-devis-create-actions>.yaya-devis-import{background:#249457!important;border:1px solid #249457!important;color:#fff!important}
      .yaya-devis-create-patched #avEtat{display:block!important}
    `;document.head.appendChild(style);
  }
  function getRoot(){return document.getElementById('modalRoot');}
  function cleanFields(modal){
    if(!modal)return;
    const lib=modal.querySelector('#avLib');if(lib){const row=lib.closest('.mrow');if(row)row.remove();else lib.remove();}
    const mt=modal.querySelector('#avMt');if(mt){const row=mt.closest('.mrow');if(row)row.remove();else mt.remove();}
    const desc=modal.querySelector('#avDesc');if(desc){const row=desc.closest('.yaya-devis-description-row,.mrow');if(row)row.remove();else desc.remove();}
    modal.querySelectorAll('.yaya-devis-description-row').forEach(row=>row.remove());
  }
  function patch(){
    const root=getRoot();if(!root)return;
    const modal=[...root.querySelectorAll('.overlay .modal')].find(item=>/^Ajouter le devis/i.test(String(item.querySelector('h5')&&item.querySelector('h5').textContent||'').trim())||item.classList.contains('yaya-devis-create-patched'));
    if(!modal)return;modal.classList.add('yaya-devis-create-patched');cleanFields(modal);
    let buttons=[...modal.querySelectorAll('button')];
    const paste=buttons.find(b=>/Coller une capture/i.test(String(b.textContent||'')));if(paste)paste.remove();
    const cancel=buttons.find(b=>/^Annuler$/i.test(String(b.textContent||'').trim()));if(cancel)cancel.remove();
    buttons=[...modal.querySelectorAll('button')];
    const upload=buttons.find(b=>/Importer le devis/i.test(String(b.textContent||''))||/^Importer$/i.test(String(b.textContent||'').trim()));
    const save=buttons.find(b=>/Enregistrer le devis/i.test(String(b.textContent||''))||/^Enregistrer$/i.test(String(b.textContent||'').trim()));
    const close=buttons.find(b=>/^Fermer$/i.test(String(b.textContent||'').trim()));if(!upload||!save||!close)return;
    upload.textContent='Importer';save.textContent='Enregistrer';upload.classList.add('yaya-devis-import');
    let footer=modal.querySelector('.yaya-devis-create-actions');if(!footer){footer=save.closest('.mfoot')||document.createElement('div');if(!footer.parentElement)modal.appendChild(footer);footer.classList.add('mfoot','yaya-devis-create-actions');}
    if(save.parentElement!==footer)footer.appendChild(save);if(upload.parentElement!==footer)footer.appendChild(upload);if(close.parentElement!==footer)footer.appendChild(close);
  }
  function install(){installStyle();patch();const root=getRoot();if(!root)return;let raf=0;new MutationObserver(()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;patch();});}).observe(root,{childList:true,subtree:true});}
  if(document.body)install();else document.addEventListener('DOMContentLoaded',install,{once:true});
})();

(function(){
  'use strict';
  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';let queue=Promise.resolve();
  function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}
  function persistState(){try{if(typeof S!=='undefined'&&S)localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(S));}catch(e){}}
  function dateToday(){try{return typeof isoDate==='function'?isoDate(new Date()):new Date().toISOString().slice(0,10);}catch(e){return new Date().toISOString().slice(0,10);}}
  async function saveFirst(cid,lien,numeroExtrait){
    const c=typeof chantierById==='function'?chantierById(cid):(S.chantiers||[]).find(x=>String(x.id)===String(cid));if(!c)throw new Error('Chantier introuvable');
    if(!lien)throw new Error('Importe d’abord la pièce jointe');
    const oldNotes=c.notes,oldNumero=c.numero;c.notes=lien;if(numeroExtrait)c.numero=numeroExtrait;persistState();if(typeof render==='function')render();
    const ok=typeof apiPost==='function'?await apiPost('setChantiers',S.chantiers):false;if(!ok){c.notes=oldNotes;c.numero=oldNumero;persistState();if(typeof render==='function')render();throw new Error('Enregistrement impossible');}
  }
  async function freshAvenants(){if(typeof apiGet!=='function')return Array.isArray(S.avenants)?S.avenants.slice():[];try{const fresh=await apiGet(true);return fresh&&Array.isArray(fresh.avenants)?fresh.avenants.slice():(Array.isArray(S.avenants)?S.avenants.slice():[]);}catch(e){return Array.isArray(S.avenants)?S.avenants.slice():[];}}
  async function saveOther(cid,numero,lien){
    if(!lien)throw new Error('Importe d’abord la pièce jointe');
    const row={id:(typeof uid==='function'?uid():(Date.now().toString(36)+Math.random().toString(36).slice(2,8))),chantierId:String(cid||''),libelle:'Devis '+numero,montantHT:0,date:dateToday(),lien:lien};
    const base=await freshAvenants();const payload=base.concat([row]);const ok=typeof apiPost==='function'?await apiPost('setAvenants',payload):false;if(!ok)throw new Error('Enregistrement impossible');
    if(!Array.isArray(S.avenants))S.avenants=[];S.avenants=payload;persistState();if(typeof render==='function')render();
  }
  function saveBackground(cid){
    let numero=1,lien='',numeroExtrait='';try{numero=Number(devisNumeroEnCours)||1;}catch(e){}try{lien=String(avenantLien||'');}catch(e){}try{numeroExtrait=String(devisNumeroExtrait||'');}catch(e){}
    if(!lien){toastSafe('Importe d’abord la pièce jointe',true);return;}
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    queue=queue.catch(()=>{}).then(()=>wait(0)).then(()=>numero===1?saveFirst(cid,lien,numeroExtrait):saveOther(cid,numero,lien)).then(()=>{try{avenantLien='';devisNumeroExtrait='';}catch(e){}toastSafe('Devis enregistré ✓');}).catch(e=>{console.error('Yaya — enregistrement devis :',e);toastSafe(String(e&&e.message||e),true);});
    return Promise.resolve(true);
  }
  saveBackground.__yayaDocumentOnlySave=true;window.saveAvenant=saveBackground;try{saveAvenant=saveBackground;}catch(e){}
})();
