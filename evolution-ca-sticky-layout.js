(function(){
  'use strict';
  if(window.__yayaEvolutionStickyV49Boot)return;
  window.__yayaEvolutionStickyV49Boot=true;

  const STYLE_ID='yaya-evolution-sticky-v49';
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
      #pane-evolution .evo2-signed-count{
        display:block;
        margin-top:2px;
        font-size:8px;
        line-height:1.05;
        font-weight:900;
        color:#0b7a68;
        white-space:nowrap;
      }

      @media (min-width:761px){
        #pane-evolution.evo49-ready{
          height:var(--evo49-height,680px)!important;
          max-height:var(--evo49-height,680px)!important;
          overflow:hidden!important;
        }
        #pane-evolution.evo49-ready .evo2-shell{
          height:100%!important;
          min-height:0!important;
          display:grid!important;
          grid-template-rows:auto minmax(0,1fr)!important;
          gap:10px!important;
          overflow:hidden!important;
        }
        #pane-evolution.evo49-ready .evo49-fixed{
          position:relative!important;
          z-index:5!important;
          display:grid!important;
          gap:10px!important;
          background:#f4f6f8!important;
          padding:2px 2px 0!important;
        }
        #pane-evolution.evo49-ready .evo49-scroll{
          min-height:0!important;
          height:100%!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
          overscroll-behavior-y:contain!important;
          scroll-snap-type:y mandatory!important;
          scroll-behavior:smooth!important;
          scrollbar-gutter:stable;
        }
        #pane-evolution.evo49-ready .evo49-page{
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
        #pane-evolution.evo49-ready .evo49-page>.evo2-card{
          flex:1 1 auto!important;
          min-height:0!important;
          height:100%!important;
          display:flex!important;
          flex-direction:column!important;
        }
        #pane-evolution.evo49-ready .evo49-chart .evo2-chart-scroll{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow-x:auto!important;
          overflow-y:hidden!important;
        }
        #pane-evolution.evo49-ready .evo49-chart .evo2-chart{
          height:100%!important;
          min-height:330px!important;
        }
        #pane-evolution.evo49-ready .evo49-chart .evo2-card-head,
        #pane-evolution.evo49-ready .evo49-chart .evo2-legend,
        #pane-evolution.evo49-ready .evo49-table .evo2-table-head{
          flex:0 0 auto!important;
        }
        #pane-evolution.evo49-ready .evo49-table .evo2-table-wrap{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow:auto!important;
        }
      }

      @media (max-width:760px){
        #pane-evolution .evo2-kpis{grid-template-columns:1fr 1fr!important}
        #pane-evolution.evo49-ready{
          height:auto!important;
          max-height:none!important;
          overflow:visible!important;
        }
        #pane-evolution.evo49-ready .evo2-shell{
          height:auto!important;
          display:grid!important;
          grid-template-rows:auto!important;
          overflow:visible!important;
        }
        #pane-evolution.evo49-ready .evo49-fixed{
          position:static!important;
          background:transparent!important;
          padding:0!important;
        }
        #pane-evolution.evo49-ready .evo49-scroll{
          height:auto!important;
          overflow:visible!important;
          scroll-snap-type:none!important;
        }
        #pane-evolution.evo49-ready .evo49-page{
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
      const value=monthEl.querySelector('.evo2-value');
      if(!value)return;

      let countEl=value.querySelector('.evo2-signed-count');
      const show=year>2026||(year===2026&&i>=8);

      if(!show){
        if(countEl)countEl.remove();
        return;
      }

      if(!countEl){
        countEl=document.createElement('span');
        countEl.className='evo2-signed-count';
        value.appendChild(countEl);
      }

      const count=counts[i]||0;
      countEl.textContent=count+' '+(count===1?'chantier':'chantiers');

      const trophy=monthEl.querySelector('.evo2-trophy');
      if(trophy)trophy.style.bottom='calc(var(--bar-height) + 39px)';
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
      pane.style.removeProperty('--evo49-height');
      return;
    }
    const top=Math.max(0,Math.round(pane.getBoundingClientRect().top));
    const height=Math.max(560,viewportHeight()-top-8);
    pane.style.setProperty('--evo49-height',height+'px');
  }

  function installWheel(scroll){
    if(!scroll||scroll.dataset.evo49Wheel==='1')return;
    scroll.dataset.evo49Wheel='1';
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
    pane.classList.remove('evo-snap-ready','evo47-ready','evo48-ready');
    pane.classList.add('evo49-ready');
    pane.scrollTop=0;

    let fixed=shell.querySelector(':scope > .evo49-fixed');
    let scroll=shell.querySelector(':scope > .evo49-scroll');

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
    fixed.className='evo49-fixed';
    fixed.dataset.evoBlock='1';
    fixed.append(toolbar,kpis);

    const chartPage=document.createElement('section');
    chartPage.className='evo49-page evo49-chart';
    chartPage.dataset.evoBlock='2';
    chartPage.append(chart);

    const tablePage=document.createElement('section');
    tablePage.className='evo49-page evo49-table';
    tablePage.dataset.evoBlock='3';
    tablePage.append(table);

    scroll=document.createElement('div');
    scroll.className='evo49-scroll';
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
