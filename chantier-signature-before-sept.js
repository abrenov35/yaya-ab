(function(){
  'use strict';

  const SPECIAL='AVANT_2026-09';
  const LABEL='Signé avant Sept. 2026';

  function isSpecial(v){
    return String(v==null?'':v).trim().toUpperCase()===SPECIAL;
  }

  function installDisplay(){
    const previous=window.signatureChantierHtml;
    if(typeof previous!=='function'||previous.__yayaBeforeSept)return;
    const wrapped=function(c){
      if(isSpecial(c&&c.dateSignature)){
        return '<span class="signature-date">'+LABEL+'</span>';
      }
      return previous(c);
    };
    wrapped.__yayaBeforeSept=true;
    window.signatureChantierHtml=wrapped;
  }

  function installPlanningProtection(){
    const previous=window.synchroniserDatesPlanning;
    if(typeof previous!=='function'||previous.__yayaBeforeSept)return;
    const wrapped=async function(){
      const keep=new Map();
      try{
        (window.S&&Array.isArray(S.chantiers)?S.chantiers:[]).forEach(function(c){
          if(c&&isSpecial(c.dateSignature))keep.set(String(c.id||''),SPECIAL);
        });
      }catch(e){}
      const result=await previous.apply(this,arguments);
      try{
        if(window.S&&Array.isArray(S.chantiers)){
          S.chantiers.forEach(function(c){
            const id=String(c&&c.id||'');
            if(keep.has(id))c.dateSignature=SPECIAL;
          });
        }
      }catch(e){}
      return result;
    };
    wrapped.__yayaBeforeSept=true;
    window.synchroniserDatesPlanning=wrapped;
  }

  function installEditSupport(){
    const previousSync=window.syncEditChSignature;
    if(typeof previousSync==='function'&&!previousSync.__yayaBeforeSept){
      const wrappedSync=function(){
        const special=document.getElementById('editChSignatureBeforeSept');
        const hidden=document.getElementById('editChSignature');
        if(special&&special.checked){
          if(hidden)hidden.value=SPECIAL;
          return SPECIAL;
        }
        return previousSync.apply(this,arguments);
      };
      wrappedSync.__yayaBeforeSept=true;
      window.syncEditChSignature=wrappedSync;
    }

    const previousOpen=window.openExistingChantierModal;
    if(typeof previousOpen!=='function'||previousOpen.__yayaBeforeSept)return;

    const wrappedOpen=function(cid){
      const result=previousOpen.apply(this,arguments);
      let chantier=null;
      try{
        chantier=(window.S&&Array.isArray(S.chantiers))?S.chantiers.find(function(c){return String(c&&c.id||'')===String(cid||'');}):null;
      }catch(e){}

      const month=document.getElementById('editChSignatureMonth');
      const year=document.getElementById('editChSignatureYear');
      const hidden=document.getElementById('editChSignature');
      if(!month||!year||!hidden)return result;

      const fields=month.closest('.yaya-signature-fields')||month.parentElement;
      const label=fields&&fields.closest('label');
      if(!label||document.getElementById('editChSignatureBeforeSept'))return result;

      const row=document.createElement('label');
      row.style.cssText='display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;margin:2px 0 6px;cursor:pointer';
      row.innerHTML='<input id="editChSignatureBeforeSept" type="checkbox" style="width:16px;height:16px"> <span>'+LABEL+'</span>';
      label.insertBefore(row,fields);

      const checkbox=row.querySelector('input');
      checkbox.checked=!!(chantier&&isSpecial(chantier.dateSignature));

      function apply(){
        const on=checkbox.checked;
        month.disabled=on;
        year.disabled=on;
        month.style.opacity=on?'.45':'1';
        year.style.opacity=on?'.45':'1';
        if(on){
          hidden.value=SPECIAL;
        }else{
          if(isSpecial(hidden.value))hidden.value='';
          window.syncEditChSignature();
        }
      }
      checkbox.addEventListener('change',apply);
      apply();
      return result;
    };
    wrappedOpen.__yayaBeforeSept=true;
    window.openExistingChantierModal=wrappedOpen;
  }

  function install(){
    installDisplay();
    installPlanningProtection();
    installEditSupport();
    try{
      if(typeof render==='function')render();
    }catch(e){}
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(install,0);},{once:true});
  }else{
    setTimeout(install,0);
  }
  setTimeout(install,250);
  setTimeout(install,1000);
})();
