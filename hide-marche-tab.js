(function(){
'use strict';
if(window.__yayaHideMarcheTab)return;
window.__yayaHideMarcheTab=true;

const style=document.createElement('style');
style.id='yaya-hide-marche-tab-style';
style.textContent='#pane-chantiers .yaya-detail-section-tab[data-section="marche"]{display:none!important}';
document.head.appendChild(style);

function hide(){
  document.querySelectorAll('#pane-chantiers .yaya-detail-section-tab[data-section="marche"]').forEach(function(btn){
    btn.style.setProperty('display','none','important');
    if(btn.classList.contains('on')){
      const tabs=btn.closest('.yaya-detail-section-tabs');
      const commandes=tabs&&tabs.querySelector('.yaya-detail-section-tab[data-section="commandes"]');
      if(commandes)commandes.click();
    }
  });
}

hide();
let raf=0;
new MutationObserver(function(){
  if(raf)return;
  raf=requestAnimationFrame(function(){raf=0;hide();});
}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();