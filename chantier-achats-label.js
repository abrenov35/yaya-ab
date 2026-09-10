(function(){
  'use strict';

  if(window.__yayaChantierAchatsLabelV1)return;
  window.__yayaChantierAchatsLabelV1=true;

  function replaceTabLabel(tab){
    if(!tab)return;

    // Le moteur d'onglets place le libellé dans <strong> et le compteur dans <small>.
    // On remplace uniquement le libellé, sans ajouter de texte devant le bouton.
    const strong=tab.querySelector('strong');
    if(strong){
      if(strong.textContent!=='Achats')strong.textContent='Achats';
      Array.from(tab.childNodes).forEach(function(node){
        if(node.nodeType!==Node.TEXT_NODE)return;
        const t=String(node.textContent||'').trim();
        if(/^achats$/i.test(t)||/^d[ée]penses$/i.test(t))node.remove();
      });
      return;
    }

    let replaced=false;
    Array.from(tab.childNodes).forEach(function(node){
      if(node.nodeType!==Node.TEXT_NODE)return;
      const t=String(node.textContent||'').trim();
      if(/^d[ée]penses$/i.test(t)||/^achats$/i.test(t)){
        if(!replaced){node.textContent='Achats ';replaced=true;}
        else node.remove();
      }
    });
    if(!replaced)tab.insertBefore(document.createTextNode('Achats '),tab.firstChild||null);
  }

  function apply(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    pane.querySelectorAll('.yaya-detail-section-tab[data-section="depenses"]').forEach(replaceTabLabel);

    pane.querySelectorAll('.yaya-detail-section-action-row[data-section="depenses"] .yaya-detail-section-action-title').forEach(function(el){
      if(el.textContent!=='Achats')el.textContent='Achats';
    });

    pane.querySelectorAll('.yaya-detail-section-action-row[data-section="depenses"] .yaya-detail-section-action-button').forEach(function(el){
      const t=String(el.textContent||'').trim();
      if(/dépense/i.test(t)||/depense/i.test(t))el.textContent='＋ Ajouter un achat';
    });

    pane.querySelectorAll('.yaya-detail-empty-pane[data-section="depenses"]').forEach(function(el){
      const t=String(el.textContent||'').trim();
      if(/^aucune dépense$/i.test(t)||/^aucune depense$/i.test(t))el.textContent='Aucun achat';
    });
  }

  function install(){
    apply();
    const pane=document.getElementById('pane-chantiers');
    if(!pane){setTimeout(install,180);return;}
    if(!pane.dataset.yayaAchatsLabelObserved){
      pane.dataset.yayaAchatsLabelObserved='1';
      new MutationObserver(function(){requestAnimationFrame(apply);}).observe(pane,{childList:true,subtree:true,characterData:true});
    }
  }

  install();
})();
