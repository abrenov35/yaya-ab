(function(){
  'use strict';
  if(window.__yayaAchatEditDirectSaveV1)return;
  window.__yayaAchatEditDirectSaveV1=true;

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}
  function getAchat(id){
    try{return typeof S!=='undefined'&&S&&Array.isArray(S.achats)?S.achats.find(function(a){return String(a&&a.id||'')===String(id);})||null:null;}catch(e){return null;}
  }
  function getId(modal,button){
    let id=txt(button&&button.dataset&&button.dataset.achatId||modal&&modal.dataset&&modal.dataset.yayaAchatId||'');
    if(id)return id;
    const raw=String(button&&button.getAttribute&&button.getAttribute('onclick')||'');
    const m=raw.match(/saveAchat\s*\(\s*['\"]([^'\"]+)['\"]/);
    if(m&&m[1])return String(m[1]);
    try{
      const save=Array.from(modal.querySelectorAll('button')).find(function(b){return /saveAchat/.test(String(b.getAttribute('onclick')||''));});
      if(save){
        const mm=String(save.getAttribute('onclick')||'').match(/saveAchat\s*\(\s*['\"]([^'\"]+)['\"]/);
        if(mm&&mm[1])return String(mm[1]);
      }
    }catch(e){}
    return '';
  }
  function isEditSave(button){
    const modal=button&&button.closest?button.closest('.modal'):null;
    if(!modal||!modal.querySelector('#eaCh'))return false;
    const raw=String(button.getAttribute('onclick')||'');
    return button.classList.contains('yaya-achat-single-save')||/saveAchat/.test(raw)||/^Enregistrer$/i.test(txt(button.textContent));
  }
  function arm(button){
    if(!isEditSave(button))return false;
    if(button.dataset.yayaDirectSaveArmed==='1')return true;
    button.dataset.yayaDirectSaveArmed='1';
    button.dataset.yayaDirectSaveText=button.textContent||'Enregistrer';
    button.dataset.yayaDirectSaveOnclick=button.getAttribute('onclick')||'';
    button.classList.remove('yaya-achat-single-save');
    button.removeAttribute('onclick');
    button.textContent='Enregistrement…';
    return true;
  }
  function restore(button){
    if(!button)return;
    button.textContent=button.dataset.yayaDirectSaveText||'Enregistrer';
    button.disabled=false;
    button.classList.add('yaya-achat-single-save');
    if(button.dataset.yayaDirectSaveOnclick)button.setAttribute('onclick',button.dataset.yayaDirectSaveOnclick);
    delete button.dataset.yayaDirectSaveArmed;
  }
  async function save(button){
    const modal=button.closest('.modal');
    const id=getId(modal,button);
    if(!id){restore(button);toastSafe('Impossible d’identifier cet achat',true);return;}
    const current=getAchat(id);
    if(!current){restore(button);toastSafe('Achat introuvable',true);return;}

    const ch=modal.querySelector('#eaCh');
    const type=modal.querySelector('#eaType');
    const four=modal.querySelector('#eaFour');
    const des=modal.querySelector('#eaDes');
    const date=modal.querySelector('#eaDate');
    const mt=modal.querySelector('#eaMt');
    if(!ch||!type||!four||!des||!date||!mt){restore(button);toastSafe('Champs de modification incomplets',true);return;}

    const updated=Object.assign({},current,{
      chantierId:ch.value,
      typeDoc:type.value,
      fournisseur:four.value.trim(),
      designation:des.value.trim(),
      date:date.value,
      montantHT:Number(mt.value)||0
    });
    if(String(updated.typeDoc||'').trim()==='Facture sous-traitant')updated.sousTraitant=updated.fournisseur;
    else if('sousTraitant' in updated)updated.sousTraitant='';

    button.disabled=true;
    try{
      if(typeof apiPost!=='function')throw new Error('API Yaya indisponible');
      const ok=await apiPost('addAchat',updated);
      if(!ok)throw new Error('Écriture Sheet refusée');

      const idx=S.achats.findIndex(function(a){return String(a&&a.id||'')===String(id);});
      if(idx>=0)S.achats[idx]=updated;
      try{
        const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
        const cached=raw?JSON.parse(raw):{};
        if(cached&&typeof cached==='object'){
          cached.achats=Array.isArray(S.achats)?S.achats:[];
          localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
        }
      }catch(e){}
      try{if(typeof closeModal==='function')closeModal();}catch(e){}
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe('Achat modifié dans le Sheet ✓');
    }catch(err){
      restore(button);
      toastSafe('NON ENREGISTRÉ — '+txt(err&&err.message||err),true);
    }
  }

  function prep(e){
    const button=e.target&&e.target.closest?e.target.closest('button'):null;
    if(!button)return;
    arm(button);
  }

  window.addEventListener('pointerdown',prep,true);
  window.addEventListener('keydown',function(e){
    if(e.key!=='Enter'&&e.key!==' ')return;
    const button=e.target&&e.target.closest?e.target.closest('button'):null;
    if(button)arm(button);
  },true);

  window.addEventListener('click',function(e){
    const button=e.target&&e.target.closest?e.target.closest('button'):null;
    if(!button||button.dataset.yayaDirectSaveArmed!=='1')return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    save(button);
  },true);
})();
