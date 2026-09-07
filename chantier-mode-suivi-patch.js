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

/* Charge le correctif Achat / Facture sous-traitant : un seul champ texte. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-achat-st-single-field="1"]'))return;
  const s=document.createElement('script');
  s.src='achat-soustraitant-modal-fix.js?v=single-field-2-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-achat-st-single-field','1');
  document.head.appendChild(s);
})();
