(function(){
  'use strict';
  if(window.__yayaGlobalModalActionsV1)return;
  window.__yayaGlobalModalActionsV1=true;

  const ROOT_ID='modalRoot';
  const STYLE_ID='yaya-global-modal-actions-v1';
  const FRAME_STYLE_ID='yaya-global-modal-actions-frame-v1';
  let raf=0;
  let lastPieceUrl='';

  function text(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function label(btn){return text((btn&&btn.textContent||'')+' '+(btn&&btn.getAttribute&&btn.getAttribute('aria-label')||''));}
  function isDelete(btn){return /^supprimer\b/i.test(label(btn));}
  function isEdit(btn){return /^modifier(?:\s+l[’']objet)?\b/i.test(label(btn));}
  function isClose(btn){return /^fermer\b/i.test(label(btn));}

  function mainCss(scope){return `
    ${scope} .modal>h5,
    ${scope} .piece-preview-head{
      display:flex!important;
      align-items:center!important;
      gap:9px!important;
      box-sizing:border-box!important;
    }
    ${scope} .modal>h5>span:first-child,
    ${scope} .piece-preview-head>span:first-child{
      margin-right:auto!important;
      min-width:0!important;
    }
    ${scope} .yaya-read-actions,
    ${scope} .yaya-mail-read-actions,
    ${scope} .yaya-global-actions,
    ${scope} .modal-actions,
    ${scope} .mfoot{
      display:flex!important;
      flex-direction:row!important;
      align-items:center!important;
      flex-wrap:nowrap!important;
      gap:9px!important;
      width:100%!important;
      box-sizing:border-box!important;
      overflow-x:auto!important;
      overflow-y:hidden!important;
    }
    ${scope} .yaya-read-actions button,
    ${scope} .yaya-mail-read-actions button,
    ${scope} .yaya-global-actions button,
    ${scope} .modal-actions button,
    ${scope} .mfoot button,
    ${scope} .piece-preview-head button,
    ${scope} .modal>h5>button{
      flex:0 0 auto!important;
      min-height:40px!important;
      height:40px!important;
      margin-top:0!important;
      margin-bottom:0!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      box-sizing:border-box!important;
      white-space:nowrap!important;
      vertical-align:middle!important;
    }
    ${scope} .yaya-read-actions .yaya-delete,
    ${scope} .yaya-mail-read-actions .yaya-delete,
    ${scope} .yaya-global-actions .yaya-delete,
    ${scope} .modal-actions .yaya-delete,
    ${scope} .mfoot .yaya-delete{
      margin-left:0!important;
      margin-right:auto!important;
    }
    ${scope} .yaya-global-actions{
      margin:8px 0 12px!important;
      padding:0 0 10px!important;
      border-bottom:1px solid #dfe6ee!important;
    }
    ${scope} .yaya-download{
      min-height:36px!important;
      height:36px!important;
      padding:0 13px!important;
      border:1px solid #2d7d46!important;
      border-radius:8px!important;
      background:#2d7d46!important;
      color:#fff!important;
      font-size:12.5px!important;
      font-weight:800!important;
      cursor:pointer!important;
    }
    @media(max-width:640px){
      ${scope} .yaya-read-actions,
      ${scope} .yaya-mail-read-actions,
      ${scope} .yaya-global-actions,
      ${scope} .modal-actions,
      ${scope} .mfoot{gap:6px!important;}
      ${scope} .yaya-read-actions button,
      ${scope} .yaya-mail-read-actions button,
      ${scope} .yaya-global-actions button,
      ${scope} .modal-actions button,
      ${scope} .mfoot button,
      ${scope} .piece-preview-head button,
      ${scope} .modal>h5>button{
        min-height:38px!important;
        height:38px!important;
        padding-left:9px!important;
        padding-right:9px!important;
        font-size:11.5px!important;
      }
      ${scope} .yaya-download{min-height:34px!important;height:34px!important;}
    }
  `;}

  function installStyle(doc){
    if(!doc||doc.getElementById(STYLE_ID))return;
    const s=doc.createElement('style');
    s.id=STYLE_ID;
    s.textContent=mainCss('#'+ROOT_ID);
    (doc.head||doc.documentElement).appendChild(s);
  }

  function installFrameStyle(doc){
    if(!doc||doc.getElementById(FRAME_STYLE_ID))return;
    const s=doc.createElement('style');
    s.id=FRAME_STYLE_ID;
    s.textContent=mainCss('body');
    (doc.head||doc.documentElement).appendChild(s);
  }

  function closeModalSafe(){
    try{if(typeof window.closeModal==='function')return window.closeModal();}catch(e){}
    const root=document.getElementById(ROOT_ID);if(root)root.innerHTML='';
  }

  function ensureTopActions(modal){
    if(!modal)return;
    if(!modal.matches('.message-modal,.yaya-mail-body-modal'))return;

    const head=modal.querySelector(':scope > h5');
    if(!head)return;

    const all=[...modal.querySelectorAll('button')];
    const del=all.find(b=>!b.closest('h5')&&isDelete(b))||null;
    const edit=all.find(b=>!b.closest('h5')&&isEdit(b))||null;
    const headerClose=[...head.querySelectorAll(':scope > button')].find(isClose)||null;
    let bar=modal.querySelector(':scope > .yaya-global-actions,:scope > .yaya-read-actions,:scope > .yaya-mail-read-actions');

    if(!del&&!edit&&!bar)return;
    if(!bar){
      bar=document.createElement('div');
      bar.className='yaya-global-actions';
      head.insertAdjacentElement('afterend',bar);
    }else{
      bar.classList.add('yaya-global-actions');
      if(bar.previousElementSibling!==head)head.insertAdjacentElement('afterend',bar);
    }

    let d=del||[...bar.querySelectorAll('button')].find(isDelete)||null;
    let e=edit||[...bar.querySelectorAll('button')].find(isEdit)||null;
    let c=[...bar.querySelectorAll('button')].find(isClose)||headerClose||null;

    if(d){d.classList.add('yaya-delete');if(d.parentElement!==bar)bar.appendChild(d);}
    if(e){e.classList.add('yaya-edit');if(e.parentElement!==bar)bar.appendChild(e);}
    if(c){c.classList.add('yaya-close');if(c.parentElement!==bar)bar.appendChild(c);}
    if(!c){
      c=document.createElement('button');
      c.type='button';c.className='btnp yaya-close';c.textContent='Fermer';
      c.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();closeModalSafe();});
      bar.appendChild(c);
    }

    if(d&&bar.firstElementChild!==d)bar.insertBefore(d,bar.firstElementChild);
    if(e&&e.nextElementSibling!==c)bar.insertBefore(e,c);
    if(bar.lastElementChild!==c)bar.appendChild(c);
  }

  function decorateActionBars(root){
    if(!root||!root.querySelectorAll)return;
    root.querySelectorAll('.yaya-read-actions,.yaya-mail-read-actions,.yaya-global-actions,.modal-actions,.mfoot').forEach(function(bar){
      [...bar.querySelectorAll('button')].forEach(function(btn){
        if(isDelete(btn))btn.classList.add('yaya-delete');
        if(isEdit(btn))btn.classList.add('yaya-edit');
        if(isClose(btn))btn.classList.add('yaya-close');
      });
    });
  }

  function driveId(url){const m=String(url||'').match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);return m&&m[1]?m[1]:'';}
  function isImageUrl(url){return /\.(?:jpe?g|png|webp|gif|bmp|svg)(?:[?#]|$)/i.test(String(url||''));}
  function isPdfUrl(url){return /\.pdf(?:[?#]|$)/i.test(String(url||''));}

  function candidateUrl(modal){
    if(!modal)return '';
    const tagged=text(modal.dataset&&modal.dataset.yayaDownloadUrl);if(tagged)return tagged;
    const viewer=modal.querySelector('iframe[src],embed[src],object[data]');
    if(viewer){const u=text(viewer.getAttribute('src')||viewer.getAttribute('data'));if(u)return u;}
    const link=[...modal.querySelectorAll('a[href]')].map(a=>text(a.href||a.getAttribute('href'))).find(Boolean);if(link)return link;
    return text(lastPieceUrl||window.__yayaLastPieceUrl||'');
  }

  function isPdfViewer(modal,url){
    if(!modal)return false;
    if(modal.querySelector('.piece-pdf-pages,.piece-drive-pages-stage'))return true;
    if(isPdfUrl(url))return true;
    if(driveId(url)&&modal.querySelector('.piece-preview-stage,iframe,embed,object'))return true;
    if(url&&!isImageUrl(url)&&modal.classList.contains('piece-preview-modal'))return true;
    return false;
  }

  function downloadUrl(url){
    url=text(url);if(!url)return;
    const id=driveId(url);
    let target=url;
    if(id)target='https://drive.google.com/uc?export=download&id='+encodeURIComponent(id);
    else if(/dropbox\.com/i.test(target)){
      try{const u=new URL(target);u.searchParams.delete('raw');u.searchParams.set('dl','1');target=u.toString();}catch(e){}
    }else if(/1drv\.ms|onedrive\.live\.com|sharepoint\.com/i.test(target)){
      try{const u=new URL(target);u.searchParams.set('download','1');target=u.toString();}catch(e){}
    }
    const a=document.createElement('a');
    a.href=target;a.target='_blank';a.rel='noopener';a.download='';
    document.body.appendChild(a);a.click();a.remove();
  }

  function addDownload(modal){
    if(!modal)return;
    const url=candidateUrl(modal);
    if(!url||!isPdfViewer(modal,url))return;
    modal.dataset.yayaDownloadUrl=url;

    const head=modal.querySelector(':scope > .piece-preview-head,:scope > h5');
    if(!head)return;
    let btn=head.querySelector(':scope > .yaya-download');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';btn.className='yaya-download';btn.textContent='Télécharger';
      btn.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();downloadUrl(btn.dataset.url);});
      const close=[...head.querySelectorAll(':scope > button')].find(isClose)||null;
      if(close)head.insertBefore(btn,close);else head.appendChild(btn);
    }
    btn.dataset.url=url;
  }

  function wrapVoirPiece(){
    const current=window.voirPiece;
    if(typeof current!=='function'||current.__yayaGlobalDownloadWrappedV1)return;
    const wrapped=function(url){
      lastPieceUrl=text(url);window.__yayaLastPieceUrl=lastPieceUrl;
      const result=current.apply(this,arguments);
      schedule();
      return result;
    };
    wrapped.__yayaGlobalDownloadWrappedV1=true;
    wrapped.__yayaPreviousVoirPiece=current;
    window.voirPiece=wrapped;
  }

  function watchFrame(frame){
    if(!frame||frame.__yayaGlobalModalFrameV1)return;
    frame.__yayaGlobalModalFrameV1=true;
    function bind(){
      try{
        const doc=frame.contentDocument;
        if(!doc||!doc.documentElement)return;
        installFrameStyle(doc);
        decorateActionBars(doc);
        if(doc.__yayaGlobalModalObserverV1)return;
        doc.__yayaGlobalModalObserverV1=true;
        new MutationObserver(function(){decorateActionBars(doc);}).observe(doc.documentElement,{childList:true,subtree:true});
      }catch(e){}
    }
    frame.addEventListener('load',bind,{passive:true});
    bind();
  }

  function apply(){
    installStyle(document);
    wrapVoirPiece();
    const root=document.getElementById(ROOT_ID);if(!root)return;
    root.querySelectorAll('.message-modal,.yaya-mail-body-modal').forEach(ensureTopActions);
    decorateActionBars(root);
    root.querySelectorAll('.modal').forEach(addDownload);
    document.querySelectorAll('iframe').forEach(watchFrame);
  }

  function schedule(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;apply();});}

  function install(){
    apply();
    const root=document.getElementById(ROOT_ID);
    if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['src','data']});
    new MutationObserver(function(muts){
      for(const m of muts){if(m.addedNodes&&m.addedNodes.length){schedule();break;}}
    }).observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(apply,80);setTimeout(apply,300);setTimeout(apply,1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
