(function(){
'use strict';
if(window.__YAYA_CHANTIER_THREE_BLOCK_VIEWPORT_V5)return;
window.__YAYA_CHANTIER_THREE_BLOCK_VIEWPORT_V5=true;

const STYLE_ID='yaya-chantier-three-block-viewport-v5';
const PAGE_SIZE=12;
let activeCard=null;
let activeKey='';
let pageIndex=0;
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
    /* 3 blocs chantier.
       Bloc 1 = entête + KPI.
       Bloc 2 = onglets + bandeau/actions.
       Bloc 3 = contenu, affiché par pages de 12 lignes. */
    #pane-chantiers .card.yaya-three-block-fit{overflow:visible!important}

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

    #pane-chantiers .card.yaya-three-block-long .yaya-page-hidden{
      display:none!important;
    }

    #pane-chantiers .card.yaya-three-block-long .yaya-detail-section-node,
    #pane-chantiers .card.yaya-three-block-long .ycn-group-body{
      overflow:visible!important;
      max-height:none!important;
    }

    #pane-chantiers .yaya-block-page-indicator{
      display:none;
      align-items:center;
      justify-content:flex-end;
      min-height:24px;
      padding:2px 4px 4px;
      color:#64748b;
      font-size:10.5px;
      font-weight:700;
      user-select:none;
    }
    #pane-chantiers .card.yaya-three-block-long .yaya-block-page-indicator{
      display:flex;
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

  // IMPORTANT : ne jamais prendre le bandeau d'actions comme bloc 3.
  // Il porte lui aussi data-section, donc querySelector() renvoyait ce bandeau
  // et la pagination comptait 0 ligne. On cible explicitement le vrai pane contenu.
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
    scope.querySelectorAll(sel).forEach(el=>seen.add(el));
  });
  return Array.from(seen).sort((a,b)=>{
    const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
    return ra.top-rb.top||ra.left-rb.left;
  });
}

function ensureIndicator(card,scope){
  if(!card||!scope)return null;
  let el=card.querySelector(':scope > .yaya-block-page-indicator');
  if(!el){
    el=document.createElement('div');
    el.className='yaya-block-page-indicator';
  }
  if(scope.nextElementSibling!==el)scope.insertAdjacentElement('afterend',el);
  return el;
}

function clearPagination(card){
  if(!card)return;
  card.querySelectorAll('.yaya-page-hidden').forEach(el=>el.classList.remove('yaya-page-hidden'));
  const ind=card.querySelector(':scope > .yaya-block-page-indicator');
  if(ind)ind.remove();
}

function applyPage(card){
  if(!card)return;
  const scope=activeScope(card);
  if(!scope){clearPagination(card);return;}

  const rows=rowsFor(card);
  const longList=rows.length>PAGE_SIZE;
  card.classList.toggle('yaya-three-block-long',longList);

  if(!longList){
    rows.forEach(el=>el.classList.remove('yaya-page-hidden'));
    const old=card.querySelector(':scope > .yaya-block-page-indicator');
    if(old)old.remove();
    pageIndex=0;
    return;
  }

  const pageCount=Math.ceil(rows.length/PAGE_SIZE);
  pageIndex=Math.max(0,Math.min(pageIndex,pageCount-1));
  const start=pageIndex*PAGE_SIZE;
  const end=Math.min(rows.length,start+PAGE_SIZE);

  rows.forEach((el,i)=>el.classList.toggle('yaya-page-hidden',i<start||i>=end));

  const ind=ensureIndicator(card,scope);
  if(ind)ind.textContent=(start+1)+'–'+end+' / '+rows.length;
}

function evaluate(){
  installStyle();

  const c=currentCard();
  const key=c?sectionKey(c):'';

  if(activeCard&&activeCard!==c){
    clearPagination(activeCard);
    activeCard.classList.remove('yaya-three-block-fit','yaya-three-block-long');
    activeCard.style.removeProperty('--yaya-detail-sticky-top');
    activeCard.style.removeProperty('--yaya-tabs-sticky-height');
  }

  if(c!==activeCard||key!==activeKey){
    pageIndex=0;
    activeCard=c;
    activeKey=key;
  }

  if(!c)return;
  const tabs=c.querySelector(':scope > .yaya-detail-section-tabs');
  if(!tabs)return;

  const top=stickyTop();
  c.style.setProperty('--yaya-detail-sticky-top',top+'px');
  c.style.setProperty('--yaya-tabs-sticky-height',Math.ceil(tabs.getBoundingClientRect().height||0)+'px');

  applyPage(c);

  const available=Math.max(320,window.innerHeight-top-10);
  const fullHeight=Math.ceil(c.getBoundingClientRect().height);
  c.classList.toggle('yaya-three-block-fit',fullHeight>available||c.classList.contains('yaya-three-block-long'));
}

function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;evaluate();});
}

function changePage(dir){
  const c=activeCard||currentCard();
  if(!c)return false;
  const rows=rowsFor(c);
  const pages=Math.ceil(rows.length/PAGE_SIZE);
  if(pages<=1)return false;

  const next=Math.max(0,Math.min(pages-1,pageIndex+(dir>0?1:-1)));
  if(next===pageIndex)return false;

  pageIndex=next;
  applyPage(c);
  return true;
}

function inBlock3(card,target){
  const scope=activeScope(card);
  return !!(scope&&target&&scope.contains(target));
}

function onWheel(e){
  const c=activeCard||currentCard();
  if(!c||!c.classList.contains('yaya-three-block-long'))return;
  if(!inBlock3(c,e.target))return;
  if(wheelLock||Math.abs(e.deltaY)<16)return;

  if(changePage(e.deltaY>0?1:-1)){
    e.preventDefault();
    wheelLock=true;
    setTimeout(()=>{wheelLock=false;},220);
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
  if(Math.abs(delta)<55)return;

  const c=activeCard||currentCard();
  if(!c||!c.classList.contains('yaya-three-block-long'))return;
  const target=e.target;
  if(!inBlock3(c,target))return;
  changePage(delta>0?1:-1);
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
    attributeFilter:['class','data-yaya-detail-section']
  });
}

setTimeout(schedule,0);
setTimeout(schedule,250);
setTimeout(schedule,800);

window.__YAYA_CHANTIER_THREE_BLOCK_VIEWPORT_VERSION='5.0-visible-pages-12-fixed-scope';
})();