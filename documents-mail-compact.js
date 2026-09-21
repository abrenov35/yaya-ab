(function(){
  'use strict';
  if(window.__YAYA_DOCUMENTS_MAIL_COMPACT_V1)return;
  window.__YAYA_DOCUMENTS_MAIL_COMPACT_V1=true;

  const STYLE_ID='yaya-documents-mail-compact-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-section-action-row[data-section="documents"]{
        min-height:42px!important;
        margin:5px 0 8px!important;
        padding:6px 8px 6px 10px!important;
        background:#f4f8fd!important;
        border:1px solid #d6e3f0!important;
        border-left:4px solid #6f9fcd!important;
        border-radius:9px!important;
        box-shadow:0 1px 2px rgba(22,45,73,.035)!important;
      }
      #pane-chantiers .yaya-detail-section-action-row[data-section="documents"] .yaya-detail-section-action-title{
        color:#285f96!important;
        font-size:13px!important;
        font-weight:900!important;
        letter-spacing:.045em!important;
      }
      #pane-chantiers .yaya-detail-section-action-row[data-section="documents"] .yaya-detail-section-action-button{
        min-height:32px!important;
        height:32px!important;
        padding:0 11px!important;
        border-radius:8px!important;
        background:#173f69!important;
        border-color:#173f69!important;
        color:#fff!important;
        font-size:11px!important;
        font-weight:800!important;
        box-shadow:none!important;
      }

      #pane-chantiers .yaya-detail-documents-pane[data-empty="0"]::before,
      #pane-chantiers .yaya-detail-mails-pane[data-empty="0"]::before{
        content:none!important;
        display:none!important;
      }

      #pane-chantiers .yaya-force-mails-pane,
      #pane-chantiers .yaya-detail-documents-pane,
      #pane-chantiers .yaya-detail-mails-pane{
        overflow:hidden!important;
        border:1px solid #e1e8f0!important;
        border-radius:9px!important;
        background:#fff!important;
        box-shadow:none!important;
      }
      #pane-chantiers .yaya-force-mails-pane,
      #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-mails-pane{display:none!important}
      #pane-chantiers .yaya-force-mails-pane{margin:0 0 7px!important}
      #pane-chantiers .yaya-detail-documents-pane{margin:0!important}

      #pane-chantiers .yaya-force-mails-title,
      #pane-chantiers .yaya-documents-compact-title,
      #pane-chantiers .yaya-mails-compact-title{
        display:flex!important;
        align-items:center!important;
        min-height:30px!important;
        padding:0 10px!important;
        margin:0!important;
        border-bottom:1px solid #dfe7ef!important;
        font-size:10.5px!important;
        font-weight:900!important;
        letter-spacing:.045em!important;
      }
      #pane-chantiers .yaya-force-mails-title,
      #pane-chantiers .yaya-mails-compact-title{
        background:#f5eff9!important;
        color:#69448a!important;
        border-bottom-color:#e0d2e9!important;
      }
      #pane-chantiers .yaya-documents-compact-title{
        background:#eef5fb!important;
        color:#285f96!important;
        border-bottom-color:#d3e1ee!important;
      }

      #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row,
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row{
        display:grid!important;
        grid-template-columns:minmax(125px,.85fr) minmax(0,1.7fr) 92px!important;
        align-items:center!important;
        gap:10px!important;
        min-height:40px!important;
        padding:6px 10px!important;
        border-bottom:1px solid #e7ecf2!important;
        background:#fff!important;
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:last-child,
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:last-child{border-bottom:0!important}
      #pane-chantiers .yaya-mail-restored-sender,
      #pane-chantiers .yaya-detail-mails-pane .yaya-mail-sender{
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#17324f!important;
        font-size:12px!important;
        font-weight:850!important;
      }
      #pane-chantiers .yaya-mail-restored-subject,
      #pane-chantiers .yaya-detail-mails-pane .yaya-mail-subject{
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#53677c!important;
        font-size:11.5px!important;
        font-weight:500!important;
        text-align:left!important;
      }
      #pane-chantiers .yaya-mail-restored-date,
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-charge-cost{
        color:#8793a1!important;
        font-size:10.5px!important;
        font-weight:500!important;
        text-align:right!important;
        white-space:nowrap!important;
      }

      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row{
        display:grid!important;
        grid-template-columns:minmax(180px,1fr) minmax(360px,2fr) 100px 100px!important;
        align-items:center!important;
        gap:16px!important;
        min-height:54px!important;
        padding:8px 12px!important;
        border-bottom:1px solid #e7ecf2!important;
        background:#fff!important;
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row:last-child{border-bottom:0!important}
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row > strong{
        grid-column:1!important;
        grid-row:1!important;
        min-width:0!important;
        overflow:hidden!important;
        color:#17324f!important;
        font-size:12.5px!important;
        font-weight:850!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row > strong > small{
        display:block!important;
        min-width:0!important;
        margin-top:2px!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        color:#53677c!important;
        font-size:10.8px!important;
        font-weight:500!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-document-field-2{
        grid-column:2!important;
        grid-row:1!important;
        min-width:0!important;
        padding:5px 0 5px 10px!important;
        border-left:1px solid #e1e8f0!important;
        overflow:visible!important;
        text-overflow:clip!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        color:#334e68!important;
        font-size:13px!important;
        line-height:1.35!important;
        font-weight:600!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        text-align:left!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours{
        grid-column:3!important;
        grid-row:1!important;
        color:#6d7e90!important;
        font-size:11px!important;
        font-weight:600!important;
        text-align:left!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-cost{
        grid-column:4!important;
        grid-row:1!important;
        color:#8793a1!important;
        font-size:11px!important;
        font-weight:500!important;
        text-align:right!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-view,
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-edit,
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-delete,
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-view,
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-edit,
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-document-delete{
        display:none!important;
      }

      @media(max-width:760px) and (orientation:portrait){
        #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row,
        #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row{
          grid-template-columns:minmax(0,1fr) auto!important;
          grid-template-rows:auto auto!important;
          gap:3px 10px!important;
          min-height:52px!important;
          padding:7px 9px!important;
        }
        #pane-chantiers .yaya-mail-restored-sender,
        #pane-chantiers .yaya-detail-mails-pane .yaya-mail-sender{
          grid-column:1!important;
          grid-row:1!important;
          font-size:11.5px!important;
        }
        #pane-chantiers .yaya-mail-restored-date,
        #pane-chantiers .yaya-detail-mails-pane .yaya-detail-charge-cost{
          grid-column:2!important;
          grid-row:1!important;
          align-self:center!important;
          font-size:9.8px!important;
        }
        #pane-chantiers .yaya-mail-restored-subject,
        #pane-chantiers .yaya-detail-mails-pane .yaya-mail-subject{
          grid-column:1/-1!important;
          grid-row:2!important;
          font-size:10.8px!important;
          text-align:left!important;
        }

        #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row{
          grid-template-columns:minmax(0,1fr) auto auto!important;
          grid-template-rows:auto auto!important;
          gap:3px 10px!important;
          min-height:54px!important;
          padding:7px 9px!important;
        }
        #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row > strong{
          grid-column:1!important;
          grid-row:1!important;
          align-self:center!important;
          padding-right:8px!important;
          font-size:11.5px!important;
        }
        #pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-cost{
          grid-column:3!important;
          grid-row:1!important;
          align-self:center!important;
          font-size:9.8px!important;
        }
        #pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours{
          grid-column:2!important;
          grid-row:1!important;
          align-self:center!important;
          justify-self:end!important;
          max-width:110px!important;
          font-size:9.8px!important;
          text-align:right!important;
        }
        #pane-chantiers .yaya-detail-documents-pane .yaya-document-field-2{
          grid-column:1/-1!important;
          grid-row:2!important;
          padding:4px 0 0!important;
          border-left:0!important;
          border-top:1px solid #edf1f5!important;
          justify-content:flex-start!important;
          text-align:left!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function addTitle(pane,className,textValue){
    let title=pane.querySelector(':scope > .'+className);
    if(!title){
      title=document.createElement('div');
      title.className=className;
      pane.insertBefore(title,pane.firstChild||null);
    }
    if(title.textContent!==textValue)title.textContent=textValue;
  }

  function apply(){
    installStyle();

    document.querySelectorAll('#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-mails-pane, #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-force-mails-pane').forEach(function(pane){
      pane.style.setProperty('display','none','important');
      pane.setAttribute('aria-hidden','true');
    });

    document.querySelectorAll('#pane-chantiers .yaya-detail-section-action-row[data-section="documents"] .yaya-detail-section-action-title').forEach(function(el){
      if(el.textContent!=='DOC & MAILS')el.textContent='DOC & MAILS';
    });

    document.querySelectorAll('#pane-chantiers .yaya-force-mails-pane').forEach(function(pane){
      const rows=pane.querySelectorAll(':scope > .yaya-mail-restored-row');
      const title=pane.querySelector(':scope > .yaya-force-mails-title');
      if(title)title.style.setProperty('display','none','important');
    });

    document.querySelectorAll('#pane-chantiers .yaya-detail-mails-pane').forEach(function(pane){
      const rows=pane.querySelectorAll(':scope > .yaya-detail-mail-row');
      const title=pane.querySelector(':scope > .yaya-mails-compact-title');
      if(title)title.remove();
    });

    document.querySelectorAll('#pane-chantiers .yaya-detail-documents-pane').forEach(function(pane){
      const rows=pane.querySelectorAll(':scope > .yaya-detail-document-row');
      const title=pane.querySelector(':scope > .yaya-documents-compact-title');
      if(title)title.remove();
      rows.forEach(function(row){
        const primary=row.querySelector(':scope > strong');
        if(!primary)return;
        let secondary=row.querySelector(':scope > .yaya-document-field-2');
        if(!secondary){
          secondary=primary.querySelector(':scope > small');
          if(secondary){
            secondary.classList.add('yaya-document-field-2');
            primary.insertAdjacentElement('afterend',secondary);
          }else{
            secondary=document.createElement('span');
            secondary.className='yaya-document-field-2';
            primary.insertAdjacentElement('afterend',secondary);
          }
        }
        const type=row.querySelector(':scope > .yaya-detail-charge-hours');
        const date=row.querySelector(':scope > .yaya-detail-charge-cost');
        const pj=row.querySelector(':scope > .yaya-mail-pj-row-button');
        const mobile=window.matchMedia('(max-width:760px) and (orientation:portrait)').matches;

        row.style.setProperty('display','grid','important');
        row.style.setProperty(
          'grid-template-columns',
          mobile
            ? (pj ? 'minmax(0,1fr) auto 38px auto' : 'minmax(0,1fr) auto auto')
            : (pj ? 'minmax(180px,28%) minmax(360px,1fr) 100px 44px 100px' : 'minmax(180px,28%) minmax(360px,1fr) 100px 100px'),
          'important'
        );
        primary.style.setProperty('grid-column','1','important');
        primary.style.setProperty('grid-row','1','important');
        secondary.style.setProperty('grid-column',mobile ? '1 / -1' : '2','important');
        secondary.style.setProperty('grid-row',mobile ? '2' : '1','important');
        secondary.style.setProperty('white-space','normal','important');
        secondary.style.setProperty('overflow','visible','important');
        secondary.style.setProperty('text-overflow','clip','important');
        secondary.style.setProperty('display','flex','important');
        secondary.style.setProperty('align-items','center','important');
        secondary.style.setProperty('justify-content','flex-start','important');
        secondary.style.setProperty('text-align','left','important');
        secondary.style.setProperty('padding-left',mobile?'0':'10px','important');
        secondary.style.setProperty('padding-right','0','important');
        if(type){
          type.style.setProperty('grid-column',mobile ? '2' : '3','important');
          type.style.setProperty('grid-row','1','important');
        }
        if(pj){
          pj.style.setProperty('grid-column',mobile ? '3' : '4','important');
          pj.style.setProperty('grid-row','1','important');
          pj.style.setProperty('display','inline-flex','important');
          pj.style.setProperty('visibility','visible','important');
          pj.style.setProperty('opacity','1','important');
          pj.style.setProperty('justify-self','center','important');
          pj.style.setProperty('align-self','center','important');
        }
        if(date){
          date.style.setProperty('grid-column',mobile ? (pj?'4':'3') : (pj?'5':'4'),'important');
          date.style.setProperty('grid-row','1','important');
        }
      });
    });
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;apply();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();

  const root=document.getElementById('pane-chantiers')||document.body;
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
  window.addEventListener('resize',schedule);
})();
