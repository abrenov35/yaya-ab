(function(){
  'use strict';
  if(window.__YAYA_CHARGES_GROUPED_V1)return;
  window.__YAYA_CHARGES_GROUPED_V1=true;

  const STYLE_ID='yaya-charges-grouped-view-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* CHARGES — 2 familles visuelles : salariés/heures et sous-traitance */
      #pane-chantiers .yaya-detail-charges-pane{
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        overflow:visible!important;
      }
      #pane-chantiers .yaya-charge-group{
        overflow:hidden!important;
        margin:0 0 10px!important;
        border:1px solid #dfe7ef!important;
        border-radius:10px!important;
        background:#fff!important;
        box-shadow:0 1px 2px rgba(22,45,73,.035)!important;
      }
      #pane-chantiers .yaya-charge-group:last-child{margin-bottom:0!important}
      #pane-chantiers .yaya-charge-group-head{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:12px!important;
        min-height:40px!important;
        padding:7px 11px!important;
        border-bottom:1px solid #dfe7ef!important;
      }
      #pane-chantiers .yaya-charge-group--employees .yaya-charge-group-head{
        background:#edf5fd!important;
        border-bottom-color:#d7e5f3!important;
      }
      #pane-chantiers .yaya-charge-group--subcontract .yaya-charge-group-head{
        background:#fff7ed!important;
        border-bottom-color:#eadfce!important;
      }
      #pane-chantiers .yaya-charge-group-title{
        min-width:0!important;
        color:#17324f!important;
        font-size:12.5px!important;
        font-weight:900!important;
        letter-spacing:.01em!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-charge-group--employees .yaya-charge-group-title::before{
        content:"👥";
        margin-right:7px;
        font-size:13px;
      }
      #pane-chantiers .yaya-charge-group--subcontract .yaya-charge-group-title::before{
        content:"🔧";
        margin-right:7px;
        font-size:13px;
      }
      #pane-chantiers .yaya-charge-group-summary{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:8px!important;
        min-width:0!important;
        color:#6f7f91!important;
        font-size:10.5px!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-charge-group-summary .yaya-charge-group-hours{
        color:#516b84!important;
        font-weight:700!important;
      }
      #pane-chantiers .yaya-charge-group-summary .yaya-charge-total-label{
        color:#7a8795!important;
        font-weight:600!important;
      }
      #pane-chantiers .yaya-charge-group-summary strong{
        color:#17324f!important;
        font-size:13px!important;
        font-weight:900!important;
      }
      #pane-chantiers .yaya-charge-group-body{
        background:#fff!important;
      }
      #pane-chantiers .yaya-charge-group-body .yaya-detail-charge-row{
        border-radius:0!important;
      }
      #pane-chantiers .yaya-charge-group-body .yaya-detail-charge-row:last-child{
        border-bottom:0!important;
      }

      @media(min-width:761px){
        #pane-chantiers .yaya-charge-group-body .yaya-detail-charge-row{
          min-height:46px!important;
        }
      }

      @media(max-width:760px){
        #pane-chantiers .yaya-charge-group{
          margin-bottom:8px!important;
        }
        #pane-chantiers .yaya-charge-group-head{
          min-height:38px!important;
          padding:7px 9px!important;
          gap:8px!important;
        }
        #pane-chantiers .yaya-charge-group-title{
          font-size:11.5px!important;
        }
        #pane-chantiers .yaya-charge-group-summary{
          gap:6px!important;
          font-size:9.5px!important;
        }
        #pane-chantiers .yaya-charge-group-summary strong{
          font-size:11.5px!important;
        }
        #pane-chantiers .yaya-charge-total-label{
          display:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function parseNumber(text){
    const raw=String(text||'')
      .replace(/[€h]/gi,'')
      .replace(/[\u00a0\u202f\s]/g,'')
      .replace(',','.')
      .replace(/[^0-9.\-]/g,'');
    const value=Number(raw);
    return Number.isFinite(value)?value:0;
  }

  function euro(value){
    return Math.round(Number(value)||0).toLocaleString('fr-FR')+' €';
  }

  function isSubcontract(row){
    const hours=row.querySelector('.yaya-detail-charge-hours');
    const text=String(hours&&hours.textContent||'').trim().toLowerCase();
    return text.includes('sous-trait');
  }

  function sumRows(rows,type){
    let amount=0;
    let hours=0;
    rows.forEach(function(row){
      const cost=row.querySelector('.yaya-detail-charge-cost');
      amount+=parseNumber(cost&&cost.textContent);
      if(type==='employees'){
        const h=row.querySelector('.yaya-detail-charge-hours');
        hours+=parseNumber(h&&h.textContent);
      }
    });
    return {amount:amount,hours:hours};
  }

  function makeGroup(type,rows){
    if(!rows.length)return null;

    const group=document.createElement('section');
    group.className='yaya-charge-group yaya-charge-group--'+(type==='employees'?'employees':'subcontract');
    group.dataset.chargeGroup=type;

    const head=document.createElement('div');
    head.className='yaya-charge-group-head';

    const title=document.createElement('strong');
    title.className='yaya-charge-group-title';
    title.textContent=type==='employees'?'Salariés / heures':'Sous-traitance';

    const summary=document.createElement('div');
    summary.className='yaya-charge-group-summary';

    const body=document.createElement('div');
    body.className='yaya-charge-group-body';

    head.appendChild(title);
    head.appendChild(summary);
    group.appendChild(head);
    group.appendChild(body);
    rows.forEach(function(row){body.appendChild(row);});

    updateGroup(group);
    return group;
  }

  function updateGroup(group){
    if(!group)return;
    const type=group.dataset.chargeGroup||'employees';
    const rows=[...group.querySelectorAll(':scope > .yaya-charge-group-body > .yaya-detail-charge-row')];
    const totals=sumRows(rows,type);
    const summary=group.querySelector(':scope > .yaya-charge-group-head > .yaya-charge-group-summary');
    if(!summary)return;

    const html=(type==='employees'
      ? '<span class="yaya-charge-group-hours">'+totals.hours.toLocaleString('fr-FR')+' h</span>'
      : '')
      +'<span class="yaya-charge-total-label">Total</span>'
      +'<strong>'+euro(totals.amount)+'</strong>';

    if(summary.innerHTML!==html)summary.innerHTML=html;
  }

  function groupPane(pane){
    if(!pane)return;

    const directRows=[...pane.children].filter(function(node){
      return node.classList&&node.classList.contains('yaya-detail-charge-row');
    });

    if(directRows.length){
      const employees=[];
      const subcontract=[];
      directRows.forEach(function(row){
        (isSubcontract(row)?subcontract:employees).push(row);
      });

      const fragment=document.createDocumentFragment();
      const empGroup=makeGroup('employees',employees);
      const subGroup=makeGroup('subcontract',subcontract);
      if(empGroup)fragment.appendChild(empGroup);
      if(subGroup)fragment.appendChild(subGroup);
      pane.appendChild(fragment);
    }

    pane.querySelectorAll(':scope > .yaya-charge-group').forEach(updateGroup);
  }

  function apply(){
    installStyle();
    document.querySelectorAll('#pane-chantiers .yaya-detail-charges-pane').forEach(groupPane);
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      apply();
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  const pane=document.getElementById('pane-chantiers');
  if(pane)new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();