(function(){
  'use strict';

  const STYLE_ID='yaya-landscape-phone-toolbar-v1';
  const INNER_STYLE_ID='yaya-fiche-inter-landscape-phone-v1';

  function installOuterStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      @media (orientation:landscape) and (hover:none) and (pointer:coarse){
        .hdr{
          display:flex!important;
          align-items:center!important;
          gap:5px!important;
          width:100%!important;
          max-width:100vw!important;
          padding:5px 6px!important;
          overflow:hidden!important;
        }
        .hdr .brand{
          flex:0 0 auto!important;
          min-width:0!important;
          margin:0!important;
          gap:4px!important;
        }
        .hdr .brand span,
        .hdr .sync,
        .hdr>#yayaReloadBtn{
          display:none!important;
        }
        .hdr .brand b{
          font-size:15px!important;
          line-height:1!important;
          white-space:nowrap!important;
        }
        #yayaVersion{
          display:inline-flex!important;
          transform:scale(.88)!important;
          transform-origin:left center!important;
          margin-left:2px!important;
        }
        .hdr .tabs{
          display:flex!important;
          flex:1 1 auto!important;
          min-width:0!important;
          width:auto!important;
          max-width:none!important;
          align-items:center!important;
          justify-content:flex-start!important;
          flex-wrap:nowrap!important;
          gap:4px!important;
          padding:0!important;
          overflow:visible!important;
        }
        .hdr .tab,
        .hdr .fiche-inter-tab,
        .hdr .planning-external-tab,
        .hdr .ab-docs-external-tab,
        .hdr #yayaCreateChantierBtn{
          flex:0 1 auto!important;
          min-width:0!important;
          width:auto!important;
          height:34px!important;
          min-height:34px!important;
          padding:0 8px!important;
          font-size:10px!important;
          gap:4px!important;
          white-space:nowrap!important;
        }
        .hdr .tabs .yaya-header-chantier-search{
          flex:0 1 120px!important;
          width:120px!important;
          min-width:88px!important;
          height:34px!important;
        }
        .hdr .tabs .yaya-header-chantier-search #filtreInput{
          height:34px!important;
          min-height:34px!important;
          padding:0 8px!important;
          font-size:10px!important;
        }
        .hdr #yayaCreateChantierBtn{
          font-size:0!important;
          padding:0 8px!important;
        }
        .hdr #yayaCreateChantierBtn::before{
          content:'Ajouter';
          font-size:10px!important;
          font-weight:700!important;
        }
        .hdr .planning-external-tab{padding-left:7px!important;padding-right:7px!important;}
        .hdr .ab-docs-external-tab{padding-left:7px!important;padding-right:7px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function installInnerStyle(){
    const frame=document.getElementById('yayaFicheInterFrame');
    if(!frame)return;
    try{
      const doc=frame.contentDocument;
      if(!doc||!doc.head||doc.getElementById(INNER_STYLE_ID))return;
      const style=doc.createElement('style');
      style.id=INNER_STYLE_ID;
      style.textContent=`
        @media (orientation:landscape) and (hover:none) and (pointer:coarse){
          .header{padding:0 8px!important;min-height:46px!important;}
          .header-top{
            display:flex!important;
            min-height:46px!important;
            max-width:none!important;
            gap:6px!important;
          }
          .brand{flex:0 0 auto!important;min-width:0!important;}
          .logo-text{display:none!important;}
          .logo-sub{
            display:block!important;
            font-size:9px!important;
            white-space:nowrap!important;
          }
          .toolbar-actions{
            display:flex!important;
            flex:1 1 auto!important;
            min-width:0!important;
            justify-content:flex-end!important;
            gap:4px!important;
            overflow:visible!important;
          }
          .toolbar-btn,
          .type-select{
            height:31px!important;
            min-width:0!important;
            padding:0 8px!important;
            font-size:9px!important;
          }
          .toolbar-search{
            width:118px!important;
            min-width:88px!important;
            height:31px!important;
            padding:0 8px!important;
            font-size:9px!important;
          }
          .type-select{width:108px!important;padding-right:22px!important;}
        }
      `;
      doc.head.appendChild(style);
    }catch(e){}
  }

  function bindFrame(){
    const frame=document.getElementById('yayaFicheInterFrame');
    if(!frame)return;
    if(frame.dataset.yayaLandscapeBound!=='1'){
      frame.dataset.yayaLandscapeBound='1';
      frame.addEventListener('load',function(){setTimeout(installInnerStyle,0);});
    }
    installInnerStyle();
  }

  function install(){
    installOuterStyle();
    bindFrame();
    if(!document.body)return;
    let timer=0;
    const observer=new MutationObserver(function(){
      clearTimeout(timer);
      timer=setTimeout(bindFrame,20);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
