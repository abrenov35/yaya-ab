(function(){
  'use strict';
  if(window.__yayaEvolutionStickyV48Boot)return;
  window.__yayaEvolutionStickyV48Boot=true;

  const STYLE_ID='yaya-evolution-sticky-v48';
  let observer=null;
  let resizeTimer=0;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      @media (min-width:761px){
        #pane-evolution.evo48-ready{
          height:var(--evo48-height,680px)!important;
          max-height:var(--evo48-height,680px)!important;
          overflow:hidden!important;
        }
        #pane-evolution.evo48-ready .evo2-shell{
          height:100%!important;
          min-height:0!important;
          display:grid!important;
          grid-template-rows:auto minmax(0,1fr)!important;
          gap:10px!important;
          overflow:hidden!important;
        }
        #pane-evolution.evo48-ready .evo48-fixed{
          position:relative!important;
          z-index:5!important;
          display:grid!important;
          gap:10px!important;
          background:#f4f6f8!important;
          padding:2px 2px 0!important;
        }
        #pane-evolution.evo48-ready .evo48-scroll{
          min-height:0!important;
          height:100%!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
          overscroll-behavior-y:contain!important;
          scroll-snap-type:y mandatory!important;
          scroll-behavior:smooth!important;
          scrollbar-gutter:stable;
        }
        #pane-evolution.evo48-ready .evo48-page{
          height:100%!important;
          min-height:100%!important;
          max-height:100%!important;
          box-sizing:border-box!important;
          scroll-snap-align:start!important;
          scroll-snap-stop:always!important;
          display:flex!important;
          flex-direction:column!important;
          padding:2px 2px 8px!important;
          overflow:hidden!important;
        }
        #pane-evolution.evo48-ready .evo48-page>.evo2-card{
          flex:1 1 auto!important;
          min-height:0!important;
          height:100%!important;
          display:flex!important;
          flex-direction:column!important;
        }
        #pane-evolution.evo48-ready .evo48-chart .evo2-chart-scroll{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow-x:auto!important;
          overflow-y:hidden!important;
        }
        #pane-evolution.evo48-ready .evo48-chart .evo2-chart{
          height:100%!important;
          min-height:330px!important;
        }
        #pane-evolution.evo48-ready .evo48-chart .evo2-card-head,
        #pane-evolution.evo48-ready .evo48-chart .evo2-legend,
        #pane-evolution.evo48-ready .evo48-table .evo2-table-head{
          flex:0 0 auto!important;
        }
        #pane-evolution.evo48-ready .evo48-table .evo2-table-wrap{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow:auto!important;
        }
      }

      @media (max-width:760px){
        #pane-evolution.evo48-ready{
          height:auto!important;
          max-height:none!important;
          overflow:visible!important;
        }
        #pane-evolution.evo48-ready .evo2-shell{
          height:auto!important;
          display:grid!important;
          grid-template-rows:auto!important;
          overflow:visible!important;
        }
        #pane-evolution.evo48-ready .evo48-fixed{
          position:static!important;
          background:transparent!important;
          padding:0!important;
        }
        #pane-evolution.evo48-ready .evo48-scroll{
          height:auto!important;
          overflow:visible!important;
          scroll-snap-type:none!important;
        }
        #pane-evolution.evo48-ready .evo48-page{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          overflow:visible!important;
          padding:0 0 10px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function viewportHeight(){
    try{
      return Math.round((window.visualViewport&&window.visualViewport.height)||window.innerHeight||720);
    }catch(e){
      return window.innerHeight||720;
    }
  }

  function sizePane(pane){
    if(!pane)return;
    if(window.innerWidth<=760){
      pane.style.removeProperty('--evo48-height');
      return;
    }
    const top=Math.max(0,Math.round(pane.getBoundingClientRect().top));
    const height=Math.max(560,viewportHeight()-top-8);
    pane.style.setProperty('--evo48-height',height+'px');
  }

  function installWheel(scroll){
    if(!scroll||scroll.dataset.evo48Wheel==='1')return;
    scroll.dataset.evo48Wheel='1';
    let lock=false;

    scroll.addEventListener('wheel',function(e){
      if(window.innerWidth<=760||Math.abs(e.deltaY)<8)return;

      e.stopPropagation();
      e.preventDefault();

      if(lock)return;

      const h=scroll.clientHeight||1;
      const current=Math.round(scroll.scrollTop/h);
      const target=Math.max(0,Math.min(1,current+(e.deltaY>0?1:-1)));

      if(target===current)return;

      lock=true;
      scroll.scrollTo({top:target*h,behavior:'smooth'});
      setTimeout(function(){lock=false;},520);
    },{passive:false});
  }

  function arrange(){
    installStyle();

    const pane=document.getElementById('pane-evolution');
    const shell=pane&&pane.querySelector('.evo2-shell');
    if(!pane||!shell)return false;

    sizePane(pane);
    pane.classList.remove('evo-snap-ready','evo47-ready');
    pane.classList.add('evo48-ready');
    pane.scrollTop=0;

    let fixed=shell.querySelector(':scope > .evo48-fixed');
    let scroll=shell.querySelector(':scope > .evo48-scroll');

    if(fixed&&scroll){
      installWheel(scroll);
      return true;
    }

    const toolbar=shell.querySelector('.evo2-toolbar');
    const kpis=shell.querySelector('.evo2-kpis');
    const cards=Array.from(shell.querySelectorAll('.evo2-card'));
    const chart=cards.find(function(card){return !!card.querySelector('.evo2-chart');});
    const table=cards.find(function(card){return !!card.querySelector('.evo2-table');});

    if(!toolbar||!kpis||!chart||!table)return false;

    fixed=document.createElement('div');
    fixed.className='evo48-fixed';
    fixed.dataset.evoBlock='1';
    fixed.append(toolbar,kpis);

    const chartPage=document.createElement('section');
    chartPage.className='evo48-page evo48-chart';
    chartPage.dataset.evoBlock='2';
    chartPage.append(chart);

    const tablePage=document.createElement('section');
    tablePage.className='evo48-page evo48-table';
    tablePage.dataset.evoBlock='3';
    tablePage.append(table);

    scroll=document.createElement('div');
    scroll.className='evo48-scroll';
    scroll.append(chartPage,tablePage);

    shell.replaceChildren(fixed,scroll);
    scroll.scrollTop=0;
    installWheel(scroll);
    return true;
  }

  function observePane(){
    const pane=document.getElementById('pane-evolution');
    if(!pane)return false;

    if(observer)observer.disconnect();
    observer=new MutationObserver(function(){
      requestAnimationFrame(arrange);
    });
    observer.observe(pane,{childList:true,subtree:true});
    return true;
  }

  function boot(){
    if(!document.getElementById('pane-evolution')){
      setTimeout(boot,120);
      return;
    }

    observePane();
    requestAnimationFrame(arrange);
    setTimeout(arrange,100);
    setTimeout(arrange,300);
    setTimeout(arrange,800);
  }

  window.addEventListener('resize',function(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(function(){
      const pane=document.getElementById('pane-evolution');
      if(pane){
        sizePane(pane);
        arrange();
      }
    },100);
  },{passive:true});

  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',function(){
      const pane=document.getElementById('pane-evolution');
      if(pane){
        sizePane(pane);
        arrange();
      }
    },{passive:true});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }
})();
