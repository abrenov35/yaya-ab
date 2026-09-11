(function(){
  'use strict';

  const STYLE_ID='yaya-ab-commandes-link-style';
  const BLOCK_CLASS='yaya-ab-commandes-link';
  const AB_COMMANDES_URL='https://abrenov35.github.io/ab-commandes/';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .${BLOCK_CLASS}{
        display:none!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:14px!important;
        width:100%!important;
        margin:0 0 10px!important;
        padding:12px 14px!important;
        border:1px solid #b9cde6!important;
        border-radius:9px!important;
        background:#f3f7fc!important;
        box-shadow:0 1px 3px rgba(22,45,73,.06)!important;
      }
      .card[data-yaya-detail-section="commandes"] > .${BLOCK_CLASS}{display:flex!important}
      .${BLOCK_CLASS} .yaya-ab-commandes-copy{min-width:0!important}
      .${BLOCK_CLASS} .yaya-ab-commandes-title{
        display:block!important;
        margin:0!important;
        color:#173b60!important;
        font-size:12px!important;
        font-weight:850!important;
        letter-spacing:.035em!important;
        text-transform:uppercase!important;
      }
      .${BLOCK_CLASS} .yaya-ab-commandes-sub{
        display:block!important;
        margin-top:3px!important;
        color:#6c788b!important;
        font-size:11.5px!important;
        font-weight:600!important;
      }
      .${BLOCK_CLASS} .yaya-ab-commandes-open{
        flex:0 0 auto!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:34px!important;
        padding:0 12px!important;
        border:1px solid #759dcc!important;
        border-radius:7px!important;
        background:#fff!important;
        color:#174d7d!important;
        font-size:11.5px!important;
        font-weight:800!important;
        text-decoration:none!important;
        white-space:nowrap!important;
        cursor:pointer!important;
      }
      .${BLOCK_CLASS} .yaya-ab-commandes-open:hover{background:#eaf3fc!important}
      @media(max-width:640px){
        .${BLOCK_CLASS}{align-items:flex-start!important;flex-direction:column!important;padding:11px!important}
        .${BLOCK_CLASS} .yaya-ab-commandes-open{width:100%!important}
      }
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

  function linkFor(id){
    const url=new URL(AB_COMMANDES_URL);
    url.searchParams.set('chantierId',String(id||''));
    return url.toString();
  }

  function ensure(card){
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;
    const id=cardId(card);
    if(!id)return;

    let block=card.querySelector(':scope > .'+BLOCK_CLASS);
    if(!block){
      block=document.createElement('div');
      block.className=BLOCK_CLASS;
      block.innerHTML=`
        <div class="yaya-ab-commandes-copy">
          <strong class="yaya-ab-commandes-title">📦 Suivi des commandes chantier</strong>
          <span class="yaya-ab-commandes-sub">Produits à commander, commandés ou reçus</span>
        </div>
        <a class="yaya-ab-commandes-open" target="_blank" rel="noopener">Ouvrir le suivi ↗</a>
      `;
    }

    const href=linkFor(id);
    const a=block.querySelector('.yaya-ab-commandes-open');
    if(a&&a.href!==href)a.href=href;
    block.dataset.chantierId=id;

    if(tabs.nextElementSibling!==block)tabs.insertAdjacentElement('afterend',block);
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
  window.addEventListener('hashchange',scan);
  window.addEventListener('focus',scan);

  window.__YAYA_AB_COMMANDES_LINK_VERSION='1.0';
})();
