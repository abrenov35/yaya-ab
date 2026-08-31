(function(){
  'use strict';

  const LINK_ID='yayaPlanningToolbarLink';
  const STYLE_ID='yaya-planning-toolbar-link-style';

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .planning-external-tab{
        position:relative!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:7px!important;
        min-width:140px!important;
        height:42px!important;
        padding:0 16px!important;
        border:1px solid #7d91c7!important;
        border-radius:7px!important;
        background:#294796!important;
        color:#fff!important;
        box-shadow:none!important;
        font-size:13px!important;
        font-weight:700!important;
        line-height:1!important;
        white-space:nowrap!important;
        font-family:inherit!important;
        cursor:pointer!important;
        text-decoration:none!important;
      }
      .planning-external-tab:hover{background:#3453a2!important}
      @media(max-width:1050px){
        .planning-external-tab{min-width:auto!important;padding:0 13px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function install(){
    ensureStyle();
    if(document.getElementById(LINK_ID))return;

    const fiche=document.querySelector('.fiche-inter-tab');
    if(!fiche){setTimeout(install,120);return;}

    const link=document.createElement('a');
    link.id=LINK_ID;
    link.className='planning-external-tab';
    link.href='https://abrenov35.github.io/planning-ab/';
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.textContent='Planning';
    link.setAttribute('aria-label','Ouvrir le planning dans un nouvel onglet');

    fiche.insertAdjacentElement('afterend',link);
  }

  install();
})();
