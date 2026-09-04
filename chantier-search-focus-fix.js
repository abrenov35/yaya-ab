(function(){
  'use strict';

  function cleanSearchChrome(){
    const input=document.getElementById('filtreInput');
    if(input){
      input.type='text';
      input.style.setProperty('-webkit-appearance','none','important');
      input.style.setProperty('appearance','none','important');
    }

    const headerSearch=document.getElementById('yayaHeaderChantierSearch');
    if(headerSearch){
      headerSearch.querySelectorAll('#yayaSearchClear,.yaya-search-icon').forEach(function(el){el.remove();});
      headerSearch.querySelectorAll('span,button').forEach(function(el){
        const t=String(el.textContent||'').trim();
        if(t==='🔍'||t==='🔎'||t==='⌕'||t==='×'||t==='✕'||t==='❌')el.remove();
      });
    }

    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    pane.querySelectorAll('.yaya-search-icon,#yayaSearchClear').forEach(function(el){el.remove();});

    pane.querySelectorAll('span,button').forEach(function(el){
      if(el.closest('.card'))return;
      if(el.closest('.modal'))return;
      if(el.id==='yayaCreateChantierBtn')return;
      const t=String(el.textContent||'').trim();
      if(t==='🔍'||t==='🔎'||t==='⌕'||t==='×'||t==='✕'||t==='❌')el.remove();
    });

    Array.from(pane.children).forEach(function(el){
      if(el.classList&&el.classList.contains('card'))return;
      if(el.classList&&el.classList.contains('yaya-chantier-search-line'))return;
      if(el.querySelector&&el.querySelector('#filtreInput'))return;
      if(el.querySelector&&el.querySelector('#yayaCreateChantierBtn'))return;
      if(el.querySelector&&el.querySelector('.card'))return;
      const usefulButton=el.querySelector&&Array.from(el.querySelectorAll('button')).some(function(btn){
        const t=String(btn.textContent||'').trim();
        return t && t!=='🔍' && t!=='🔎' && t!=='⌕' && t!=='×' && t!=='✕' && t!=='❌';
      });
      const hasInput=el.querySelector&&el.querySelector('input,select,textarea');
      const txt=String(el.textContent||'').replace(/[🔍🔎⌕×✕❌]/g,'').trim();
      if(!usefulButton&&!hasInput&&!txt)el.remove();
    });
  }

  let cleanFrame=0;
  function scheduleClean(){
    if(cleanFrame)cancelAnimationFrame(cleanFrame);
    cleanFrame=requestAnimationFrame(function(){
      cleanFrame=0;
      cleanSearchChrome();
    });
  }

  function install(){
    if(typeof window.renderChantiers!=='function'){
      setTimeout(install,100);
      return;
    }

    if(!window.renderChantiers.__yayaSearchFocusFix){
      const original=window.renderChantiers;
      const wrapped=function(){
        const before=document.getElementById('filtreInput');
        const focused=!!before && document.activeElement===before;
        const start=focused && typeof before.selectionStart==='number' ? before.selectionStart : null;
        const end=focused && typeof before.selectionEnd==='number' ? before.selectionEnd : start;
        const direction=focused ? before.selectionDirection : 'none';

        const result=original.apply(this,arguments);

        scheduleClean();

        if(focused){
          const after=document.getElementById('filtreInput');
          if(after){
            try{after.focus({preventScroll:true});}catch(e){after.focus();}
            try{
              const max=after.value.length;
              after.setSelectionRange(Math.min(start==null?max:start,max),Math.min(end==null?max:end,max),direction||'none');
            }catch(e){}
          }
        }
        return result;
      };

      wrapped.__yayaSearchFocusFix=true;
      wrapped.__yayaSearchFocusOriginal=original;
      window.renderChantiers=wrapped;
    }

    const pane=document.getElementById('pane-chantiers');
    if(pane&&!pane.dataset.yayaSearchChromeCleanObserved){
      pane.dataset.yayaSearchChromeCleanObserved='1';
      new MutationObserver(scheduleClean).observe(pane,{childList:true,subtree:true});
    }

    cleanSearchChrome();
    setTimeout(cleanSearchChrome,150);
    setTimeout(cleanSearchChrome,600);
  }

  install();
})();
