(function(){
  'use strict';
  if (document.querySelector('script[data-yaya-dd-db-search]')) return;
  var s=document.createElement('script');
  s.src='dd-db-search-restore.js?v=20260901-1';
  s.defer=true;
  s.dataset.yayaDdDbSearch='1';
  document.head.appendChild(s);
})();
