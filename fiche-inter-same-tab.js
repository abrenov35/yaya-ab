(function(){
  'use strict';

  function install(){
    const link=document.querySelector('.fiche-inter-tab');
    if(!link){setTimeout(install,120);return;}
    if(link.dataset.yayaSameTab==='1')return;
    link.dataset.yayaSameTab='1';
    link.removeAttribute('target');
    link.removeAttribute('rel');
    link.addEventListener('click',function(e){
      e.preventDefault();
      const href=this.getAttribute('href');
      if(href)window.location.href=href;
    });
  }

  install();
})();
