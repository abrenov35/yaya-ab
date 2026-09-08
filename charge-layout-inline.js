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
      #pane-chantiers .achligne.ligD.yaya-consumables-auto-row{
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

  function achatFromRow(row){
    try{
      const action=Array.from(row.querySelectorAll('[onclick]')).map(function(el){
        return String(el.getAttribute('onclick')||'');
      }).join(' ');
      const match=action.match(/(?:editAchat|editMontantAchat|delAchat)\(['\"]([^'\"]+)['\"]\)/);
      if(!match||!match[1]||typeof S==='undefined'||!Array.isArray(S.achats))return null;
      return S.achats.find(function(a){return String(a&&a.id||'')===String(match[1]);})||null;
    }catch(e){return null;}
  }

  function isConsumablesRow(row){
    if(!row)return false;
    const text=String(row.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
    if(text.indexOf('FORFAIT CONSOMMABLES')!==-1)return true;
    const badge=row.querySelector('.badge');
    if(badge&&String(badge.textContent||'').trim().toUpperCase()==='CONSOMMABLES')return true;

    const achat=achatFromRow(row);
    if(!achat)return false;
    return String(achat.origine||'').toUpperCase()==='CONSOMMABLES_AUTO' ||
      String(achat.fournisseur||'').trim().toUpperCase()==='FORFAIT CONSOMMABLES' ||
      String(achat.typeDoc||'').trim().toUpperCase()==='CONSOMMABLES';
  }

  function hideConsumablesRows(){
    document.querySelectorAll('#pane-chantiers .achligne.ligD').forEach(function(row){
      if(!isConsumablesRow(row))return;
      row.classList.add('yaya-consumables-auto-row');
      row.style.setProperty('display','none','important');
      row.setAttribute('aria-hidden','true');
    });
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
})();
