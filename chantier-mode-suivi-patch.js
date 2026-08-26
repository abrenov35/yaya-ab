(function(){
  'use strict';

  function clean(){
    document.querySelectorAll('.yaya-suivi-tabs,.yaya-docs-only-badge,.yaya-mode-suivi-box').forEach(function(el){el.remove();});
    document.querySelectorAll('.yaya-docs-only-card').forEach(function(el){el.classList.remove('yaya-docs-only-card');});
    document.querySelectorAll('.yaya-docs-hide').forEach(function(el){
      el.classList.remove('yaya-docs-hide');
      if(el.style&&el.style.display==='none')el.style.display='';
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});
  else clean();
})();
