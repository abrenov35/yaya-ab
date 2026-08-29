(function(){
  'use strict';
  const STYLE_ID='yaya-mail-chantier-section-fix-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* Les mails Yaya Mail 2 ne doivent être visibles que dans Documents. */
      #pane-chantiers .card[data-yaya-detail-section="marche"] .message-ligne,
      #pane-chantiers .card[data-yaya-detail-section="depenses"] .message-ligne,
      #pane-chantiers .card[data-yaya-detail-section="charges"] .message-ligne{display:none!important}

      #pane-chantiers .card[data-yaya-detail-section="documents"] .message-ligne{
        display:grid!important;
        grid-template-columns:100px minmax(0,1fr) 90px 112px!important;
        align-items:center!important;
        gap:10px!important;
        height:46px!important;
        min-height:46px!important;
        max-height:46px!important;
        padding:5px 0!important;
        overflow:hidden!important;
      }

      #pane-chantiers .message-ligne .message-actions{
        display:grid!important;
        grid-template-columns:28px 28px 28px!important;
        column-gap:6px!important;
        align-items:center!important;
        justify-content:end!important;
        min-width:96px!important;
        width:96px!important;
        overflow:visible!important;
      }

      /* 1er bouton = VOIR, même si d'autres patches ont modifié son onclick. */
      #pane-chantiers .message-ligne .message-actions .message-view-btn{
        grid-column:1!important;
        width:28px!important;
        min-width:28px!important;
        height:28px!important;
        padding:0!important;
        margin:0!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid #a9c8e8!important;
        border-radius:7px!important;
        background:#f3f8fd!important;
        color:#174d7d!important;
        font-size:0!important;
      }
      #pane-chantiers .message-ligne .message-actions .message-view-btn::before{content:"👁"!important;font-size:15px!important;line-height:1!important}

      #pane-chantiers .message-ligne .message-actions button:nth-child(2){grid-column:2!important}
      #pane-chantiers .message-ligne .message-actions button:nth-child(2)::before{content:"✏️"!important}
      #pane-chantiers .message-ligne .message-actions button:nth-child(3){grid-column:3!important}
      #pane-chantiers .message-ligne .message-actions button:nth-child(3)::before{content:"❌"!important}
    `;
    document.head.appendChild(s);
  }

  function normalize(){
    document.querySelectorAll('#pane-chantiers .message-ligne').forEach(row=>{
      const actions=row.querySelector('.message-actions');
      if(!actions)return;
      const buttons=[...actions.querySelectorAll('button')];
      if(buttons[0]){
        buttons[0].classList.add('message-view-btn');
        buttons[0].title='Voir le message';
        buttons[0].setAttribute('aria-label','Voir le message');
      }
      if(buttons[1]){
        buttons[1].title='Modifier le mail';
        buttons[1].setAttribute('aria-label','Modifier le mail');
      }
      if(buttons[2]){
        buttons[2].title='Supprimer le mail';
        buttons[2].setAttribute('aria-label','Supprimer le mail');
      }
    });
  }

  function run(){installStyle();normalize();}
  run();
  setTimeout(run,50);
  setTimeout(run,250);
  setTimeout(run,1000);
  new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body||document.documentElement,{childList:true,subtree:true});
})();
