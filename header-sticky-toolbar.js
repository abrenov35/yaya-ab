(function(){
  'use strict';
  const STYLE_ID='yaya-header-sticky-toolbar-v1';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .hdr{
      position:sticky!important;
      top:0!important;
      z-index:10000!important;
      width:100%!important;
      background:inherit!important;
    }
  `;
  document.head.appendChild(style);
})();
