(function(){
  'use strict';

  const STYLE_ID='yaya-create-chantier-search-line-v2';
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
      #pane-chantiers .yaya-chantier-search-line .yaya-search-wrap{
        position:relative!important;
        flex:1 1 auto!important;
        min-width:0!important;
        margin:0!important;
      }
      #pane-chantiers .yaya-chantier-search-line #filtreInput{
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
        flex:0 0 auto!important;
        height:40px!important;
        min-height:40px!important;
        margin:0!important;
        padding:0 15px!important;
        display:inline-flex!important;
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
      #pane-chantiers #yayaCreateChantierWrap:empty{display:none!important}
      @media(max-width:640px){
        #pane-chantiers .yaya-chantier-search-line{gap:7px!important}
        #pane-chantiers .yaya-chantier-search-line #yayaCreateChantierBtn{
          padding:0 10px!important;
          font-size:11.5px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureButton(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return null;
    let btn=document.getElementById('yayaCreateChantierBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='yayaCreateChantierBtn';
      btn.type='button';
      btn.className='btnp';
      btn.textContent='➕ Ajouter un chantier';
      btn.addEventListener('click',()=>{
        if(typeof window.openChantierModal==='function')window.openChantierModal();
      });
    }else{
      btn.textContent='➕ Ajouter un chantier';
      btn.style.display='inline-flex';
    }
    return btn;
  }

  function createSearchWrap(pane){
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

  function align(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    let input=pane.querySelector('#filtreInput');
    let searchWrap=input&&input.parentElement;

    if(!input){
      searchWrap=createSearchWrap(pane);
      input=searchWrap.querySelector('#filtreInput');
    }else if(searchWrap){
      searchWrap.classList.add('yaya-search-wrap');
    }
    if(!searchWrap)return;

    let row=pane.querySelector('.yaya-chantier-search-line');
    if(!row){
      row=document.createElement('div');
      row.className='yaya-chantier-search-line';
      if(searchWrap.parentNode&&searchWrap.parentNode!==pane){
        searchWrap.parentNode.insertBefore(row,searchWrap);
      }else{
        const tabs=pane.querySelector('.yaya-suivi-tabs');
        if(tabs&&tabs.parentNode===pane&&tabs.nextSibling)pane.insertBefore(row,tabs.nextSibling);
        else pane.insertBefore(row,pane.firstChild);
      }
    }

    if(searchWrap.parentNode!==row)row.appendChild(searchWrap);

    const btn=ensureButton();
    if(btn&&btn.parentNode!==row)row.appendChild(btn);

    const oldWrap=document.getElementById('yayaCreateChantierWrap');
    if(oldWrap&&oldWrap!==row&&oldWrap.children.length===0)oldWrap.remove();
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;align();});
  }

  const obs=new MutationObserver(schedule);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(align,50);
  setTimeout(align,250);
})();
