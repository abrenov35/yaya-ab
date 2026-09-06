(function(){
  'use strict';

  // Empêche l'ancienne passerelle chantier-auto-planning-create.js de s'installer.
  window.__yayaAutoPlanningCreateInstalled=true;

  if(document.querySelector('script[data-yaya-planning-bridge-v1]'))return;
  const script=document.createElement('script');
  script.src='planning-bridge.js?v=bridge-1';
  script.async=false;
  script.setAttribute('data-yaya-planning-bridge-v1','1');
  document.head.appendChild(script);
})();
