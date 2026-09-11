(function(){
  'use strict';

  const STYLE_ID='yaya-ab-commandes-link-style';
  const BLOCK_CLASS='yaya-ab-commandes-link';
  const FRAME_CLASS='yaya-ab-commandes-frame';
  const AB_COMMANDES_URL='https://abrenov35.github.io/ab-commandes/';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .${BLOCK_CLASS}{
        display:none!important;width:100%!important;margin:0!important;padding:0!important;
        border:0!important;border-radius:0!important;background:transparent!important;
        overflow:visible!important;box-shadow:none!important;
      }
      .card[data-yaya-detail-section="commandes"] > .${BLOCK_CLASS}{display:block!important}
      #pane-chantiers .card > .yaya-detail-commandes-pane,
      #pane-chantiers .card > .yaya-detail-section-action-row[data-section="commandes"],
      #pane-chantiers .card > .yaya-detail-empty-pane[data-section="commandes"]{display:none!important}
      .${BLOCK_CLASS} .yaya-ab-commandes-wait{padding:8px 0!important;color:#708095!important;font-size:12px!important;font-weight:700!important;text-align:left!important;background:transparent!important;border:0!important}
      .${FRAME_CLASS}{display:block!important;width:100%!important;height:260px!important;min-height:0!important;border:0!important;border-radius:0!important;background:#fff!important;overflow:hidden!important}
    `;
    document.head.appendChild(style);
  }

  function cardId(card){
    if(!card)return '';
    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]).trim();
    }
    try{
      if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier).trim();
    }catch(e){}
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
      const el=card&&card.querySelector(sel);
      const txt=String(el&&el.textContent||'').trim();
      if(txt)return txt;
    }
    return '';
  }

  function linkFor(id,name){
    const url=new URL(AB_COMMANDES_URL);
    if(id)url.searchParams.set('chantierId',String(id));
    if(name)url.searchParams.set('chantierName',String(name));
    url.searchParams.set('embed','1');
    return url.toString();
  }

  function positionBlock(card,tabs,block){
    const anchor=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="commandes"]')||card.querySelector(':scope > .yaya-detail-commandes-pane');
    if(anchor){if(block.nextElementSibling!==anchor)card.insertBefore(block,anchor)}
    else if(block.parentElement!==card||tabs.nextElementSibling!==block)tabs.insertAdjacentElement('afterend',block);
  }

  function stopAnyIframe(block){
    if(!block)return;
    block.querySelectorAll('iframe').forEach(frame=>{
      try{frame.src='about:blank'}catch(e){}
      frame.remove();
    });
  }

  function isLegacyBlock(block){
    if(!block)return false;
    const link=[...block.querySelectorAll('a')].find(a=>/ouvrir en grand/i.test(String(a.textContent||'')));
    const oldFrame=block.querySelector('iframe:not(.'+FRAME_CLASS+')');
    const oldTitle=[...block.querySelectorAll('strong')].find(el=>/ab commandes/i.test(String(el.textContent||'')));
    return !!(link||oldFrame||oldTitle);
  }

  function normalizeBlocks(card){
    const blocks=[...card.querySelectorAll(':scope > .'+BLOCK_CLASS)];
    if(!blocks.length)return null;

    let keep=blocks.find(b=>b.querySelector('.'+FRAME_CLASS))||blocks[0];
    blocks.forEach(b=>{
      if(b===keep)return;
      stopAnyIframe(b);
      b.remove();
    });

    if(isLegacyBlock(keep)){
      stopAnyIframe(keep);
      keep.innerHTML='';
      keep.removeAttribute('style');
    }
    keep.className='yaya-detail-section-node '+BLOCK_CLASS;
    keep.dataset.section='commandes';
    return keep;
  }

  function ensureBlock(card,tabs){
    let block=normalizeBlocks(card);
    if(!block){
      block=document.createElement('div');
      block.className='yaya-detail-section-node '+BLOCK_CLASS;
      block.dataset.section='commandes';
    }
    positionBlock(card,tabs,block);
    return block;
  }

  function stopFrame(block){
    const frame=block&&block.querySelector('.'+FRAME_CLASS);
    if(frame){
      try{frame.src='about:blank'}catch(e){}
      frame.remove();
    }
    const wait=block&&block.querySelector('.yaya-ab-commandes-wait');
    if(wait)wait.remove();
  }

  function startFrame(block,id,name){
    const href=linkFor(id,name);
    let frame=block.querySelector('.'+FRAME_CLASS);
    if(frame&&frame.dataset.src===href)return;
    stopFrame(block);
    const wait=document.createElement('div');
    wait.className='yaya-ab-commandes-wait';
    wait.textContent='Chargement des dernières commandes…';
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

  function ensure(card){
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;
    const block=ensureBlock(card,tabs);
    const active=String(card.dataset.yayaDetailSection||'')==='commandes';
    block.style.setProperty('display',active?'block':'none','important');

    /* Aucun iframe / aucune synchro tant que l'onglet Commande n'est pas ouvert. */
    if(!active){stopFrame(block);return}

    const id=cardId(card);
    const name=chantierName(id,card);
    if(!id&&!name){
      stopFrame(block);
      const wait=document.createElement('div');
      wait.className='yaya-ab-commandes-wait';
      wait.textContent='Chargement du chantier…';
      block.appendChild(wait);
      return;
    }
    block.dataset.chantierId=id||'';
    startFrame(block,id,name);
  }

  function handleMessage(e){
    const d=e&&e.data;
    if(!d||d.type!=='AB_COMMANDES_HEIGHT')return;
    const h=Math.max(120,Math.ceil(Number(d.height)||260)+2);
    document.querySelectorAll('.'+FRAME_CLASS).forEach(frame=>{
      try{if(frame.contentWindow===e.source){frame.style.setProperty('height',h+'px','important');frame.setAttribute('scrolling','no')}}catch(err){}
    });
  }

  let timer=0;
  function scan(){
    clearTimeout(timer);
    timer=setTimeout(()=>document.querySelectorAll('#pane-chantiers .card').forEach(ensure),40);
  }

  installStyle();
  scan();
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-yaya-detail-section']});
  window.addEventListener('message',handleMessage);
  window.addEventListener('hashchange',scan);
  window.addEventListener('focus',scan);

  window.__YAYA_AB_COMMANDES_LINK_VERSION='4.3';
})();
