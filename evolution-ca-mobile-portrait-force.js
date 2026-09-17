(function(){
  'use strict';
  const ID='yaya-evolution-ca-mobile-portrait-force-v2';
  if(document.getElementById(ID))return;
  const style=document.createElement('style');
  style.id=ID;
  style.textContent=`
    #pane-evolution,
    #pane-evolution .evo2-shell,
    #pane-evolution .evo50-fixed,
    #pane-evolution .evo50-scroll,
    #pane-evolution .evo50-page,
    #pane-evolution .evo2-card,
    #pane-evolution .evo2-kpis,
    #pane-evolution .evo2-kpi,
    #pane-evolution .evo2-chart-scroll{
      max-width:100%!important;
      min-width:0!important;
      box-sizing:border-box!important;
    }

    @media (min-width:761px){
      #pane-evolution.evo50-ready{
        height:var(--yaya-evo-fit-height,var(--evo50-height,680px))!important;
        max-height:var(--yaya-evo-fit-height,var(--evo50-height,680px))!important;
      }
      #pane-evolution.evo50-ready .evo50-chart .evo2-chart{
        min-height:0!important;
      }
    }

    @media (min-width:761px) and (max-width:1100px){
      #pane-evolution .evo2-chart-scroll{
        width:100%!important;
        overflow-x:hidden!important;
      }
      #pane-evolution .evo2-chart{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      #pane-evolution .evo2-columns{
        grid-template-columns:repeat(12,minmax(0,1fr))!important;
        gap:4px!important;
      }
      #pane-evolution .evo2-month-label{font-size:9px!important;}
      #pane-evolution .evo2-value{font-size:8px!important;}
    }

    @media (orientation:portrait) and (hover:none) and (pointer:coarse){
      html,body{
        width:100%!important;
        max-width:100%!important;
        overflow-x:hidden!important;
      }
      body>.body,
      #pane-evolution,
      #pane-evolution .evo2-shell,
      #pane-evolution .evo50-fixed,
      #pane-evolution .evo50-scroll,
      #pane-evolution .evo50-page,
      #pane-evolution .evo2-card{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
        overflow-x:hidden!important;
      }

      #pane-evolution .evo2-kpis{
        display:grid!important;
        grid-template-columns:minmax(0,1fr)!important;
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        gap:8px!important;
      }
      #pane-evolution .evo2-kpi{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      #pane-evolution .evo2-kpi b{
        white-space:normal!important;
        overflow-wrap:anywhere!important;
      }

      #pane-evolution .evo2-chart-scroll{
        width:100%!important;
        max-width:100%!important;
        overflow-x:hidden!important;
        padding:0 3px 9px!important;
        box-sizing:border-box!important;
      }
      #pane-evolution .evo2-chart{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        height:270px!important;
        padding:12px 2px 0 36px!important;
        box-sizing:border-box!important;
      }
      #pane-evolution .evo2-y-axis{left:0!important;width:32px!important;}
      #pane-evolution .evo2-y-label{right:2px!important;font-size:7px!important;}
      #pane-evolution .evo2-gridline{left:36px!important;right:2px!important;}
      #pane-evolution .evo2-columns{
        left:36px!important;
        right:2px!important;
        grid-template-columns:repeat(12,minmax(0,1fr))!important;
        gap:2px!important;
      }
      #pane-evolution .evo2-bars-zone{gap:1px!important;}
      #pane-evolution .evo2-bar-wrap{width:min(18px,46%)!important;}
      #pane-evolution .evo2-month-label{font-size:6px!important;letter-spacing:-.03em!important;overflow:hidden!important;}
      #pane-evolution .evo2-value{font-size:5.8px!important;letter-spacing:-.03em!important;}
      #pane-evolution .evo2-value.best{font-size:6px!important;}
      #pane-evolution .evo2-trophy{font-size:9px!important;}
      #pane-evolution .evo2-legend{padding:0 6px 9px!important;font-size:8px!important;}

      #pane-evolution .evo2-table-wrap{
        width:100%!important;
        max-width:100%!important;
        overflow-x:hidden!important;
        padding:0 2px 10px!important;
        box-sizing:border-box!important;
      }
      #pane-evolution .evo2-table{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        table-layout:fixed!important;
        font-size:7px!important;
      }
      #pane-evolution .evo2-table th,
      #pane-evolution .evo2-table td{
        padding:5px 1px!important;
        font-size:6.8px!important;
        line-height:1.08!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:break-word!important;
      }
      #pane-evolution .evo2-table th:first-child,
      #pane-evolution .evo2-table td:first-child{width:20%!important;}
      #pane-evolution .evo2-table th:nth-child(2),
      #pane-evolution .evo2-table td:nth-child(2){width:22%!important;}
      #pane-evolution .evo2-table th:nth-child(3),
      #pane-evolution .evo2-table td:nth-child(3){width:22%!important;}
      #pane-evolution .evo2-table th:nth-child(4),
      #pane-evolution .evo2-table td:nth-child(4){width:22%!important;}
      #pane-evolution .evo2-table th:nth-child(5),
      #pane-evolution .evo2-table td:nth-child(5){width:14%!important;}
      #pane-evolution .evo2-month-cell{gap:2px!important;min-width:0!important;}
      #pane-evolution .evo2-dot{width:4px!important;height:4px!important;flex:0 0 4px!important;}
      #pane-evolution .evo2-manual{display:none!important;}
      #pane-evolution .evo2-change{min-width:0!important;padding:1px!important;font-size:6px!important;}
    }
  `;
  document.head.appendChild(style);

  let raf=0;
  function viewportHeight(){
    try{return Math.round((window.visualViewport&&window.visualViewport.height)||window.innerHeight||720);}
    catch(_){return window.innerHeight||720;}
  }
  function fitEvolution(){
    raf=0;
    const pane=document.getElementById('pane-evolution');
    if(!pane)return;
    if(window.innerWidth<=760){
      pane.style.removeProperty('--yaya-evo-fit-height');
      return;
    }
    const top=Math.max(0,Math.round(pane.getBoundingClientRect().top));
    const available=Math.max(260,viewportHeight()-top-8);
    pane.style.setProperty('--yaya-evo-fit-height',available+'px');
  }
  function scheduleFit(){
    if(raf)return;
    raf=requestAnimationFrame(fitEvolution);
  }
  function watchPane(){
    const pane=document.getElementById('pane-evolution');
    if(!pane||pane.dataset.yayaEvoFitWatch==='1')return;
    pane.dataset.yayaEvoFitWatch='1';
    new MutationObserver(scheduleFit).observe(pane,{childList:true});
    scheduleFit();
  }

  window.addEventListener('resize',scheduleFit,{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener('resize',scheduleFit,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchPane,{once:true});
  else watchPane();
  setTimeout(watchPane,250);
  setTimeout(scheduleFit,700);
})();
