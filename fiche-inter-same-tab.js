(function(){
  'use strict';

  function install(){
    const link=document.querySelector('.fiche-inter-tab');
    if(!link){setTimeout(install,120);return;}

    link.setAttribute('target','_blank');
    link.setAttribute('rel','noopener noreferrer');
    link.removeAttribute('data-yaya-inline-fiche');

    // L'ancienne version ouvrait la Fiche inter dans Yaya via un iframe.
    // On force désormais une ouverture indépendante dans un nouvel onglet.
    if(link.dataset.yayaNewTabFiche==='1')return;
    link.dataset.yayaNewTabFiche='1';

    link.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const href=this.getAttribute('href')||'https://abrenov35.github.io/docs-chantier-ab/';
      window.open(href,'_blank','noopener');
    },true);
  }

  install();
})();
