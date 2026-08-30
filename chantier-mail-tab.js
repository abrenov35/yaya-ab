(function(){
  'use strict';
  const STYLE_ID='yaya-chantier-mail-tab-style';

  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
    style.textContent=`
      #pane-chantiers .card .yaya-detail-section-tabs .yaya-detail-section-tab[data-section="mail"]{
        flex:1 1 0!important;
        min-width:0!important;
        min-height:42px!important;
        height:auto!important;
        padding:7px 12px!important;
        margin:0!important;
        border:1px solid #c7a58b!important;
        border-radius:8px!important;
        background:#f3e4d8!important;
        color:#7a5138!important;
        box-shadow:none!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:8px!important;
        font-size:12px!important;
        font-weight:700!important;
        line-height:1.15!important;
        white-space:nowrap!important;
        cursor:pointer!important;
      }
      #pane-chantiers .card .yaya-detail-section-tabs .yaya-detail-section-tab[data-section="mail"].on{
        background:#ead3c1!important;
        border-color:#a97855!important;
        color:#6c432b!important;
        box-shadow:inset 0 0 0 1px #a97855!important;
      }

      #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-section-node[data-section="mail"]{
        display:none!important;
      }
      #pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-section-node:not([data-section="mail"]),
      #pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-empty-pane,
      #pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-charges-pane{
        display:none!important;
      }
      #pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-section-node[data-section="mail"]{
        display:grid!important;
      }

      @media(max-width:640px){
        #pane-chantiers .card .yaya-detail-section-tabs .yaya-detail-section-tab[data-section="mail"]{
          flex:0 0 auto!important;
          min-width:112px!important;
          padding:7px 9px!important;
          font-size:11px!important;
        }
      }
    `;
  }

  function isMailRow(row){
    const badge=row.querySelector('.badge');
    const type=String(badge&&badge.textContent||'').trim().toUpperCase();
    return type==='MAIL'||row.classList.contains('message-ligne')||!!row.querySelector('.b-mail');
  }

  function classifyMailRows(card){
    card.querySelectorAll(':scope > .yaya-detail-section-node[data-section="documents"]').forEach(row=>{
      if(isMailRow(row))row.dataset.section='mail';
    });
  }

  function activateMail(card,btn){
    classifyMailRows(card);
    card.dataset.yayaDetailSection='mail';
    card.querySelectorAll(':scope > .yaya-detail-section-tabs .yaya-detail-section-tab').forEach(tab=>{
      const on=tab.dataset.section==='mail';
      tab.classList.toggle('on',on);
      tab.setAttribute('aria-selected',on?'true':'false');
    });
    btn.classList.add('on');
    btn.setAttribute('aria-selected','true');
  }

  function prepareCard(card){
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;
    classifyMailRows(card);

    const docs=tabs.querySelector('.yaya-detail-section-tab[data-section="documents"]');
    if(!docs)return;

    let btn=tabs.querySelector('.yaya-mail-section-btn');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='yaya-mail-section-btn';
      btn.textContent='Mail';
      docs.insertAdjacentElement('afterend',btn);
    }

    btn.classList.add('yaya-detail-section-tab');
    btn.dataset.section='mail';
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-selected',card.dataset.yayaDetailSection==='mail'?'true':'false');

    if(btn.dataset.yayaMailBound!=='1'){
      btn.dataset.yayaMailBound='1';
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        activateMail(card,btn);
      });
    }
  }

  function run(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .card').forEach(prepareCard);
  }

  run();
  setTimeout(run,100);
  setTimeout(run,500);
  setTimeout(run,1200);
  window.addEventListener('yaya:data-refreshed',run);
  document.addEventListener('click',function(){setTimeout(run,0);},true);
})();
