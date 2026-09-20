(function(){
'use strict';
if(window.__YAYA_REMOVE_DETAIL_SEARCH_V1)return;
window.__YAYA_REMOVE_DETAIL_SEARCH_V1=true;

const id='yaya-remove-detail-search-v3';
if(!document.getElementById(id)){
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    .yaya-detail-search-wrap,
    #pane-chantiers .yaya-detail-search-input,
    #pane-chantiers .yaya-detail-search-clear{
      display:none!important;
    }
  `;
  document.head.appendChild(style);
}

function remove(){
  document.querySelectorAll('.yaya-detail-search-wrap').forEach(function(el){el.remove();});

  const pane=document.getElementById('pane-chantiers');
  if(!pane||!pane.querySelector('.yaya-detail-section-tabs'))return;

  // L'ancien renderChantiers peut recréer sa recherche après l'ouverture de
  // la fiche. Son input est ensuite déplacé dans l'en-tête, mais la barre,
  // la loupe et la croix peuvent rester. La retirer à chaque nouveau rendu.
  pane.querySelectorAll('div').forEach(function(row){
    const input=row.querySelector(':scope > #filtreInput');
    const icon=[...row.children].some(function(el){
      return el.tagName==='SPAN'&&/[🔍🔎]/.test(String(el.textContent||''));
    });
    if(input||icon)row.remove();
  });
}

remove();
const pane=document.getElementById('pane-chantiers');
if(pane)new MutationObserver(remove).observe(pane,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',remove,{once:true});
setTimeout(remove,100);
setTimeout(remove,500);
setTimeout(remove,1500);
})();
