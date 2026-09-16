(function(){
  'use strict';
  window.syncMsg=function(m){
    var el=document.getElementById('syncState');
    if(el) el.textContent=String(m||'');
  };
})();
