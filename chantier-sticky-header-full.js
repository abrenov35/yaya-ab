(function(){
'use strict';
if(window.__YAYA_CHANTIER_STICKY_OPTION1_V2)return;
window.__YAYA_CHANTIER_STICKY_OPTION1_V2=true;

const STYLE_ID='yaya-chantier-sticky-option1-v2';

function installStyle(){
  let old=document.getElementById('yaya-chantier-sticky-full-v1');
  if(old)old.remove();
  if(document.getElementById(STYLE_ID))return;

  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* OPTION 1 — Achats :
       les KPI et le titre chantier défilent normalement.
       seuls les onglets + le bandeau ACHATS restent visibles. */

    #pane-chantiers .card:has(> .yaya-detail-section-tabs){
      overflow:visible!important;
    }

    /* Annule l'ancien comportement "tout figé". */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
      position:relative!important;
      top:auto!important;
      z-index:auto!important;
    }

    /* Par défaut aucun sticky sur les autres rubriques. */
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-tabs,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .yaya-detail-section-action-row{
      position:relative!important;
      top:auto!important;
    }

    /* Onglets figés uniquement lorsque la rubrique ACHATS est ouverte. */
    #pane-chantiers .card[data-yaya-detail-section="depenses"] > .yaya-detail-section-tabs{
      position:sticky!important;
      top:var(--yaya-achats-sticky-base,0px)!important;
      z-index:46!important;
      background:#fff!important;
      margin-top:0!important;
      margin-bottom:0!important;
      padding-top:4px!important;
      padding-bottom:4px!important;
      box-shadow:0 4px 10px rgba(22,45,73,.08)!important;
    }

    /* Bandeau ACHATS + boutons juste sous les onglets. */
    #pane-chantiers .card[data-yaya-detail-section="depenses"] > .yaya-detail-section-action-row[data-section="depenses"]{
      position:sticky!important;
      top:calc(var(--yaya-achats-sticky-base,0px) + var(--yaya-achats-sticky-tabs-h,42px))!important;
      z-index:45!important;
      background:#fff!important;
      margin-top:0!important;
      margin-bottom:8px!important;
      box-shadow:0 5px 10px rgba(22,45,73,.05)!important;
    }

    /* Évite qu'un contenu de la liste crée son propre scroll. */
    #pane-chantiers .card[data-yaya-detail-section="depenses"] > .yaya-detail-expenses-pane{
      overflow:visible!important;
      max-height:none!important;
    }

    @media(max-width:760px){
      #pane-chantiers .card[data-yaya-detail-section="depenses"] > .yaya-detail-section-tabs{
        padding-top:3px!important;
        padding-bottom:3px!important;
      }
    }
  `;
  document.head.appendChild(s);
}

function stickyBase(){
  const header=document.querySelector('.hdr');
  if(!header)return 0;
  const cs=getComputedStyle(header);
  if(cs.position!=='sticky'&&cs.position!=='fixed')return 0;
  return Math.max(0,Math.ceil(header.getBoundingClientRect().height||0));
}

function sync(){
  installStyle();
  document.querySelectorAll('#pane-chantiers .card:has(> .yaya-detail-section-tabs)').forEach(function(card){
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    const base=stickyBase();
    const tabsH=tabs?Math.ceil(tabs.getBoundingClientRect().height||0):0;
    card.style.setProperty('--yaya-achats-sticky-base',base+'px');
    card.style.setProperty('--yaya-achats-sticky-tabs-h',Math.max(34,tabsH)+'px');
  });
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
schedule();
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',function(){setTimeout(schedule,100);},{passive:true});
window.addEventListener('yaya:data-refreshed',schedule,{passive:true});
document.addEventListener('click',function(e){
  if(e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab'))setTimeout(schedule,20);
},true);

const pane=document.getElementById('pane-chantiers');
if(pane){
  new MutationObserver(function(records){
    for(const r of records){
      if(r.type==='attributes'||(r.addedNodes&&r.addedNodes.length)){schedule();break;}
    }
  }).observe(pane,{
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['data-yaya-detail-section']
  });
}

setTimeout(schedule,200);
window.__YAYA_CHANTIER_STICKY_OPTION1_VERSION='2.0';
})();