// NOTE COMMANDES : puces automatiques et hauteur stable selon le nombre de lignes.
(function(){
  'use strict';
  if(window.__YAYA_COMMANDES_NOTE_CHECKLIST_V2)return;
  window.__YAYA_COMMANDES_NOTE_CHECKLIST_V2=true;

  const PREFIX='• ';
  const MIN_ROWS=3;

  function fitRows(el){
    if(!el)return;
    const rows=Math.max(MIN_ROWS,String(el.value||'').split('\n').length);
    if(el.rows!==rows)el.rows=rows;
    el.style.removeProperty('height');
    el.style.overflowY='hidden';
    el.style.resize='none';
  }

  function normalizeLine(line){
    line=String(line||'');
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
    }
    fitRows(el);
  }

  function setup(el){
    if(!el||el.dataset.yayaChecklistReadyV2==='1')return;
    el.dataset.yayaChecklistReadyV2='1';
    apply(el,true);

    el.addEventListener('input',function(){fitRows(el);});

    el.addEventListener('keydown',function(e){
      if(e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.altKey||e.metaKey)return;
      e.preventDefault();
      const start=typeof el.selectionStart==='number'?el.selectionStart:el.value.length;
      const end=typeof el.selectionEnd==='number'?el.selectionEnd:start;
      const insert='\n'+PREFIX;
      el.value=el.value.slice(0,start)+insert+el.value.slice(end);
      const pos=start+insert.length;
      try{el.setSelectionRange(pos,pos);}catch(_){}
      fitRows(el);
      el.dispatchEvent(new Event('input',{bubbles:true}));
    });

    el.addEventListener('blur',function(){apply(el,false);});
    el.addEventListener('paste',function(){setTimeout(function(){apply(el,false);},0);});
  }

  function scan(){
    const el=document.getElementById('ycnNote');
    if(el)setup(el);
  }

  document.addEventListener('click',function(e){
    if(e.target&&e.target.closest&&e.target.closest('[data-ycn-note-cancel]')){
      setTimeout(function(){
        const el=document.getElementById('ycnNote');
        if(el){apply(el,true);fitRows(el);}
      },0);
    }
  },true);

  const obs=new MutationObserver(scan);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(scan,0);
  setTimeout(scan,300);
})();
