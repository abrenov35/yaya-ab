(function(){
  'use strict';

  const brand=document.querySelector('.hdr .brand span');
  if(brand)brand.textContent='AB RENOV 35';

  const STYLE_ID='yaya-create-chantier-search-line-main-v8';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .hdr{
        position:sticky!important;
        top:0!important;
        z-index:10000!important;
      }
      .hdr .tab[data-tab="heures"]:not(.yaya-hours-toolbar-btn){display:none!important;}
      .hdr .tabs{align-items:center!important;}
      .hdr .tabs .yaya-header-chantier-search{
        position:relative!important;
        display:flex!important;
        align-items:center!important;
        flex:0 1 220px!important;
        width:220px!important;
        min-width:150px!important;
        height:38px!important;
        margin:0!important;
      }
      .hdr .tabs .yaya-header-chantier-search #filtreInput{
        display:block!important;
        width:100%!important;
        height:38px!important;
        min-height:38px!important;
        margin:0!important;
        padding:0 12px!important;
        border:1px solid rgba(255,255,255,.45)!important;
        border-radius:7px!important;
        background:#fff!important;
        color:#162D49!important;
        box-sizing:border-box!important;
        font-size:13px!important;
        font-weight:600!important;
        outline:none!important;
        appearance:none!important;
        -webkit-appearance:none!important;
      }
      .hdr .tabs .yaya-header-chantier-search #filtreInput::placeholder{color:#718096!important;font-weight:500!important;}
      .hdr .tabs .yaya-header-chantier-search #filtreInput:focus{
        border-color:#C9A227!important;
        box-shadow:0 0 0 2px rgba(201,162,39,.22)!important;
      }
      .hdr .tabs .yaya-header-chantier-search #filtreInput::-webkit-search-cancel-button,
      .hdr .tabs .yaya-header-chantier-search #filtreInput::-webkit-search-decoration,
      .hdr .tabs .yaya-header-chantier-search #filtreInput::-webkit-search-results-button,
      .hdr .tabs .yaya-header-chantier-search #filtreInput::-webkit-search-results-decoration{
        -webkit-appearance:none!important;
        appearance:none!important;
        display:none!important;
      }
      .hdr .tabs .yaya-header-chantier-search::before,
      .hdr .tabs .yaya-header-chantier-search::after,
      .hdr .tabs .yaya-header-chantier-search .yaya-search-icon,
      .hdr .tabs .yaya-header-chantier-search #yayaSearchClear{
        display:none!important;
        content:none!important;
      }
      #pane-chantiers .yaya-chantier-search-line{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:10px!important;
        margin:10px 0 14px!important;
        width:100%!important;
      }
      #pane-chantiers .yaya-chantier-search-line[hidden]{display:none!important;}
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{
        display:inline-flex!important;
        visibility:visible!important;
        opacity:1!important;
        flex:0 0 auto!important;
        width:auto!important;
        height:40px!important;
        min-height:40px!important;
        margin:0!important;
        padding:0 15px!important;
        align-items:center!important;
        justify-content:center!important;
        white-space:nowrap!important;
        border-radius:8px!important;
        font-size:13px!important;
        font-weight:700!important;
        background:#24436B!important;
        color:#fff!important;
        border:1px solid #24436B!important;
      }
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn:hover{background:#1c3657!important;border-color:#1c3657!important;}
      #pane-chantiers .card .top button[onclick*="toggleChantier"].yaya-chantier-view-eye{
        width:32px!important;min-width:32px!important;height:32px!important;min-height:32px!important;
        padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;
        border:1px solid #a9c8e8!important;border-radius:7px!important;background:#f3f8fd!important;color:#174d7d!important;
        box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:14px!important;line-height:1!important;
      }
      @media(max-width:760px){
        .hdr .tabs .yaya-header-chantier-search{flex:0 1 150px!important;width:150px!important;min-width:105px!important;height:36px!important;}
        .hdr .tabs .yaya-header-chantier-search #filtreInput{height:36px!important;min-height:36px!important;font-size:12px!important;padding:0 10px!important;}
        #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{padding:0 9px!important;font-size:11px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function isMainChantiersPage(){
    try{
      if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.size==='number')return expChantiers.size===0;
    }catch(e){}
    return true;
  }

  function normaliserRechercheChantier(v){
    return String(v||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .trim();
  }

  let yayaSearchFrame=null;

  function filtrerCartesChantiers(valeur){
    const q=normaliserRechercheChantier(valeur);
    document.querySelectorAll('#pane-chantiers > .card').forEach(function(card){
      const top=card.querySelector('.top');
      const texte=normaliserRechercheChantier(top?top.textContent:card.textContent);
      card.style.display=!q||texte.includes(q)?'':'none';
    });
  }

  function bindSearch(input){
    if(!input)return;
    input.oninput=null;
    input.removeAttribute('oninput');
    input.removeAttribute('onchange');
    if(input.dataset.yayaSearchBound==='1')return;
    input.dataset.yayaSearchBound='1';
    input.addEventListener('input',function(){
      const valeur=input.value;
      try{filtreChantier=valeur;}catch(e){}
      if(yayaSearchFrame)cancelAnimationFrame(yayaSearchFrame);
      yayaSearchFrame=requestAnimationFrame(function(){filtrerCartesChantiers(valeur);});
    });
  }

  function ensureHeaderSearch(){
    const tabs=document.querySelector('.hdr .tabs');
    if(!tabs)return;
    const chantierBtn=tabs.querySelector('.tab[data-tab="chantiers"]');
    if(!chantierBtn)return;

    const allInputs=[...document.querySelectorAll('#filtreInput')];
    let input=allInputs[0]||null;
    allInputs.slice(1).forEach(function(el){
      const p=el.parentElement;
      el.remove();
      if(p&&p.parentElement&&p.children.length===0)p.remove();
    });

    if(!input){
      input=document.createElement('input');
      input.id='filtreInput';
      input.autocomplete='off';
      input.placeholder='Rechercher...';
      try{input.value=String(filtreChantier||'');}catch(e){input.value='';}
    }

    input.type='text';
    input.setAttribute('inputmode','search');
    bindSearch(input);

    let wrap=document.getElementById('yayaHeaderChantierSearch');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='yayaHeaderChantierSearch';
      wrap.className='yaya-header-chantier-search';
    }

    wrap.querySelectorAll('#yayaSearchClear,.yaya-search-icon').forEach(function(el){el.remove();});
    [...wrap.querySelectorAll('span')].forEach(function(el){
      const t=String(el.textContent||'').trim();
      if(t==='🔍'||t==='🔎'||t==='⌕'||t==='×'||t==='✕')el.remove();
    });

    const oldParent=input.parentElement;
    if(input.parentElement!==wrap)wrap.appendChild(input);

    if(oldParent&&oldParent!==wrap&&oldParent!==document.body){
      const isLegacySearchBlock=oldParent.closest&&oldParent.closest('#pane-chantiers');
      if(isLegacySearchBlock&&oldParent.parentElement&&oldParent.children.length===0)oldParent.remove();
    }

    if(wrap.parentElement!==tabs || wrap.previousElementSibling!==chantierBtn){
      chantierBtn.insertAdjacentElement('afterend',wrap);
    }

    const hours=tabs.querySelector('.yaya-hours-toolbar-btn') || tabs.querySelector('.tab[data-tab="heures"]');
    if(hours && hours.previousElementSibling!==wrap){
      wrap.insertAdjacentElement('afterend',hours);
    }

    document.querySelectorAll('#pane-chantiers .yaya-search-wrap,#pane-chantiers .yaya-search-input-box').forEach(function(el){
      if(!el.querySelector('#filtreInput'))el.remove();
    });
  }

  function ensureCreateButton(pane){
    let btn=pane.querySelector('#yayaCreateChantierBtn');
    if(!btn){
      const legacy=[...pane.querySelectorAll('button')].find(function(b){
        return String(b.getAttribute('onclick')||'').includes('openChantierModal');
      });
      btn=legacy||document.createElement('button');
      btn.id='yayaCreateChantierBtn';
      btn.type='button';
      btn.className='btnp';
      if(!legacy){
        btn.addEventListener('click',function(){
          if(typeof window.openChantierModal==='function')window.openChantierModal();
        });
      }
    }
    btn.textContent='➕ Ajouter un chantier';
    return btn;
  }

  function normalizeChantierViewButtons(pane){
    pane.querySelectorAll('.card .top button[onclick*="toggleChantier"]').forEach(function(btn){
      if(String(btn.textContent||'').trim()!=='Voir')return;
      btn.textContent='👁️';
      btn.title='Voir le chantier';
      btn.setAttribute('aria-label','Voir le chantier');
      btn.classList.add('yaya-chantier-view-eye');
    });
  }

  function syncMainLine(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    ensureHeaderSearch();

    const rows=[...pane.querySelectorAll('.yaya-chantier-search-line')];
    rows.slice(1).forEach(function(el){el.remove();});
    let row=rows[0]||null;
    if(!row){
      row=document.createElement('div');
      row.className='yaya-chantier-search-line';
      pane.insertBefore(row,pane.firstChild);
    }

    row.querySelectorAll('#filtreInput,.yaya-search-wrap,.yaya-search-input-box,#yayaSearchClear,.yaya-search-icon').forEach(function(el){el.remove();});

    const create=ensureCreateButton(pane);
    if(create.parentNode!==row)row.appendChild(create);

    [...pane.children].forEach(function(el){
      if(el===row)return;
      if(el.tagName!=='DIV')return;
      const hasCard=el.classList.contains('card')||el.querySelector('.card');
      const hasUsefulButton=el.querySelector('button:not(#yayaCreateChantierBtn)');
      const hasInput=el.querySelector('input,select,textarea');
      const txt=String(el.textContent||'').replace(/[🔍🔎⌕×✕]/g,'').trim();
      if(!hasCard&&!hasUsefulButton&&!hasInput&&!txt)el.remove();
    });

    row.hidden=!isMainChantiersPage();
    normalizeChantierViewButtons(pane);
  }

  function wrapAfterRender(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__yayaMainLineWrapped)return true;
    const wrapped=function(){
      const result=fn.apply(this,arguments);
      setTimeout(syncMainLine,0);
      return result;
    };
    wrapped.__yayaMainLineWrapped=true;
    window[name]=wrapped;
    return true;
  }

  let headerTimer=0;
  function scheduleHeader(){
    clearTimeout(headerTimer);
    headerTimer=setTimeout(ensureHeaderSearch,0);
  }

  function install(){
    syncMainLine();
    const ok1=wrapAfterRender('renderChantiers');
    const ok2=wrapAfterRender('toggleChantier');
    if(!ok1||!ok2){setTimeout(install,180);return;}
    const header=document.querySelector('.hdr');
    if(header&&!header.dataset.yayaHeaderSearchObserved){
      header.dataset.yayaHeaderSearchObserved='1';
      new MutationObserver(function(records){
        if(records.some(function(r){return r.addedNodes.length||r.removedNodes.length;}))scheduleHeader();
      }).observe(header,{childList:true,subtree:true});
    }
    setTimeout(ensureHeaderSearch,150);
    setTimeout(ensureHeaderSearch,600);
  }

  install();
})();
