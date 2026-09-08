(function(){
  'use strict';

  if(window.__yayaConsumablesHideLineV2)return;
  window.__yayaConsumablesHideLineV2=true;

  const TARGET='FORFAIT CONSOMMABLES';

  function norm(v){return String(v||'').replace(/\s+/g,' ').trim().toUpperCase();}

  function isTargetText(el){
    if(!el)return false;
    return norm(el.textContent).indexOf(TARGET)!==-1;
  }

  function expenseById(id){
    try{
      if(typeof S==='undefined'||!Array.isArray(S.achats))return null;
      return S.achats.find(function(a){return String(a&&a.id||'')===String(id||'');})||null;
    }catch(e){return null;}
  }

  function isConsumableExpense(a){
    if(!a)return false;
    return norm(a.fournisseur)===TARGET ||
      norm(a.typeDoc)==='CONSOMMABLES' ||
      norm(a.origine)==='CONSOMMABLES_AUTO';
  }

  function rowFromElement(el){
    if(!el)return null;

    const direct=el.closest&&el.closest('.achligne,.yaya-detail-expense-row,[data-achat-id],[data-expense-id],tr,li');
    if(direct)return direct;

    let cur=el;
    for(let i=0;i<7&&cur&&cur.parentElement;i++,cur=cur.parentElement){
      const hasDelete=cur.querySelector&&cur.querySelector('button[onclick*="delAchat"],.x');
      const hasAmount=cur.querySelector&&cur.querySelector('b,.editable,strong');
      if(hasDelete&&hasAmount)return cur;
    }
    return null;
  }

  function hideRow(row){
    if(!row)return;
    row.classList.add('yaya-consumables-hidden-row');
    row.style.setProperty('display','none','important');
    row.setAttribute('aria-hidden','true');
  }

  function hideByText(){
    const root=document.getElementById('pane-chantiers');
    if(!root)return;

    root.querySelectorAll('*').forEach(function(el){
      if(!isTargetText(el))return;
      const row=rowFromElement(el);
      if(row)hideRow(row);
    });
  }

  function hideByData(){
    const root=document.getElementById('pane-chantiers');
    if(!root)return;

    root.querySelectorAll('[onclick*="editAchat"],[onclick*="editMontantAchat"],[onclick*="delAchat"]').forEach(function(el){
      const code=String(el.getAttribute('onclick')||'');
      const m=code.match(/(?:editAchat|editMontantAchat|delAchat)\(['\"]([^'\"]+)['\"]\)/);
      if(!m||!isConsumableExpense(expenseById(m[1])))return;
      hideRow(rowFromElement(el));
    });
  }

  function hide(){hideByText();hideByData();}

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){scheduled=false;hide();});
  }

  const style=document.createElement('style');
  style.textContent='#pane-chantiers .yaya-consumables-hidden-row{display:none!important;}';
  document.head.appendChild(style);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('yaya:data-refreshed',schedule);
  setTimeout(schedule,120);
  setTimeout(schedule,400);
  setTimeout(schedule,1000);
})();