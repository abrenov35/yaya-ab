(function(){
  'use strict';

  // Bloque définitivement l’ancienne passerelle chantier-auto-planning-create.js.
  window.__yayaAutoPlanningCreateInstalled=true;

  if(document.querySelector('script[data-yaya-planning-bridge-v2]'))return;
  const script=document.createElement('script');
  script.src='planning-bridge.js?v=bridge-2';
  script.async=false;
  script.setAttribute('data-yaya-planning-bridge-v2','1');
  document.head.appendChild(script);
})();
