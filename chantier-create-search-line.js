(function(){
  'use strict';

  const STYLE_ID='yaya-create-chantier-search-line-v1';
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
        height:40px!important;
        min-height:40px!important;
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

  function align(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;
    const input=pane.querySelector('#filtreInput');
    if(!input)return;

    const searchWrap=input.parentElement;
    if(!searchWrap)return;
    searchWrap.classList.add('yaya-search-wrap');

    let row=pane.querySelector('.yaya-chantier-search-line');
    if(!row){
      row=document.createElement('div');
      row.className='yaya-chantier-search-line';
      searchWrap.parentNode.insertBefore(row,searchWrap);
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
