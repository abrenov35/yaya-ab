// NOTE COMMANDES : puces uniquement sur les lignes contenant une donnée, hauteur stable.
(function(){
  'use strict';
  if(window.__YAYA_COMMANDES_NOTE_CHECKLIST_V3)return;
  window.__YAYA_COMMANDES_NOTE_CHECKLIST_V3=true;

  const PREFIX='• ';
  const DEFAULT_MIN_ROWS=3;

  function minRows(el){
    const root=el && el.closest ? el.closest('.yaya-cmd-native-root') : null;
    return root && !root.querySelector('.ycn-row') ? 1 : DEFAULT_MIN_ROWS;
  }

  function fitRows(el){
    if(!el)return;
    const rows=Math.max(minRows(el),String(el.value||'').split('\n').length);
    if(el.rows!==rows)el.rows=rows;
    el.style.removeProperty('height');
    el.style.overflowY='hidden';
    el.style.resize='none';
  }

  function normalizeLine(line){
    line=String(line||'');
    const clean=line.replace(/^\s*(?:☑️|☑|•)\s*/, '');
    if(!clean.trim())return '';
    return PREFIX+clean;
  }

  function normalizeValue(value){
    const text=String(value||'');
    if(!text)return '';
    return text.split('\n').map(normalizeLine).join('\n');
  }

  function apply(el,moveCaret){
    if(!el)return;
    const before=String(el.value||'');
    const caret=typeof el.selectionStart==='number'?el.selectionStart:before.length;
    const after=normalizeValue(before);
    if(after!==before){
      const nextCaret=normalizeValue(before.slice(0,caret)).length;
      el.value=after;
      if(moveCaret){
        try{el.setSelectionRange(nextCaret,nextCaret);}catch(_){}
      }
    }
    fitRows(el);
  }

  function setup(el){
    if(!el||el.dataset.yayaChecklistReadyV3==='1')return;
    el.dataset.yayaChecklistReadyV3='1';
    apply(el,true);

    el.addEventListener('input',function(){
      apply(el,true);
    });

    el.addEventListener('keydown',function(e){
      if(e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.altKey||e.metaKey)return;
      e.preventDefault();
      const start=typeof el.selectionStart==='number'?el.selectionStart:el.value.length;
      const end=typeof el.selectionEnd==='number'?el.selectionEnd:start;
      el.value=el.value.slice(0,start)+'\n'+el.value.slice(end);
      const pos=start+1;
      try{el.setSelectionRange(pos,pos);}catch(_){}
      fitRows(el);
      el.dispatchEvent(new Event('input',{bubbles:true}));
    });

    el.addEventListener('blur',function(){apply(el,false);});
    el.addEventListener('paste',function(){setTimeout(function(){apply(el,true);},0);});
  }

  function scan(){
    const el=document.getElementById('ycnNote');
    if(el){setup(el);fitRows(el);}
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
