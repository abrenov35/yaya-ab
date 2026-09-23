(function(){
  'use strict';
  if(window.__yayaMailAttachmentsButtonV9)return;
  window.__yayaMailAttachmentsButtonV9=true;
  window.__yayaMailAttachmentsButtonV5=true;
  window.__yayaMailAttachmentsButtonV4=true;
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
  function driveIdFromUrl(value){
    const s=text(value);
    let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    if(m&&m[1])return m[1];
    m=s.match(/[?&]id=([^&#]+)/i);
    return m&&m[1]?decodeURIComponent(m[1]):'';
  }

  function isPdfAttachment(d){
    const name=fileLabel(d);
    const url=text(d&&(d.lien||d.url||d.webUrl||d.downloadUrl));
    return /\.pdf(?:$|[?#])/i.test(name)||/\.pdf(?:$|[?#])/i.test(url);
  }

  function isImageAttachment(d){
    const name=fileLabel(d);
    const url=text(d&&(d.lien||d.url||d.webUrl||d.downloadUrl));
    return /\.(?:jpe?g|png|webp|gif|heic)(?:$|[?#])/i.test(name)||/\.(?:jpe?g|png|webp|gif|heic)(?:$|[?#])/i.test(url);
  }

  function mailAttachmentDownloadUrl(d){
    const url=text(d&&(d.lien||d.url||d.webUrl||d.downloadUrl));
    const id=driveIdFromUrl(url);
    return id?'https://drive.google.com/uc?export=download&id='+encodeURIComponent(id):url;
  }

  function closeMailAttachmentViewer(){
    window.__yayaMailAttachmentPreview=null;
    const root=document.getElementById('modalRoot');
    if(root)root.innerHTML='';
  }

  function deleteMailAttachment(d){
    const id=text(d&&d.id);if(!id)return;
    closeMailAttachmentViewer();
    setTimeout(function(){
      try{if(typeof window.delDocument==='function'){window.delDocument(id);return;}}catch(e){}
      try{if(typeof delDocument==='function')delDocument(id);}catch(e){}
    },0);
  }

  function editMailAttachment(d){
    const id=text(d&&d.id);if(!id)return;
    closeMailAttachmentViewer();
    setTimeout(function(){
      try{if(typeof window.editDocument==='function'){window.editDocument(id);return;}}catch(e){}
      try{if(typeof editDocument==='function')editDocument(id);}catch(e){}
    },0);
  }

  function loadDrivePage(id,page,width,timeoutMs){
    return new Promise(function(resolve,reject){
      const img=new Image();
      let done=false;
      const finish=function(ok){
        if(done)return;done=true;clearTimeout(timer);
        img.onload=img.onerror=null;
        ok?resolve(img):reject(new Error('Page PDF indisponible'));
      };
      const timer=setTimeout(function(){finish(false);},timeoutMs||6000);
      img.onload=function(){finish(img.naturalWidth>80&&img.naturalHeight>80);};
      img.onerror=function(){finish(false);};
      img.src='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/image?pagenumber='+page+'&w='+Math.max(1000,width||1800);
    });
  }

  async function renderMailAttachmentPdf(stage,d,token){
    const url=text(d&&(d.lien||d.url||d.webUrl||d.downloadUrl));
    const id=driveIdFromUrl(url);
    if(!id){
      stage.innerHTML='<div class="yaya-mail-pj-error">Aperçu PDF indisponible. Utilise Télécharger.</div>';
      return;
    }

    stage.innerHTML='<div class="yaya-mail-pj-loading">Chargement du PDF…</div>';
    const viewer=document.createElement('div');
    viewer.className='yaya-mail-pj-scroll';
    stage.replaceChildren(viewer);

    const loading=document.createElement('div');
    loading.className='yaya-mail-pj-loading';
    loading.textContent='Chargement du PDF…';
    viewer.appendChild(loading);

    let count=0;
    const width=Math.max(1200,Math.min(2200,Math.round((stage.clientWidth||1200)*1.55)));

    for(let page=1;page<=80;page++){
      if(stage.dataset.renderToken!==token)return;
      let img;
      try{img=await loadDrivePage(id,page,width,6000);}
      catch(e){
        if(page===1){
          loading.textContent='Aperçu PDF indisponible. Utilise Télécharger.';
        }else if(loading.isConnected){
          loading.remove();
        }
        break;
      }
      if(stage.dataset.renderToken!==token)return;
      if(loading.isConnected)loading.remove();

      const wrap=document.createElement('div');
      wrap.className='yaya-mail-pj-page';
      const label=document.createElement('div');
      label.className='yaya-mail-pj-page-label';
      label.textContent='Page '+page;
      img.alt='Page '+page;
      wrap.append(img,label);
      viewer.appendChild(wrap);
      count++;
    }

    if(count) viewer.scrollTop=0;
  }

  function renderMailAttachmentImage(stage,d,token){
    const url=text(d&&(d.lien||d.url||d.webUrl||d.downloadUrl));
    const id=driveIdFromUrl(url);
    const img=document.createElement('img');
    img.className='yaya-mail-pj-image';
    img.alt=fileLabel(d);
    img.src=id?'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w2200':url;
    stage.replaceChildren(img);
    stage.dataset.renderToken=token;
  }

  function renderMailAttachmentFallback(stage,d,token){
    const url=text(d&&(d.lien||d.url||d.webUrl||d.downloadUrl));
    const iframe=document.createElement('iframe');
    iframe.className='yaya-mail-pj-fallback-frame';
    iframe.src=url;
    iframe.title=fileLabel(d);
    stage.replaceChildren(iframe);
    stage.dataset.renderToken=token;
  }

  function buildMailAttachmentViewer(list,activeId){
    const root=document.getElementById('modalRoot');
    if(!root||!list.length)return;

    const active=list.find(function(item){return text(item&&item.id)===text(activeId);})||list[0];
    window.__yayaMailAttachmentPreview={
      mailId:linkedMailId(active),
      ids:list.map(function(item){return text(item&&item.id);}).filter(Boolean),
      activeId:text(active.id)
    };

    root.innerHTML=''
      +'<div class="overlay yaya-mail-pj-viewer-overlay">'
      +'<div class="modal yaya-mail-pj-viewer-modal">'
      +'<div class="yaya-mail-pj-viewer-head">'
      +'<div class="yaya-mail-pj-viewer-switch"></div>'
      +'<div class="yaya-mail-pj-viewer-name"></div>'
      +'<div class="yaya-mail-pj-viewer-actions">'
      +'<button type="button" class="btn2 yaya-mail-pj-edit">Modifier</button>'
      +'<button type="button" class="btnp yaya-mail-pj-download">Télécharger</button>'
      +'<button type="button" class="btn2 yaya-mail-pj-delete">Supprimer</button>'
      +'<button type="button" class="btn2 yaya-mail-pj-close">Fermer</button>'
      +'</div></div>'
      +'<div class="yaya-mail-pj-viewer-stage"></div>'
      +'</div></div>';

    const modal=root.querySelector('.yaya-mail-pj-viewer-modal');
    const stage=root.querySelector('.yaya-mail-pj-viewer-stage');
    const name=root.querySelector('.yaya-mail-pj-viewer-name');
    const switcher=root.querySelector('.yaya-mail-pj-viewer-switch');

    function activate(d){
      if(!d)return;
      const token=Date.now()+'_'+Math.random().toString(36).slice(2);
      stage.dataset.renderToken=token;
      name.textContent=fileLabel(d);
      window.__yayaMailAttachmentPreview.activeId=text(d.id);

      switcher.querySelectorAll('button').forEach(function(btn){
        btn.classList.toggle('active',text(btn.dataset.id)===text(d.id));
      });

      const dl=root.querySelector('.yaya-mail-pj-download');
      dl.onclick=function(){
        const href=mailAttachmentDownloadUrl(d);
        if(href)window.open(href,'_blank','noopener');
      };
      root.querySelector('.yaya-mail-pj-edit').onclick=function(){editMailAttachment(d);};
      root.querySelector('.yaya-mail-pj-delete').onclick=function(){deleteMailAttachment(d);};

      if(isPdfAttachment(d)){
        renderMailAttachmentPdf(stage,d,token);
      }else if(isImageAttachment(d)){
        renderMailAttachmentImage(stage,d,token);
      }else{
        renderMailAttachmentFallback(stage,d,token);
      }
    }

    list.forEach(function(d,index){
      const btn=document.createElement('button');
      btn.type='button';
      btn.textContent='Pièce '+(index+1);
      btn.dataset.id=text(d.id);
      btn.title=fileLabel(d);
      btn.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();activate(d);
      });
      switcher.appendChild(btn);
    });

    root.querySelector('.yaya-mail-pj-close').onclick=closeMailAttachmentViewer;
    const overlay=root.querySelector('.yaya-mail-pj-viewer-overlay');
    overlay.addEventListener('click',function(e){if(e.target===overlay)closeMailAttachmentViewer();});

    activate(active);
  }

  function openPiece(d,knownList){
    if(!d)return;
    const list=Array.isArray(knownList)&&knownList.length?knownList:attachmentsForMail(linkedMailId(d));
    buildMailAttachmentViewer(list,text(d.id));
  }
  function fileLabel(d){return text(d.pieceNom||d.titre||d.nomFichier||d.filename||d.fileName)||'Pièce jointe';}

  function injectAttachmentChoices(){
    const context=window.__yayaMailAttachmentPreview;
    if(!context||!Array.isArray(context.ids)||context.ids.length<2)return false;
    const currentId=text(window.__yayaUnifiedPreviewDocumentId||window.__yayaPreviewDocumentId);
    if(currentId&&context.ids.indexOf(currentId)===-1){window.__yayaMailAttachmentPreview=null;return false;}
    const modal=document.querySelector('#modalRoot .piece-preview-modal');if(!modal)return false;
    const head=modal.querySelector('.piece-preview-head');if(!head)return false;
    let group=head.querySelector(':scope > .yaya-mail-pj-switcher');
    if(!group){
      group=document.createElement('span');
      group.className='yaya-mail-pj-switcher';
      head.insertBefore(group,head.firstChild||null);
    }
    group.replaceChildren();
    context.ids.forEach(function(id,index){
      const d=docById(id);if(!d)return;
      const button=document.createElement('button');
      button.type='button';button.className='yaya-mail-pj-choice';button.textContent='Pièce '+(index+1);
      button.title=fileLabel(d);
      if(id===text(context.activeId))button.classList.add('active');
      button.addEventListener('click',function(event){
        event.preventDefault();event.stopPropagation();
        if(id===text(window.__yayaMailAttachmentPreview&&window.__yayaMailAttachmentPreview.activeId))return;
        const list=context.ids.map(docById).filter(Boolean);
        openPiece(d,list);
      });
      group.appendChild(button);
    });
    return true;
  }

  function scheduleAttachmentChoices(){ return false; }

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
    // Une seule stabilisation : les anciens 5 redimensionnements successifs
    // faisaient clignoter l'aperçu des PJ mail.
    requestAnimationFrame(function(){
      const modal=document.querySelector('#modalRoot .piece-preview-modal');
      if(!modal)return;
      modal.dataset.yayaMailPjStable='1';
      modal.dataset.yayaPreviewFullscreen='1';
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

      #modalRoot .yaya-mail-pj-switcher{display:inline-flex!important;align-items:center!important;gap:4px!important;padding:3px!important;border:1px solid #c7d5e4!important;border-radius:9px!important;background:#edf3f8!important;flex:0 0 auto!important;max-width:100%!important;overflow-x:auto!important}
      #modalRoot .yaya-mail-pj-switcher .yaya-mail-pj-choice{min-height:31px!important;height:31px!important;padding:0 11px!important;border:1px solid transparent!important;border-radius:6px!important;background:transparent!important;color:#34516f!important;font-size:11.5px!important;font-weight:800!important;box-shadow:none!important}
      #modalRoot .yaya-mail-pj-switcher .yaya-mail-pj-choice.active{border-color:#17639f!important;background:#17639f!important;color:#fff!important}

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

      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row:has(.${ROW_BUTTON_CLASS}) .${ROW_BUTTON_CLASS}{
        grid-column:4!important;grid-row:1!important;display:inline-flex!important;visibility:visible!important;opacity:1!important;
        justify-self:center!important;align-self:center!important;position:relative!important;z-index:5!important;
      }
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

      #modalRoot .yaya-mail-pj-viewer-overlay{
        position:fixed!important;inset:0!important;z-index:2147483646!important;
        display:flex!important;align-items:stretch!important;justify-content:stretch!important;
        padding:6px!important;box-sizing:border-box!important;background:rgba(14,28,46,.18)!important;
        overflow:hidden!important;
      }
      #modalRoot .yaya-mail-pj-viewer-modal{
        width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;
        margin:0!important;padding:0!important;border-radius:10px!important;background:#fff!important;
        display:flex!important;flex-direction:column!important;overflow:hidden!important;box-sizing:border-box!important;
      }
      #modalRoot .yaya-mail-pj-viewer-head{
        flex:0 0 auto!important;display:grid!important;
        grid-template-columns:auto minmax(180px,1fr) auto!important;
        grid-template-areas:"switch name actions"!important;gap:14px!important;align-items:center!important;
        min-height:58px!important;padding:7px 12px!important;border-bottom:1px solid #dbe3ec!important;background:#fff!important;
      }
      #modalRoot .yaya-mail-pj-viewer-switch{
        grid-area:switch!important;display:inline-flex!important;gap:4px!important;padding:3px!important;
        border:1px solid #c7d5e4!important;border-radius:9px!important;background:#edf3f8!important;overflow-x:auto!important;
      }
      #modalRoot .yaya-mail-pj-viewer-switch button{
        min-height:34px!important;padding:0 12px!important;border:1px solid transparent!important;border-radius:7px!important;
        background:transparent!important;color:#34516f!important;font-size:12px!important;font-weight:800!important;white-space:nowrap!important;
      }
      #modalRoot .yaya-mail-pj-viewer-switch button.active{
        border-color:#17639f!important;background:#17639f!important;color:#fff!important;
      }
      #modalRoot .yaya-mail-pj-viewer-name{
        grid-area:name!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;
        color:#142d4a!important;font-size:14px!important;font-weight:850!important;
      }
      #modalRoot .yaya-mail-pj-viewer-actions{
        grid-area:actions!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;
      }
      #modalRoot .yaya-mail-pj-viewer-actions button{
        height:40px!important;min-height:40px!important;padding:0 15px!important;border-radius:8px!important;font-size:12px!important;font-weight:800!important;
      }
      #modalRoot .yaya-mail-pj-download{background:#26824f!important;border-color:#26824f!important;color:#fff!important}
      #modalRoot .yaya-mail-pj-delete{background:#fff5f3!important;border-color:#f1aaa1!important;color:#c82921!important}
      #modalRoot .yaya-mail-pj-viewer-stage{
        flex:1 1 auto!important;min-height:0!important;position:relative!important;overflow:hidden!important;background:#edf1f5!important;
      }
      #modalRoot .yaya-mail-pj-scroll{
        width:100%!important;height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;
        box-sizing:border-box!important;padding:10px 0 28px!important;background:#edf1f5!important;
        overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;
      }
      #modalRoot .yaya-mail-pj-page{
        position:relative!important;width:min(96%,1200px)!important;margin:0 auto 14px!important;background:#fff!important;
        box-shadow:0 1px 8px rgba(18,38,61,.18)!important;
      }
      #modalRoot .yaya-mail-pj-page img{
        display:block!important;width:100%!important;height:auto!important;max-width:100%!important;max-height:none!important;margin:0!important;
      }
      #modalRoot .yaya-mail-pj-page-label{
        position:absolute!important;right:10px!important;bottom:8px!important;padding:3px 7px!important;border-radius:11px!important;
        background:rgba(18,40,64,.78)!important;color:#fff!important;font-size:10px!important;font-weight:800!important;
      }
      #modalRoot .yaya-mail-pj-loading,#modalRoot .yaya-mail-pj-error{
        padding:28px!important;text-align:center!important;color:#36506c!important;font-weight:700!important;
      }
      #modalRoot .yaya-mail-pj-image{
        display:block!important;max-width:100%!important;max-height:none!important;width:auto!important;height:auto!important;margin:12px auto 28px!important;
      }
      #modalRoot .yaya-mail-pj-fallback-frame{
        display:block!important;width:100%!important;height:100%!important;border:0!important;background:#fff!important;
      }
      @media(max-width:760px){
        #modalRoot .yaya-mail-pj-viewer-overlay{padding:3px!important}
        #modalRoot .yaya-mail-pj-viewer-modal{border-radius:6px!important}
        #modalRoot .yaya-mail-pj-viewer-head{
          grid-template-columns:minmax(0,1fr) auto!important;
          grid-template-areas:"switch name" "actions actions"!important;gap:6px 8px!important;padding:5px 7px!important;
        }
        #modalRoot .yaya-mail-pj-viewer-name{font-size:11.5px!important;text-align:right!important}
        #modalRoot .yaya-mail-pj-viewer-actions{justify-content:flex-start!important;overflow-x:auto!important;gap:6px!important}
        #modalRoot .yaya-mail-pj-viewer-actions button{height:34px!important;min-height:34px!important;padding:0 10px!important;font-size:11px!important}
        #modalRoot .yaya-mail-pj-page{width:100%!important;margin-bottom:10px!important}
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
    closeList();
    openPiece(list[0],list);
  }

  window.yayaOpenMailAttachments=openList;

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
      '#pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row,'+
      '#pane-chantiers .message-ligne,'+
      '#pane-documents .yaya-doc-mail-row,'+
      '#pane-documents .achligne.ligR[data-yaya-kind="mail"],'+
      '#pane-mails .mail-last-row'
    ).forEach(add);

    document.querySelectorAll('[data-mail-id],[data-yaya-mail-delete],[data-yaya-mail-edit],[onclick*="voirMessageYaya"]').forEach(function(el){
      const row=el.closest('tr,.yaya-detail-mail-row,.yaya-mail-restored-row,.yaya-detail-document-row,.message-ligne,.yaya-doc-mail-row,.achligne.ligR,.mail-last-row');
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
      injectAttachmentChoices();
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
  function scheduleBurst(){
    schedule();
    [50,150,400,900].forEach(function(delay){
      setTimeout(schedule,delay);
    });
  }

  function installRenderHook(){
    if(typeof window.render!=='function'){
      setTimeout(installRenderHook,150);
      return;
    }
    if(window.render.__yayaMailPjPersistentV6)return;
    const original=window.render;
    const wrapped=function(){
      const result=original.apply(this,arguments);
      scheduleBurst();
      return result;
    };
    wrapped.__yayaMailPjPersistentV6=true;
    wrapped.__yayaOriginalRender=original;
    window.render=wrapped;
    try{render=wrapped;}catch(e){}
  }

  window.yayaRefreshMailPjButtons=scheduleBurst;
  window.addEventListener('yaya:data-refreshed',scheduleBurst);
  window.addEventListener('hashchange',scheduleBurst);
  window.addEventListener('focus',scheduleBurst);
  installRenderHook();
  scheduleBurst();
})();
