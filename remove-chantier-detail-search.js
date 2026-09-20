(function(){
'use strict';
if(window.__YAYA_REMOVE_DETAIL_SEARCH_V1)return;
window.__YAYA_REMOVE_DETAIL_SEARCH_V1=true;

const id='yaya-remove-detail-search-v2';
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
}

remove();
const pane=document.getElementById('pane-chantiers');
if(pane)new MutationObserver(remove).observe(pane,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',remove,{once:true});
setTimeout(remove,100);
setTimeout(remove,500);
})();
