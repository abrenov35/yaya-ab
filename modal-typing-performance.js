(function(){
'use strict';
if(window.__yayaModalTypingFastV3)return;
window.__yayaModalTypingFastV3=true;
window.__yayaModalTypingFastV2=true;
window.__yayaModalTypingFastV1=true;
const id='yaya-modal-typing-fast-v3';
if(document.getElementById(id))return;
const s=document.createElement('style');
s.id=id;
s.textContent=`
body #modalRoot .overlay,
body #modalRoot .yaya-finance-edit-overlay,
body #ycnEditModal.ycn-modal,
.ydd-ov,
.yaya-commande-create-overlay,
.yaya-consumables-overlay,
.yaya-charge-delete-overlay{
  -webkit-backdrop-filter:none!important;
  backdrop-filter:none!important;
  filter:none!important;
}
body #modalRoot .modal,
body #modalRoot .achat-edit-modal,
body #ycnEditModal .ycn-dialog,
.ydd-modal,
.yaya-commande-create-modal{
  contain:layout paint!important;
}
body.yaya-fast-finance-typing > .hdr,
body.yaya-fast-finance-typing > .body{
  visibility:hidden!important;
  pointer-events:none!important;
}
body.yaya-fast-finance-typing #modalRoot .overlay{
  background:#eef2f6!important;
}
body.yaya-fast-finance-typing #modalRoot .modal{
  box-shadow:0 12px 32px rgba(15,23,42,.18)!important;
  isolation:isolate!important;
}
body #modalRoot input,
body #modalRoot textarea,
body #modalRoot select,
body #ycnEditModal input,
body #ycnEditModal textarea,
body #ycnEditModal select{
  will-change:auto!important;
  transform:none!important;
  filter:none!important;
  -webkit-backdrop-filter:none!important;
  backdrop-filter:none!important;
  transition:none!important;
}
`;
document.head.appendChild(s);

function isFinanceEditOpen(){
  const root=document.getElementById('modalRoot');
  if(!root)return false;
  const modal=root.querySelector('.modal');
  return !!(modal&&modal.querySelector('#eaFour')&&modal.querySelector('#eaDes')&&modal.querySelector('#eaMt'));
}
function syncFastMode(){
  const active=isFinanceEditOpen();
  document.body.classList.toggle('yaya-fast-finance-typing',active);
  if(!active)return;
  document.querySelectorAll('#modalRoot #eaFour,#modalRoot #eaDes').forEach(function(input){
    input.spellcheck=false;
    input.autocomplete='off';
  });
}
function installFastMode(){
  const root=document.getElementById('modalRoot');
  if(!root){setTimeout(installFastMode,120);return;}
  let raf=0;
  new MutationObserver(function(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;syncFastMode();});
  }).observe(root,{childList:true,subtree:true});
  syncFastMode();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installFastMode,{once:true});
else installFastMode();
})();
