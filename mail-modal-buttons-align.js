(function(){
  'use strict';
  if(window.__yayaMailModalButtonsAlignV1)return;
  window.__yayaMailModalButtonsAlignV1=true;
  const id='yaya-mail-modal-buttons-align-v1';
  if(document.getElementById(id))return;
  const s=document.createElement('style');
  s.id=id;
  s.textContent=`
    #modalRoot .yaya-mail-body-modal .yaya-read-actions{
      display:flex!important;
      flex-direction:row!important;
      align-items:center!important;
      flex-wrap:nowrap!important;
      gap:10px!important;
      width:100%!important;
    }
    #modalRoot .yaya-mail-body-modal .yaya-read-actions .yaya-delete{
      margin:0 auto 0 0!important;
    }
    #modalRoot .yaya-mail-body-modal .yaya-read-actions .yaya-edit{
      margin:0!important;
    }
    #modalRoot .yaya-mail-body-modal .yaya-read-actions button:last-child{
      margin:0!important;
    }
    @media(max-width:640px){
      #modalRoot .yaya-mail-body-modal .yaya-read-actions{
        flex-wrap:nowrap!important;
        gap:6px!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-read-actions button{
        flex:0 1 auto!important;
        min-width:0!important;
        padding-left:10px!important;
        padding-right:10px!important;
      }
    }
  `;
  document.head.appendChild(s);
})();
