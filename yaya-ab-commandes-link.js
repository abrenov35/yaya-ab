(function(){
  'use strict';

  const STYLE_ID='yaya-ab-commandes-link-style';
  const BLOCK_CLASS='yaya-ab-commandes-link';
  const FRAME_CLASS='yaya-ab-commandes-frame';
  const OWNER='ab-commandes-v47';
  const AB_COMMANDES_URL='https://abrenov35.github.io/ab-commandes/';
  const cleanupTimers=new WeakMap();

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
      .${BLOCK_CLASS} > div:not(.yaya-ab-commandes-wait){display:none!important}
      .${BLOCK_CLASS} > iframe:not(.${FRAME_CLASS}){display:none!important;height:0!important;min-height:0!important}
      .${BLOCK_CLASS} .yaya-ab-commandes-wait{padding:8px 0!important;color:#708095!important;font-size:12px!important;font-weight:700!important;text-align:left!important;background:transparent!important;border:0!important}
      .${FRAME_CLASS}{display:block!important;width:100%!important;height:260px!important;min-height:0!important;border:0!important;border-radius:0!important;background:#fff!important;overflow:hidden!important}
    `;
  }

  function commandesActive(card){
    if(!card)return false;
    if(String(card.dataset.yayaDetailSection||'')==='commandes')return true;
    const tab=card.querySelector(':scope > .yaya-detail-section-tabs [data-section="commandes"]');
    if(!tab)return false;
    return tab.classList.contains('on')||tab.classList.contains('active')||tab.getAttribute('aria-selected')==='true';
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
    return url.toString();
  }

  function stopIframe(frame){
    if(!frame)return;
    try{frame.src='about:blank'}catch(e){}
    frame.remove();
  }

  function clearBlockRuntime(block){
    if(!block)return;
    block.querySelectorAll('iframe').forEach(stopIframe);
    block.querySelectorAll('.yaya-ab-commandes-wait').forEach(x=>x.remove());
    block.style.removeProperty('height');
    block.style.removeProperty('min-height');
  }

  function cancelCleanup(block){
    const t=cleanupTimers.get(block);
    if(t){clearTimeout(t);cleanupTimers.delete(block)}
  }

  function scheduleCleanup(block){
    if(!block||cleanupTimers.has(block))return;
    const t=setTimeout(()=>{
      cleanupTimers.delete(block);
      const card=block.closest('.card');
      if(card&&commandesActive(card))return;
      clearBlockRuntime(block);
    },500);
    cleanupTimers.set(block,t);
  }

  function stopOtherActiveFrames(keepBlock){
    document.querySelectorAll('#pane-chantiers .'+BLOCK_CLASS).forEach(block=>{
      if(block===keepBlock)return;
      cancelCleanup(block);
      clearBlockRuntime(block);
    });
  }

  function purgeCard(card){
    const blocks=[...card.querySelectorAll(':scope > .'+BLOCK_CLASS)];
    if(!blocks.length)return null;
    const keep=blocks.find(b=>b.dataset.abCommandesOwner===OWNER)||blocks[0];
    blocks.forEach(b=>{
      if(b===keep)return;
      cancelCleanup(b);
      clearBlockRuntime(b);
      b.remove();
    });

    if(keep.dataset.abCommandesOwner!==OWNER){
      cancelCleanup(keep);
      clearBlockRuntime(keep);
      keep.replaceChildren();
      keep.removeAttribute('style');
      keep.dataset.abCommandesOwner=OWNER;
    }else{
      keep.querySelectorAll('iframe:not(.'+FRAME_CLASS+')').forEach(stopIframe);
      [...keep.children].forEach(el=>{
        if(el.classList.contains(FRAME_CLASS)||el.classList.contains('yaya-ab-commandes-wait'))return;
        el.remove();
      });
    }
    keep.className='yaya-detail-section-node '+BLOCK_CLASS;
    keep.dataset.section='commandes';
    return keep;
  }

  function positionBlock(card,tabs,block){
    const anchor=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="commandes"]')||card.querySelector(':scope > .yaya-detail-commandes-pane');
    if(anchor){if(block.nextElementSibling!==anchor)card.insertBefore(block,anchor)}
    else if(block.parentElement!==card||tabs.nextElementSibling!==block)tabs.insertAdjacentElement('afterend',block);
  }

  function ensureBlock(card,tabs){
    let block=purgeCard(card);
    if(!block){
      block=document.createElement('div');
      block.className='yaya-detail-section-node '+BLOCK_CLASS;
      block.dataset.section='commandes';
      block.dataset.abCommandesOwner=OWNER;
    }
    positionBlock(card,tabs,block);
    return block;
  }

  function startFrame(block,id,name){
    const href=linkFor(id,name);
    let frame=block.querySelector('.'+FRAME_CLASS);
    if(frame&&frame.dataset.src===href)return;

    clearBlockRuntime(block);
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
    const active=commandesActive(card);

    if(!active){
      scheduleCleanup(block);
      return;
    }

    cancelCleanup(block);
    stopOtherActiveFrames(block);

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

  let timer=0;
  function scan(){clearTimeout(timer);timer=setTimeout(()=>document.querySelectorAll('#pane-chantiers .card').forEach(ensure),45)}

  installStyle();
  scan();
  const pane=document.getElementById('pane-chantiers')||document.documentElement;
  new MutationObserver(scan).observe(pane,{childList:true,subtree:true,attributes:true,attributeFilter:['data-yaya-detail-section','class','aria-selected']});

  document.addEventListener('click',e=>{
    const btn=e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab[data-section="commandes"]');
    if(!btn)return;
    const card=btn.closest('.card');
    setTimeout(()=>{if(card)ensure(card)},0);
    setTimeout(()=>{if(card)ensure(card)},80);
  });

  window.addEventListener('message',handleMessage);
  window.addEventListener('hashchange',scan);
  window.addEventListener('focus',scan);

  window.__YAYA_AB_COMMANDES_LINK_VERSION='4.7';
})();
