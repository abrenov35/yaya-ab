(function(){
  'use strict';
  if(window.__yayaMailAttachmentsButtonV4)return;
  window.__yayaMailAttachmentsButtonV2=true;

  const TYPE='MAIL_PJ';
  const BUTTON_CLASS='yaya-mail-pj-button';
  const ROW_BUTTON_CLASS='yaya-mail-pj-row-button';
  const MODAL_CLASS='yaya-mail-pj-list-overlay';
  const STYLE_ID='yaya-mail-pj-style-v4';

  function text(v){return String(v==null?'':v).trim();}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function docs(){
    try{return (typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];}catch(e){return [];}
  }
  function upper(v){return text(v).toUpperCase();}
  function isAttachment(d){return !!d&&upper(d.type)===TYPE;}
  function docById(id){id=text(id);return docs().find(function(d){return text(d&&d.id)===id;})||null;}
  function linkedMailId(d){
    if(!d)return '';
    return text(d.mailId||d.parentMailId||d.messageId||d.mailDocumentId||d.parentId||d.sujet);
  }
  function attachmentsForMail(mailId){
    mailId=text(mailId);
    if(!mailId)return [];
    return docs().filter(function(d){
      return isAttachment(d)&&linkedMailId(d)===mailId&&!!text(d.lien||d.url||d.webUrl||d.downloadUrl);
    });
  }
  function mailIdFromModal(modal){
    if(!modal)return '';
    const el=modal.querySelector('[data-yaya-mail-delete],[data-yaya-mail-edit],[data-mail-id]');
    if(!el)return '';
    return text(el.dataset.yayaMailDelete||el.dataset.yayaMailEdit||el.dataset.mailId||'');
  }
  function mailIdFromRow(row){
    if(!row)return '';
    const direct=text(row.dataset&&(row.dataset.mailId||row.dataset.yayaMailId||row.dataset.id));
    if(direct)return direct;
    const el=row.querySelector('[data-mail-id],[data-yaya-mail-delete],[data-yaya-mail-edit]');
    if(el){
      const id=text(el.dataset.mailId||el.dataset.yayaMailDelete||el.dataset.yayaMailEdit||'');
      if(id)return id;
    }
    const raw=[].map.call(row.querySelectorAll('[onclick]'),function(el){return text(el.getAttribute('onclick'));}).join(' ');
    const m=raw.match(/(?:voirMessageYaya|editDocument|delDocument)\(['"]([^'"]+)/i);
    return m&&m[1]?text(m[1]):'';
  }
  function openPiece(d){
    if(!d)return;
    const url=text(d.lien||d.url||d.webUrl||d.downloadUrl);if(!url)return;
    const docId=text(d.id);
    try{window.__yayaPreviewDocumentId=docId;}catch(e){}
    try{
      if(typeof window.voirPiece==='function'){
        window.voirPiece(url);
        scheduleMailAttachmentFullscreen(docId);
        return;
      }
    }catch(e){}
    try{
      if(typeof voirPiece==='function'){
        voirPiece(url);
        scheduleMailAttachmentFullscreen(docId);
        return;
      }
    }catch(e){}
    window.open(url,'_blank','noopener');
  }
  function fileLabel(d){return text(d.pieceNom||d.titre||d.nomFichier||d.filename||d.fileName)||'Pièce jointe';}

  function forceMailAttachmentFullscreen(docId){
    const expected=text(docId);
    const root=document.getElementById('modalRoot');
    if(!root)return false;
    const modal=root.querySelector('.piece-preview-modal');
    if(!modal)return false;

    const active=text(window.__yayaPreviewDocumentId);
    if(expected&&active&&expected!==active)return false;

    const overlay=modal.closest('.piece-preview-overlay,.overlay');
    if(overlay){
      overlay.dataset.yayaMailPjFullscreen='1';
      overlay.style.setProperty('position','fixed','important');
      overlay.style.setProperty('inset','0','important');
      overlay.style.setProperty('width','100vw','important');
      overlay.style.setProperty('height','100dvh','important');
      overlay.style.setProperty('padding','0','important');
      overlay.style.setProperty('margin','0','important');
      overlay.style.setProperty('align-items','stretch','important');
      overlay.style.setProperty('justify-content','stretch','important');
      overlay.style.setProperty('overflow','hidden','important');
      overlay.style.setProperty('background','#fff','important');
    }

    modal.dataset.yayaMailPjFullscreen='1';
    modal.style.setProperty('position','relative','important');
    modal.style.setProperty('inset','auto','important');
    modal.style.setProperty('box-sizing','border-box','important');
    modal.style.setProperty('width','100vw','important');
    modal.style.setProperty('height','100dvh','important');
    modal.style.setProperty('max-width','none','important');
    modal.style.setProperty('max-height','none','important');
    modal.style.setProperty('min-width','0','important');
    modal.style.setProperty('min-height','0','important');
    modal.style.setProperty('margin','0','important');
    modal.style.setProperty('padding','6px','important');
    modal.style.setProperty('border-radius','0','important');
    modal.style.setProperty('box-shadow','none','important');
    modal.style.setProperty('overflow','hidden','important');

    const head=modal.querySelector('.piece-preview-head');
    if(head){
      head.style.setProperty('flex','0 0 auto','important');
      head.style.setProperty('min-height','42px','important');
      head.style.setProperty('margin','0 0 4px','important');
      head.style.setProperty('padding','0 6px','important');
    }

    const stage=modal.querySelector('.piece-preview-stage');
    if(stage){
      stage.style.setProperty('flex','1 1 auto','important');
      stage.style.setProperty('min-width','0','important');
      stage.style.setProperty('min-height','0','important');
      stage.style.setProperty('width','100%','important');
      stage.style.setProperty('height','auto','important');
      stage.style.setProperty('border-radius','0','important');
      stage.style.setProperty('overflow','hidden','important');
    }
    return true;
  }

  function scheduleMailAttachmentFullscreen(docId){
    [0,30,120,350,800].forEach(function(delay){
      setTimeout(function(){forceMailAttachmentFullscreen(docId);},delay);
    });
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      #modalRoot .${BUTTON_CLASS}{border:1px solid #c99b2f!important;background:#fff8e6!important;color:#765400!important;font-weight:900!important}
      #modalRoot .${BUTTON_CLASS}[data-count]:not([data-count="1"])::after{content:' (' attr(data-count) ')'!important}
      #modalRoot .${MODAL_CLASS}{position:fixed!important;inset:0!important;z-index:2147483646!important;background:rgba(16,28,45,.42)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;box-sizing:border-box!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-list-modal{width:min(640px,calc(100vw - 28px))!important;max-height:min(76vh,720px)!important;overflow:hidden!important;background:#fff!important;border-radius:12px!important;box-shadow:0 18px 55px rgba(16,28,45,.28)!important;display:flex!important;flex-direction:column!important}
      #modalRoot .${MODAL_CLASS} h5{display:flex!important;align-items:center!important;justify-content:space-between!important;margin:0!important;padding:14px 16px!important;border-bottom:1px solid #dfe6ee!important;color:#162d49!important;font-size:15px!important}
      #modalRoot .${MODAL_CLASS} h5 button{border:0!important;background:transparent!important;font-size:23px!important;line-height:1!important;cursor:pointer!important;color:#53657a!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-list{overflow:auto!important;padding:10px 12px 14px!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-item{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:10px!important;align-items:center!important;padding:10px 4px!important;border-bottom:1px solid #edf1f5!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-item:last-child{border-bottom:0!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-name{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#24364d!important;font-size:13px!important;font-weight:700!important}
      #modalRoot .${MODAL_CLASS} .yaya-mail-pj-view{min-height:36px!important;padding:0 14px!important;border:1px solid #17639f!important;border-radius:8px!important;background:#17639f!important;color:#fff!important;font-weight:800!important;cursor:pointer!important}

      .${ROW_BUTTON_CLASS}{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;min-width:36px!important;max-width:36px!important;height:26px!important;min-height:26px!important;padding:0!important;border:1px solid #d3a53a!important;border-radius:6px!important;background:#fff8e6!important;color:#765400!important;font-size:10.5px!important;font-weight:900!important;line-height:1!important;cursor:pointer!important;white-space:nowrap!important;box-shadow:none!important;justify-self:center!important;align-self:center!important}
      .${ROW_BUTTON_CLASS}:hover{background:#ffefbd!important;border-color:#bd8c16!important}
      .${ROW_BUTTON_CLASS}[data-count]:not([data-count="1"])::after{content:' (' attr(data-count) ')'!important}

      /* PJ sur la même ligne que l'expéditeur et l'objet. */
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:has(.${ROW_BUTTON_CLASS}),
      #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:has(.${ROW_BUTTON_CLASS}){
        grid-template-columns:minmax(125px,.85fr) minmax(0,1.7fr) 44px 92px!important;
      }
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:has(.${ROW_BUTTON_CLASS}) .yaya-mail-sender,
      #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:has(.${ROW_BUTTON_CLASS}) .yaya-mail-restored-sender{grid-column:1!important}
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:has(.${ROW_BUTTON_CLASS}) .yaya-mail-subject,
      #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:has(.${ROW_BUTTON_CLASS}) .yaya-mail-restored-subject{grid-column:2!important}
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:has(.${ROW_BUTTON_CLASS}) .${ROW_BUTTON_CLASS},
      #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:has(.${ROW_BUTTON_CLASS}) .${ROW_BUTTON_CLASS}{grid-column:3!important;grid-row:1!important}
      #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:has(.${ROW_BUTTON_CLASS}) .yaya-detail-charge-cost,
      #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:has(.${ROW_BUTTON_CLASS}) .yaya-mail-restored-date{grid-column:4!important;grid-row:1!important}

      #pane-documents .yaya-doc-mail-row:has(.${ROW_BUTTON_CLASS}){
        grid-template-columns:minmax(190px,.8fr) minmax(320px,1.8fr) 44px minmax(150px,.7fr) 100px!important;
      }
      #pane-documents .yaya-doc-mail-row:has(.${ROW_BUTTON_CLASS}) .yaya-doc-mail-sender{grid-column:1!important}
      #pane-documents .yaya-doc-mail-row:has(.${ROW_BUTTON_CLASS}) .yaya-doc-mail-subject{grid-column:2!important}
      #pane-documents .yaya-doc-mail-row:has(.${ROW_BUTTON_CLASS}) .${ROW_BUTTON_CLASS}{grid-column:3!important;grid-row:1!important}
      #pane-documents .yaya-doc-mail-row:has(.${ROW_BUTTON_CLASS}) .yaya-doc-mail-chantier{grid-column:4!important}
      #pane-documents .yaya-doc-mail-row:has(.${ROW_BUTTON_CLASS}) .yaya-doc-mail-date{grid-column:5!important}

      #pane-mails .mail-last-row:has(.${ROW_BUTTON_CLASS}){
        grid-template-columns:minmax(0,1fr) 155px 82px 36px 32px!important;
      }
      #pane-mails .mail-last-row:has(.${ROW_BUTTON_CLASS}) .${ROW_BUTTON_CLASS}{grid-column:4!important;grid-row:1!important}
      #pane-mails .mail-last-row:has(.${ROW_BUTTON_CLASS}) .mail-last-view{grid-column:5!important;grid-row:1!important}

      #pane-chantiers .message-actions .${ROW_BUTTON_CLASS}{width:36px!important;min-width:36px!important;max-width:36px!important;height:26px!important;padding:0!important;font-size:10.5px!important}
      tr .${ROW_BUTTON_CLASS}{margin-left:6px!important}

      @media(max-width:760px) and (orientation:portrait){
        #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:has(.${ROW_BUTTON_CLASS}),
        #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:has(.${ROW_BUTTON_CLASS}){
          grid-template-columns:minmax(0,1fr) 38px auto!important;
          grid-template-rows:auto auto!important;
          gap:3px 7px!important;
        }
        #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:has(.${ROW_BUTTON_CLASS}) .yaya-mail-sender,
        #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:has(.${ROW_BUTTON_CLASS}) .yaya-mail-restored-sender{grid-column:1!important;grid-row:1!important}
        #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:has(.${ROW_BUTTON_CLASS}) .${ROW_BUTTON_CLASS},
        #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:has(.${ROW_BUTTON_CLASS}) .${ROW_BUTTON_CLASS}{grid-column:2!important;grid-row:1!important}
        #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:has(.${ROW_BUTTON_CLASS}) .yaya-detail-charge-cost,
        #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:has(.${ROW_BUTTON_CLASS}) .yaya-mail-restored-date{grid-column:3!important;grid-row:1!important}
        #pane-chantiers .yaya-detail-mails-pane .yaya-detail-mail-row:has(.${ROW_BUTTON_CLASS}) .yaya-mail-subject,
        #pane-chantiers .yaya-force-mails-pane .yaya-mail-restored-row:has(.${ROW_BUTTON_CLASS}) .yaya-mail-restored-subject{grid-column:1/-1!important;grid-row:2!important}
      }

      #pane-documents .achligne.ligR[data-yaya-mail-pj-hidden="1"],
      #pane-chantiers [data-yaya-mail-pj-hidden="1"]{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function closeList(){
    const overlay=document.querySelector('#modalRoot .'+MODAL_CLASS);
    if(overlay)overlay.remove();
  }

  function openList(mailId){
    const list=attachmentsForMail(mailId);
    if(!list.length)return;
    if(list.length===1){openPiece(list[0]);return;}
    const root=document.getElementById('modalRoot');if(!root)return;
    closeList();
    const overlay=document.createElement('div');overlay.className=MODAL_CLASS;
    overlay.innerHTML=''
      +'<div class="yaya-mail-pj-list-modal" role="dialog" aria-modal="true" aria-label="Pièces jointes du mail">'
      +'<h5>Pièces jointes du mail<button type="button" class="yaya-mail-pj-close" aria-label="Fermer">×</button></h5>'
      +'<div class="yaya-mail-pj-list">'
      +list.map(function(d){return '<div class="yaya-mail-pj-item"><div class="yaya-mail-pj-name" title="'+esc(fileLabel(d))+'">'+esc(fileLabel(d))+'</div><button type="button" class="yaya-mail-pj-view" data-doc-id="'+esc(text(d.id))+'">Voir</button></div>';}).join('')
      +'</div></div>';
    root.appendChild(overlay);
    overlay.addEventListener('click',function(e){
      if(e.target===overlay||e.target.closest('.yaya-mail-pj-close')){e.preventDefault();closeList();return;}
      const btn=e.target.closest('.yaya-mail-pj-view');if(!btn)return;
      e.preventDefault();e.stopPropagation();
      const d=docById(btn.dataset.docId);if(d)openPiece(d);
    });
  }

  function injectModalButton(){
    const modal=document.querySelector('#modalRoot .yaya-mail-body-modal,#modalRoot .message-modal,#modalRoot .yaya-mail-fullscreen-modal');
    if(!modal)return;
    const mailId=mailIdFromModal(modal);if(!mailId)return;
    const list=attachmentsForMail(mailId);
    const actions=modal.querySelector('.yaya-read-actions,.yaya-mail-read-actions');if(!actions)return;
    let btn=actions.querySelector('.'+BUTTON_CLASS);
    if(!list.length){if(btn)btn.remove();return;}
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';btn.className=BUTTON_CLASS;btn.textContent='PJ';
      const close=actions.querySelector('.yaya-close,.btnp');
      if(close)actions.insertBefore(btn,close);else actions.appendChild(btn);
      btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openList(mailId);});
    }
    btn.dataset.count=String(list.length);
    btn.title=list.length===1?'Visualiser la pièce jointe':'Voir les '+list.length+' pièces jointes';
  }

  function actionHostForRow(row){
    if(!row)return null;
    const named=row.querySelector('.message-actions,.mail-actions,.actions,.yaya-mail-actions');
    if(named)return named;
    if(row.matches('tr')){
      const cells=row.querySelectorAll('td,th');
      if(cells.length)return cells[cells.length-1];
    }
    const mailAction=row.querySelector('[data-mail-id],[onclick*="voirMessageYaya"]');
    if(mailAction&&mailAction.parentElement&&mailAction.parentElement!==row)return mailAction.parentElement;
    return row;
  }

  function decorateRow(row){
    const mailId=mailIdFromRow(row);if(!mailId)return;
    const list=attachmentsForMail(mailId);
    let btn=row.querySelector(':scope .'+ROW_BUTTON_CLASS);
    if(!list.length){if(btn)btn.remove();return;}
    const host=actionHostForRow(row);if(!host)return;
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className=ROW_BUTTON_CLASS;
      btn.textContent='PJ';
      btn.dataset.mailId=mailId;
      btn.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        openList(text(this.dataset.mailId));
      });
      host.appendChild(btn);
    }
    btn.dataset.mailId=mailId;
    btn.dataset.count=String(list.length);
    btn.title=list.length===1?'Visualiser la pièce jointe':'Voir les '+list.length+' pièces jointes';
  }

  function injectRowButtons(){
    const seen=new Set();
    const add=function(row){if(!row||seen.has(row))return;seen.add(row);decorateRow(row);};

    document.querySelectorAll(
      '#pane-chantiers .yaya-detail-mail-row,'+
      '#pane-chantiers .yaya-mail-restored-row,'+
      '#pane-chantiers .message-ligne,'+
      '#pane-documents .yaya-doc-mail-row,'+
      '#pane-mails .mail-last-row'
    ).forEach(add);

    document.querySelectorAll('[data-mail-id],[data-yaya-mail-delete],[data-yaya-mail-edit],[onclick*="voirMessageYaya"]').forEach(function(el){
      const row=el.closest('tr,.yaya-detail-mail-row,.yaya-mail-restored-row,.message-ligne,.yaya-doc-mail-row,.mail-last-row');
      if(row)add(row);
    });
  }

  function hideAttachmentRows(root){
    if(!root||!root.querySelectorAll)return;
    const rows=[];
    const selectors='[data-id],[data-row-id]';
    if(root.matches&&root.matches(selectors))rows.push(root);
    root.querySelectorAll(selectors).forEach(function(el){rows.push(el.closest('.achligne,.yaya-detail-document-row,tr,[data-id],[data-row-id]')||el);});
    rows.forEach(function(row){
      const id=text((row.dataset&&row.dataset.id)||'')||
        text(row.querySelector&&row.querySelector('[data-row-id]')&&row.querySelector('[data-row-id]').dataset.rowId)||
        text(row.dataset&&row.dataset.rowId);
      if(!id)return;
      const d=docById(id);if(!isAttachment(d))return;
      row.dataset.yayaMailPjHidden='1';
    });
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;ensureStyle();injectModalButton();injectRowButtons();
      hideAttachmentRows(document.getElementById('pane-documents'));
      hideAttachmentRows(document.getElementById('pane-chantiers'));
    });
  }

  ensureStyle();
  const modalRoot=document.getElementById('modalRoot');
  if(modalRoot)new MutationObserver(schedule).observe(modalRoot,{childList:true,subtree:true});
  ['pane-documents','pane-chantiers','pane-mails'].forEach(function(id){
    const pane=document.getElementById(id);if(pane)new MutationObserver(schedule).observe(pane,{childList:true,subtree:true});
  });
  window.addEventListener('yaya:data-refreshed',schedule);
  window.addEventListener('hashchange',schedule);
  schedule();
})();