(function(){
  'use strict';

  function patchFunction(name, transform){
    try{
      const fn=window[name];
      if(typeof fn!=='function')return false;
      const before=fn.toString();
      const after=transform(before);
      if(!after||after===before)return false;
      window[name]=(0,eval)('('+after+')');
      return true;
    }catch(e){
      console.warn('[Yaya recent-items] '+name,e);
      return false;
    }
  }

  function install(){
    let changed=false;

    changed=patchFunction('renderAchats',src=>
      src.replace(/\.slice\(0\s*,\s*5\)/g,'.slice(0,10)')
    )||changed;

    changed=patchFunction('renderDocuments',src=>
      src.replace(
        "historiquePiecesYaya().filter(d=>String(d.origine||'document')!=='charge')",
        "historiquePiecesYaya().filter(d=>String(d.origine||'document')!=='charge').slice(0,10)"
      )
    )||changed;

    if(changed&&typeof window.render==='function'){
      try{window.render();}catch(e){}
    }
  }

  setTimeout(install,0);
  setTimeout(install,150);
})();
