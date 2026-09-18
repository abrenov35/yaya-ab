(function(){
'use strict';
if(window.__YAYA_CHANTIER_THREE_BLOCK_VIEWPORT_V3)return;
window.__YAYA_CHANTIER_THREE_BLOCK_VIEWPORT_V3=true;

const STYLE_ID='yaya-chantier-three-block-viewport-v3';
const PAGE_SIZE=12;
let activeCard=null;
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
    /* Fiche chantier = 3 blocs :
       1. en-tête + KPI
       2. onglets + bandeau/actions de la rubrique
       3. lignes de la rubrique, parcourues par groupes de 12.
       Aucun ascenseur interne. */
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

    #pane-chantiers [data-yaya-page-start="1"]{
      scroll-margin-top:calc(
        var(--yaya-detail-sticky-top,8px)
        + var(--yaya-tabs-sticky-height,48px)
        + var(--yaya-action-sticky-height,48px)
        + 8px
      )!important;
    }
  `;
  document.head.appendChild(s);
}

function currentCard(){
  return document.querySelector('#pane-chantiers .card:has(> .yaya-detail-section-tabs)');
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
  const section=String(card.dataset.yayaDetailSection||'');
  let scope=card.querySelector(':scope > .yaya-detail-section-node[data-section="'+CSS.escape(section)+'"]');
  if(!scope&&section==='commandes'){
    scope=card.querySelector(':scope > .yaya-ab-commandes-direct, :scope > .yaya-detail-commandes-pane');
  }
  return scope||card;
}

function visibleRows(card){
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

function markPages(card){
  const rows=visibleRows(card);
  card.querySelectorAll('[data-yaya-page-start]').forEach(el=>el.removeAttribute('data-yaya-page-start'));
  rows.forEach((row,i)=>{
    if(i%PAGE_SIZE===0)row.dataset.yayaPageStart='1';
  });
  return rows;
}

function evaluate(){
  installStyle();

  const c=currentCard();
  if(activeCard&&activeCard!==c){
    activeCard.classList.remove('yaya-three-block-fit','yaya-three-block-long');
    activeCard.style.removeProperty('--yaya-detail-sticky-top');
    activeCard.style.removeProperty('--yaya-tabs-sticky-height');
    activeCard.style.removeProperty('--yaya-action-sticky-height');
  }
  activeCard=c;
  if(!c)return;

  const tabs=c.querySelector(':scope > .yaya-detail-section-tabs');
  if(!tabs)return;

  const rows=markPages(c);
  const action=c.querySelector(':scope > .yaya-detail-section-action-row[data-section="'+CSS.escape(String(c.dataset.yayaDetailSection||''))+'"]')
    ||c.querySelector(':scope > .yaya-detail-section-action-row');

  const top=stickyTop();
  const tabsH=Math.ceil(tabs.getBoundingClientRect().height||0);
  const actionH=action&&action.offsetParent!==null?Math.ceil(action.getBoundingClientRect().height||0):0;

  c.style.setProperty('--yaya-detail-sticky-top',top+'px');
  c.style.setProperty('--yaya-tabs-sticky-height',tabsH+'px');
  c.style.setProperty('--yaya-action-sticky-height',actionH+'px');

  const available=Math.max(320,window.innerHeight-top-10);
  const fullHeight=Math.ceil(c.getBoundingClientRect().height);
  const needsScroll=fullHeight>available;
  const longList=rows.length>PAGE_SIZE;

  c.classList.toggle('yaya-three-block-fit',needsScroll);
  c.classList.toggle('yaya-three-block-long',longList);
}

function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;evaluate();});
}

function pageStarts(){
  const c=activeCard||currentCard();
  if(!c||!c.classList.contains('yaya-three-block-long'))return [];
  return visibleRows(c).filter((_,i)=>i%PAGE_SIZE===0);
}

function currentPageIndex(starts){
  if(!starts.length)return -1;
  const top=stickyTop()
    +(activeCard?Number.parseFloat(getComputedStyle(activeCard).getPropertyValue('--yaya-tabs-sticky-height'))||0:0)
    +(activeCard?Number.parseFloat(getComputedStyle(activeCard).getPropertyValue('--yaya-action-sticky-height'))||0:0)
    +10;
  let idx=0;
  for(let i=0;i<starts.length;i++){
    if(starts[i].getBoundingClientRect().top<=top+25)idx=i;
    else break;
  }
  return idx;
}

function goPage(direction){
  if(wheelLock)return false;
  const starts=pageStarts();
  if(starts.length<2)return false;

  const idx=currentPageIndex(starts);
  const next=Math.max(0,Math.min(starts.length-1,idx+(direction>0?1:-1)));
  if(next===idx)return false;

  wheelLock=true;
  starts[next].scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>{wheelLock=false;},420);
  return true;
}

function onWheel(e){
  if(Math.abs(e.deltaY)<18)return;
  const c=activeCard||currentCard();
  if(!c||!c.classList.contains('yaya-three-block-long'))return;

  const scope=activeScope(c);
  if(!scope)return;
  const r=scope.getBoundingClientRect();
  const y=e.clientY;
  if(y<r.top-20||y>r.bottom+20)return;

  if(goPage(e.deltaY>0?1:-1))e.preventDefault();
}

function onTouchStart(e){
  if(!e.touches||!e.touches.length)return;
  touchStartY=e.touches[0].clientY;
}

function onTouchEnd(e){
  if(!touchStartY)return;
  const y=e.changedTouches&&e.changedTouches.length?e.changedTouches[0].clientY:touchStartY;
  const delta=touchStartY-y;
  touchStartY=0;
  if(Math.abs(delta)<70)return;

  const c=activeCard||currentCard();
  if(!c||!c.classList.contains('yaya-three-block-long'))return;
  goPage(delta>0?1:-1);
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
    attributeFilter:['class','data-yaya-detail-section','style']
  });
}

setTimeout(schedule,0);
setTimeout(schedule,250);
setTimeout(schedule,800);

window.__YAYA_CHANTIER_THREE_BLOCK_VIEWPORT_VERSION='3.0-pages-12';
})();