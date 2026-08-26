(function(){
  'use strict';

  function placeSearchAfterTabs(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    const tabs=pane.querySelector('.yaya-suivi-tabs');
    const searchLine=pane.querySelector('.yaya-chantier-search-line');
    if(!tabs||!searchLine)return;
    if(tabs.nextElementSibling!==searchLine){
      tabs.insertAdjacentElement('afterend',searchLine);
    }
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      placeSearchAfterTabs();
    });
  }

  const obs=new MutationObserver(schedule);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(placeSearchAfterTabs,50);
  setTimeout(placeSearchAfterTabs,250);
})();
