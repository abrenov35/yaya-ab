(function(){
  'use strict';

  if(window.__yayaSearchArchivesV1)return;
  window.__yayaSearchArchivesV1=true;

  let renderFrame=0;
  let installed=false;

  function normalise(v){
    return String(v||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .trim();
  }

  function currentQuery(){
    const input=document.getElementById('filtreInput');
    if(input)return String(input.value||'').trim();
    try{return String(filtreChantier||'').trim();}catch(e){return '';}
  }

  function filterRenderedCards(q){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    const nq=normalise(q);

    pane.querySelectorAll('.card').forEach(function(card){
      const top=card.querySelector('.top');
      const txt=normalise(top?top.textContent:card.textContent);
      card.style.display=!nq||txt.includes(nq)?'':'none';
    });

    pane.querySelectorAll('button').forEach(function(btn){
      const txt=normalise(btn.textContent);
      if(txt.includes('chantiers archives')){
        btn.style.display=nq?'none':'';
      }
    });
  }

  function wrapRender(){
    const original=window.renderChantiers;
    if(typeof original!=='function')return false;
    if(original.__yayaSearchArchivesWrapped)return true;

    const wrapped=function(){
      const q=currentQuery();
      let previous=false;
      let forced=false;

      if(q){
        try{
          previous=showArchives;
          showArchives=true;
          forced=true;
        }catch(e){}
      }

      let out;
      try{
        out=original.apply(this,arguments);
      }finally{
        if(forced){
          try{showArchives=previous;}catch(e){}
        }
        requestAnimationFrame(function(){filterRenderedCards(q);});
      }
      return out;
    };

    wrapped.__yayaSearchArchivesWrapped=true;
    window.renderChantiers=wrapped;
    return true;
  }

  function rerenderForSearch(){
    cancelAnimationFrame(renderFrame);
    renderFrame=requestAnimationFrame(function(){
      wrapRender();
      if(typeof window.renderChantiers==='function')window.renderChantiers();
    });
  }

  function install(){
    if(installed)return;
    if(!wrapRender()){
      setTimeout(install,150);
      return;
    }
    installed=true;

    document.addEventListener('input',function(e){
      const target=e&&e.target;
      if(!target||target.id!=='filtreInput')return;
      try{filtreChantier=target.value;}catch(err){}
      rerenderForSearch();
    },true);

    document.addEventListener('search',function(e){
      const target=e&&e.target;
      if(!target||target.id!=='filtreInput')return;
      try{filtreChantier=target.value;}catch(err){}
      rerenderForSearch();
    },true);

    const pane=document.getElementById('pane-chantiers');
    if(pane){
      new MutationObserver(function(){
        const q=currentQuery();
        if(q)requestAnimationFrame(function(){filterRenderedCards(q);});
      }).observe(pane,{childList:true,subtree:true});
    }
  }

  install();
})();
