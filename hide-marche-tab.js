(function(){
'use strict';
if(window.__yayaHideMarcheTab)return;
window.__yayaHideMarcheTab=true;
const style=document.createElement('style');
style.id='yaya-hide-marche-tab-style';
style.textContent='#pane-chantiers .yaya-detail-section-tab[data-section="marche"]{display:none!important}';
document.head.appendChild(style);
function hide(){
 document.querySelectorAll('#pane-chantiers .yaya-detail-section-tab[data-section="marche"]').forEach(btn=>btn.style.setProperty('display','none','important'));
}
hide();
new MutationObserver(hide).observe(document.documentElement,{childList:true,subtree:true});
})();