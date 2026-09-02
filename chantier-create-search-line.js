(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-search-line-v10';
  let searchFrame=0;
  let installTimer=0;

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;

    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-search-wrap{
        position:relative!important;
        display:block!important;
        width:100%!important;
        min-width:0!important;
      }

      .yaya-search-wrap #filtreInput{
        width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
        padding-right:48px!important;
      }

      .yaya-search-clear{
        position:absolute!important;
        right:10px!important;
        top:50%!important;
        transform:translateY(-50%)!important;
        width:30px!important;
        height:30px!important;
        min-width:30px!important;
        border:0!important;
        border-radius:999px!important;
        background:transparent!important;
        color:#8a94a6!important;
        display:none!important;
        align-items:center!important;
        justify-content:center!important;
        font-size:24px!important;
        line-height:1!important;
        cursor:pointer!important;
        z-index:20!important;
        pointer-events:auto!important;
      }

      .yaya-search-clear:hover{
        background:rgba(15,23,42,.06)!important;
        color:#334155!important;
      }

      .yaya-search-clear:focus{
        outline:none!important;
        box-shadow:0 0 0 2px rgba(59,130,246,.22)!important;
      }

      .yaya-search-wrap.has-value .yaya-search-clear{
        display:flex!important;
      }
    `;
    document.head.appendChild(style);
  }

  function normaliserRecherche(v){
    return String(v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .trim();
  }

  function getPane(){
    return document.getElementById('pane-chantiers');
  }

  function getCards(pane){
    return [...pane.querySelectorAll('.card')].filter(function(card){
      return !!card.querySelector('.top');
    });
  }

  function filtrerCartes(pane,valeur){
    if(!pane) return;

    const q=normaliserRecherche(valeur);

    getCards(pane).forEach(function(card){
      const top=card.querySelector('.top');
      const texte=normaliserRecherche(
        top ? top.textContent : card.textContent
      );

      card.style.display=
        !q || texte.includes(q)
          ? ''
          : 'none';
    });
  }

  function setFiltreGlobal(value){
    try{
      filtreChantier=String(value || '');
    }catch(e){}
  }

  function getFiltreGlobal(){
    try{
      return String(filtreChantier || '');
    }catch(e){
      return '';
    }
  }

  function updateClearState(wrap,input){
    if(!wrap || !input) return;
    const hasValue=String(input.value || '').trim().length>0;
    wrap.classList.toggle('has-value',hasValue);
  }

  function runFilter(pane,input){
    if(searchFrame){
      cancelAnimationFrame(searchFrame);
    }

    const value=String(input && input.value || '');

    setFiltreGlobal(value);

    searchFrame=requestAnimationFrame(function(){
      filtrerCartes(pane,value);
    });
  }

  function clearSearch(pane,input,wrap){
    if(!input) return;

    input.value='';
    setFiltreGlobal('');
    updateClearState(wrap,input);

    if(searchFrame){
      cancelAnimationFrame(searchFrame);
      searchFrame=0;
    }

    filtrerCartes(pane,'');
    input.focus();
  }

  function ensureClearButton(pane,wrap,input){
    let btn=wrap.querySelector('.yaya-search-clear');

    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='yaya-search-clear';
      btn.setAttribute('aria-label','Effacer la recherche');
      btn.setAttribute('title','Effacer la recherche');
      btn.innerHTML='&times;';
      wrap.appendChild(btn);
    }

    if(btn.dataset.yayaBound!=='1'){
      btn.dataset.yayaBound='1';

      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        clearSearch(pane,input,wrap);
      });

      btn.addEventListener('mousedown',function(e){
        e.preventDefault();
      });
    }

    updateClearState(wrap,input);
    return btn;
  }

  function bindInput(pane,input,wrap){
    if(!input) return;

    input.oninput=null;
    input.onchange=null;
    input.removeAttribute('oninput');
    input.removeAttribute('onchange');

    if(input.dataset.yayaSearchBound!=='1'){
      input.dataset.yayaSearchBound='1';

      input.addEventListener('input',function(){
        updateClearState(wrap,input);
        runFilter(pane,input);
      });

      input.addEventListener('keydown',function(e){
        if(e.key==='Escape'){
          e.preventDefault();
          clearSearch(pane,input,wrap);
        }
      });
    }

    updateClearState(wrap,input);
  }

  function ensureWrapAroundInput(pane,input){
    let wrap=input.closest('.yaya-search-wrap');

    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='yaya-search-wrap';

      const parent=input.parentElement;
      if(parent){
        parent.insertBefore(wrap,input);
      }
      wrap.appendChild(input);
    }

    return wrap;
  }

  function createSearchIfMissing(pane){
    let input=document.getElementById('filtreInput');
    if(input) return input;

    const line=document.createElement('div');
    line.style.margin='10px 0 14px';

    const wrap=document.createElement('div');
    wrap.className='yaya-search-wrap';

    input=document.createElement('input');
    input.id='filtreInput';
    input.className='inp';
    input.type='search';
    input.autocomplete='off';
    input.placeholder='Rechercher un chantier...';
    input.value=getFiltreGlobal();

    wrap.appendChild(input);
    line.appendChild(wrap);

    const firstCard=getCards(pane)[0];
    if(firstCard){
      pane.insertBefore(line,firstCard);
    }else{
      pane.prepend(line);
    }

    return input;
  }

  function install(){
    injectStyle();

    const pane=getPane();
    if(!pane) return;

    const input=createSearchIfMissing(pane);
    if(!input) return;

    const wrap=ensureWrapAroundInput(pane,input);

    ensureClearButton(pane,wrap,input);
    bindInput(pane,input,wrap);

    if(String(input.value || '').trim()){
      filtrerCartes(pane,input.value);
    }else{
      filtrerCartes(pane,'');
    }
  }

  function scheduleInstall(){
    clearTimeout(installTimer);
    installTimer=setTimeout(install,20);
  }

  install();

  new MutationObserver(function(){
    scheduleInstall();
  }).observe(document.documentElement,{
    childList:true,
    subtree:true
  });

  window.addEventListener('resize',scheduleInstall,{passive:true});
  window.addEventListener('yaya:data-refreshed',scheduleInstall);
})();
