(function(){
  'use strict';

  const STYLE_ID='yaya-create-chantier-search-line-main-v1';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-chantier-search-line{
        display:flex;
        align-items:center;
        gap:10px;
        margin:10px 0 14px;
        width:100%;
      }
      #pane-chantiers .yaya-chantier-search-line[hidden]{display:none!important;}
      #pane-chantiers .yaya-chantier-search-line .yaya-search-wrap{
        position:relative;
        flex:1 1 auto;
        min-width:0;
        margin:0;
      }
      #pane-chantiers .yaya-chantier-search-line #filtreInput{
        width:100%;
        height:40px;
        min-height:40px;
        padding-left:34px;
        padding-right:32px;
        box-sizing:border-box;
      }
      #pane-chantiers .yaya-search-icon{
        position:absolute;
        left:11px;
        top:50%;
        transform:translateY(-50%);
        pointer-events:none;
        font-size:14px;
        color:#8a9aab;
      }
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{
        flex:0 0 auto;
        height:40px;
        min-height:40px;
        margin:0;
        padding:0 15px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        white-space:nowrap;
        border-radius:8px;
        background:#24436B;
        color:#fff;
        border:1px solid #24436B;
        font-size:13px;
        font-weight:700;
      }
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn:hover{
        background:#1c3657;
        border-color:#1c3657;
      }
      #pane-chantiers #yayaCreateChantierWrap:empty{display:none!important;}
      @media(max-width:640px){
        #pane-chantiers .yaya-chantier-search-line{gap:7px;}
        #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{
          padding:0 10px;
          font-size:11.5px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function isMainChantiersPage(){
    try{
      if(typeof expChantiers!=='undefined' && expChantiers && typeof expChantiers.size==='number'){
        return expChantiers.size===0;
      }
    }catch(e){}
    return true;
  }

  function ensureButton(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return null;

    const duplicates=[...pane.querySelectorAll('#yayaCreateChantierBtn')];
    duplicates.slice(1).forEach(el=>el.remove());

    let btn=duplicates[0]||null;
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

  function createSearchWrap(){
    const wrap=document.createElement('div');
    wrap.className='yaya-search-wrap';
    wrap.dataset.syntheticSearch='1';

    const input=document.createElement('input');
    input.id='filtreInput';
    input.className='inp';
    input.type='search';
    input.autocomplete='off';
    input.placeholder='Rechercher un chantier...';
    try{input.value=String(filtreChantier||'');}catch(e){input.value='';}

    const icon=document.createElement('span');
    icon.className='yaya-search-icon';
    icon.textContent='⌕';

    input.addEventListener('input',()=>{
      try{filtreChantier=input.value;}catch(e){}
      try{if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.clear==='function')expChantiers.clear();}catch(e){}
      if(typeof window.renderChantiers==='function')window.renderChantiers();
    });

    wrap.appendChild(input);
    wrap.appendChild(icon);
    return wrap;
  }

  function syncMainLine(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    const rows=[...pane.querySelectorAll('.yaya-chantier-search-line')];
    rows.slice(1).forEach(el=>el.remove());
    let row=rows[0]||null;

    let input=pane.querySelector('#filtreInput');
    let searchWrap=input&&input.closest('.yaya-search-wrap');
    if(!searchWrap){
      searchWrap=createSearchWrap();
      input=searchWrap.querySelector('#filtreInput');
    }

    if(!row){
      row=document.createElement('div');
      row.className='yaya-chantier-search-line';
      pane.insertBefore(row,pane.firstChild);
    }

    if(searchWrap.parentNode!==row)row.appendChild(searchWrap);
    const btn=ensureButton();
    if(btn&&btn.parentNode!==row)row.appendChild(btn);

    const oldWrap=document.getElementById('yayaCreateChantierWrap');
    if(oldWrap&&oldWrap!==row)oldWrap.remove();

    row.hidden=!isMainChantiersPage();
  }

  function wrapAfterRender(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__yayaMainLineWrapped)return false;
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
    const r1=wrapAfterRender('renderChantiers');
    const r2=wrapAfterRender('toggleChantier');
    if(!r1||!r2)setTimeout(install,180);
  }

  install();
})();
