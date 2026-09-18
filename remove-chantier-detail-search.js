(function(){
'use strict';
if(window.__YAYA_REMOVE_DETAIL_SEARCH_V1)return;
window.__YAYA_REMOVE_DETAIL_SEARCH_V1=true;

const id='yaya-remove-detail-search-v1';
if(!document.getElementById(id)){
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-chantiers .yaya-detail-search-wrap{
      display:none!important;
    }
  `;
  document.head.appendChild(style);
}

function remove(){
  document.querySelectorAll('#pane-chantiers .yaya-detail-search-wrap').forEach(function(el){el.remove();});
}

remove();
const pane=document.getElementById('pane-chantiers');
if(pane)new MutationObserver(remove).observe(pane,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',remove,{once:true});
setTimeout(remove,100);
setTimeout(remove,500);
})();