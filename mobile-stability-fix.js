(function(){
  'use strict';

  const id='yaya-mobile-stability-v1';
  if(document.getElementById(id))return;

  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    html{-webkit-text-size-adjust:100%;text-size-adjust:100%;}
    button,a,[role="button"],select{touch-action:manipulation;-webkit-tap-highlight-color:transparent;}

    @media (hover:none) and (pointer:coarse){
      *{transition-duration:0s!important;}
      button:active,a:active,[role="button"]:active{opacity:.78;}
    }

    @media(max-width:760px){
      html,body{width:100%!important;max-width:100%!important;overflow-x:hidden!important;}
      body{padding-bottom:calc(24px + env(safe-area-inset-bottom))!important;}

      .hdr{
        position:sticky!important;top:0!important;z-index:40!important;
        display:flex!important;flex-direction:column!important;align-items:stretch!important;
        gap:7px!important;width:100%!important;max-width:100%!important;
        padding:calc(8px + env(safe-area-inset-top)) 10px 8px!important;
        overflow:hidden!important;
      }
      .hdr .brand{min-width:0!important;gap:7px!important;}
      .hdr .brand b{font-size:17px!important;white-space:nowrap!important;}
      .hdr .brand span{display:none!important;}
      .hdr .sync,.hdr>#yayaReloadBtn{display:none!important;}
      .hdr .tabs{
        display:flex!important;
        justify-content:flex-start!important;flex-wrap:nowrap!important;gap:6px!important;
        width:100%!important;overflow-x:auto!important;overscroll-behavior-x:contain!important;
        -webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;padding:1px 0 3px!important;
      }
      .hdr .tabs::-webkit-scrollbar{display:none!important;}
      .hdr .tab,.hdr #yayaReloadBtn,.hdr .fiche-inter-tab{
        flex:0 0 auto!important;min-width:auto!important;min-height:42px!important;height:42px!important;
        padding:0 12px!important;font-size:12px!important;white-space:nowrap!important;
      }
      body>.body{width:100%!important;max-width:100%!important;margin:0!important;padding:10px 8px 20px!important;}
      #pane-chantiers,#pane-chantiers>.card{width:100%!important;max-width:100%!important;min-width:0!important;}
      #pane-chantiers .card{padding-left:10px!important;padding-right:10px!important;}
      #pane-chantiers .top{align-items:center!important;}
      #pane-chantiers .top>b{max-width:100%!important;overflow-wrap:anywhere!important;}
      #pane-chantiers .top>.spacer{display:none!important;}
      #pane-chantiers .top>span[style*="width:150px"]{width:auto!important;flex:1 1 44%!important;text-align:left!important;}
      #pane-chantiers .top>span[style*="width:56px"]{width:auto!important;margin-right:0!important;}
      #pane-chantiers .top>button{min-height:44px!important;}
      #pane-chantiers .kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important;}
      #pane-chantiers .stat{min-width:0!important;padding:9px!important;}
      #pane-chantiers .stat b{font-size:15px!important;overflow-wrap:anywhere!important;}

      #pane-chantiers .chantier-fin-toolbar,
      #pane-chantiers .yaya-detail-section-tabs{
        width:100%!important;max-width:100%!important;overflow-x:auto!important;
        -webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important;
        scroll-snap-type:x proximity!important;touch-action:pan-x!important;
      }
      #pane-chantiers .chantier-fin-toolbar>button,
      #pane-chantiers .yaya-detail-section-tab{
        flex:0 0 auto!important;min-height:44px!important;height:44px!important;
        scroll-snap-align:start!important;touch-action:manipulation!important;
      }
      #pane-chantiers .yaya-detail-section-tab{min-width:132px!important;}

      .overlay{
        align-items:flex-start!important;padding:calc(8px + env(safe-area-inset-top)) 8px calc(8px + env(safe-area-inset-bottom))!important;
        overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;
      }
      .modal{
        width:100%!important;max-width:100%!important;max-height:calc(100dvh - 16px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;
        overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;padding:14px 12px!important;border-radius:11px!important;
      }
      .modal h5{position:sticky!important;top:-14px!important;z-index:2!important;margin:-14px -12px 10px!important;padding:13px 12px!important;background:#fff!important;border-bottom:1px solid #e4e9ef!important;}
      .modal .mrow,.modal .row,.modal .mfoot{flex-wrap:wrap!important;}
      .modal .inp,.modal .msel,.modal input,.modal select,.modal textarea{max-width:100%!important;font-size:16px!important;}
      .modal .mfoot{position:sticky!important;bottom:-14px!important;z-index:2!important;margin:14px -12px -14px!important;padding:10px 12px calc(10px + env(safe-area-inset-bottom))!important;background:#fff!important;border-top:1px solid #e4e9ef!important;}
      .modal button,.mfoot button{min-height:44px!important;}

      #toast{bottom:calc(12px + env(safe-area-inset-bottom))!important;width:calc(100% - 24px)!important;max-width:none!important;text-align:center!important;}
    }

    @media(max-width:390px){
      #pane-chantiers .kpis{grid-template-columns:1fr!important;}
      .hdr .tab,.hdr .fiche-inter-tab{padding:0 10px!important;}
    }
  `;
  document.head.appendChild(style);
})();
