(function(){
'use strict';
if(window.__YAYA_CHANTIER_THREE_BLOCK_VIEWPORT_V7)return;
window.__YAYA_CHANTIER_THREE_BLOCK_VIEWPORT_V7=true;

const STYLE_ID='yaya-chantier-three-block-viewport-v7';
const PAGE_SIZE=12;
let activeCard=null;
let activeKey='';
let raf=0;
let wheelLock=false;
let touchStartY=0;

const ROW_SELECTORS=[
  '.ycn-row',
  '.yaya-detail-commande-row',
  '.yaya-detail-expense-row',
  '.yaya-detail-charge-row',
  '.yaya-detail-document-row',
  '.yaya-detail-mail-row',
  '.achat-ligne',
  '.charge-ligne',
  '.docligne',
  '.doc-row-standard',
  '.message-ligne',
  '.yaya-photo-row',
  '.yaya-photo-item',
  'tbody > tr'
];

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* Fiche chantier 3 blocs, sans masquer/remplacer les lignes.
       Le texte reste dans le DOM en permanence : aucun scintillement. */
    #pane-chantiers .card.yaya-three-block-fit{
      overflow:visible!important;
    }

    #pane-chantiers .card.yaya-three-block-fit > .yaya-detail-section-tabs{
      position:sticky!important;
      top:var(--yaya-detail-sticky-top,8px)!important;
      z-index:30!important;
      background:#fff!important;
      padding-top:5px!important;
      padding-bottom:5px!important;
      margin-bottom:8px!important;
      box-shadow:0 5px 10px rgba(22,45,73,.06)!important;
    }

    #pane-chantiers .card.yaya-three-block-fit > .yaya-detail-section-action-row{
      position:sticky!important;
      top:calc(var(--yaya-detail-sticky-top,8px) + var(--yaya-tabs-sticky-height,48px))!important;
      z-index:29!important;
      background:#fff!important;
      margin-top:0!important;
      box-shadow:0 5px 10px rgba(22,45,73,.04)!important;
    }

    #pane-chantiers .card.yaya-three-block-long .yaya-detail-section-node,
    #pane-chantiers .card.yaya-three-block-long .ycn-group-body{
      overflow:visible!important;
      max-height:none!important;
    }

    #pane-chantiers [data-yaya-page-anchor="1"]{
      scroll-margin-top:calc(
        var(--yaya-detail-sticky-top,8px)
        + var(--yaya-tabs-sticky-height,48px)
        + var(--yaya-action-sticky-height,48px)
        + 8px
      )!important;
    }

    #pane-chantiers .yaya-block-page-indicator{
      display:none!important;
    }
  `;
  document.head.appendChild(s);
}

function currentCard(){
  return document.querySelector('#pane-chantiers .card:has(> .yaya-detail-section-tabs)');
}

function sectionKey(card){
  return String(card&&card.dataset.yayaDetailSection||'');
}

function stickyTop(){
  const hdr=document.querySelector('.hdr');
  if(!hdr)return 8;
  const cs=getComputedStyle(hdr);
  if(cs.position!=='sticky'&&cs.position!=='fixed')return 8;
  return Math.max(8,Math.ceil(hdr.getBoundingClientRect().height)+6);
}

function activeScope(card){
  if(!card)return null;
  const section=sectionKey(card);

  let candidates=[...card.querySelectorAll(
    ':scope > .yaya-detail-section-node[data-section="'+CSS.escape(section)+'"]:not(.yaya-detail-section-action-row):not(.yaya-detail-empty-pane)'
  )];

  let scope=candidates.find(function(el){
    return ROW_SELECTORS.some(function(sel){return !!el.querySelector(sel);});
  }) || candidates[0] || null;

  if(!scope&&section==='commandes'){
    scope=card.querySelector(':scope > .yaya-ab-commandes-direct, :scope > .yaya-detail-commandes-pane');
  }
  return scope||null;
}

function rowsFor(card){
  const scope=activeScope(card);
  if(!scope)return [];
  const seen=new Set();
  ROW_SELECTORS.forEach(sel=>{
    scope.querySelectorAll(sel).forEach(el=>{
      if(el.offsetParent!==null)seen.add(el);
    });
  });
  return Array.from(seen).sort((a,b)=>{
    const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
    return ra.top-rb.top||ra.left-rb.left;
  });
}

function markAnchors(card){
  if(!card)return [];
  card.querySelectorAll('[data-yaya-page-anchor]').forEach(el=>el.removeAttribute('data-yaya-page-anchor'));
  const rows=rowsFor(card);
  rows.forEach((row,i)=>{
    if(i%PAGE_SIZE===0)row.dataset.yayaPageAnchor='1';
  });
  return rows;
}

function evaluate(){
  installStyle();

  const c=currentCard();
  const key=c?sectionKey(c):'';

  if(activeCard&&activeCard!==c){
    activeCard.classList.remove('yaya-three-block-fit','yaya-three-block-long');
    activeCard.style.removeProperty('--yaya-detail-sticky-top');
    activeCard.style.removeProperty('--yaya-tabs-sticky-height');
    activeCard.style.removeProperty('--yaya-action-sticky-height');
  }

  activeCard=c;
  activeKey=key;
  if(!c)return;

  const tabs=c.querySelector(':scope > .yaya-detail-section-tabs');
  if(!tabs)return;

  const rows=markAnchors(c);
  const action=c.querySelector(':scope > .yaya-detail-section-action-row[data-section="'+CSS.escape(key)+'"]')
    ||c.querySelector(':scope > .yaya-detail-section-action-row');

  const top=stickyTop();
  const tabsH=Math.ceil(tabs.getBoundingClientRect().height||0);
  const actionH=action&&action.offsetParent!==null?Math.ceil(action.getBoundingClientRect().height||0):0;

  c.style.setProperty('--yaya-detail-sticky-top',top+'px');
  c.style.setProperty('--yaya-tabs-sticky-height',tabsH+'px');
  c.style.setProperty('--yaya-action-sticky-height',actionH+'px');

  const available=Math.max(320,window.innerHeight-top-10);
  const fullHeight=Math.ceil(c.getBoundingClientRect().height);

  c.classList.toggle('yaya-three-block-long',rows.length>PAGE_SIZE);
  c.classList.toggle('yaya-three-block-fit',fullHeight>available||rows.length>PAGE_SIZE);
}

function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;evaluate();});
}

function anchorsFor(card){
  const rows=rowsFor(card);
  return rows.filter((_,i)=>i%PAGE_SIZE===0);
}

function stickyContentTop(card){
  if(!card)return stickyTop()+8;
  const cs=getComputedStyle(card);
  return stickyTop()
    +(parseFloat(cs.getPropertyValue('--yaya-tabs-sticky-height'))||0)
    +(parseFloat(cs.getPropertyValue('--yaya-action-sticky-height'))||0)
    +8;
}

function currentAnchorIndex(card,anchors){
  if(!anchors.length)return -1;
  const top=stickyContentTop(card);
  let idx=0;
  for(let i=0;i<anchors.length;i++){
    if(anchors[i].getBoundingClientRect().top<=top+10)idx=i;
    else break;
  }
  return idx;
}

function jumpPage(dir){
  const card=activeCard||currentCard();
  if(!card||!card.classList.contains('yaya-three-block-long'))return false;

  const anchors=anchorsFor(card);
  if(anchors.length<2)return false;

  const idx=currentAnchorIndex(card,anchors);
  const next=Math.max(0,Math.min(anchors.length-1,idx+(dir>0?1:-1)));
  if(next===idx)return false;

  const target=anchors[next];
  const y=Math.max(0,window.scrollY+target.getBoundingClientRect().top-stickyContentTop(card));
  window.scrollTo(0,Math.round(y));
  return true;
}

function inBlock3(card,target){
  const scope=activeScope(card);
  return !!(scope&&target&&scope.contains(target));
}

function onWheel(e){
  const card=activeCard||currentCard();
  if(!card||!card.classList.contains('yaya-three-block-long'))return;
  if(!inBlock3(card,e.target))return;
  if(wheelLock||Math.abs(e.deltaY)<18)return;

  if(jumpPage(e.deltaY>0?1:-1)){
    e.preventDefault();
    wheelLock=true;
    setTimeout(()=>{wheelLock=false;},140);
  }
}

function onTouchStart(e){
  if(!e.touches||!e.touches.length)return;
  touchStartY=e.touches[0].clientY;
}

function onTouchEnd(e){
  if(!touchStartY)return;
  const endY=e.changedTouches&&e.changedTouches.length?e.changedTouches[0].clientY:touchStartY;
  const delta=touchStartY-endY;
  touchStartY=0;
  if(Math.abs(delta)<60)return;

  const card=activeCard||currentCard();
  if(!card||!card.classList.contains('yaya-three-block-long'))return;
  if(!inBlock3(card,e.target))return;

  jumpPage(delta>0?1:-1);
}

installStyle();
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('hashchange',schedule,{passive:true});
window.addEventListener('yaya:data-refreshed',schedule,{passive:true});
document.addEventListener('click',()=>setTimeout(schedule,40),true);
document.addEventListener('change',()=>setTimeout(schedule,20),true);
window.addEventListener('wheel',onWheel,{passive:false});
window.addEventListener('touchstart',onTouchStart,{passive:true});
window.addEventListener('touchend',onTouchEnd,{passive:true});

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

window.__YAYA_CHANTIER_THREE_BLOCK_VIEWPORT_VERSION='7.0-no-flicker-natural-12';
})();