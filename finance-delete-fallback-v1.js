(function(){
'use strict';
if(window.__yayaDeleteFallbackV1)return;
window.__yayaDeleteFallbackV1=true;
function txt(v){return String(v==null?'':v).trim();}
async function removeRow(id){
  id=txt(id);
  if(!id||typeof apiPost!=='function'||typeof S==='undefined'||!S||!Array.isArray(S.achats))return false;
  var rows=S.achats.filter(function(a){return txt(a&&a.id)!==id;}).map(function(a){return Object.assign({},a);});
  if(rows.length===S.achats.length)return false;
  var ok=await apiPost('setAchats',rows);
  if(!ok)return false;
  S.achats=rows;
  try{
    var raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
    var cached=raw?JSON.parse(raw):{};
    cached.achats=rows;
    localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
  }catch(e){}
  try{if(typeof render==='function')render();}catch(e){}
  return true;
}
window.addEventListener('click',async function(e){
  var btn=e.target&&e.target.closest&&e.target.closest('[data-bg-ok],.ycpf-confirm-ok');
  if(!btn||btn.dataset.yayaFallbackBusy==='1')return;
  var dialog=btn.closest('.yaya-finance-bg-delete-confirm-v1,.ycpf-confirm');
  if(!dialog)return;
  var edit=document.querySelector('#modalRoot .modal');
  var raw='';
  try{raw=Array.from((edit||document).querySelectorAll('button')).map(function(b){return b.getAttribute('onclick')||'';}).find(function(v){return /saveAchat/.test(v);})||'';}catch(_){}
  var match=raw.match(/saveAchat\(\s*['"]([^'"]+)/);
  var id=match&&match[1]||btn.dataset.achatId||'';
  if(!id&&edit&&edit.dataset)id=edit.dataset.yayaAchatId||'';
  if(!id)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  btn.dataset.yayaFallbackBusy='1';btn.disabled=true;btn.textContent='Suppression…';
  try{
    var ok=await removeRow(id);
    if(!ok)throw new Error('enregistrement refusé');
    dialog.remove();
    try{if(typeof closeModal==='function')closeModal();}catch(_){}
    try{document.getElementById('yaya-charge-piece-fast-viewer-v5')?.remove();}catch(_){}
    try{if(typeof toast==='function')toast('Achat ou charge supprimé ✓');}catch(_){}
  }catch(err){
    btn.dataset.yayaFallbackBusy='';btn.disabled=false;btn.textContent='Supprimer de Yaya';
    try{if(typeof toast==='function')toast('Suppression impossible : '+err.message,true);}catch(_){}
  }
},true);
})();
