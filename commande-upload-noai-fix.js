(function(){
  'use strict';

  if(window.__yayaCommandeUploadNoAiFixV3)return;
  window.__yayaCommandeUploadNoAiFixV3=true;

  const nativeFetch=window.fetch.bind(window);

  window.fetch=function(input,init){
    try{
      const options=init||{};
      const body=options.body;
      const modalOpen=!!document.querySelector('.yaya-commande-create-overlay');

      if(modalOpen&&typeof body==='string'){
        const payload=JSON.parse(body);
        if(payload&&payload.action==='extraireDocument'&&payload.data&&payload.data.base64){
          payload.action='archiverDevis';
          options.body=JSON.stringify(payload);
          return nativeFetch(input,options);
        }
      }
    }catch(e){}

    return nativeFetch(input,init);
  };

  const style=document.createElement('style');
  style.id='yaya-commande-mobile-portrait-fixed-v3';
  style.textContent=`
    @media(max-width:760px) and (orientation:portrait){
      html:root .yaya-commande-create-overlay{
        position:fixed!important;
        top:var(--yaya-visible-top,0px)!important;
        left:var(--yaya-commande-visible-left,0px)!important;
        right:auto!important;
        bottom:auto!important;
        width:var(--yaya-commande-visible-width,100vw)!important;
        max-width:var(--yaya-commande-visible-width,100vw)!important;
        height:var(--yaya-visible-height,100dvh)!important;
        min-height:0!important;
        padding:8px!important;
        box-sizing:border-box!important;
        display:flex!important;
        align-items:flex-start!important;
        justify-content:center!important;
        overflow:hidden!important;
        overflow-x:hidden!important;
        overscroll-behavior:contain!important;
      }

      html:root .yaya-commande-create-overlay .yaya-commande-create-modal{
        width:100%!important;
        max-width:520px!important;
        height:auto!important;
        max-height:calc(100% - 8px)!important;
        min-height:0!important;
        margin:0 auto!important;
        display:flex!important;
        flex-direction:column!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }

      html:root .yaya-commande-create-overlay .yaya-commande-create-head{
        flex:0 0 auto!important;
      }

      html:root .yaya-commande-create-overlay .yaya-commande-create-body{
        flex:1 1 auto!important;
        min-height:0!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        overscroll-behavior-y:contain!important;
        -webkit-overflow-scrolling:touch!important;
        scroll-behavior:auto!important;
        scroll-padding:10px 0 16px!important;
      }

      html:root .yaya-commande-create-overlay .yaya-commande-create-actions{
        position:relative!important;
        bottom:auto!important;
        flex:0 0 auto!important;
        background:#fff!important;
      }

      html:root .yaya-commande-create-overlay .yaya-commande-create-field input,
      html:root .yaya-commande-create-overlay .yaya-commande-create-field select{
        font-size:16px!important;
      }
    }
  `;
  document.head.appendChild(style);

  function commandeModal(){
    return document.querySelector('.yaya-commande-create-overlay .yaya-commande-create-modal');
  }

  function syncCommandeViewport(){
    const root=document.documentElement;
    const vv=window.visualViewport;
    root.style.setProperty('--yaya-commande-visible-left',(vv?vv.offsetLeft:0)+'px');
    root.style.setProperty('--yaya-commande-visible-width',(vv?vv.width:window.innerWidth)+'px');
  }

  function keepCommandeFieldVisible(){
    const field=document.activeElement;
    if(!field||!field.closest||!field.closest('.yaya-commande-create-overlay'))return;

    const modal=commandeModal();
    const body=field.closest('.yaya-commande-create-body');
    if(!modal||!body)return;

    requestAnimationFrame(function(){
      const fieldRect=field.getBoundingClientRect();
      const bodyRect=body.getBoundingClientRect();
      const gap=10;

      if(fieldRect.top<bodyRect.top+gap){
        body.scrollTop+=fieldRect.top-bodyRect.top-gap;
      }else if(fieldRect.bottom>bodyRect.bottom-gap){
        body.scrollTop+=fieldRect.bottom-bodyRect.bottom+gap;
      }
    });
  }

  document.addEventListener('focusin',function(e){
    if(!e.target||!e.target.closest||!e.target.closest('.yaya-commande-create-overlay'))return;
    syncCommandeViewport();
    keepCommandeFieldVisible();
    setTimeout(function(){syncCommandeViewport();keepCommandeFieldVisible();},120);
    setTimeout(function(){syncCommandeViewport();keepCommandeFieldVisible();},360);
  },true);

  syncCommandeViewport();

  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',function(){
      syncCommandeViewport();
      if(commandeModal())setTimeout(keepCommandeFieldVisible,30);
    },{passive:true});
    window.visualViewport.addEventListener('scroll',function(){
      syncCommandeViewport();
    },{passive:true});
  }
})();
