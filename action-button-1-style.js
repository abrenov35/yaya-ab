(function(){
  'use strict';
  const id='yaya-action-button-1-style-v1';
  if(document.getElementById(id))return;

  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    /* TEST 1/3 — uniquement le premier bouton d'action : VOIR */
    #pane-achats .charge-open-btn{
      width:28px!important;
      min-width:28px!important;
      max-width:28px!important;
      height:28px!important;
      min-height:28px!important;
      padding:0!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      border:1px solid #c8d7e7!important;
      border-radius:7px!important;
      background:#f4f8fc!important;
      color:#234f79!important;
      box-shadow:0 1px 2px rgba(22,45,73,.12)!important;
      font-size:12px!important;
      line-height:1!important;
      transition:background .15s ease,border-color .15s ease,transform .08s ease,box-shadow .15s ease!important;
    }
    #pane-achats .charge-open-btn:hover{
      background:#eaf2f9!important;
      border-color:#afc4da!important;
      box-shadow:0 2px 4px rgba(22,45,73,.14)!important;
    }
    #pane-achats .charge-open-btn:active{
      transform:translateY(1px)!important;
      box-shadow:0 1px 1px rgba(22,45,73,.10)!important;
    }
  `;
  document.head.appendChild(style);
})();
