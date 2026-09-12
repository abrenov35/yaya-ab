// V36 — normalisation des dates de signature Sheet + cas antérieur à septembre 2026
(function(){
  'use strict';

  const SPECIAL='AVANT_2026-09';
  const LABEL='Signé avant Sept. 2026';
  const DAY_MS=86400000;
  const SHEETS_EPOCH=Date.UTC(1899,11,30);

  function isSpecial(v){
    return String(v==null?'':v).trim().toUpperCase()===SPECIAL;
  }

  function pad2(n){return String(n).padStart(2,'0');}

  function serialToIso(v){
    const n=Number(v);
    if(!Number.isFinite(n)||n<20000||n>100000)return '';
    const d=new Date(SHEETS_EPOCH+Math.round(n)*DAY_MS);
    if(Number.isNaN(d.getTime()))return '';
    return d.getUTCFullYear()+'-'+pad2(d.getUTCMonth()+1)+'-'+pad2(d.getUTCDate());
  }

  function normalizeSignature(v){
    if(v==null)return '';
    if(isSpecial(v))return SPECIAL;
    if(typeof v==='number')return serialToIso(v)||String(v);
    const s=String(v).trim();
    if(/^\d{5}(?:\.0+)?$/.test(s))return serialToIso(s)||s;
    return s;
  }

  function normalizeState(){
    let changed=false;
    try{
      if(!window.S||!Array.isArray(S.chantiers))return false;
      S.chantiers.forEach(function(c){
        if(!c)return;
        const before=c.dateSignature;
        const after=normalizeSignature(before);
        if(after!==before){c.dateSignature=after;changed=true;}
      });
    }catch(e){}
    return changed;
  }

  function installDisplay(){
    const previous=window.signatureChantierHtml;
    if(typeof previous!=='function'||previous.__yayaSignatureV36)return;
    const wrapped=function(c){
      const value=normalizeSignature(c&&c.dateSignature);
      if(isSpecial(value)){
        return '<span class="signature-date">'+LABEL+'</span>';
      }
      if(c&&value!==c.dateSignature){
        c=Object.assign({},c,{dateSignature:value});
      }
      return previous(c);
    };
    wrapped.__yayaSignatureV36=true;
    window.signatureChantierHtml=wrapped;
  }

  function installPlanningProtection(){
    const previous=window.synchroniserDatesPlanning;
    if(typeof previous!=='function'||previous.__yayaSignatureV36)return;
    const wrapped=async function(){
      normalizeState();
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
            else c.dateSignature=normalizeSignature(c.dateSignature);
          });
        }
      }catch(e){}
      return result;
    };
    wrapped.__yayaSignatureV36=true;
    window.synchroniserDatesPlanning=wrapped;
  }

  function installEditSupport(){
    const previousSync=window.syncEditChSignature;
    if(typeof previousSync==='function'&&!previousSync.__yayaSignatureV36){
      const wrappedSync=function(){
        const special=document.getElementById('editChSignatureBeforeSept');
        const hidden=document.getElementById('editChSignature');
        if(special&&special.checked){
          if(hidden)hidden.value=SPECIAL;
          return SPECIAL;
        }
        return previousSync.apply(this,arguments);
      };
      wrappedSync.__yayaSignatureV36=true;
      window.syncEditChSignature=wrappedSync;
    }

    const previousOpen=window.openExistingChantierModal;
    if(typeof previousOpen!=='function'||previousOpen.__yayaSignatureV36)return;

    const wrappedOpen=function(cid){
      normalizeState();
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
    wrappedOpen.__yayaSignatureV36=true;
    window.openExistingChantierModal=wrappedOpen;
  }

  function install(){
    const changed=normalizeState();
    installDisplay();
    installPlanningProtection();
    installEditSupport();
    try{
      if(changed&&typeof render==='function')render();
      else if(typeof render==='function')render();
    }catch(e){}
  }

  window.addEventListener('yaya:data-refreshed',function(){
    const changed=normalizeState();
    if(changed){try{if(typeof render==='function')render();}catch(e){}}
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(install,0);},{once:true});
  }else{
    setTimeout(install,0);
  }
  setTimeout(install,250);
  setTimeout(install,1000);
})();
