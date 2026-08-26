(function(){
  'use strict';
  const id='yaya-chantier-action-border-v1';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-chantiers .chantier-fin-toolbar > .chantier-expense-btn,
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openDocumentModal"]{
      background:#fff!important;
      border:1px solid #003D7A!important;
      color:#003D7A!important;
      box-shadow:none!important;
    }
    #pane-chantiers .chantier-fin-toolbar > .chantier-expense-btn:hover,
    #pane-chantiers .chantier-fin-toolbar > button[onclick*="openDocumentModal"]:hover{
      background:#E8F2F9!important;
    }
  `;
  document.head.appendChild(style);
})();
