(function(){
  'use strict';
  const id='yaya-action-button-1-style-v2';
  if(document.getElementById(id))return;

  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    /* BOUTON 1 — VOIR : petit carré pastel avec contour */
    .charge-open-btn,
    .message-view-btn{
      width:28px!important;
      min-width:28px!important;
      max-width:28px!important;
      height:28px!important;
      min-height:28px!important;
      padding:0!important;
      margin:0 2px!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      border:1px solid #a9c8e8!important;
      border-radius:7px!important;
      background:#f3f8fd!important;
      color:#174d7d!important;
      box-shadow:0 1px 3px rgba(22,45,73,.14)!important;
      font-size:12px!important;
      line-height:1!important;
      cursor:pointer!important;
      vertical-align:middle!important;
      transition:background .15s ease,border-color .15s ease,box-shadow .15s ease,transform .08s ease!important;
    }
    .charge-open-btn:hover,
    .message-view-btn:hover{
      background:#e9f3fc!important;
      border-color:#83b2df!important;
      box-shadow:0 2px 5px rgba(22,45,73,.17)!important;
    }
    .charge-open-btn:active,
    .message-view-btn:active{
      transform:translateY(1px)!important;
      box-shadow:0 1px 2px rgba(22,45,73,.12)!important;
    }
  `;
  document.head.appendChild(style);
})();
