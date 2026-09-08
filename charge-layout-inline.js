(function(){
  'use strict';

  const STYLE_ID='yaya-charge-layout-inline-v1';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row{
        min-height:54px!important;
        padding:9px 12px!important;
        column-gap:14px!important;
        align-items:center!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong{
        min-width:0!important;
        display:flex!important;
        align-items:center!important;
        gap:5px 12px!important;
        flex-wrap:wrap!important;
        line-height:1.3!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong > small:not(.yaya-history-date){
        display:inline!important;
        margin:0!important;
        color:#596579!important;
        font-size:12px!important;
        font-weight:500!important;
        line-height:1.3!important;
        white-space:normal!important;
      }
      #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong > .yaya-history-date{
        display:inline!important;
        margin:0 0 0 auto!important;
        padding-left:14px!important;
        color:#7a8798!important;
        font-size:10.5px!important;
        font-weight:500!important;
        line-height:1.3!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-consumables-auto-row{
        display:none!important;
      }

      @media(max-width:640px){
        #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row{
          min-height:52px!important;
          padding:8px 9px!important;
          column-gap:8px!important;
        }
        #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong{
          gap:4px 8px!important;
        }
        #pane-chantiers .yaya-detail-charges-pane .yaya-detail-charge-row > strong > .yaya-history-date{
          padding-left:8px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const TARGET='FORFAIT CONSOMMABLES';

  function norm(value){
    return String(value||'').replace(/\s+/g,' ').trim().toUpperCase();
  }

  function achatById(id){
    try{
      if(typeof S==='undefined'||!Array.isArray(S.achats))return null;
      return S.achats.find(function(a){
        return String(a&&a.id||'')===String(id||'');
      })||null;
    }catch(e){
      return null;
    }
  }

  function isConsumableAchat(achat){
    if(!achat)return false;
    return norm(achat.origine)==='CONSOMMABLES_AUTO' ||
      norm(achat.fournisseur)===TARGET ||
      norm(achat.typeDoc)==='CONSOMMABLES';
  }

  function achatIdFromElement(el){
    if(!el)return '';
    const code=String(el.getAttribute&&el.getAttribute('onclick')||'');
    const match=code.match(/(?:editAchat|editMontantAchat|delAchat)\(['\"]([^'\"]+)['\"]\)/);
    return match&&match[1]?String(match[1]):'';
  }

  function hasDeleteAction(el){
    return !!(el&&el.querySelector&&el.querySelector('button[onclick*="delAchat"],[onclick*="delAchat"],button.x,.x'));
  }

  function rowFromElement(el){
    if(!el)return null;

    let current=el;
    for(let i=0;i<8&&current&&current!==document.body;i++,current=current.parentElement){
      if(hasDeleteAction(current))return current;
    }

    if(el.closest){
      return el.closest('.achligne,.yaya-detail-expense-row,.yaya-detail-achat-row,[data-achat-id],[data-expense-id],tr,li');
    }

    return null;
  }

  function hideRow(row){
    if(!row)return;
    row.classList.add('yaya-consumables-auto-row');
    row.style.setProperty('display','none','important');
    row.setAttribute('aria-hidden','true');
  }

  function hideByStoredData(root){
    root.querySelectorAll('[onclick*="editAchat"],[onclick*="editMontantAchat"],[onclick*="delAchat"]').forEach(function(el){
      const id=achatIdFromElement(el);
      if(!id||!isConsumableAchat(achatById(id)))return;
      hideRow(rowFromElement(el));
    });
  }

  function hideByVisibleText(root){
    root.querySelectorAll('*').forEach(function(el){
      const own=norm(el.textContent);
      if(own.indexOf(TARGET)===-1)return;

      // Ne masquer que la ligne métier contenant les actions de l'achat,
      // jamais le bouton "Consommables : xx €" ni toute la fiche chantier.
      const row=rowFromElement(el);
      if(row)hideRow(row);
    });
  }

  function hideConsumablesRows(){
    const root=document.getElementById('pane-chantiers');
    if(!root)return;
    hideByStoredData(root);
    hideByVisibleText(root);
  }

  let scheduled=false;
  function scheduleHide(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      hideConsumablesRows();
    });
  }

  scheduleHide();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',scheduleHide,{once:true});
  }
  new MutationObserver(scheduleHide).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('yaya:data-refreshed',scheduleHide);
  setTimeout(scheduleHide,100);
  setTimeout(scheduleHide,350);
  setTimeout(scheduleHide,900);
})();