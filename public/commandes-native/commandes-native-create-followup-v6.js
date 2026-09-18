(function(){
'use strict';
if(window.__YAYA_COMMANDES_CREATE_FOLLOWUP_V6)return;
window.__YAYA_COMMANDES_CREATE_FOLLOWUP_V6=true;

function apply(){
  const sel=document.getElementById('ycnResponsable');
  if(sel && ![...sel.options].some(o=>String(o.value||o.textContent).trim()==='Pascale')){
    const opt=document.createElement('option');
    opt.value='Pascale';
    opt.textContent='Pascale';
    sel.appendChild(opt);
  }

  let style=document.getElementById('ycn-v6-small-fixes');
  if(!style){
    style=document.createElement('style');
    style.id='ycn-v6-small-fixes';
    style.textContent=`
      body #ycnEditModal .ycn-doc-v5{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        text-align:center!important;
      }
    `;
    document.head.appendChild(style);
  }
}

apply();
const obs=new MutationObserver(()=>apply());
obs.observe(document.body,{childList:true,subtree:true});
window.addEventListener('yaya:data-refreshed',apply);
window.__YAYA_COMMANDES_CREATE_FOLLOWUP_V6_VERSION='6.2-pascale-center-doc';
})();