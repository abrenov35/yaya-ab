(function(){
  'use strict';

  const STYLE_ID = 'yaya-chantier-home-white-grey-style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Fond global plus sobre */
      #pane-chantiers{
        background:#f3f4f6 !important;
        padding:10px !important;
        border-radius:12px !important;
      }

      /* Barre de recherche */
      #pane-chantiers #filtreInput{
        background:#ffffff !important;
        border:1px solid #d1d5db !important;
        color:#1f2937 !important;
        box-shadow:none !important;
      }

      /* Lignes chantiers */
      #pane-chantiers .yaya-chantier-home-row{
        border:1px solid #d6d9df !important;
        border-radius:10px !important;
        box-shadow:none !important;
        margin:0 0 10px 0 !important;
        padding:0 !important;
        overflow:hidden !important;
      }

      #pane-chantiers .yaya-chantier-home-row.yaya-row-white{
        background:#ffffff !important;
      }

      #pane-chantiers .yaya-chantier-home-row.yaya-row-grey{
        background:#f1f3f5 !important;
      }

      /* Nettoyage des cartes internes éventuelles */
      #pane-chantiers .yaya-chantier-home-row .card{
        background:transparent !important;
        box-shadow:none !important;
        border:none !important;
        margin:0 !important;
      }

      /* Titres / textes */
      #pane-chantiers .yaya-chantier-home-row b,
      #pane-chantiers .yaya-chantier-home-row strong{
        color:#1f2937 !important;
      }

      #pane-chantiers .yaya-chantier-home-row small,
      #pane-chantiers .yaya-chantier-home-row .note{
        color:#6b7280 !important;
      }

      /* Boutons actions à droite plus sobres */
      #pane-chantiers .yaya-chantier-home-row button{
        background:#ffffff !important;
        border:1px solid #cfd4dc !important;
        color:#4b5563 !important;
        box-shadow:none !important;
      }

      #pane-chantiers .yaya-chantier-home-row button:hover{
        background:#eceff3 !important;
      }

      /* Légère respiration sur les zones internes */
      #pane-chantiers .yaya-chantier-home-row > div{
        padding-left:12px;
        padding-right:12px;
      }
    `;
    document.head.appendChild(style);
  }

  function isChantierRow(el){
    if(!el || !el.textContent) return false;
    const txt = el.textContent.replace(/\s+/g,' ').trim();

    return (
      /Signature\s*:/.test(txt) ||
      /Début\s*:/.test(txt) ||
      /Marché\s*:/.test(txt) ||
      /Marge\s*:/.test(txt)
    );
  }

  function paintRows(){
    const pane = document.getElementById('pane-chantiers');
    if(!pane) return;

    const children = Array.from(pane.children || []);
    let index = 0;

    children.forEach(el=>{
      el.classList.remove('yaya-chantier-home-row','yaya-row-white','yaya-row-grey');

      if(!isChantierRow(el)) return;

      el.classList.add('yaya-chantier-home-row');
      el.classList.add(index % 2 === 0 ? 'yaya-row-white' : 'yaya-row-grey');
      index++;
    });
  }

  function refresh(){
    injectStyle();
    paintRows();
  }

  function install(){
    refresh();

    const paneWatcher = setInterval(()=>{
      const pane = document.getElementById('pane-chantiers');
      if(!pane) return;

      clearInterval(paneWatcher);
      refresh();

      const mo = new MutationObserver(()=>{
        refresh();
      });

      mo.observe(pane, {
        childList: true,
        subtree: true
      });
    }, 200);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();