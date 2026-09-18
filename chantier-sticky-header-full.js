(function(){
'use strict';
if(window.__YAYA_CHANTIER_STICKY_FULL_V1)return;
window.__YAYA_CHANTIER_STICKY_FULL_V1=true;

const STYLE_ID='yaya-chantier-sticky-full-v1';

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* Fiche chantier : partie haute complète figée.
       Le scroll reste celui de la page, aucun scroll interne ni saut automatique. */

    #pane-chantiers .card:has(> .yaya-detail-section-tabs){
      overflow:visible!important;
    }

    /* Bloc 1 : nom chantier + bouton gérer chantier */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top{
      position:sticky!important;
      top:var(--yaya-sticky-base,72px)!important;
      z-index:44!important;
      background:#fff!important;
      padding-top:4px!important;
      margin-bottom:0!important;
    }

    /* Bloc 1 : KPI */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
      position:sticky!important;
      top:calc(var(--yaya-sticky-base,72px) + var(--yaya-sticky-top-h,52px))!important;
      z-index:43!important;
      background:#fff!important;
      padding-top:6px!important;
      padding-bottom:8px!important;
      margin-bottom:0!important;
    }

    /* Bloc 2 : onglets */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs{
      position:sticky!important;
      top:calc(
        var(--yaya-sticky-base,72px)
        + var(--yaya-sticky-top-h,52px)
        + var(--yaya-sticky-kpis-h,92px)
      )!important;
      z-index:42!important;
      background:#fff!important;
      padding-top:6px!important;
      padding-bottom:6px!important;
      margin-top:0!important;
      margin-bottom:0!important;
      box-shadow:0 5px 10px rgba(22,45,73,.06)!important;
    }

    /* Bloc 2 : bandeau rubrique active + actions */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-action-row{
      position:sticky!important;
      top:calc(
        var(--yaya-sticky-base,72px)
        + var(--yaya-sticky-top-h,52px)
        + var(--yaya-sticky-kpis-h,92px)
        + var(--yaya-sticky-tabs-h,50px)
      )!important;
      z-index:41!important;
      background:#fff!important;
      margin-top:0!important;
      margin-bottom:8px!important;
      box-shadow:0 5px 10px rgba(22,45,73,.04)!important;
    }

    /* Le contenu défile naturellement sous la zone figée. */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-node:not(.yaya-detail-section-action-row){
      overflow:visible!important;
      max-height:none!important;
    }
  `;
  document.head.appendChild(s);
}

function headerBase(){
  const hdr=document.querySelector('.hdr');
  if(!hdr)return 0;
  const cs=getComputedStyle(hdr);
  if(cs.position==='fixed'||cs.position==='sticky'){
    return Math.ceil(hdr.getBoundingClientRect().height||0);
  }
  return 0;
}

function sync(){
  installStyle();
  const card=document.querySelector('#pane-chantiers .card:has(> .yaya-detail-section-tabs)');
  if(!card)return;

  const top=card.querySelector(':scope > .top');
  const kpis=card.querySelector(':scope > .kpis');
  const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');

  const base=Math.max(0,headerBase());
  const topH=top?Math.ceil(top.getBoundingClientRect().height||0):0;
  const kpisH=kpis?Math.ceil(kpis.getBoundingClientRect().height||0):0;
  const tabsH=tabs?Math.ceil(tabs.getBoundingClientRect().height||0):0;

  card.style.setProperty('--yaya-sticky-base',base+'px');
  card.style.setProperty('--yaya-sticky-top-h',topH+'px');
  card.style.setProperty('--yaya-sticky-kpis-h',kpisH+'px');
  card.style.setProperty('--yaya-sticky-tabs-h',tabsH+'px');
}

let raf=0;
function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(function(){
    raf=0;
    sync();
  });
}

installStyle();
sync();

window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',function(){
  setTimeout(schedule,80);
  setTimeout(schedule,300);
},{passive:true});
window.addEventListener('yaya:data-refreshed',schedule,{passive:true});
document.addEventListener('click',function(){setTimeout(schedule,30)},true);

const pane=document.getElementById('pane-chantiers');
if(pane){
  new MutationObserver(schedule).observe(pane,{
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['data-yaya-detail-section']
  });
}

setTimeout(schedule,0);
setTimeout(schedule,250);
setTimeout(schedule,800);

window.__YAYA_CHANTIER_STICKY_FULL_VERSION='1.0';
})();