(function(){
  'use strict';
  const STYLE_ID='yaya-evolution-ca-hide-title-v1';
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #pane-evolution .evo2-toolbar{display:none!important}
  `;
  document.head.appendChild(style);
})();
