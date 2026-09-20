(function(){
'use strict';
if(window.__yayaModalTypingFastV2)return;
window.__yayaModalTypingFastV2=true;
window.__yayaModalTypingFastV1=true;
const id='yaya-modal-typing-fast-v2';
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
})();
