(function(){
  'use strict';
  const STYLE_ID='yaya-header-sticky-toolbar-v2';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .hdr{
      position:sticky!important;
      top:0!important;
      z-index:60!important;
    }
  `;
  document.head.appendChild(style);
})();
