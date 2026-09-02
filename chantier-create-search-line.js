(function(){
  'use strict';

  const brand=document.querySelector('.hdr .brand span');
  if(brand)brand.textContent='AB RENOV 35';

  const STYLE_ID='yaya-create-chantier-search-line-main-v5';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .hdr .tab[data-tab="heures"]{display:none!important;}
      #pane-chantiers .yaya-chantier-search-line{display:flex!important;align-items:center!important;gap:10px!important;margin:10px 0 14px!important;width:100%!important;max-width:100%!important;overflow:visible!important;}
      #pane-chantiers .yaya-chantier-search-line[hidden]{display:none!important;}
      #pane-chantiers .yaya-chantier-search-line .yaya-search-wrap{position:relative!important;flex:1 1 0!important;width:auto!important;max-width:none!important;min-width:0!important;margin:0!important;}
      #pane-chantiers .yaya-search-input-box{position:relative!important;width:100%!important;min-width:0!important;}
      #pane-chantiers .yaya-chantier-search-line #filtreInput{display:block!important;width:100%!important;max-width:none!important;height:40px!important;min-height:40px!important;margin:0!important;padding:0 44px 0 14px!important;box-sizing:border-box!important;}
      #pane-chantiers .yaya-chantier-search-line #filtreInput::-webkit-search-cancel-button{-webkit-appearance:none!important;appearance:none!important;display:none!important;}
      #pane-chantiers .yaya-search-icon{display:none!important;}
      #pane-chantiers #yayaSearchClear{all:unset!important;position:absolute!important;right:12px!important;top:50%!important;transform:translateY(-50%)!important;width:24px!important;height:24px!important;display:none!important;align-items:center!important;justify-content:center!important;text-align:center!important;color:#7b8794!important;font-size:22px!important;line-height:24px!important;cursor:pointer!important;z-index:50!important;}
      #pane-chantiers #yayaSearchClear[data-visible="1"]{display:inline-flex!important;}
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{display:inline-flex!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important;width:auto!important;height:40px!important;min-height:40px!important;margin:0!important;padding:0 15px!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important;border-radius:8px!important;font-size:13px!important;font-weight:700!important;background:#24436B!important;color:#fff!important;border:1px solid #24436B!important;}
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn:hover{background:#1c3657!important;border-color:#1c3657!important;}
      #pane-chantiers #yayaCreateChantierWrap:empty{display:none!important;}
      #pane-chantiers .card .top button[onclick*="toggleChantier"].yaya-chantier-view-eye{width:32px!important;min-width:32px!important;height:32px!important;min-height:32px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #a9c8e8!important;border-radius:7px!important;background:#f3f8fd!important;color:#174d7d!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:14px!important;line-height:1!important;}
      @media(max-width:640px){
        #pane-chantiers .yaya-chantier-search-line{gap:7px!important;flex-wrap:nowrap!important;}
        #pane-chantiers .yaya-chantier-search-line .yaya-search-wrap{flex:1 1 105px!important;width:105px!important;min-width:72px!important;max-width:none!important;}
        #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{padding:0 8px!important;font-size:11px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function isMainChantiersPage(){try{if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.size==='number')return expChantiers.size===0;}catch(e){}return true;}

  function removeOrphanSearchIcons(pane){
    pane.querySelectorAll('.yaya-search-icon').forEach(el=>el.remove());
    [...pane.querySelectorAll('span')].forEach(el=>{
      const t=String(el.textContent||'').trim();
      if(t==='🔍'||t==='🔎'||t==='⌕')el.remove();
    });
  }

  function removeLegacyVisibleSearchCross(pane){
    [...pane.querySelectorAll('button')].forEach(btn=>{
      const t=String(btn.textContent||'').trim();
      const id=String(btn.id||'').trim();
      const cls=String(btn.className||'').trim();
      if(t==='✕'&&!id&&!cls)btn.remove();
    });
  }

  function ensureCreateButton(pane){
    const buttons=[...pane.querySelectorAll('#yayaCreateChantierBtn')];
    buttons.slice(1).forEach(el=>el.remove());
    let btn=buttons[0]||null;
    if(!btn){
      btn=document.createElement('button');
      btn.id='yayaCreateChantierBtn';
      btn.type='button';
      btn.className='btnp';
      btn.addEventListener('click',()=>{
        if(typeof window.openChantierModal==='function')window.openChantierModal();
      });
    }
    btn.textContent='➕ Ajouter un chantier';
    return btn;
  }

  function normalizeChantierViewButtons(pane){
    pane.querySelectorAll('.card .top button[onclick*="toggleChantier"]').forEach(btn=>{
      if(String(btn.textContent||'').trim()!=='Voir')return;
      btn.textContent='👁️';
      btn.title='Voir le chantier';
      btn.setAttribute('aria-label','Voir le chantier');
      btn.classList.add('yaya-chantier-view-eye');
    });
  }

  let yayaSearchFrame=null;

  function normaliserRechercheChantier(v){
    return String(v||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .trim();
  }

  function filtrerCartesChantiers(valeur){
    const q=normaliserRechercheChantier(valeur);

    document
      .querySelectorAll('#pane-chantiers > .card')
      .forEach(function(card){
        const top=card.querySelector('.top');
        const texte=normaliserRechercheChantier(top?top.textContent:card.textContent);
        card.style.display=!q||texte.includes(q)?'':'none';
      });
  }

  function bindSyntheticSearch(input){
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

      yayaSearchFrame=requestAnimationFrame(function(){
        filtrerCartesChantiers(valeur);
      });
    });
  }

  function ensureClearButton(input,box){
    let clear=box.querySelector('#yayaSearchClear');

    if(!clear){
      clear=document.createElement('button');
      clear.id='yayaSearchClear';
      clear.type='button';
      clear.textContent='×';
      clear.title='Effacer la recherche';
      clear.setAttribute('aria-label','Effacer la recherche');
      box.appendChild(clear);
    }

    function refresh(){
      clear.dataset.visible=input.value?'1':'0';
    }

    if(input.dataset.yayaClearBound!=='1'){
      input.dataset.yayaClearBound='1';
      input.addEventListener('input',refresh);
    }

    if(clear.dataset.yayaClearBound!=='1'){
      clear.dataset.yayaClearBound='1';
      clear.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        input.value='';
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.focus();
        refresh();
      });
    }

    refresh();
  }

  function ensureSingleSearch(pane){
    const inputs=[...pane.querySelectorAll('#filtreInput')];
    let input=inputs[0]||null;

    inputs.slice(1).forEach(function(el){
      const parent=el.parentElement;
      el.remove();

      if(
        parent&&
        parent.classList&&
        parent.classList.contains('yaya-search-wrap')&&
        !parent.querySelector('#filtreInput')
      ){
        parent.remove();
      }
    });

    if(!input){
      input=document.createElement('input');
      input.id='filtreInput';
      input.className='inp';
      input.type='search';
      input.autocomplete='off';
      input.placeholder='Rechercher un chantier...';

      try{input.value=String(filtreChantier||'');}
      catch(e){input.value='';}
    }

    bindSyntheticSearch(input);

    let wrap=input.closest('.yaya-search-wrap');

    if(!wrap){
      const previousParent=input.parentElement;
      wrap=document.createElement('div');
      wrap.className='yaya-search-wrap';

      if(previousParent)previousParent.insertBefore(wrap,input);
      wrap.appendChild(input);

      if(previousParent&&previousParent!==pane){
        [...previousParent.querySelectorAll(':scope > span')].forEach(function(el){
          const t=String(el.textContent||'').trim();
          if(t==='🔍'||t==='🔎'||t==='⌕')el.remove();
        });

        if(previousParent.children.length===0&&!String(previousParent.textContent||'').trim()){
          previousParent.remove();
        }
      }
    }

    let box=input.closest('.yaya-search-input-box');
    if(!box||box.parentElement!==wrap){
      box=document.createElement('div');
      box.className='yaya-search-input-box';
      wrap.insertBefore(box,input);
      box.appendChild(input);
    }

    wrap.querySelectorAll('.yaya-search-icon').forEach(el=>el.remove());
    ensureClearButton(input,box);

    return wrap;
  }

  function syncMainLine(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    removeOrphanSearchIcons(pane);
    removeLegacyVisibleSearchCross(pane);

    const rows=[...pane.querySelectorAll('.yaya-chantier-search-line')];
    rows.slice(1).forEach(el=>el.remove());
    let row=rows[0]||null;

    const searchWrap=ensureSingleSearch(pane);

    if(!row){
      row=document.createElement('div');
      row.className='yaya-chantier-search-line';
      pane.insertBefore(row,pane.firstChild);
    }

    if(searchWrap.parentNode!==row)row.appendChild(searchWrap);

    const hours=pane.querySelector('#yayaHeuresChantierBtn');
    if(hours)hours.remove();

    const create=ensureCreateButton(pane);
    if(create.parentNode!==row)row.appendChild(create);

    const oldWrap=document.getElementById('yayaCreateChantierWrap');
    if(oldWrap&&oldWrap!==row)oldWrap.remove();

    removeLegacyVisibleSearchCross(pane);
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

  function install(){
    syncMainLine();
    const ok1=wrapAfterRender('renderChantiers');
    const ok2=wrapAfterRender('toggleChantier');
    if(!ok1||!ok2)setTimeout(install,180);
  }

  install();
})();
