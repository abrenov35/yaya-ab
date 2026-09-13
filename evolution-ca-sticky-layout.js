(function(){
  'use strict';
  if(window.__yayaEvolutionStickyV47Boot)return;
  window.__yayaEvolutionStickyV47Boot=true;

  const STYLE_ID='yaya-evolution-sticky-v47';
  let resizeTimer=0;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      @media (min-width:761px){
        #pane-evolution.evo47-ready,
        #pane-evolution.evo47-ready.evo-snap-ready{
          height:var(--evo47-height,680px)!important;
          max-height:var(--evo47-height,680px)!important;
          overflow:hidden!important;
          overscroll-behavior:none!important;
          scrollbar-gutter:auto!important;
        }
        #pane-evolution.evo47-ready .evo2-shell{
          height:100%!important;
          min-height:0!important;
          display:grid!important;
          grid-template-rows:auto minmax(0,1fr)!important;
          gap:10px!important;
          overflow:hidden!important;
        }
        #pane-evolution.evo47-ready .evo47-fixed{
          position:relative;
          z-index:3;
          display:grid;
          gap:10px;
          flex:0 0 auto;
          background:#f4f6f8;
          padding:2px 2px 0;
        }
        #pane-evolution.evo47-ready .evo47-scroll{
          min-height:0!important;
          height:100%!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
          scroll-snap-type:y mandatory;
          scroll-behavior:smooth;
          overscroll-behavior-y:contain;
          scrollbar-gutter:stable;
        }
        #pane-evolution.evo47-ready .evo47-page{
          height:100%!important;
          min-height:100%!important;
          max-height:100%!important;
          box-sizing:border-box;
          scroll-snap-align:start;
          scroll-snap-stop:always;
          padding:2px 2px 8px;
          display:flex;
          flex-direction:column;
          overflow:hidden;
        }
        #pane-evolution.evo47-ready .evo47-page>.evo2-card{
          flex:1 1 auto!important;
          min-height:0!important;
          height:100%!important;
          display:flex!important;
          flex-direction:column!important;
        }
        #pane-evolution.evo47-ready .evo47-chart .evo2-chart-scroll{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow-x:auto!important;
          overflow-y:hidden!important;
        }
        #pane-evolution.evo47-ready .evo47-chart .evo2-chart{
          height:100%!important;
          min-height:330px!important;
        }
        #pane-evolution.evo47-ready .evo47-chart .evo2-card-head,
        #pane-evolution.evo47-ready .evo47-chart .evo2-legend,
        #pane-evolution.evo47-ready .evo47-table .evo2-table-head{
          flex:0 0 auto;
        }
        #pane-evolution.evo47-ready .evo47-table .evo2-table-wrap{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow:auto!important;
        }
      }
      @media (max-width:760px){
        #pane-evolution.evo47-ready,
        #pane-evolution.evo47-ready.evo-snap-ready{
          height:auto!important;
          max-height:none!important;
          overflow:visible!important;
        }
        #pane-evolution.evo47-ready .evo2-shell{
          height:auto!important;
          display:grid!important;
          grid-template-rows:auto!important;
          overflow:visible!important;
        }
        #pane-evolution.evo47-ready .evo47-fixed{position:static;padding:0;background:transparent}
        #pane-evolution.evo47-ready .evo47-scroll{height:auto!important;overflow:visible!important;scroll-snap-type:none!important}
        #pane-evolution.evo47-ready .evo47-page{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding:0 0 10px}
      }
    `;
    document.head.appendChild(style);
  }

  function viewportHeight(){
    try{return Math.round((window.visualViewport&&window.visualViewport.height)||window.innerHeight||720);}catch(e){return window.innerHeight||720;}
  }

  function sizePane(pane){
    if(!pane)return;
    if(window.innerWidth<=760){
      pane.style.removeProperty('--evo47-height');
      return;
    }
    const rect=pane.getBoundingClientRect();
    const top=Math.max(0,Math.round(rect.top));
    const height=Math.max(560,viewportHeight()-top-8);
    pane.style.setProperty('--evo47-height',height+'px');
  }

  function installWheel(scroll){
    if(!scroll||scroll.dataset.evo47Wheel)return;
    scroll.dataset.evo47Wheel='1';
    let lock=false;
    scroll.addEventListener('wheel',function(e){
      if(window.innerWidth<=760||Math.abs(e.deltaY)<8)return;
      e.stopPropagation();
      if(lock){e.preventDefault();return;}
      const h=scroll.clientHeight||1;
      const current=Math.round(scroll.scrollTop/h);
      const dir=e.deltaY>0?1:-1;
      const target=Math.max(0,Math.min(1,current+dir));
      if(target===current)return;
      e.preventDefault();
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
    pane.classList.add('evo47-ready');

    let fixed=shell.querySelector(':scope > .evo47-fixed');
    let scroll=shell.querySelector(':scope > .evo47-scroll');

    if(!fixed||!scroll){
      const toolbar=shell.querySelector('.evo2-toolbar');
      const kpis=shell.querySelector('.evo2-kpis');
      const cards=Array.from(shell.querySelectorAll('.evo2-card'));
      const chart=cards.find(function(card){return !!card.querySelector('.evo2-chart');});
      const table=cards.find(function(card){return !!card.querySelector('.evo2-table');});
      if(!toolbar||!kpis||!chart||!table)return false;

      fixed=document.createElement('div');
      fixed.className='evo47-fixed';
      fixed.append(toolbar,kpis);

      const chartPage=document.createElement('section');
      chartPage.className='evo47-page evo47-chart';
      chartPage.dataset.evoBlock='2';
      chartPage.append(chart);

      const tablePage=document.createElement('section');
      tablePage.className='evo47-page evo47-table';
      tablePage.dataset.evoBlock='3';
      tablePage.append(table);

      scroll=document.createElement('div');
      scroll.className='evo47-scroll';
      scroll.append(chartPage,tablePage);

      shell.replaceChildren(fixed,scroll);
      scroll.scrollTop=0;
    }

    installWheel(scroll);
    return true;
  }

  function install(){
    if(!window.__yayaEvolutionDashboardV2Installed||typeof window.renderEvolution!=='function'){
      setTimeout(install,120);
      return;
    }

    if(!window.renderEvolution.__yayaStickyV47){
      const original=window.renderEvolution;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        requestAnimationFrame(arrange);
        setTimeout(arrange,100);
        setTimeout(arrange,190);
        return result;
      };
      wrapped.__yayaStickyV47=true;
      window.renderEvolution=wrapped;
    }

    requestAnimationFrame(arrange);
    setTimeout(arrange,120);
  }

  window.addEventListener('resize',function(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(function(){
      const pane=document.getElementById('pane-evolution');
      if(pane)sizePane(pane);
    },100);
  },{passive:true});

  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',function(){
      const pane=document.getElementById('pane-evolution');
      if(pane)sizePane(pane);
    },{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
