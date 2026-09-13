// V43 — affichage des signatures en lecture seule depuis dateSignature (colonne J)
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

  function signatureLabel(c){
    const value=valueToIso(c&&c.dateSignature);
    if(!value)return '';
    if(/^\d{4}$/.test(value))return value;
    if(isSpecial(value))return LABEL;
    const m=value.match(/^(\d{4})-(\d{2})/);
    if(m){
      const d=new Date(Number(m[1]),Number(m[2])-1,1);
      const lib=d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
      return 'Signé : '+lib.charAt(0).toUpperCase()+lib.slice(1);
    }
    // Toute autre terminologie saisie manuellement en colonne J est affichée telle quelle.
    return value;
  }

  function signatureHtml(c){
    const label=signatureLabel(c);
    return label?'<span class="signature-date">'+label+'</span>':'';
  }

  function installDisplay(){
    window.signatureChantierHtml=signatureHtml;
  }

  function chantierIdFromTop(top){
    if(!top)return '';
    const nodes=top.querySelectorAll('[onclick]');
    for(const node of nodes){
      const code=String(node.getAttribute('onclick')||'');
      const m=code.match(/(?:toggleChantier|editMontantDevis|restaurerChantier|delChantier)\(['"]([^'"]+)['"]/);
      if(m&&m[1])return m[1];
    }
    return '';
  }

  function ensureCardSignatures(){
    let chantiers=[];
    try{
      chantiers=(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers))?S.chantiers:[];
    }catch(e){return;}
    if(!chantiers.length)return;

    document.querySelectorAll('#pane-chantiers .card > .top').forEach(function(top){
      const cid=chantierIdFromTop(top);
      if(!cid)return;
      const chantier=chantiers.find(function(c){return String(c&&c.id||'')===String(cid);});
      if(!chantier)return;

      const label=signatureLabel(chantier);
      let badge=top.querySelector('.signature-date');

      if(!label){
        if(badge&&badge.classList.contains('yaya-column-j-signature'))badge.remove();
        return;
      }

      if(!badge){
        badge=document.createElement('span');
        badge.className='signature-date yaya-column-j-signature';
        const spacer=top.querySelector('.spacer');
        if(spacer)spacer.insertAdjacentElement('afterend',badge);
        else top.appendChild(badge);
      }
      badge.textContent=label;
    });
  }

  let paintPending=false;
  function schedulePaint(){
    if(paintPending)return;
    paintPending=true;
    requestAnimationFrame(function(){
      paintPending=false;
      installDisplay();
      ensureCardSignatures();
    });
  }

  function install(){
    installDisplay();
    schedulePaint();
  }

  window.addEventListener('yaya:data-refreshed',schedulePaint);
  window.addEventListener('yaya:signature-dates-refreshed',schedulePaint);
  window.addEventListener('focus',schedulePaint);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)schedulePaint();});

  if(document.body){
    new MutationObserver(schedulePaint).observe(document.body,{childList:true,subtree:true});
  }else{
    document.addEventListener('DOMContentLoaded',function(){
      new MutationObserver(schedulePaint).observe(document.body,{childList:true,subtree:true});
    },{once:true});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(install,0);},{once:true});
  }else{
    setTimeout(install,0);
  }
  [300,1200,3000].forEach(function(ms){setTimeout(install,ms);});
})();
