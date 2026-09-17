// Onglet Commande : aucun compteur/chiffre affiche a cote du libelle.
(function(){
  'use strict';
  if(window.__YAYA_COMMANDE_TAB_NO_COUNT_FINAL)return;
  window.__YAYA_COMMANDE_TAB_NO_COUNT_FINAL=true;

  const STYLE_ID='yaya-commande-tab-no-count-final-style';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .card .yaya-detail-section-tabs .yaya-detail-section-tab[data-section="commandes"] > small,
      #pane-chantiers .card .yaya-detail-section-tabs .yaya-detail-section-tab.yaya-commande-tab-contrast > small{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        min-width:0!important;
        height:0!important;
        margin:0!important;
        padding:0!important;
      }
    `;
    document.head.appendChild(style);
  }

  function isCommandeTab(btn){
    if(!btn)return false;
    if(String(btn.dataset&&btn.dataset.section||'').toLowerCase()==='commandes')return true;
    const strong=btn.querySelector(':scope > strong');
    return /^commande$/i.test(String(strong&&strong.textContent||'').trim());
  }

  function clean(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-section-tabs .yaya-detail-section-tab').forEach(function(btn){
      if(!isCommandeTab(btn))return;
      btn.querySelectorAll(':scope > small').forEach(function(counter){counter.remove();});
    });
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;clean();});
  }

  installStyle();
  clean();
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  setTimeout(clean,0);
  setTimeout(clean,100);
  setTimeout(clean,400);
})();
