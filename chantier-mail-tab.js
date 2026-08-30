(function(){
  'use strict';
  const STYLE_ID='yaya-chantier-mail-tab-style';
  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-section-tabs .yaya-mail-section-btn{
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
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        font-size:12px!important;
        font-weight:700!important;
        line-height:1.15!important;
        white-space:nowrap!important;
        cursor:pointer!important;
      }
      @media(max-width:640px){
        #pane-chantiers .yaya-detail-section-tabs .yaya-mail-section-btn{
          flex:0 0 auto!important;
          min-width:112px!important;
          padding:7px 9px!important;
          font-size:11px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  function addButtons(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-section-tabs').forEach(tabs=>{
      if(tabs.querySelector('.yaya-mail-section-btn'))return;
      const docs=tabs.querySelector('.yaya-detail-section-tab[data-section="documents"]');
      if(!docs)return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='yaya-mail-section-btn';
      btn.textContent='Mail';
      docs.insertAdjacentElement('afterend',btn);
    });
  }
  function run(){installStyle();addButtons();}
  run();setTimeout(run,100);setTimeout(run,500);
  window.addEventListener('yaya:data-refreshed',run);
  document.addEventListener('click',function(){setTimeout(addButtons,0);},true);
})();
