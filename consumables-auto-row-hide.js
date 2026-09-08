(function(){
  'use strict';

  if(window.__yayaConsumablesAutoRowHideV1)return;
  window.__yayaConsumablesAutoRowHideV1=true;

  const TYPE='Consommables';
  const FOURNISSEUR='FORFAIT CONSOMMABLES';

  function achats(){
    try{return Array.isArray(window.S&&S.achats)?S.achats:[];}catch(e){return [];}
  }

  function isConsumable(a){
    if(!a)return false;
    return String(a.typeDoc||'')===TYPE ||
      String(a.fournisseur||'')===FOURNISSEUR ||
      String(a.origine||'')==='CONSOMMABLES_AUTO';
  }

  function isConsumableId(id){
    const sid=String(id||'');
    if(!sid)return false;
    return achats().some(a=>String(a&&a.id||'')===sid&&isConsumable(a));
  }

  function rowExpenseId(row){
    if(!row)return '';
    for(const el of row.querySelectorAll('[onclick]')){
      const txt=String(el.getAttribute('onclick')||'');
      const m=txt.match(/(?:editAchat|editMontantAchat|delAchat)\(['\"]([^'\"]+)['\"]\)/);
      if(m&&m[1])return String(m[1]);
    }
    return '';
  }

  function hideRows(){
    document.querySelectorAll('#pane-chantiers .achligne.ligD').forEach(row=>{
      const id=rowExpenseId(row);
      const byId=id&&isConsumableId(id);
      const byText=String(row.textContent||'').toUpperCase().includes(FOURNISSEUR);
      if(byId||byText){
        row.style.setProperty('display','none','important');
        row.setAttribute('aria-hidden','true');
        row.dataset.yayaConsumablesAuto='1';
      }
    });
  }

  function wrapEdit(name){
    const original=window[name];
    if(typeof original!=='function'||original.__yayaConsumablesGuard)return;
    const wrapped=function(id){
      if(isConsumableId(id)){
        try{
          if(typeof window.toast==='function')window.toast('Consommables calculés automatiquement : heures × coefficient.');
        }catch(e){}
        return false;
      }
      return original.apply(this,arguments);
    };
    wrapped.__yayaConsumablesGuard=true;
    window[name]=wrapped;
  }

  function install(){
    wrapEdit('editAchat');
    wrapEdit('editMontantAchat');
    hideRows();
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      install();
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  }else{
    schedule();
  }

  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
