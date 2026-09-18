(function(){
'use strict';
if(window.__YAYA_CHANTIER_TWO_BLOCK_VIEWPORT_V1)return;
window.__YAYA_CHANTIER_TWO_BLOCK_VIEWPORT_V1=true;

const STYLE_ID='yaya-chantier-two-block-viewport-v1';
let activeCard=null;
let mode=false;
let animating=false;

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* Fiche chantier = bloc 1 (entête + KPI) puis bloc 2 (onglets + contenu).
       Aucun scroll interne : on utilise uniquement le scroll de la page. */
    #pane-chantiers .card.yaya-two-block-fit{
      overflow:visible!important;
    }
    #pane-chantiers .card.yaya-two-block-fit > .yaya-detail-section-tabs{
      scroll-margin-top:10px!important;
    }
  `;
  document.head.appendChild(s);
}

function card(){
  return document.querySelector('#pane-chantiers .card:has(> .yaya-detail-section-tabs)');
}

function headerOffset(){
  const hdr=document.querySelector('.hdr');
  if(!hdr)return 8;
  const cs=getComputedStyle(hdr);
  if(cs.position!=='sticky'&&cs.position!=='fixed')return 8;
  return Math.max(8,Math.ceil(hdr.getBoundingClientRect().height)+8);
}

function pageY(el){const r=el.getBoundingClientRect();return r.top+window.scrollY;}

function evaluate(){
  installStyle();
  const c=card();
  if(activeCard&&activeCard!==c)activeCard.classList.remove('yaya-two-block-fit');
  activeCard=c;
  mode=false;
  if(!c)return;

  const tabs=c.querySelector(':scope > .yaya-detail-section-tabs');
  if(!tabs)return;

  const rect=c.getBoundingClientRect();
  const available=Math.max(320,window.innerHeight-headerOffset()-10);
  const fullHeight=Math.ceil(rect.height);

  // Si tout tient déjà à l'écran, on ne change rien.
  if(fullHeight<=available){
    c.classList.remove('yaya-two-block-fit');
    return;
  }

  // Sinon, un seul scroll doit permettre de remonter le bloc 1
  // et d'aligner immédiatement le bloc 2 en haut de l'écran.
  mode=true;
  c.classList.add('yaya-two-block-fit');
}

function targetY(){
  const c=activeCard||card();if(!c)return null;
  const tabs=c.querySelector(':scope > .yaya-detail-section-tabs');if(!tabs)return null;
  return Math.max(0,Math.round(pageY(tabs)-headerOffset()));
}

function topY(){
  const c=activeCard||card();if(!c)return null;
  return Math.max(0,Math.round(pageY(c)-headerOffset()));
}

function smoothTo(y){
  if(y==null)return;
  animating=true;
  window.scrollTo({top:y,behavior:'smooth'});
  setTimeout(()=>{animating=false;},420);
}

function onWheel(e){
  if(!mode||animating||Math.abs(e.deltaY)<8)return;
  const c=activeCard||card();if(!c)return;
  const start=topY(),target=targetY();if(start==null||target==null)return;
  const y=window.scrollY;

  if(e.deltaY>0 && y<=start+70 && target>y+30){
    e.preventDefault();
    smoothTo(target);
    return;
  }

  // Retour symétrique vers le bloc 1 avec un scroll vers le haut.
  if(e.deltaY<0 && Math.abs(y-target)<=90 && start<y-30){
    e.preventDefault();
    smoothTo(start);
  }
}

let raf=0;
function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;evaluate();});
}

installStyle();
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('hashchange',schedule,{passive:true});
window.addEventListener('yaya:data-refreshed',schedule,{passive:true});
document.addEventListener('click',()=>setTimeout(schedule,40),true);
window.addEventListener('wheel',onWheel,{passive:false});

const pane=document.getElementById('pane-chantiers');
if(pane){
  new MutationObserver(schedule).observe(pane,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-yaya-detail-section']});
}
setTimeout(schedule,0);
setTimeout(schedule,250);
setTimeout(schedule,800);
})();