(function(){
  'use strict';

  const STYLE_ID='yaya-create-chantier-search-line-main-v2';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-chantier-search-line{
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        margin:10px 0 14px!important;
        width:100%!important;
      }
      #pane-chantiers .yaya-chantier-search-line[hidden]{display:none!important;}
      #pane-chantiers .yaya-chantier-search-line .yaya-search-wrap{
        position:relative!important;
        flex:1 1 auto!important;
        min-width:0!important;
        margin:0!important;
      }
      #pane-chantiers .yaya-chantier-search-line #filtreInput{
        display:block!important;
        width:100%!important;
        height:40px!important;
        min-height:40px!important;
        padding-left:34px!important;
        padding-right:32px!important;
        box-sizing:border-box!important;
      }
      #pane-chantiers .yaya-search-icon{
        position:absolute!important;
        left:11px!important;
        top:50%!important;
        transform:translateY(-50%)!important;
        pointer-events:none!important;
        font-size:14px!important;
        color:#8a9aab!important;
      }
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{
        display:inline-flex!important;
        visibility:visible!important;
        opacity:1!important;
        flex:0 0 auto!important;
        height:40px!important;
        min-height:40px!important;
        margin:0!important;
        padding:0 15px!important;
        align-items:center!important;
        justify-content:center!important;
        white-space:nowrap!important;
        border-radius:8px!important;
        background:#24436B!important;
        color:#fff!important;
        border:1px solid #24436B!important;
        font-size:13px!important;
        font-weight:700!important;
      }
      #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn:hover{
        background:#1c3657!important;
        border-color:#1c3657!important;
      }
      #pane-chantiers #yayaCreateChantierWrap:empty{display:none!important;}
      @media(max-width:640px){
        #pane-chantiers .yaya-chantier-search-line{gap:7px!important;}
        #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{
          padding:0 10px!important;
          font-size:11.5px!important;
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

  function ensureButton(pane){
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
    btn.style.setProperty('display','inline-flex','important');
    btn.style.setProperty('visibility','visible','important');
    btn.style.setProperty('opacity','1','important');
    return btn;
  }

  function bindSyntheticSearch(input){
    if(!input||input.dataset.yayaSearchBound==='1')return;
    input.dataset.yayaSearchBound='1';
    input.addEventListener('input',()=>{
      try{filtreChantier=input.value;}catch(e){}
      try{if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.clear==='function')expChantiers.clear();}catch(e){}
      if(typeof window.renderChantiers==='function')window.renderChantiers();
    });
  }

  function ensureSingleSearch(pane){
    const inputs=[...pane.querySelectorAll('#filtreInput')];
    let input=inputs[0]||null;
    inputs.slice(1).forEach(el=>{
      const parent=el.parentElement;
      el.remove();
      if(parent&&parent.classList&&parent.classList.contains('yaya-search-wrap')&&!parent.querySelector('#filtreInput'))parent.remove();
    });

    if(!input){
      input=document.createElement('input');
      input.id='filtreInput';
      input.className='inp';
      input.type='search';
      input.autocomplete='off';
      input.placeholder='Rechercher un chantier...';
      try{input.value=String(filtreChantier||'');}catch(e){input.value='';}
      bindSyntheticSearch(input);
    }

    let wrap=input.closest('.yaya-search-wrap');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='yaya-search-wrap';
      const parent=input.parentNode;
      if(parent)parent.insertBefore(wrap,input);
      wrap.appendChild(input);
    }

    let icon=wrap.querySelector('.yaya-search-icon');
    if(!icon){
      icon=document.createElement('span');
      icon.className='yaya-search-icon';
      icon.textContent='⌕';
      wrap.appendChild(icon);
    }
    return wrap;
  }

  function syncMainLine(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

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

    const btn=ensureButton(pane);
    if(btn.parentNode!==row)row.appendChild(btn);

    const oldWrap=document.getElementById('yayaCreateChantierWrap');
    if(oldWrap&&oldWrap!==row)oldWrap.remove();

    row.hidden=!isMainChantiersPage();
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
