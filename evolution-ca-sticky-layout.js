(function(){
  'use strict';
  if(window.__yayaEvolutionStickyV50Boot)return;
  window.__yayaEvolutionStickyV50Boot=true;

  const STYLE_ID='yaya-evolution-sticky-v50';
  let observer=null;
  let resizeTimer=0;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-evolution .evo2-sub{display:none!important}
      #pane-evolution .evo2-kpi-green{display:none!important}
      #pane-evolution .evo2-kpis{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      #pane-evolution .evo2-bar .evo2-signed-count{
        position:absolute!important;
        inset:0!important;
        display:grid!important;
        place-items:center!important;
        margin:0!important;
        color:#fff!important;
        font-size:14px!important;
        line-height:1!important;
        font-weight:900!important;
        text-shadow:0 1px 3px rgba(0,0,0,.35)!important;
        pointer-events:none!important;
        z-index:3!important;
      }

      @media (min-width:761px){
        #pane-evolution.evo50-ready{
          height:var(--evo50-height,680px)!important;
          max-height:var(--evo50-height,680px)!important;
          overflow:hidden!important;
        }
        #pane-evolution.evo50-ready .evo2-shell{
          height:100%!important;
          min-height:0!important;
          display:grid!important;
          grid-template-rows:auto minmax(0,1fr)!important;
          gap:10px!important;
          overflow:hidden!important;
        }
        #pane-evolution.evo50-ready .evo50-fixed{
          position:relative!important;
          z-index:5!important;
          display:grid!important;
          gap:10px!important;
          background:#f4f6f8!important;
          padding:6px 2px 0!important;
        }
        #pane-evolution.evo50-ready .evo50-scroll{
          min-height:0!important;
          height:100%!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
          overscroll-behavior-y:contain!important;
          scroll-snap-type:y mandatory!important;
          scroll-behavior:smooth!important;
          scrollbar-gutter:stable;
        }
        #pane-evolution.evo50-ready .evo50-page{
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
        #pane-evolution.evo50-ready .evo50-page>.evo2-card{
          flex:1 1 auto!important;
          min-height:0!important;
          height:100%!important;
          display:flex!important;
          flex-direction:column!important;
        }
        #pane-evolution.evo50-ready .evo50-chart .evo2-chart-scroll{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow-x:auto!important;
          overflow-y:hidden!important;
        }
        #pane-evolution.evo50-ready .evo50-chart .evo2-chart{
          height:100%!important;
          min-height:330px!important;
        }
        #pane-evolution.evo50-ready .evo50-chart .evo2-card-head,
        #pane-evolution.evo50-ready .evo50-chart .evo2-legend,
        #pane-evolution.evo50-ready .evo50-table .evo2-table-head{
          flex:0 0 auto!important;
        }
        #pane-evolution.evo50-ready .evo50-table .evo2-table-wrap{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow:auto!important;
        }
      }

      @media (max-width:760px){
        #pane-evolution .evo2-kpis{grid-template-columns:1fr 1fr!important}
        #pane-evolution .evo2-bar .evo2-signed-count{font-size:12px!important}
        #pane-evolution.evo50-ready{
          height:auto!important;
          max-height:none!important;
          overflow:visible!important;
        }
        #pane-evolution.evo50-ready .evo2-shell{
          height:auto!important;
          display:grid!important;
          grid-template-rows:auto!important;
          overflow:visible!important;
        }
        #pane-evolution.evo50-ready .evo50-fixed{
          position:static!important;
          background:transparent!important;
          padding:0!important;
        }
        #pane-evolution.evo50-ready .evo50-scroll{
          height:auto!important;
          overflow:visible!important;
          scroll-snap-type:none!important;
        }
        #pane-evolution.evo50-ready .evo50-page{
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          overflow:visible!important;
          padding:0 0 10px!important;
        }
      }

      @media (max-width:760px) and (orientation:portrait){
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
          grid-template-columns:1fr!important;
          width:100%!important;
          max-width:100%!important;
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
          padding:0 4px 9px!important;
          box-sizing:border-box!important;
        }
        #pane-evolution .evo2-chart{
          width:100%!important;
          max-width:100%!important;
          min-width:0!important;
          height:270px!important;
          padding:12px 2px 0 38px!important;
          box-sizing:border-box!important;
        }
        #pane-evolution .evo2-y-axis{
          left:0!important;
          width:34px!important;
        }
        #pane-evolution .evo2-y-label{
          right:2px!important;
          font-size:7px!important;
        }
        #pane-evolution .evo2-gridline{
          left:38px!important;
          right:2px!important;
        }
        #pane-evolution .evo2-columns{
          left:38px!important;
          right:2px!important;
          grid-template-columns:repeat(12,minmax(0,1fr))!important;
          gap:2px!important;
        }
        #pane-evolution .evo2-bars-zone{gap:1px!important}
        #pane-evolution .evo2-bar-wrap{width:min(20px,46%)!important}
        #pane-evolution .evo2-month-label{
          font-size:6.5px!important;
          letter-spacing:-.02em!important;
          overflow:hidden!important;
        }
        #pane-evolution .evo2-value{
          font-size:6px!important;
          letter-spacing:-.03em!important;
        }
        #pane-evolution .evo2-value.best{font-size:6.5px!important}
        #pane-evolution .evo2-trophy{font-size:10px!important}
        #pane-evolution .evo2-legend{
          padding:0 8px 9px!important;
          font-size:8px!important;
        }

        #pane-evolution .evo2-table-wrap{
          width:100%!important;
          max-width:100%!important;
          overflow-x:hidden!important;
          padding:0 3px 10px!important;
          box-sizing:border-box!important;
        }
        #pane-evolution .evo2-table{
          width:100%!important;
          min-width:0!important;
          max-width:100%!important;
          table-layout:fixed!important;
          font-size:7.5px!important;
        }
        #pane-evolution .evo2-table th,
        #pane-evolution .evo2-table td{
          padding:5px 1px!important;
          font-size:7px!important;
          line-height:1.1!important;
          white-space:normal!important;
          overflow-wrap:anywhere!important;
          word-break:break-word!important;
        }
        #pane-evolution .evo2-table th:first-child,
        #pane-evolution .evo2-table td:first-child{width:20%!important}
        #pane-evolution .evo2-table th:nth-child(2),
        #pane-evolution .evo2-table td:nth-child(2){width:22%!important}
        #pane-evolution .evo2-table th:nth-child(3),
        #pane-evolution .evo2-table td:nth-child(3){width:22%!important}
        #pane-evolution .evo2-table th:nth-child(4),
        #pane-evolution .evo2-table td:nth-child(4){width:22%!important}
        #pane-evolution .evo2-table th:nth-child(5),
        #pane-evolution .evo2-table td:nth-child(5){width:14%!important}
        #pane-evolution .evo2-month-cell{
          gap:2px!important;
          min-width:0!important;
        }
        #pane-evolution .evo2-dot{
          width:4px!important;
          height:4px!important;
          flex:0 0 4px!important;
        }
        #pane-evolution .evo2-manual{display:none!important}
        #pane-evolution .evo2-change{
          min-width:0!important;
          padding:1px!important;
          font-size:6.5px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function signatureCanonique(c){
    const marker=String(c&&c.notes||'').match(/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/);
    if(marker&&marker[1])return marker[1];
    const direct=String(c&&c.dateSignature||'').trim().match(/^(\d{4}-\d{2})/);
    return direct&&direct[1]?direct[1]:'';
  }

  function signedCountsFor(year){
    const counts=Array(12).fill(0);
    const chantiers=(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers))?S.chantiers:[];
    chantiers.forEach(function(c){
      const sig=signatureCanonique(c);
      const m=sig.match(/^(\d{4})-(\d{2})/);
      if(!m||Number(m[1])!==year)return;
      const month=Number(m[2])-1;
      if(month>=0&&month<12)counts[month]++;
    });
    return counts;
  }

  function selectedYear(pane){
    const select=pane&&pane.querySelector('.evo2-year');
    const value=Number(select&&select.value);
    if(Number.isFinite(value)&&value>2000)return value;
    try{
      if(typeof anneeEvolution!=='undefined'&&Number(anneeEvolution)>2000)return Number(anneeEvolution);
    }catch(e){}
    return new Date().getFullYear();
  }

  function applyDisplayTweaks(pane){
    if(!pane)return;

    const sub=pane.querySelector('.evo2-sub');
    if(sub)sub.remove();

    const green=pane.querySelector('.evo2-kpi-green');
    if(green)green.remove();

    const kpis=pane.querySelector('.evo2-kpis');
    if(kpis)kpis.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';

    const year=selectedYear(pane);
    const counts=signedCountsFor(year);
    const months=Array.from(pane.querySelectorAll('.evo2-month'));

    months.forEach(function(monthEl,i){
      const currentBar=Array.from(monthEl.querySelectorAll('.evo2-bar')).find(function(bar){
        return !bar.classList.contains('previous');
      });
      let countEl=monthEl.querySelector('.evo2-signed-count');
      const count=counts[i]||0;
      const show=(year>2026||(year===2026&&i>=8))&&count>0;

      if(!show||!currentBar){
        if(countEl)countEl.remove();
      }else{
        if(!countEl){
          countEl=document.createElement('span');
          countEl.className='evo2-signed-count';
        }
        if(countEl.parentNode!==currentBar)currentBar.appendChild(countEl);
        const label=String(count);
        if(countEl.textContent!==label)countEl.textContent=label;
        currentBar.setAttribute('data-signed-count',label);
      }

      const trophy=monthEl.querySelector('.evo2-trophy');
      if(trophy)trophy.style.bottom='calc(var(--bar-height) + 23px)';
    });
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
      pane.style.removeProperty('--evo50-height');
      return;
    }
    const top=Math.max(0,Math.round(pane.getBoundingClientRect().top));
    const height=Math.max(560,viewportHeight()-top-8);
    pane.style.setProperty('--evo50-height',height+'px');
  }

  function installWheel(scroll){
    if(!scroll||scroll.dataset.evo50Wheel==='1')return;
    scroll.dataset.evo50Wheel='1';
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

    applyDisplayTweaks(pane);
    sizePane(pane);
    pane.classList.remove('evo-snap-ready','evo47-ready','evo48-ready','evo49-ready');
    pane.classList.add('evo50-ready');
    pane.scrollTop=0;

    let fixed=shell.querySelector(':scope > .evo50-fixed');
    let scroll=shell.querySelector(':scope > .evo50-scroll');

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
    fixed.className='evo50-fixed';
    fixed.dataset.evoBlock='1';
    fixed.append(toolbar,kpis);

    const chartPage=document.createElement('section');
    chartPage.className='evo50-page evo50-chart';
    chartPage.dataset.evoBlock='2';
    chartPage.append(chart);

    const tablePage=document.createElement('section');
    tablePage.className='evo50-page evo50-table';
    tablePage.dataset.evoBlock='3';
    tablePage.append(table);

    scroll=document.createElement('div');
    scroll.className='evo50-scroll';
    scroll.append(chartPage,tablePage);

    shell.replaceChildren(fixed,scroll);
    scroll.scrollTop=0;
    installWheel(scroll);
    applyDisplayTweaks(pane);
    return true;
  }

  function observePane(){
    const pane=document.getElementById('pane-evolution');
    if(!pane)return false;
    if(observer)observer.disconnect();
    observer=new MutationObserver(function(){requestAnimationFrame(arrange);});
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
    resizeTimer=setTimeout(arrange,100);
  },{passive:true});

  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',function(){requestAnimationFrame(arrange);},{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
