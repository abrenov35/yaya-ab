(function(){
  'use strict';

  const STYLE_ID='yaya-documents-view-only-css-v2';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    /* Page Documents uniquement : lecture seule. */
    #pane-documents button[onclick^="openDocumentModal("],
    #pane-documents button[onclick^="editDocument("],
    #pane-documents button[onclick^="delDocument("]{
      display:none!important;
    }

    /* Présentation calée sur « Dernières charges validées ». */
    #pane-documents > .note{
      margin:8px 0 6px!important;
      color:#162D49!important;
      opacity:1!important;
      font-size:11px!important;
      font-weight:800!important;
      letter-spacing:0!important;
    }

    #pane-documents > .card{
      margin:0!important;
      padding:0!important;
      background:#fff!important;
      border:0!important;
      border-left:3px solid #10B981!important;
      border-radius:0!important;
      box-shadow:none!important;
    }

    #pane-documents > .card > .achligne.ligR{
      min-height:70px!important;
      padding:13px 18px!important;
      border-top:1px solid #DDE3EA!important;
      color:#162D49!important;
      background:#fff!important;
    }

    #pane-documents > .card > .achligne.ligR:last-child{
      border-bottom:1px solid #DDE3EA!important;
    }

    #pane-documents .achligne.ligR > .badge:nth-child(1){
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      min-height:42px!important;
      padding:0 14px!important;
      background:#fff!important;
      color:#162D49!important;
      border:1px solid #C7D4E0!important;
      border-radius:9px!important;
      font-size:11px!important;
      font-weight:800!important;
      box-shadow:none!important;
    }

    #pane-documents .achligne.ligR > .badge:nth-child(2){
      min-width:0!important;
      padding:0!important;
      background:transparent!important;
      color:#162D49!important;
      border:0!important;
      border-radius:0!important;
      font-size:12px!important;
      font-weight:800!important;
      text-align:left!important;
      box-shadow:none!important;
    }

    #pane-documents .achligne.ligR > .badge:nth-child(3){
      min-width:0!important;
      padding:0!important;
      background:transparent!important;
      color:#162D49!important;
      border:0!important;
      border-radius:0!important;
      font-size:11px!important;
      font-weight:500!important;
      text-align:left!important;
      box-shadow:none!important;
    }
  `;
  document.head.appendChild(style);
})();
