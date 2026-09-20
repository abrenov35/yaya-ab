(function(){
  'use strict';
  if(window.__yayaEnterSaveV1)return;
  window.__yayaEnterSaveV1=true;

  let lastTriggerAt=0;

  function visible(el){
    if(!el||!el.isConnected)return false;
    const s=getComputedStyle(el);
    if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;
    const r=el.getBoundingClientRect();
    return r.width>0&&r.height>0;
  }

  function disabled(el){
    if(!el)return true;
    if(el.disabled)return true;
    if(el.getAttribute('aria-disabled')==='true')return true;
    if(el.getAttribute('aria-busy')==='true')return true;
    if(el.style&&el.style.pointerEvents==='none')return true;
    return false;
  }

  function saveLabel(el){
    return String(
      (el&&el.textContent)||
      (el&&el.getAttribute&&el.getAttribute('aria-label'))||
      (el&&el.value)||
      ''
    ).replace(/\s+/g,' ').trim();
  }

  function findScope(target){
    if(!target||!target.closest)return null;
    return target.closest(
      '#modalRoot .modal,'+
      '#modalRoot .overlay,'+
      '.ycn-dialog,'+
      '.cmd-dialog,'+
      '[role="dialog"],'+
      'form'
    );
  }

  function findSave(scope){
    if(!scope)return null;
    const candidates=Array.from(scope.querySelectorAll(
      'button,input[type="submit"],input[type="button"]'
    ));
    return candidates.find(function(el){
      if(!visible(el)||disabled(el))return false;
      const label=saveLabel(el);
      return /^Enregistrer\b/i.test(label);
    })||null;
  }

  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'||e.defaultPrevented||e.isComposing||e.repeat)return;
    if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;

    const target=e.target;
    if(!target)return;

    // Entrée doit rester disponible pour écrire une nouvelle ligne ou choisir
    // une valeur dans les contrôles natifs.
    const tag=String(target.tagName||'').toUpperCase();
    if(tag==='TEXTAREA'||tag==='SELECT'||target.isContentEditable)return;
    if(tag==='BUTTON')return;

    const scope=findScope(target);
    if(!scope)return;

    const save=findSave(scope);
    if(!save)return;

    const now=Date.now();
    if(now-lastTriggerAt<700)return;
    lastTriggerAt=now;

    e.preventDefault();
    e.stopPropagation();

    try{
      const form=save.closest('form');
      if(form&&typeof form.requestSubmit==='function'&&
         (save.type==='submit'||save.getAttribute('type')===null)){
        form.requestSubmit(save);
      }else{
        save.click();
      }
    }catch(err){
      console.warn('Yaya — raccourci Entrée/Enregistrer impossible',err);
    }
  },true);
})();
