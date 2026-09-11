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
        display:none!important;
        width:100%!important;
        margin:0 0 6px!important;
        border:1px solid #cbd9e9!important;
        border-radius:10px!important;
        background:#fff!important;
        overflow:hidden!important;
        box-shadow:0 1px 3px rgba(22,45,73,.06)!important;
      }
      .card[data-yaya-detail-section="commandes"] > .${BLOCK_CLASS}{
        display:block!important;
      }
      .${BLOCK_CLASS} .yaya-ab-commandes-head{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:10px!important;
        padding:9px 12px!important;
        border-bottom:1px solid #dbe5ef!important;
        background:#f3f7fc!important;
      }
      .${BLOCK_CLASS} .yaya-ab-commandes-title{
        margin:0!important;
        color:#173b60!important;
        font-size:12px!important;
        font-weight:850!important;
        letter-spacing:.035em!important;
        text-transform:uppercase!important;
      }
      .${BLOCK_CLASS} .yaya-ab-commandes-open{
        color:#174d7d!important;
        font-size:11px!important;
        font-weight:800!important;
        text-decoration:none!important;
        white-space:nowrap!important;
      }
      .${BLOCK_CLASS} .yaya-ab-commandes-wait{
        padding:12px!important;
        color:#708095!important;
        font-size:12px!important;
        font-weight:700!important;
        text-align:center!important;
      }
      .${FRAME_CLASS}{
        display:block!important;
        width:100%!important;
        height:260px!important;
        border:0!important;
        background:#fff!important;
      }
      @media(max-width:640px){
        .${BLOCK_CLASS} .yaya-ab-commandes-head{padding:8px 10px!important}
        .${FRAME_CLASS}{height:320px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function cardId(card){
    if(!card)return '';
    try{
      if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier).trim();
    }catch(e){}
    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]).trim();
    }
    return '';
  }

  function chantierName(id,card){
    try{
      if(typeof S!=='undefined'&&Array.isArray(S.chantiers)){
        const c=S.chantiers.find(x=>String(x.id||'')===String(id||''));
        if(c&&c.nom)return String(c.nom).trim();
      }
    }catch(e){}
    const candidates=[
      ':scope > .top b',
      ':scope > .top strong',
      ':scope > div:first-child b',
      ':scope > div:first-child strong'
    ];
    for(const sel of candidates){
      const el=card&&card.querySelector(sel);
      const txt=String(el&&el.textContent||'').trim();
      if(txt)return txt;
    }
    return '';
  }

  function linkFor(id,name,embed){
    const url=new URL(AB_COMMANDES_URL);
    if(id)url.searchParams.set('chantierId',String(id));
    if(name)url.searchParams.set('chantierName',String(name));
    if(embed)url.searchParams.set('embed','1');
    return url.toString();
  }

  function positionBlock(card,tabs,block){
    const nativeCommandRow=card.querySelector(':scope > .yaya-detail-section-action-row[data-section="commandes"]');
    const nativeCommandPane=card.querySelector(':scope > .yaya-detail-commandes-pane');
    const anchor=nativeCommandRow||nativeCommandPane;
    if(anchor){
      if(block.nextElementSibling!==anchor)card.insertBefore(block,anchor);
    }else if(block.parentElement!==card||tabs.nextElementSibling!==block){
      tabs.insertAdjacentElement('afterend',block);
    }
  }

  function syncVisibility(card,block){
    const active=String(card?.dataset?.yayaDetailSection||'')==='commandes';
    block.style.setProperty('display',active?'block':'none','important');
  }

  function ensure(card){
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;

    let block=card.querySelector(':scope > .'+BLOCK_CLASS);
    if(!block){
      block=document.createElement('div');
      block.className='yaya-detail-section-node '+BLOCK_CLASS;
      block.dataset.section='commandes';
      block.innerHTML=`
        <div class="yaya-ab-commandes-head">
          <strong class="yaya-ab-commandes-title">📦 AB COMMANDES</strong>
          <a class="yaya-ab-commandes-open" target="_blank" rel="noopener">Ouvrir en grand ↗</a>
        </div>
        <div class="yaya-ab-commandes-wait">Chargement du suivi commandes…</div>
        <iframe class="${FRAME_CLASS}" title="Suivi des commandes chantier" loading="lazy" style="display:none!important"></iframe>
      `;
    }else{
      block.classList.add('yaya-detail-section-node');
      block.dataset.section='commandes';
    }

    positionBlock(card,tabs,block);
    syncVisibility(card,block);

    const id=cardId(card);
    const name=chantierName(id,card);
    const a=block.querySelector('.yaya-ab-commandes-open');
    const frame=block.querySelector('.'+FRAME_CLASS);
    const wait=block.querySelector('.yaya-ab-commandes-wait');

    if(!id&&!name){
      if(wait)wait.textContent='Chargement du chantier…';
      return;
    }

    const fullHref=linkFor(id,name,false);
    const embedHref=linkFor(id,name,true);
    if(a)a.href=fullHref;
    block.dataset.chantierId=id||'';

    if(frame&&frame.dataset.src!==embedHref){
      frame.dataset.src=embedHref;
      frame.src=embedHref;
    }
    if(frame)frame.style.setProperty('display','block','important');
    if(wait)wait.style.setProperty('display','none','important');
  }

  function handleMessage(e){
    const d=e&&e.data;
    if(!d||d.type!=='AB_COMMANDES_HEIGHT')return;
    const h=Math.max(120,Math.min(1200,Number(d.height)||260));
    document.querySelectorAll('.'+FRAME_CLASS).forEach(frame=>{
      try{
        if(frame.contentWindow===e.source)frame.style.setProperty('height',h+'px','important');
      }catch(err){}
    });
  }

  let timer=0;
  function scan(){
    clearTimeout(timer);
    timer=setTimeout(()=>{
      document.querySelectorAll('#pane-chantiers .card').forEach(ensure);
    },40);
  }

  installStyle();
  scan();
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-yaya-detail-section']});
  window.addEventListener('message',handleMessage);
  window.addEventListener('hashchange',scan);
  window.addEventListener('focus',scan);

  window.__YAYA_AB_COMMANDES_LINK_VERSION='3.2';
})();
