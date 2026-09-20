(function(){
'use strict';
if(window.__yayaModalTypingFastV1)return;
window.__yayaModalTypingFastV1=true;
const id='yaya-modal-typing-fast-v1';
if(document.getElementById(id))return;
const s=document.createElement('style');
s.id=id;
s.textContent=`
#modalRoot .overlay,
.ycn-modal,
.ydd-ov,
.yaya-commande-create-overlay,
.yaya-consumables-overlay,
.yaya-charge-delete-overlay{
  -webkit-backdrop-filter:none!important;
  backdrop-filter:none!important;
  filter:none!important;
}
#modalRoot .modal,
.ycn-dialog,
.ydd-modal,
.yaya-commande-create-modal{
  contain:layout paint!important;
}
#modalRoot input,
#modalRoot textarea,
#modalRoot select{
  will-change:auto!important;
  transform:none!important;
  filter:none!important;
}
`;
document.head.appendChild(s);
})();