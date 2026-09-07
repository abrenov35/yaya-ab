/* ═══════════════════════════════════════════════════════════════ */
/* YAYA - Sections Style Patch - Injectée dans le DOM             */
/* Titre noir + Liseret vert + Hauteurs uniformisées              */
/* ═══════════════════════════════════════════════════════════════ */

(function(){
  // Évite l'affichage fugace d'une page chantier partiellement rendue au démarrage.
  // Un écran de chargement neutre reste au-dessus de l'application jusqu'au premier
  // rendu réellement exploitable, puis disparaît sans modifier le fonctionnement.
  function installStableBootScreen(){
    if(document.getElementById('yayaStableBootScreen'))return;

    const style=document.createElement('style');
    style.id='yaya-stable-boot-style';
    style.textContent=`
      #yayaStableBootScreen{
        position:fixed!important;
        inset:0!important;
        z-index:999999!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        flex-direction:column!important;
        gap:12px!important;
        background:#f4f6f8!important;
        color:#162d49!important;
        visibility:visible!important;
        opacity:1!important;
        transition:opacity .12s ease!important;
        pointer-events:auto!important;
      }
      #yayaStableBootScreen .yaya-stable-boot-spinner{
        width:32px!important;
        height:32px!important;
        border:4px solid rgba(22,45,73,.14)!important;
        border-top-color:#c9a227!important;
        border-radius:50%!important;
        animation:yayaStableBootSpin .8s linear infinite!important;
      }
      #yayaStableBootScreen .yaya-stable-boot-label{
        font-size:13px!important;
        font-weight:650!important;
        letter-spacing:.01em!important;
      }
      @keyframes yayaStableBootSpin{to{transform:rotate(360deg)}}
    `;
    document.head.appendChild(style);

    const screen=document.createElement('div');
    screen.id='yayaStableBootScreen';
    screen.setAttribute('aria-live','polite');
    screen.innerHTML='<div class="yaya-stable-boot-spinner"></div><div class="yaya-stable-boot-label">Chargement Yaya…</div>';
    document.body.appendChild(screen);

    let removed=false;
    function appReady(){
      const loader=document.getElementById('loader');
      if(loader){
        try{if(getComputedStyle(loader).display!=='none')return false;}catch(e){return false;}
      }

      let chantiers=null;
      try{
        if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return false;
        chantiers=S.chantiers;
      }catch(e){return false;}

      const pane=document.getElementById('pane-chantiers');
      if(!pane)return false;

      try{
        if(typeof focusChantier!=='undefined'&&focusChantier){
          return !!pane.querySelector('.yaya-detail-section-tabs');
        }
      }catch(e){}

      if(chantiers.length===0)return true;
      return !!pane.querySelector('.card');
    }

    function revealWhenReady(){
      if(removed||!appReady())return;
      removed=true;
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          screen.style.setProperty('opacity','0','important');
          screen.style.setProperty('pointer-events','none','important');
          setTimeout(function(){
            screen.remove();
            const bootStyle=document.getElementById('yaya-stable-boot-style');
            if(bootStyle)bootStyle.remove();
          },140);
        });
      });
    }

    const observer=new MutationObserver(revealWhenReady);
    observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
    const timer=setInterval(revealWhenReady,50);

    // Sécurité : ne jamais laisser l'écran de démarrage bloqué en cas d'erreur imprévue.
    setTimeout(function(){
      if(!removed){
        removed=true;
        screen.remove();
        const bootStyle=document.getElementById('yaya-stable-boot-style');
        if(bootStyle)bootStyle.remove();
      }
      observer.disconnect();
      clearInterval(timer);
    },6000);

    revealWhenReady();
  }

  installStableBootScreen();

  // Attendre que le DOM soit prêt
  function ensureStylesAndStructure(){
    // 1. Injecter le CSS
    if(!document.getElementById('yaya-sections-style')){
      const style=document.createElement('style');
      style.id='yaya-sections-style';
      style.textContent=`
.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-left: 1rem;
  border-left: 4px solid #10b981;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: -0.5px;
  text-transform: uppercase;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.data-table thead {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  height: 40px;
  vertical-align: middle;
}

.data-table td {
  padding: 0.5rem 1rem;
  border-bottom: 0.5px solid #f3f4f6;
  font-size: 13px;
  color: #374151;
  height: 44px;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background-color: #fafafa;
}

.badge-type {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.badge-type.document {
  background-color: #dbeafe;
  color: #0c4a6e;
}

.badge-type.photo {
  background-color: #dbeafe;
  color: #0c4a6e;
}

.badge-type.achat {
  background-color: #fce7f3;
  color: #831843;
}

.badge-type.chantier {
  background-color: #dcfce7;
  color: #15803d;
}

.badge-chantier {
  display: inline-block;
  padding: 3px 8px;
  background-color: #f3f4f6;
  border: 0.5px solid #d1d5db;
  border-radius: 3px;
  font-size: 11px;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
}

.text-secondary {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.3;
}

@media (max-width: 768px) {
  .section-header {
    margin-bottom: 1rem;
    padding-left: 0.75rem;
  }

  .section-header h2 {
    font-size: 16px;
  }

  .data-table th,
  .data-table td {
    padding: 0.5rem 0.75rem;
    font-size: 12px;
  }
}
      `;
      document.head.appendChild(style);
    }

    // 2. Adapter les en-têtes de sections existantes (si présents)
    adaptSectionHeaders();
  }

  function adaptSectionHeaders(){
    // Chercher les sections existantes et leur ajouter les headers
    const sections=[
      {id:'pane-documents',title:'Historique des pièces déposées'},
      {id:'pane-achats',title:'Dernières charges validées'},
      {id:'pane-chantiers',title:'Chantiers actifs'},
      {id:'pane-equipe',title:'Équipe'}
    ];

    sections.forEach(sec=>{
      const pane=document.getElementById(sec.id);
      if(!pane)return;

      // Vérifier si le header existe déjà
      if(pane.querySelector('.section-header'))return;

      // Créer et injecter le header
      const header=document.createElement('div');
      header.className='section-header';
      header.innerHTML=`<h2>${sec.title}</h2>`;

      // Insérer au début du pane
      pane.insertBefore(header,pane.firstChild);
    });
  }

  // Écouter les mutations du DOM pour réappliquer au besoin
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',ensureStylesAndStructure);
  } else {
    ensureStylesAndStructure();
  }

  // Re-appliquer après chaque render (si S.render est appelé)
  if(window.render){
    const originalRender=window.render;
    window.render=function(){
      const result=originalRender.apply(this,arguments);
      setTimeout(adaptSectionHeaders,100);
      return result;
    };
  }
})();
