(function(){
  'use strict';

  if(window.__yayaFinanceDeleteXV1)return;
  window.__yayaFinanceDeleteXV1=true;

  const STYLE_ID='yaya-finance-delete-x-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-finance-delete-x{
        width:28px!important;
        height:28px!important;
        min-width:28px!important;
        min-height:28px!important;
        padding:0!important;
        margin-left:8px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid #e6a7a7!important;
        border-radius:7px!important;
        background:#fff3f3!important;
        color:#c83c3c!important;
        box-shadow:0 1px 3px rgba(22,45,73,.14)!important;
        font-size:20px!important;
        font-weight:700!important;
        line-height:1!important;
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-finance-delete-x:hover{
        background:#ffe7e7!important;
        border-color:#d96b6b!important;
        color:#b42318!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane .yaya-commande-actions{
        gap:0!important;
      }
    `;
    document.head.appendChild(style);
  }

  function isDeleteButton(btn){
    if(!btn||btn.tagName!=='BUTTON')return false;
    if(btn.classList.contains('yaya-detail-commande-delete'))return true;

    const row=btn.closest('.yaya-detail-expense-row,.yaya-detail-charge-row,.ligD,.yaya-charge-legacy-row,.achligne,.ligR,.charge-ligne,.charge-row,.controle-row');
    if(!row)return false;

    const cls=String(btn.className||'');
    const onclick=String(btn.getAttribute('onclick')||'');
    const title=String(btn.getAttribute('title')||'');
    const aria=String(btn.getAttribute('aria-label')||'');
    const text=String(btn.textContent||'').trim();

    return /(?:delete|del-|suppr)/i.test(cls)
      || /(?:delAchat|delCommande|deleteCommande|supprimer)/i.test(onclick)
      || /supprimer/i.test(title)
      || /supprimer/i.test(aria)
      || /(?:🗑|🗑️)/u.test(text);
  }

  function decorateButton(btn){
    if(!isDeleteButton(btn))return;
    btn.classList.add('yaya-finance-delete-x');
    if(btn.textContent!=='×')btn.textContent='×';
    if(!btn.getAttribute('title'))btn.setAttribute('title','Supprimer');
    if(!btn.getAttribute('aria-label'))btn.setAttribute('aria-label','Supprimer');
  }

  function patch(){
    installStyle();
    document.querySelectorAll([
      '#pane-chantiers .yaya-detail-commandes-pane button',
      '#pane-chantiers .yaya-detail-expenses-pane button',
      '#pane-chantiers .yaya-detail-charges-pane button',
      '#pane-chantiers .ligD button',
      '#pane-chantiers .yaya-charge-legacy-row button'
    ].join(',')).forEach(decorateButton);
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;patch();});
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
