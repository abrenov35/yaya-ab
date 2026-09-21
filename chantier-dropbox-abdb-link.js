(function(){
  'use strict';

  if(window.__yayaChantierDropboxAbdbV1)return;
  window.__yayaChantierDropboxAbdbV1=true;

  const BUTTON_ID='yayaChantierDropboxBtn';
  const ABDB_URL='https://abrenov35.github.io/ab-db/';
  let pending=false;
  let observed=false;

  function currentId(){
    try{
      if(typeof focusChantier==='object'&&focusChantier)return String(focusChantier.id||'').trim();
      return String(typeof focusChantier!=='undefined'?focusChantier:'').trim();
    }catch(e){return '';}
  }

  function openFolderSearch(){
    if(!currentId()){
      try{if(typeof toast==='function')toast('Chantier introuvable',true);}catch(e){}
      return;
    }
    window.open(ABDB_URL,'_blank','noopener');
  }

  function ensureStyle(){
    if(document.getElementById('yaya-chantier-dropbox-abdb-style'))return;
    const style=document.createElement('style');
    style.id='yaya-chantier-dropbox-abdb-style';
    style.textContent=`
      #${BUTTON_ID}{
        min-height:34px!important;height:34px!important;padding:0 13px!important;
        display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;
        border:1px solid #a7c7b1!important;border-radius:8px!important;background:#edf8f0!important;
        color:#23633a!important;font-size:11.5px!important;font-weight:750!important;line-height:1!important;
        white-space:nowrap!important;box-shadow:none!important;cursor:pointer!important;
      }
      #${BUTTON_ID}:hover{background:#dff1e4!important;border-color:#86b695!important}
      #${BUTTON_ID}:active{transform:translateY(1px)!important}
      @media(max-width:640px){#${BUTTON_ID}{min-height:32px!important;height:32px!important;padding:0 10px!important;font-size:10.5px!important}}
    `;
    document.head.appendChild(style);
  }

  function sync(){
    pending=false;
    const card=document.querySelector('#pane-chantiers .card:has(> .yaya-detail-section-tabs)');
    let btn=document.getElementById(BUTTON_ID);
    if(!card){if(btn)btn.remove();return;}
    const top=card.querySelector(':scope > .top');
    if(!top)return;
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id=BUTTON_ID;
      btn.textContent='📁 Dossier Dropbox';
      btn.title='Rechercher un dossier Dropbox dans AB-DB';
      btn.setAttribute('aria-label','Ouvrir le dossier Dropbox du chantier');
      btn.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();openFolderSearch();});
    }
    const manage=top.querySelector('#yayaManageChantierCardBtn');
    if(manage){
      if(btn.parentNode!==top||btn.nextElementSibling!==manage)top.insertBefore(btn,manage);
    }else if(btn.parentNode!==top)top.appendChild(btn);
  }

  function schedule(){if(pending)return;pending=true;requestAnimationFrame(sync);}

  function observePane(){
    if(observed)return;
    const pane=document.getElementById('pane-chantiers');
    if(!pane){setTimeout(observePane,120);return;}
    observed=true;
    new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
    schedule();
  }

  ensureStyle();
  observePane();
  window.addEventListener('yaya:data-refreshed',schedule);
  schedule();
  [250,800,1600].forEach(function(ms){setTimeout(schedule,ms);});
})();
