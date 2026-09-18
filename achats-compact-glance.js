(function(){
  'use strict';
  if(window.__YAYA_ACHATS_COMPACT_GLANCE_V1)return;
  window.__YAYA_ACHATS_COMPACT_GLANCE_V1=true;

  const STYLE_ID='yaya-achats-compact-glance-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* ACHATS — lecture rapide / dense */
      #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"]{
        display:grid!important;
        grid-template-columns:auto auto minmax(0,1fr)!important;
        align-items:center!important;
        gap:8px!important;
        min-height:42px!important;
        margin:5px 0 8px!important;
        padding:6px 8px 6px 10px!important;
        background:#f7f9fc!important;
        border:1px solid #dbe4ed!important;
        border-left:4px solid #7e9fbd!important;
        border-radius:9px!important;
        box-shadow:0 1px 2px rgba(22,45,73,.035)!important;
      }
      #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-detail-section-action-title{
        color:#17324f!important;
        font-size:13px!important;
        font-weight:900!important;
        letter-spacing:.045em!important;
      }
      #pane-chantiers .yaya-achats-total-pill{
        display:inline-flex!important;
        align-items:center!important;
        gap:6px!important;
        min-height:30px!important;
        padding:0 10px!important;
        border:1px solid #d5e1ed!important;
        border-radius:8px!important;
        background:#eef4fb!important;
        color:#49647e!important;
        white-space:nowrap!important;
        font-size:10.5px!important;
        font-weight:700!important;
      }
      #pane-chantiers .yaya-achats-total-pill strong{
        color:#17324f!important;
        font-size:12px!important;
        font-weight:900!important;
      }
      #pane-chantiers .yaya-achats-total-short{display:none!important}
      #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-stock-action-buttons{
        grid-column:3!important;
        justify-self:end!important;
        margin-left:0!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:6px!important;
        flex-wrap:nowrap!important;
      }
      #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-stock-action-buttons > .yaya-detail-section-action-button{
        min-height:32px!important;
        height:32px!important;
        margin:0!important;
        padding:0 11px!important;
        border-radius:8px!important;
        font-size:11px!important;
        font-weight:800!important;
        box-shadow:none!important;
      }
      #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-stock-action-buttons > .yaya-detail-section-action-button:not(.yaya-stock-expense-button):not(.yaya-consumables-button){
        background:#173f69!important;
        border-color:#173f69!important;
        color:#fff!important;
      }
      #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-stock-action-buttons > .yaya-detail-section-action-button:not(.yaya-stock-expense-button):not(.yaya-consumables-button):hover{
        background:#12365b!important;
        border-color:#12365b!important;
      }
      #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-consumables-button{
        min-width:112px!important;
        background:#fff8e8!important;
        border-color:#ead394!important;
        color:#76540e!important;
      }
      #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-consumables-button:hover{
        background:#fff2cf!important;
        border-color:#dfc36f!important;
      }
      #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-stock-expense-button{
        min-width:76px!important;
        background:#eef7f0!important;
        border-color:#bfd9c5!important;
        color:#2d6b40!important;
      }

      #pane-chantiers .yaya-detail-expenses-pane{
        overflow:hidden!important;
        border:1px solid #e3eaf1!important;
        border-radius:10px!important;
        background:#fff!important;
      }
      #pane-chantiers .yaya-achats-column-head{
        display:grid!important;
        grid-template-columns:minmax(120px,170px) minmax(0,1fr) 108px 105px!important;
        gap:14px!important;
        align-items:center!important;
        min-height:34px!important;
        padding:0 12px!important;
        border-bottom:1px solid #e3eaf1!important;
        background:#f7f9fc!important;
        color:#49647e!important;
        font-size:10.5px!important;
        font-weight:800!important;
      }
      #pane-chantiers .yaya-achats-column-head span:last-child{text-align:right!important}

      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-row{
        display:grid!important;
        grid-template-columns:minmax(120px,170px) minmax(0,1fr) 108px 105px!important;
        gap:14px!important;
        align-items:center!important;
        min-height:48px!important;
        padding:7px 12px!important;
        border-bottom:1px solid #e8edf2!important;
        background:#fff!important;
        cursor:pointer!important;
        transition:background .12s ease!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-row:hover{
        background:#f8fbfe!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-row:last-child{border-bottom:0!important}
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-row > strong{
        display:contents!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-achat-fournisseur{
        grid-column:1!important;
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#17324f!important;
        font-size:12.5px!important;
        font-weight:850!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-achat-designation{
        grid-column:2!important;
        display:block!important;
        min-width:0!important;
        margin:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#3f5369!important;
        font-size:12.5px!important;
        font-weight:600!important;
        line-height:1.25!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-achat-date{
        grid-column:3!important;
        display:block!important;
        margin:0!important;
        color:#7b8998!important;
        font-size:11px!important;
        font-weight:500!important;
        white-space:nowrap!important;
        text-align:left!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-charge-hours{
        display:none!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-charge-cost{
        grid-column:4!important;
        min-width:0!important;
        text-align:right!important;
        color:#17324f!important;
        font-size:13.5px!important;
        font-weight:900!important;
        white-space:nowrap!important;
        text-decoration:none!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-charge-cost.yaya-achat-credit{
        color:#238451!important;
      }
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-row > .yaya-detail-charge-view,
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-row > .yaya-detail-charge-edit,
      #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-row > .yaya-detail-charge-delete{
        display:none!important;
      }

      @media(max-width:640px){
        #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"]{
          grid-template-columns:minmax(0,1fr) auto!important;
          gap:6px!important;
          padding:7px!important;
        }
        #pane-chantiers .yaya-achats-total-pill{
          justify-self:end!important;
          min-height:28px!important;
          padding:0 8px!important;
        }
        #pane-chantiers .yaya-achats-total-full{display:none!important}
        #pane-chantiers .yaya-achats-total-short{display:inline!important}
        #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-stock-action-buttons{
          grid-column:1/-1!important;
          justify-self:stretch!important;
          width:100%!important;
          display:grid!important;
          grid-template-columns:minmax(0,1.25fr) auto auto!important;
          gap:6px!important;
        }
        #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-stock-action-buttons > .yaya-detail-section-action-button{
          min-width:0!important;
          width:100%!important;
          padding:0 8px!important;
          font-size:10.5px!important;
        }
        #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-consumables-button{
          min-width:64px!important;
        }
        #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-consumables-button .yaya-consumables-label{
          display:none!important;
        }
        #pane-chantiers .yaya-detail-section-action-row[data-section="depenses"] .yaya-stock-expense-button{
          min-width:64px!important;
        }

        #pane-chantiers .yaya-achats-column-head{display:none!important}
        #pane-chantiers .yaya-detail-expenses-pane{
          border-radius:9px!important;
        }
        #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-expense-row{
          grid-template-columns:minmax(0,1fr) auto!important;
          grid-template-rows:auto auto!important;
          gap:3px 10px!important;
          min-height:56px!important;
          padding:8px 10px!important;
        }
        #pane-chantiers .yaya-detail-expenses-pane .yaya-achat-fournisseur{
          grid-column:1!important;
          grid-row:1!important;
          font-size:12px!important;
        }
        #pane-chantiers .yaya-detail-expenses-pane .yaya-detail-charge-cost{
          grid-column:2!important;
          grid-row:1!important;
          font-size:13px!important;
        }
        #pane-chantiers .yaya-detail-expenses-pane .yaya-achat-designation{
          grid-column:1!important;
          grid-row:2!important;
          font-size:11px!important;
          font-weight:500!important;
        }
        #pane-chantiers .yaya-detail-expenses-pane .yaya-achat-date{
          grid-column:2!important;
          grid-row:2!important;
          font-size:9.8px!important;
          text-align:right!important;
          align-self:center!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function euro(value){
    return (Number(value)||0).toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:2})+' €';
  }

  function normalise(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
  }

  function cardId(card){
    if(!card)return '';
    const nodes=card.querySelectorAll('[onclick]');
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['"]([^'"]+)/);
      if(m&&m[1])return String(m[1]).trim();
    }
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier).trim();}catch(_){}
    return '';
  }

  function isSubcontract(a){
    const type=normalise(a&&a.typeDoc);
    return type==='FACTURE SOUS-TRAITANT'||type==='FACTURE SOUS TRAITANT'||String(a&&a.sousTraitant||'').trim()!=='';
  }

  function isConsumables(a){
    if(!a)return false;
    return normalise(a.origine)==='CONSOMMABLES_AUTO'
      || normalise(a.fournisseur)==='FORFAIT CONSOMMABLES'
      || normalise(a.typeDoc)==='CONSOMMABLES'
      || normalise(a.designation).includes('YAYA_CONSOMMABLES');
  }

  function visiblePurchases(card){
    const cid=cardId(card);
    if(!cid)return [];
    let list=[];
    try{list=Array.isArray(S&&S.achats)?S.achats:[];}catch(_){return [];}
    return list.filter(function(a){
      if(!a||String(a.chantierId||'')!==String(cid))return false;
      if(a.statutValidation==='A_VALIDER'||a.statutValidation==='REJETEE'||a.statutValidation==='DOUBLON')return false;
      if(isSubcontract(a)||isConsumables(a))return false;
      return true;
    });
  }

  function purchaseTotal(card){
    return visiblePurchases(card).reduce(function(sum,a){
      const amount=Number(a&&a.montantHT)||0;
      return sum+(normalise(a&&a.typeDoc)==='AVOIR'?-amount:amount);
    },0);
  }

  function decorateActionRow(row){
    if(!row)return;
    const card=row.closest('.card');
    if(!card)return;

    let pill=row.querySelector(':scope > .yaya-achats-total-pill');
    if(!pill){
      pill=document.createElement('span');
      pill.className='yaya-achats-total-pill';
      pill.innerHTML='<span class="yaya-achats-total-full">Total achats</span><span class="yaya-achats-total-short">Total</span><strong></strong>';
      const group=row.querySelector(':scope > .yaya-stock-action-buttons');
      if(group)row.insertBefore(pill,group);else row.appendChild(pill);
    }
    const strong=pill.querySelector('strong');
    const value=euro(purchaseTotal(card));
    if(strong&&strong.textContent!==value)strong.textContent=value;
  }

  function wrapSupplier(row){
    const strong=row.querySelector(':scope > strong');
    if(!strong)return;

    let supplier=strong.querySelector(':scope > .yaya-achat-fournisseur');
    if(!supplier){
      const direct=[...strong.childNodes].filter(function(n){return n.nodeType===Node.TEXT_NODE&&String(n.textContent||'').trim();});
      const name=direct.map(function(n){return String(n.textContent||'').trim();}).join(' ').trim();
      if(name){
        supplier=document.createElement('span');
        supplier.className='yaya-achat-fournisseur';
        supplier.textContent=name;
        direct.forEach(function(n){n.remove();});
        strong.insertBefore(supplier,strong.firstChild||null);
      }
    }

    const detail=strong.querySelector(':scope > small:not(.yaya-history-date)');
    if(detail)detail.classList.add('yaya-achat-designation');
    const date=strong.querySelector(':scope > .yaya-history-date');
    if(date)date.classList.add('yaya-achat-date');
  }

  function makeRowActionable(row){
    if(row.dataset.yayaAchatsGlanceBound==='1')return;
    row.dataset.yayaAchatsGlanceBound='1';
    row.addEventListener('click',function(e){
      if(e.target&&e.target.closest&&e.target.closest('button,a,input,select,textarea,label'))return;
      const edit=row.querySelector('.yaya-detail-charge-edit');
      if(edit){edit.click();return;}
      const view=row.querySelector('.yaya-detail-charge-view:not(:disabled)');
      if(view)view.click();
    });
  }

  function decorateExpenseRow(row){
    if(!row)return;
    wrapSupplier(row);
    const cost=row.querySelector(':scope > .yaya-detail-charge-cost');
    if(cost){
      const current=String(cost.textContent||'').trim();
      if(/^[-−]\s*/.test(current))cost.textContent=current.replace(/^[-−]\s*/,'');
      cost.classList.toggle('yaya-achat-credit',/^\+/.test(String(cost.textContent||'').trim()));
    }
    makeRowActionable(row);
  }

  function decoratePane(pane){
    if(!pane)return;
    const rows=[...pane.querySelectorAll(':scope > .yaya-detail-expense-row')];
    let head=pane.querySelector(':scope > .yaya-achats-column-head');
    if(rows.length&&!head){
      head=document.createElement('div');
      head.className='yaya-achats-column-head';
      head.innerHTML='<span>Fournisseur</span><span>Désignation</span><span>Date</span><span>Montant</span>';
      pane.insertBefore(head,pane.firstChild||null);
    }else if(!rows.length&&head){
      head.remove();
    }
    rows.forEach(decorateExpenseRow);
  }

  function apply(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .yaya-detail-section-action-row[data-section="depenses"]').forEach(decorateActionRow);
    document.querySelectorAll('#pane-chantiers .yaya-detail-expenses-pane').forEach(decoratePane);
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;apply();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  const pane=document.getElementById('pane-chantiers')||document.body;
  new MutationObserver(schedule).observe(pane,{childList:true,subtree:true,characterData:true});
  window.addEventListener('yaya:data-refreshed',schedule);
  window.addEventListener('resize',schedule);
})();
