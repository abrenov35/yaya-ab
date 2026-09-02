(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-search-line-v11';
  const BOX_CLASS='yaya-search-input-box';
  const CLEAR_CLASS='yaya-search-clear';
  let searchFrame=0;
  let installTimer=0;

  function injectStyle(){
    const old=document.getElementById('yaya-chantier-search-line-v10');
    if(old)old.remove();
    if(document.getElementById(STYLE_ID))return;

    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .${BOX_CLASS}{
        position:relative!important;
        display:block!important;
        flex:1 1 auto!important;
        width:auto!important;
        min-width:0!important;
        align-self:stretch!important;
      }

      .${BOX_CLASS} #filtreInput{
        display:block!important;
        width:100%!important;
        height:100%!important;
        min-height:48px!important;
        min-width:0!important;
        box-sizing:border-box!important;
        padding-right:48px!important;
        margin:0!important;
      }

      .${BOX_CLASS} .${CLEAR_CLASS}{
        position:absolute!important;
        right:10px!important;
        top:50%!important;
        transform:translateY(-50%)!important;
        width:30px!important;
        height:30px!important;
        min-width:30px!important;
        max-width:30px!important;
        min-height:30px!important;
        max-height:30px!important;
        padding:0!important;
        margin:0!important;
        border:0!important;
        border-radius:999px!important;
        background:transparent!important;
        color:#7b8798!important;
        display:none!important;
        align-items:center!important;
        justify-content:center!important;
        font-family:Arial,sans-serif!important;
        font-size:27px!important;
        font-weight:300!important;
        line-height:28px!important;
        cursor:pointer!important;
        z-index:50!important;
        pointer-events:auto!important;
        touch-action:manipulation!important;
        box-shadow:none!important;
      }

      .${BOX_CLASS}.has-value .${CLEAR_CLASS}{
        display:flex!important;
      }

      .${BOX_CLASS} .${CLEAR_CLASS}:hover,
      .${BOX_CLASS} .${CLEAR_CLASS}:active{
        background:rgba(15,23,42,.07)!important;
        color:#334155!important;
      }

      .${BOX_CLASS} .${CLEAR_CLASS}:focus-visible{
        outline:2px solid rgba(59,130,246,.34)!important;
        outline-offset:1px!important;
      }

      @media(max-width:640px){
        .${BOX_CLASS} #filtreInput{
          min-height:44px!important;
          padding-right:44px!important;
        }
        .${BOX_CLASS} .${CLEAR_CLASS}{
          right:8px!important;
          width:28px!important;
          height:28px!important;
          min-width:28px!important;
          max-width:28px!important;
          min-height:28px!important;
          max-height:28px!important;
          font-size:25px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function normaliser(v){
    return String(v||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .trim();
  }

  function getPane(){
    return document.getElementById('pane-chantiers');
  }

  function cards(pane){
    return pane
      ? [...pane.querySelectorAll('.card')].filter(card=>!!card.querySelector('.top'))
      : [];
  }

  function setFiltre(value){
    try{filtreChantier=String(value||'');}catch(e){}
  }

  function getFiltre(){
    try{return String(filtreChantier||'');}catch(e){return '';}
  }

  function filtrer(pane,value){
    const q=normaliser(value);
    cards(pane).forEach(function(card){
      const top=card.querySelector('.top');
      const txt=normaliser(top?top.textContent:card.textContent);
      card.style.display=!q||txt.includes(q)?'':'none';
    });
  }

  function updateClear(box,input){
    if(!box||!input)return;
    box.classList.toggle('has-value',String(input.value||'').length>0);
  }

  function clearSearch(pane,input,box){
    if(!input)return;
    input.value='';
    setFiltre('');
    updateClear(box,input);
    if(searchFrame){cancelAnimationFrame(searchFrame);searchFrame=0;}
    filtrer(pane,'');
    input.dispatchEvent(new Event('change',{bubbles:true}));
    requestAnimationFrame(()=>input.focus({preventScroll:true}));
  }

  function removeLegacyCrosses(pane,keep){
    if(!pane)return;

    pane.querySelectorAll('.'+CLEAR_CLASS).forEach(function(btn){
      if(btn!==keep)btn.remove();
    });

    pane.querySelectorAll('button').forEach(function(btn){
      if(btn===keep||btn.closest('.card')||btn.closest('.modal'))return;
      const text=String(btn.textContent||'').trim();
      const onclick=String(btn.getAttribute('onclick')||'');
      const legacyCross=(text==='×'||text==='✕'||text==='✖');
      const legacyAction=/fermerFocus|filtreChantier/i.test(onclick);
      if(legacyCross||legacyAction)btn.remove();
    });
  }

  function ensureBox(input){
    let box=input.parentElement;
    if(box&&box.classList.contains(BOX_CLASS))return box;

    box=document.createElement('div');
    box.className=BOX_CLASS;

    const parent=input.parentNode;
    if(parent)parent.insertBefore(box,input);
    box.appendChild(input);
    return box;
  }

  function ensureClearButton(pane,box,input){
    let btn=box.querySelector(':scope > .'+CLEAR_CLASS);
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className=CLEAR_CLASS;
      btn.textContent='×';
      btn.title='Effacer la recherche';
      btn.setAttribute('aria-label','Effacer la recherche');
      box.appendChild(btn);
    }

    removeLegacyCrosses(pane,btn);

    if(btn.dataset.yayaBound!=='1'){
      btn.dataset.yayaBound='1';

      const activate=function(e){
        e.preventDefault();
        e.stopPropagation();
        clearSearch(pane,input,box);
      };

      btn.addEventListener('pointerdown',function(e){
        e.preventDefault();
        e.stopPropagation();
      });
      btn.addEventListener('click',activate);
      btn.addEventListener('touchend',activate,{passive:false});
    }

    updateClear(box,input);
    return btn;
  }

  function bindInput(pane,input,box){
    input.type='text';
    input.autocomplete='off';
    input.setAttribute('inputmode','search');
    input.oninput=null;
    input.onchange=null;
    input.removeAttribute('oninput');
    input.removeAttribute('onchange');

    if(input.dataset.yayaSearchBound==='v11'){
      updateClear(box,input);
      return;
    }

    input.dataset.yayaSearchBound='v11';

    input.addEventListener('input',function(){
      const value=String(input.value||'');
      setFiltre(value);
      updateClear(box,input);
      if(searchFrame)cancelAnimationFrame(searchFrame);
      searchFrame=requestAnimationFrame(()=>filtrer(pane,value));
    });

    input.addEventListener('keydown',function(e){
      if(e.key==='Escape'){
        e.preventDefault();
        clearSearch(pane,input,box);
      }
    });

    updateClear(box,input);
  }

  function createInput(pane){
    const line=document.createElement('div');
    line.style.margin='10px 0 14px';

    const input=document.createElement('input');
    input.id='filtreInput';
    input.className='inp';
    input.type='text';
    input.autocomplete='off';
    input.placeholder='Rechercher un chantier...';
    input.value=getFiltre();

    line.appendChild(input);
    const first=cards(pane)[0];
    if(first)pane.insertBefore(line,first);
    else pane.prepend(line);
    return input;
  }

  function install(){
    injectStyle();
    const pane=getPane();
    if(!pane)return;

    let input=pane.querySelector('#filtreInput');
    if(!input)input=createInput(pane);
    if(!input)return;

    const box=ensureBox(input);
    const clear=ensureClearButton(pane,box,input);
    bindInput(pane,input,box);
    removeLegacyCrosses(pane,clear);
    filtrer(pane,input.value||'');
  }

  function scheduleInstall(){
    clearTimeout(installTimer);
    installTimer=setTimeout(install,30);
  }

  install();

  new MutationObserver(scheduleInstall).observe(document.documentElement,{
    childList:true,
    subtree:true
  });

  window.addEventListener('resize',scheduleInstall,{passive:true});
  window.addEventListener('yaya:data-refreshed',scheduleInstall);
})();
