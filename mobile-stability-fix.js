(function(){
  'use strict';
  const id='yaya-mobile-overhaul-v3';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
    button,a,[role="button"],select,input[type="button"],input[type="submit"]{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    @media (hover:none) and (pointer:coarse){button,a,[role="button"]{transition:none!important}button:active,a:active,[role="button"]:active{filter:brightness(.94)}}
    @media(max-width:760px){
      :root{--yaya-safe-bottom:env(safe-area-inset-bottom,0px)}
      html,body{width:100%!important;max-width:100%!important;overflow-x:clip!important}
      body{padding-bottom:calc(20px + var(--yaya-safe-bottom))!important}button{cursor:default}
      .hdr{position:sticky!important;top:0!important;z-index:40!important;display:block!important;width:100%!important;max-width:100%!important;height:auto!important;min-height:0!important;padding:calc(7px + env(safe-area-inset-top,0px)) 8px 7px!important;overflow:visible!important}
      .hdr .brand{display:flex!important;min-width:0!important;margin:0 2px 6px!important}.hdr .brand b{font-size:17px!important;line-height:1.1!important;white-space:nowrap!important}
      .hdr .brand span,.hdr .sync,.hdr>#yayaReloadBtn{display:none!important}
      .hdr .tabs{display:flex!important;justify-content:flex-start!important;flex-wrap:nowrap!important;width:100%!important;max-width:100%!important;gap:6px!important;padding:1px 0 2px!important;overflow-x:auto!important;overflow-y:hidden!important;overscroll-behavior-x:contain!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;scroll-snap-type:x proximity!important}
      .hdr .tabs::-webkit-scrollbar{display:none!important}.hdr .tab,.hdr .fiche-inter-tab{flex:0 0 auto!important;min-width:auto!important;height:40px!important;min-height:40px!important;padding:0 11px!important;font-size:12px!important;line-height:1!important;white-space:nowrap!important;scroll-snap-align:start!important}
      body>.body{width:100%!important;max-width:100%!important;margin:0!important;padding:9px 8px 18px!important}.card,.gpanel{max-width:100%!important;min-width:0!important;padding-left:10px!important;padding-right:10px!important}
      .row,.weekbar,.validrow{max-width:100%!important;gap:8px!important}.inp,.msel,input:not([type="checkbox"]):not([type="radio"]),select,textarea{max-width:100%!important;font-size:16px!important}
      .btn2,.btnp,.btn-valid,.navbtn,.x{min-height:42px!important}.x{min-width:42px!important;padding:0 10px!important;margin-left:0!important}
      #pane-chantiers,#pane-achats,#pane-documents,#pane-equipe,#pane-evolution,#pane-planning{width:100%!important;max-width:100%!important;min-width:0!important}
      #pane-chantiers .top{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:7px!important}#pane-chantiers .top>b{min-width:0!important;overflow-wrap:anywhere!important}#pane-chantiers .top>.num{grid-column:1!important}#pane-chantiers .top>.spacer{display:none!important}
      #pane-chantiers .top>span[style*="width:150px"]{width:auto!important;min-width:0!important;text-align:left!important}#pane-chantiers .top>span[style*="width:56px"]{width:auto!important;margin:0!important}#pane-chantiers .top>button{min-width:42px!important;min-height:42px!important}
      #pane-chantiers .kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}#pane-chantiers .stat{min-width:0!important;padding:9px!important}#pane-chantiers .stat b{font-size:15px!important;overflow-wrap:anywhere!important}
      #pane-chantiers .chantier-fin-toolbar,#pane-chantiers .yaya-detail-section-tabs{display:flex!important;flex-wrap:nowrap!important;width:100%!important;max-width:100%!important;gap:6px!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important;scrollbar-width:none!important;scroll-snap-type:x proximity!important}
      #pane-chantiers .chantier-fin-toolbar::-webkit-scrollbar,#pane-chantiers .yaya-detail-section-tabs::-webkit-scrollbar{display:none!important}#pane-chantiers .chantier-fin-toolbar>button,#pane-chantiers .yaya-detail-section-tab{flex:0 0 auto!important;min-height:42px!important;height:42px!important;padding:0 12px!important;scroll-snap-align:start!important}#pane-chantiers .yaya-detail-section-tab{min-width:116px!important}
      .ligM,.ligD,.ligR,.yaya-document-line{width:100%!important;max-width:100%!important;min-width:0!important}.ligM,.ligD,.ligR{grid-template-columns:78px minmax(0,1fr) auto!important}.ligM>span:last-child,.ligD>span:last-child,.ligR>span:last-child{grid-column:1/-1!important;display:flex!important;justify-content:flex-end!important;gap:6px!important}.ligD>.des,.ligR>.des{grid-column:1/-1!important;white-space:normal!important;overflow-wrap:anywhere!important}.achligne button{min-height:38px!important;min-width:38px!important}
      .tblwrap{width:100%!important;max-width:100%!important;overflow-x:auto!important;overscroll-behavior-x:contain!important}.tblwrap table{min-width:680px!important}.weekbar>.spacer{display:none!important}.weekbar .btn2{flex:1 1 auto!important}
      .overlay{position:fixed!important;inset:0!important;z-index:1000!important;display:flex!important;align-items:flex-start!important;justify-content:center!important;padding:env(safe-area-inset-top,0px) 0 var(--yaya-safe-bottom)!important;overflow:hidden!important;overscroll-behavior:contain!important}
      .modal{display:flex!important;flex-direction:column!important;width:100%!important;max-width:100%!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;padding:0 12px!important;border-radius:0!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important}
      .modal h5{position:sticky!important;top:0!important;z-index:3!important;flex:0 0 auto!important;min-height:54px!important;margin:0 -12px 10px!important;padding:10px 12px!important;align-items:center!important;background:#fff!important;border-bottom:1px solid #e3e8ee!important}.modal h5 button{min-width:42px!important;min-height:42px!important}
      .modal .mrow,.modal .row{flex-wrap:wrap!important;align-items:stretch!important}.modal .mrow>*{flex:1 1 120px!important}.modal .mnum{width:auto!important}.modal .mfoot{position:sticky!important;bottom:0!important;z-index:3!important;flex:0 0 auto!important;display:flex!important;flex-wrap:wrap!important;margin:14px -12px 0!important;padding:10px 12px calc(10px + var(--yaya-safe-bottom))!important;background:#fff!important;border-top:1px solid #e3e8ee!important}.modal .mfoot button{flex:1 1 130px!important;min-height:46px!important}
      #toast{bottom:calc(10px + var(--yaya-safe-bottom))!important;width:calc(100% - 20px)!important;max-width:none!important;text-align:center!important}
    }
    @media(max-width:390px){#pane-chantiers .kpis{grid-template-columns:1fr!important}.hdr .tab,.hdr .fiche-inter-tab{padding:0 9px!important;font-size:11.5px!important}.modal{padding-left:10px!important;padding-right:10px!important}}
    @media(max-width:760px) and (orientation:portrait){.hdr{position:static!important;top:auto!important}}
  `;
  document.head.appendChild(style);
  function recadrer(){if(window.matchMedia&&window.matchMedia('(max-width:760px)').matches&&window.scrollX)window.scrollTo({left:0,top:window.scrollY,behavior:'auto'});}
  window.addEventListener('orientationchange',function(){setTimeout(recadrer,120)},{passive:true});
  document.addEventListener('focusout',function(){setTimeout(recadrer,80)},{passive:true});
})();

(function(){
  if(document.querySelector('script[data-yaya-commande-actions]'))return;
  const s=document.createElement('script');
  s.src='commande-actions.js?v=commande-actions-2';
  s.async=false;
  s.setAttribute('data-yaya-commande-actions','1');
  document.head.appendChild(s);
})();
