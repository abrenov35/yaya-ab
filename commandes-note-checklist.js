// NOTE COMMANDES : chaque ligne commence par une puce fine « • ».
// La zone de note s'adapte automatiquement au nombre de lignes, sans toucher au chargement principal de Yaya.
(function(){
  'use strict';
  if(window.__YAYA_COMMANDES_NOTE_CHECKLIST_V1)return;
  window.__YAYA_COMMANDES_NOTE_CHECKLIST_V1=true;

  const PREFIX='• ';
  const MIN_HEIGHT=82;

  function autoResize(el){
    if(!el)return;
    el.style.minHeight=MIN_HEIGHT+'px';
    el.style.overflowY='hidden';
    el.style.resize='none';
    el.style.height='auto';
    el.style.height=Math.max(el.scrollHeight,MIN_HEIGHT)+'px';
  }

  function normalizeLine(line){
    line=String(line||'');
    // Migre aussi les anciennes lignes commençant par ☑️ vers la nouvelle puce.
    line=line.replace(/^\s*(?:☑️|☑|•)\s*/, '');
    return PREFIX+line;
  }

  function normalizeValue(value){
    const text=String(value||'');
    if(!text)return PREFIX;
    return text.split('\n').map(normalizeLine).join('\n');
  }

  function apply(el,moveCaret){
    if(!el)return;
    const before=String(el.value||'');
    const after=normalizeValue(before);
    if(after!==before){
      el.value=after;
      if(moveCaret){
        try{el.setSelectionRange(after.length,after.length);}catch(_){}
      }
      el.dispatchEvent(new Event('input',{bubbles:true}));
    }
    autoResize(el);
  }

  function setup(el){
    if(!el)return;
    if(el.dataset.yayaChecklistReady==='1'){
      autoResize(el);
      return;
    }
    el.dataset.yayaChecklistReady='1';
    apply(el,true);

    el.addEventListener('input',function(){autoResize(el);});

    el.addEventListener('keydown',function(e){
      if(e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.altKey||e.metaKey)return;
      e.preventDefault();
      const start=typeof el.selectionStart==='number'?el.selectionStart:el.value.length;
      const end=typeof el.selectionEnd==='number'?el.selectionEnd:start;
      const insert='\n'+PREFIX;
      el.value=el.value.slice(0,start)+insert+el.value.slice(end);
      const pos=start+insert.length;
      try{el.setSelectionRange(pos,pos);}catch(_){}
      el.dispatchEvent(new Event('input',{bubbles:true}));
    });

    el.addEventListener('blur',function(){apply(el,false);});
    el.addEventListener('paste',function(){
      setTimeout(function(){apply(el,false);},0);
    });
  }

  function scan(){setup(document.getElementById('ycnNote'));}

  document.addEventListener('click',function(e){
    if(e.target&&e.target.closest&&e.target.closest('[data-ycn-note-cancel]')){
      setTimeout(function(){
        const el=document.getElementById('ycnNote');
        apply(el,true);
      },0);
    }
  },true);

  window.addEventListener('resize',function(){
    autoResize(document.getElementById('ycnNote'));
  },{passive:true});

  const obs=new MutationObserver(scan);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('focusin',scan,true);
  setTimeout(scan,0);
  setTimeout(scan,300);
})();
