(function(){
  'use strict';

  function install(){
    if(typeof window.renderChantiers!=='function'){
      setTimeout(install,100);
      return;
    }
    if(window.renderChantiers.__yayaSearchFocusFix)return;

    const original=window.renderChantiers;
    const wrapped=function(){
      const before=document.getElementById('filtreInput');
      const focused=!!before && document.activeElement===before;
      const start=focused && typeof before.selectionStart==='number' ? before.selectionStart : null;
      const end=focused && typeof before.selectionEnd==='number' ? before.selectionEnd : start;
      const direction=focused ? before.selectionDirection : 'none';

      const result=original.apply(this,arguments);

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

  install();
})();
