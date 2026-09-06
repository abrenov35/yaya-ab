(function(){
  'use strict';

  // Bloque définitivement l’ancienne passerelle chantier-auto-planning-create.js.
  window.__yayaAutoPlanningCreateInstalled=true;

  if(document.querySelector('script[data-yaya-planning-bridge-v3]'))return;
  const script=document.createElement('script');
  script.src='planning-bridge.js?v=bridge-3';
  script.async=false;
  script.setAttribute('data-yaya-planning-bridge-v3','1');
  document.head.appendChild(script);
})();
