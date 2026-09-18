(function(){
'use strict';
if(window.__YAYA_CHANTIER_TWO_BLOCK_VIEWPORT_V2)return;
window.__YAYA_CHANTIER_TWO_BLOCK_VIEWPORT_V2=true;

const STYLE_ID='yaya-chantier-two-block-viewport-v2';
const LONG_LIMIT=12;
let activeCard=null;
let raf=0;

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* Fiche chantier en 2 blocs.
       Aucun scroll automatique : seul l'utilisateur fait défiler la page. */
    #pane-chantiers .card.yaya-two-block-fit{
      overflow:visible!important;
    }

    /* Dès que la fiche dépasse la hauteur disponible, les onglets du bloc 2
       restent visibles pendant le défilement naturel de la page. */
    #pane-chantiers .card.yaya-two-block-fit > .yaya-detail-section-tabs{
      position:sticky!important;
      top:var(--yaya-detail-sticky-top,8px)!important;
      z-index:16!important;
      background:#fff!important;
      padding-top:5px!important;
      padding-bottom:5px!important;
      margin-bottom:10px!important;
      box-shadow:0 5px 10px rgba(22,45,73,.06)!important;
    }

    /* Plus de 12 lignes = mode liste longue : priorité à la lisibilité.
       On conserve la hauteur naturelle des lignes et le scroll reste celui de la page. */
    #pane-chantiers .card.yaya-two-block-long > .yaya-detail-section-tabs{
      box-shadow:0 6px 12px rgba(22,45,73,.09)!important;
    }

    #pane-chantiers .card.yaya-two-block-long .ycn-group-body,
    #pane-chantiers .card.yaya-two-block-long .yaya-detail-section-node{
      overflow:visible!important;
      max-height:none!important;
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

function visibleLineCount(card){
  if(!card)return 0;

  const activeSection=String(card.dataset.yayaDetailSection||'');
  let scope=card.querySelector(':scope > .yaya-detail-section-node[data-section="'+CSS.escape(activeSection)+'"]');
  if(!scope && activeSection==='commandes'){
    scope=card.querySelector(':scope > .yaya-ab-commandes-direct, :scope > .yaya-detail-commandes-pane');
  }
  if(!scope)scope=card;

  const selectors=[
    '.ycn-row',
    '.yaya-detail-commande-row',
    '.achat-ligne',
    '.charge-ligne',
    '.docligne',
    '.doc-row-standard',
    '.message-ligne',
    '.yaya-photo-row',
    '.yaya-photo-item',
    'tbody > tr'
  ];

  const seen=new Set();
  selectors.forEach(sel=>{
    scope.querySelectorAll(sel).forEach(el=>{
      if(el.offsetParent!==null)seen.add(el);
    });
  });
  return seen.size;
}

function evaluate(){
  installStyle();

  const c=currentCard();
  if(activeCard&&activeCard!==c){
    activeCard.classList.remove('yaya-two-block-fit','yaya-two-block-long');
    activeCard.style.removeProperty('--yaya-detail-sticky-top');
  }
  activeCard=c;
  if(!c)return;

  const tabs=c.querySelector(':scope > .yaya-detail-section-tabs');
  if(!tabs)return;

  const top=stickyTop();
  c.style.setProperty('--yaya-detail-sticky-top',top+'px');

  const available=Math.max(320,window.innerHeight-top-10);
  const fullHeight=Math.ceil(c.getBoundingClientRect().height);
  const lineCount=visibleLineCount(c);

  const needsScroll=fullHeight>available;
  const longList=lineCount>LONG_LIMIT;

  c.classList.toggle('yaya-two-block-fit',needsScroll);
  c.classList.toggle('yaya-two-block-long',longList);
}

function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;evaluate();});
}

installStyle();
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('hashchange',schedule,{passive:true});
window.addEventListener('yaya:data-refreshed',schedule,{passive:true});
document.addEventListener('click',()=>setTimeout(schedule,40),true);
document.addEventListener('change',()=>setTimeout(schedule,20),true);

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

window.__YAYA_CHANTIER_TWO_BLOCK_VIEWPORT_VERSION='2.0-no-auto-scroll-limit-12';
})();