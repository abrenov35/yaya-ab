/* ═══════════════════════════════════════════════════════════════ */
/* YAYA - Sections Style Patch - Injectée dans le DOM             */
/* Titre noir + Liseret vert + Hauteurs uniformisées              */
/* ═══════════════════════════════════════════════════════════════ */

(function(){
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
