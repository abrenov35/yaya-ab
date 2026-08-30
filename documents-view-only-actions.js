(function(){
  'use strict';

  const STYLE_ID='yaya-documents-view-only-css-v4';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #pane-documents button[onclick^="openDocumentModal("],
    #pane-documents button[onclick^="editDocument("],
    #pane-documents button[onclick^="delDocument("]{display:none!important}

    #pane-documents > .note{margin:8px 0 6px!important;color:#162D49!important;opacity:1!important;font-size:11px!important;font-weight:800!important;letter-spacing:0!important}
    #pane-documents > .card{margin:0!important;padding:0!important;background:#fff!important;border:0!important;border-left:0!important;border-radius:0!important;box-shadow:none!important}
    #pane-documents > .card > .achligne.ligR{min-height:70px!important;padding:13px 18px!important;border-top:1px solid #DDE3EA!important;color:#162D49!important;background:#fff!important}
    #pane-documents > .card > .achligne.ligR:last-child{border-bottom:1px solid #DDE3EA!important}

    /* Type du document : toujours sur une seule ligne. */
    #pane-documents .achligne.ligR > .badge:nth-child(1){
      display:inline-flex!important;
      align-items:center!important;
      justify-content:flex-start!important;
      width:auto!important;
      min-width:0!important;
      max-width:100%!important;
      min-height:0!important;
      padding:0!important;
      background:transparent!important;
      color:#162D49!important;
      border:0!important;
      border-radius:0!important;
      font-size:10px!important;
      font-weight:800!important;
      line-height:1!important;
      white-space:nowrap!important;
      overflow:visible!important;
      word-break:keep-all!important;
      text-align:left!important;
      box-shadow:none!important;
      flex-shrink:0!important;
    }

    #pane-documents .achligne.ligR > .badge:nth-child(2){min-width:0!important;padding:0!important;background:transparent!important;color:#162D49!important;border:0!important;border-radius:0!important;font-size:12px!important;font-weight:800!important;text-align:left!important;box-shadow:none!important}
    #pane-documents .achligne.ligR > .badge:nth-child(3){min-width:0!important;padding:0!important;background:transparent!important;color:#162D49!important;border:0!important;border-radius:0!important;font-size:11px!important;font-weight:500!important;text-align:left!important;box-shadow:none!important}

    @media(max-width:620px){
      #pane-documents > .card > .achligne.ligR{overflow:visible!important}
      #pane-documents .achligne.ligR > .badge:nth-child(1){font-size:9px!important;padding:0!important;white-space:nowrap!important}
    }
  `;
  document.head.appendChild(style);
})();
