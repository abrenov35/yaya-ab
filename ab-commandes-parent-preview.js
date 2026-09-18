// V92 — ouvre les documents AB COMMANDES dans le lecteur principal Yaya
(function(){
  'use strict';

  if(window.__YAYA_AB_COMMANDES_PARENT_PREVIEW_V92)return;
  window.__YAYA_AB_COMMANDES_PARENT_PREVIEW_V92=true;

  const MESSAGE_TYPE='AB_COMMANDES_OPEN_DOCUMENTS_V1';
  const STYLE_ID='yaya-ab-commandes-parent-preview-style';
  let currentDocs=[];
  let currentIndex=0;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .yaya-command-preview-tabs{
        flex:0 0 auto!important;
        display:flex!important;
        align-items:center!important;
        gap:6px!important;
        width:100%!important;
        min-width:0!important;
        padding:6px 4px 7px!important;
        margin:0!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        background:#fff!important;
        border-bottom:1px solid #dde5ef!important;
        scrollbar-width:thin;
      }
      #modalRoot .yaya-command-preview-tab{
        flex:0 0 auto!important;
        max-width:260px!important;
        height:30px!important;
        padding:0 10px!important;
        border:1px solid #c9d4e2!important;
        border-radius:7px!important;
        background:#fff!important;
        color:#314966!important;
        font:800 11px/1 system-ui,-apple-system,Segoe UI,sans-serif!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        cursor:pointer!important;
      }
      #modalRoot .yaya-command-preview-tab.active{
        background:#e9f2ff!important;
        border-color:#6d98c8!important;
        color:#174d82!important;
      }
    `;
    document.head.appendChild(style);
  }

  function commandFrameSource(source){
    try{
      return [...document.querySelectorAll('iframe.yaya-ab-commandes-frame,iframe#yayaAbCommandesFrame')]
        .some(frame=>frame.contentWindow===source);
    }catch(_){return false;}
  }

  function cleanDocs(raw){
    if(!Array.isArray(raw))return [];
    return raw.slice(0,20).map(d=>({
      url:String(d&&d.url||'').trim(),
      name:String(d&&d.name||d&&d.fileName||'Document').trim()||'Document'
    })).filter(d=>/^https:\/\//i.test(d.url));
  }

  function attachTabs(){
    const modal=document.querySelector('#modalRoot .piece-preview-modal');
    if(!modal||currentDocs.length<2)return;

    modal.querySelectorAll('.yaya-command-preview-tabs').forEach(x=>x.remove());

    const tabs=document.createElement('div');
    tabs.className='yaya-command-preview-tabs';
    currentDocs.forEach((doc,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='yaya-command-preview-tab'+(index===currentIndex?' active':'');
      button.textContent='📄 '+doc.name;
      button.title=doc.name;
      button.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        openAt(index);
      });
      tabs.appendChild(button);
    });

    const head=modal.querySelector('.piece-preview-head');
    const stage=modal.querySelector('.piece-preview-stage');
    if(head&&head.parentNode)head.insertAdjacentElement('afterend',tabs);
    else if(stage&&stage.parentNode)stage.parentNode.insertBefore(tabs,stage);
    else modal.insertBefore(tabs,modal.firstChild);
  }

  function scheduleTabs(){
    [0,40,120,280,600].forEach(ms=>setTimeout(attachTabs,ms));
  }

  function openAt(index){
    const doc=currentDocs[index];
    if(!doc)return;
    currentIndex=index;

    if(typeof window.voirPiece==='function'){
      try{
        const out=window.voirPiece(doc.url);
        if(out&&typeof out.catch==='function')out.catch(()=>window.open(doc.url,'_blank','noopener'));
        scheduleTabs();
        return;
      }catch(_){ }
    }

    window.open(doc.url,'_blank','noopener');
  }

  function onMessage(event){
    if(event.origin!==window.location.origin)return;
    const data=event&&event.data;
    if(!data||data.type!==MESSAGE_TYPE)return;
    if(!commandFrameSource(event.source))return;

    const docs=cleanDocs(data.docs);
    if(!docs.length)return;

    installStyle();
    currentDocs=docs;
    currentIndex=0;
    openAt(0);
  }

  installStyle();
  window.addEventListener('message',onMessage,false);
})();