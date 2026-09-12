(function(){
  'use strict';

  const STYLE_ID='yaya-ab-commandes-link-style';
  const BLOCK_CLASS='yaya-ab-commandes-link';
  const FRAME_CLASS='yaya-ab-commandes-frame';
  const OWNER='ab-commandes-v51';
  const AB_COMMANDES_URL='https://abrenov35.github.io/ab-commandes/';

  let activeCard=null;
  let scanTimer=0;
  let requestedOpen=false;
  let originalRender=null;
  let deferredRenderArgs=null;
  let renderGuardInstalled=false;

  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style)}
    style.textContent=`
      .${BLOCK_CLASS}{
        display:none!important;width:100%!important;margin:0!important;padding:0!important;
        border:0!important;border-radius:0!important;background:transparent!important;
        overflow:visible!important;box-shadow:none!important;min-height:0!important;
      }
      #pane-chantiers .card[data-yaya-detail-section="commandes"] > .${BLOCK_CLASS}{display:block!important}
      #pane-chantiers .card > .yaya-detail-commandes-pane,
      #pane-chantiers .card > .yaya-detail-section-action-row[data-section="commandes"],
      #pane-chantiers .card > .yaya-detail-empty-pane[data-section="commandes"]{display:none!important}
      .${BLOCK_CLASS} .yaya-ab-commandes-wait{padding:8px 0!important;color:#708095!important;font-size:12px!important;font-weight:700!important;background:transparent!important;border:0!important}
      .${FRAME_CLASS}{display:block!important;width:100%!important;height:260px!important;min-height:0!important;border:0!important;border-radius:0!important;background:#fff!important;overflow:hidden!important}
    `;
  }

  function commandesActive(card){
    if(!card||!card.isConnected)return false;
    if(String(card.dataset.yayaDetailSection||'')==='commandes')return true;
    const tab=card.querySelector(':scope > .yaya-detail-section-tabs [data-section="commandes"]');
    return !!(tab&&(tab.classList.contains('on')||tab.classList.contains('active')||tab.getAttribute('aria-selected')==='true'));
  }

  function protectedCommandesOpen(){
    const frame=document.querySelector('#pane-chantiers .'+FRAME_CLASS);
    if(!frame||!frame.isConnected)return false;
    const card=frame.closest('.card');
    return !!(requestedOpen&&card&&commandesActive(card));
  }

  function installRenderGuard(){
    if(typeof window.render!=='function'){
      setTimeout(installRenderGuard,120);
      return;
    }
    if(window.render.__yayaCommandesStableGuardV51){
      renderGuardInstalled=true;
      return;
    }

    originalRender=window.render;

    function guardedRender(){
      if(protectedCommandesOpen()){
        deferredRenderArgs=[...arguments];
        window.__YAYA_COMMANDES_RENDER_DEFERRED=true;
        return;
      }
      return originalRender.apply(this,arguments);
    }

    guardedRender.__yayaCommandesStableGuardV51=true;
    guardedRender.__yayaWrappedRender=originalRender;
    window.render=guardedRender;
    renderGuardInstalled=true;
  }

  function flushDeferredRender(){
    if(!deferredRenderArgs||typeof originalRender!=='function')return;
    const args=deferredRenderArgs;
    deferredRenderArgs=null;
    window.__YAYA_COMMANDES_RENDER_DEFERRED=false;
    try{originalRender.apply(window,args)}catch(e){console.warn('Rendu Yaya différé ignoré',e)}
  }

  function cardId(card){
    if(!card)return '';
    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]).trim();
    }
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier).trim()}catch(e){}
    return '';
  }

  function chantierName(id,card){
    try{
      if(typeof S!=='undefined'&&Array.isArray(S.chantiers)){
        const c=S.chantiers.find(x=>String(x.id||'')===String(id||''));
        if(c&&c.nom)return String(c.nom).trim();
      }
    }catch(e){}
    for(const sel of [':scope > .top b',':scope > .top strong',':scope > div:first-child b',':scope > div:first-child strong']){
      const el=card&&card.querySelector(sel),txt=String(el&&el.textContent||'').trim();
      if(txt)return txt;
    }
    return '';
  }

  function linkFor(id,name){
    const url=new URL(AB_COMMANDES_URL);
    if(id)url.searchParams.set('chantierId',String(id));
    if(name)url.searchParams.set('chantierName',String(name));
    url.searchParams.set('embed','1');
    url.searchParams.set('ui','drive-upload-v3');
    url.searchParams.set('_v','stable-16');
    return url.toString();
  }

  function stopIframe(frame){
    if(!frame)return;
    try{frame.src='about:blank'}catch(e){}
    frame.remove();
  }

  function destroyBlock(block){
    if(!block)return;
    block.querySelectorAll('iframe').forEach(stopIframe);
    block.remove();
  }

  function cleanupOtherBlocks(keepCard){
    document.querySelectorAll('#pane-chantiers .'+BLOCK_CLASS).forEach(block=>{
      if(keepCard&&block.parentElement===keepCard)return;
      destroyBlock(block);
    });
  }

  function ensureBlock(card){
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return null;
    const blocks=[...card.querySelectorAll(':scope > .'+BLOCK_CLASS)];
    let block=blocks[0]||null;
    blocks.slice(1).forEach(destroyBlock);
    if(!block){
      block=document.createElement('div');
      block.className='yaya-detail-section-node '+BLOCK_CLASS;
      block.dataset.section='commandes';
      block.dataset.abCommandesOwner=OWNER;
      tabs.insertAdjacentElement('afterend',block);
    }else{
      if(block.className!=='yaya-detail-section-node '+BLOCK_CLASS)block.className='yaya-detail-section-node '+BLOCK_CLASS;
      if(block.dataset.section!=='commandes')block.dataset.section='commandes';
      block.dataset.abCommandesOwner=OWNER;
      if(tabs.nextElementSibling!==block)tabs.insertAdjacentElement('afterend',block);
    }
    return block;
  }

  function startFrame(block,id,name){
    const href=linkFor(id,name);
    let frame=block.querySelector('.'+FRAME_CLASS);
    if(frame&&frame.dataset.src===href)return;

    block.querySelectorAll('iframe').forEach(stopIframe);
    block.querySelectorAll('.yaya-ab-commandes-wait').forEach(x=>x.remove());

    const wait=document.createElement('div');
    wait.className='yaya-ab-commandes-wait';
    wait.textContent='Chargement des commandes…';

    frame=document.createElement('iframe');
    frame.className=FRAME_CLASS;
    frame.title='Suivi des commandes chantier';
    frame.loading='eager';
    frame.scrolling='no';
    frame.dataset.src=href;
    frame.style.setProperty('overflow','hidden','important');
    block.append(wait,frame);
    frame.addEventListener('load',()=>{if(wait.isConnected)wait.remove()},{once:true});
    frame.src=href;
  }

  function deactivate(card){
    if(card){card.querySelectorAll(':scope > .'+BLOCK_CLASS).forEach(destroyBlock)}
    if(activeCard===card)activeCard=null;
  }

  function activate(card){
    if(!requestedOpen||!card||!card.isConnected||!commandesActive(card))return;
    if(activeCard&&activeCard!==card)deactivate(activeCard);
    cleanupOtherBlocks(card);
    activeCard=card;

    const block=ensureBlock(card);
    if(!block)return;
    const id=cardId(card),name=chantierName(id,card);
    if(!id&&!name){
      if(!block.querySelector('.yaya-ab-commandes-wait')){
        const wait=document.createElement('div');
        wait.className='yaya-ab-commandes-wait';
        wait.textContent='Chargement du chantier…';
        block.appendChild(wait);
      }
      return;
    }
    block.dataset.chantierId=id||'';
    startFrame(block,id,name);
  }

  function findActiveCard(){
    const byData=document.querySelector('#pane-chantiers .card[data-yaya-detail-section="commandes"]');
    if(byData)return byData;
    const btn=document.querySelector('#pane-chantiers .yaya-detail-section-tab[data-section="commandes"].on,#pane-chantiers .yaya-detail-section-tab[data-section="commandes"][aria-selected="true"]');
    return btn?btn.closest('.card'):null;
  }

  function scanActive(){
    if(!requestedOpen)return;
    clearTimeout(scanTimer);
    scanTimer=setTimeout(()=>{
      const card=findActiveCard();
      if(card)activate(card);
    },35);
  }

  function handleMessage(e){
    const d=e&&e.data;
    if(!d||d.type!=='AB_COMMANDES_HEIGHT')return;
    const h=Math.max(120,Math.ceil(Number(d.height)||260)+2);
    document.querySelectorAll('.'+FRAME_CLASS).forEach(frame=>{
      try{
        if(frame.contentWindow===e.source){
          frame.style.setProperty('height',h+'px','important');
          frame.setAttribute('scrolling','no');
        }
      }catch(err){}
    });
  }

  installStyle();
  cleanupOtherBlocks(null);
  installRenderGuard();
  setTimeout(installRenderGuard,600);
  setTimeout(installRenderGuard,1800);

  // L'iframe Commande n'est créée qu'après un clic explicite sur l'onglet Commande.
  // Tant qu'elle est ouverte, les render() Yaya sont différés : pas de remplacement
  // de la fiche, donc pas de clignotement ni de fermeture de modale dans l'iframe.
  document.addEventListener('click',e=>{
    const btn=e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab[data-section]');
    if(!btn)return;
    const card=btn.closest('.card');
    const key=String(btn.dataset.section||'');

    if(key==='commandes'){
      requestedOpen=true;
      setTimeout(scanActive,0);
      setTimeout(scanActive,90);
      return;
    }

    requestedOpen=false;
    setTimeout(()=>{
      deactivate(card||activeCard);
      flushDeferredRender();
    },0);
  });

  const pane=document.getElementById('pane-chantiers');
  if(pane){
    new MutationObserver(records=>{
      if(!requestedOpen)return;
      for(const rec of records){
        const target=rec.target&&rec.target.nodeType===1?rec.target:null;
        if(target&&target.closest&&target.closest('.'+BLOCK_CLASS))continue;
        const relevant=[...rec.addedNodes].some(n=>n&&n.nodeType===1&&(n.matches?.('.card,.yaya-detail-section-tabs')||n.querySelector?.('.yaya-detail-section-tabs')));
        if(relevant){scanActive();break;}
      }
    }).observe(pane,{childList:true,subtree:true});
  }

  window.addEventListener('message',handleMessage);

  window.__YAYA_AB_COMMANDES_LINK_VERSION='5.1-stable-work-session';
})();
