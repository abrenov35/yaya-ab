(function(){
  'use strict';
  const id='yaya-chantier-action-buttons-uniform-v1';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openAvenant"],
    #pane-chantiers .chantier-fin-toolbar > .chantier-expense-btn,
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openDocumentModal"]{
      background:#fff!important;
      color:#003D7A!important;
      border:1px solid #003D7A!important;
      border-radius:7px!important;
      box-shadow:none!important;
      min-height:38px!important;
      height:38px!important;
      padding:0 15px!important;
      font-size:12px!important;
      font-weight:700!important;
    }
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openAvenant"]:hover,
    #pane-chantiers .chantier-fin-toolbar > .chantier-expense-btn:hover,
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openDocumentModal"]:hover{
      background:#E8F2F9!important;
    }
  `;
  document.head.appendChild(style);
})();
