(function(){
'use strict';
if(window.__YAYA_CHANTIER_STICKY_OPTION1_V3)return;
window.__YAYA_CHANTIER_STICKY_OPTION1_V3=true;

const STYLE_ID='yaya-chantier-sticky-option1-v3';

function installStyle(){
  ['yaya-chantier-sticky-full-v1','yaya-chantier-sticky-option1-v2'].forEach(function(id){
    const n=document.getElementById(id);if(n)n.remove();
  });
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    #pane-chantiers .card:has(> .yaya-detail-section-tabs){overflow:visible!important}
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .top,
    #pane-chantiers .card:has(> .yaya-detail-section-tabs) > .kpis{
      position:relative!important;top:auto!important;z-index:auto!important
    }
    #pane-chantiers .card.yaya-achats-sticky-active > .yaya-detail-section-tabs{
      position:sticky!important;
      z-index:80!important;
      background:#fff!important;
      margin-bottom:0!important;
      box-shadow:0 5px 12px rgba(22,45,73,.10)!important
    }
    #pane-chantiers .card.yaya-achats-sticky-active > .yaya-detail-section-action-row[data-section="depenses"]{
      position:sticky!important;
      z-index:79!important;
      background:#fff!important;
      margin-top:0!important;
      box-shadow:0 5px 10px rgba(22,45,73,.06)!important
    }
    #pane-chantiers .card:not(.yaya-achats-sticky-active) > .yaya-detail-section-tabs,
    #pane-chantiers .card:not(.yaya-achats-sticky-active) > .yaya-detail-section-action-row{
      position:relative!important;top:auto!important
    }
  `;
  document.head.appendChild(s);
}

function headerHeight(){
  const h=document.querySelector('.hdr');
  if(!h)return 0;
  const cs=getComputedStyle(h);
  if(cs.position!=='sticky'&&cs.position!=='fixed')return 0;
  return Math.max(0,Math.ceil(h.getBoundingClientRect().height||0));
}

function isAchats(card){
  if(!card)return false;
  const state=String(card.dataset.yayaDetailSection||'').toLowerCase();
  if(state==='depenses'||state==='achats')return true;
  const on=card.querySelector(':scope > .yaya-detail-section-tabs .yaya-detail-section-tab.on');
  const txt=String(on&&on.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return txt.includes('achat')||txt.includes('depense');
}

function applyCard(card){
  if(!card)return;
  const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
  const action=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="depenses"]');
  const active=isAchats(card);

  card.classList.toggle('yaya-achats-sticky-active',active);

  if(!tabs)return;
  if(!active){
    tabs.style.removeProperty('top');
    if(action)action.style.removeProperty('top');
    return;
  }

  const base=headerHeight();
  const tabsH=Math.max(34,Math.ceil(tabs.getBoundingClientRect().height||0));
  tabs.style.setProperty('top',base+'px','important');
  if(action)action.style.setProperty('top',(base+tabsH)+'px','important');
}

function sync(){
  installStyle();
  document.querySelectorAll('#pane-chantiers .card:has(> .yaya-detail-section-tabs)').forEach(applyCard);
}

let raf=0;
function schedule(delay){
  if(delay){setTimeout(function(){schedule(0)},delay);return;}
  if(raf)return;
  raf=requestAnimationFrame(function(){raf=0;sync();});
}

installStyle();
schedule();
window.addEventListener('resize',function(){schedule();},{passive:true});
window.addEventListener('orientationchange',function(){schedule(100);},{passive:true});
window.addEventListener('yaya:data-refreshed',function(){schedule(30);},{passive:true});
document.addEventListener('click',function(e){
  if(e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab')){
    schedule(0);schedule(50);schedule(180);
  }
},true);

const pane=document.getElementById('pane-chantiers');
if(pane){
  new MutationObserver(function(records){
    for(const r of records){
      if(r.type==='attributes'||(r.addedNodes&&r.addedNodes.length)){schedule();break;}
    }
  }).observe(pane,{childList:true,subtree:true,attributes:true,attributeFilter:['data-yaya-detail-section','class']});
}

setTimeout(sync,100);
setTimeout(sync,500);
window.__YAYA_CHANTIER_STICKY_OPTION1_VERSION='3.0';
})();