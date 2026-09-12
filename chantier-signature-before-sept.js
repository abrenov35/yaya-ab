// V37 — affichage stable des signatures depuis dateSignature (colonne J)
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

  function valueToIso(v){
    if(v==null||v==='')return '';
    if(isSpecial(v))return SPECIAL;
    if(typeof v==='number'||/^\d{5}(?:\.0+)?$/.test(String(v).trim())){
      const n=Number(v);
      if(Number.isFinite(n)&&n>=20000&&n<=100000){
        const d=new Date(SHEETS_EPOCH+Math.round(n)*DAY_MS);
        if(!Number.isNaN(d.getTime())){
          return d.getUTCFullYear()+'-'+pad2(d.getUTCMonth()+1)+'-'+pad2(d.getUTCDate());
        }
      }
    }
    return String(v).trim();
  }

  function signatureHtml(c){
    const value=valueToIso(c&&c.dateSignature);
    if(!value)return '';
    if(isSpecial(value)){
      return '<span class="signature-date">'+LABEL+'</span>';
    }
    const m=value.match(/^(\d{4})-(\d{2})/);
    if(!m)return '';
    const d=new Date(Number(m[1]),Number(m[2])-1,1);
    const lib=d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
    const txt=lib.charAt(0).toUpperCase()+lib.slice(1);
    return '<span class="signature-date">Signé : '+txt+'</span>';
  }

  function installDisplay(){
    window.signatureChantierHtml=signatureHtml;
  }

  function installEditSupport(){
    const previousSync=window.syncEditChSignature;
    if(typeof previousSync==='function'&&!previousSync.__yayaSignatureV37){
      const wrappedSync=function(){
        const special=document.getElementById('editChSignatureBeforeSept');
        const hidden=document.getElementById('editChSignature');
        if(special&&special.checked){
          if(hidden)hidden.value=SPECIAL;
          return SPECIAL;
        }
        return previousSync.apply(this,arguments);
      };
      wrappedSync.__yayaSignatureV37=true;
      window.syncEditChSignature=wrappedSync;
    }

    const previousOpen=window.openExistingChantierModal;
    if(typeof previousOpen!=='function'||previousOpen.__yayaSignatureV37)return;

    const wrappedOpen=function(){
      const result=previousOpen.apply(this,arguments);
      const month=document.getElementById('editChSignatureMonth');
      const year=document.getElementById('editChSignatureYear');
      const hidden=document.getElementById('editChSignature');
      if(!month||!year||!hidden)return result;

      const fields=month.closest('.yaya-signature-fields')||month.parentElement;
      const label=fields&&fields.closest('label');
      if(!label)return result;

      let checkbox=document.getElementById('editChSignatureBeforeSept');
      if(!checkbox){
        const row=document.createElement('label');
        row.style.cssText='display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;margin:2px 0 6px;cursor:pointer';
        row.innerHTML='<input id="editChSignatureBeforeSept" type="checkbox" style="width:16px;height:16px"> <span>'+LABEL+'</span>';
        label.insertBefore(row,fields);
        checkbox=row.querySelector('input');
      }

      checkbox.checked=isSpecial(hidden.value);

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
          if(typeof window.syncEditChSignature==='function')window.syncEditChSignature();
        }
      }

      checkbox.onchange=apply;
      apply();
      return result;
    };
    wrappedOpen.__yayaSignatureV37=true;
    window.openExistingChantierModal=wrappedOpen;
  }

  function install(){
    installDisplay();
    installEditSupport();
    try{if(typeof render==='function')render();}catch(e){}
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(install,0);},{once:true});
  }else{
    setTimeout(install,0);
  }
  setTimeout(install,300);
  setTimeout(install,1200);
})();
