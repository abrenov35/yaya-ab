(function(){
  'use strict';

  const previousVoirPiece=window.voirPiece;
  if(typeof previousVoirPiece!=='function')return;

  const API_FALLBACK='https://script.google.com/macros/s/AKfycbx6IwMFf2plAq7i8qf8qF6f6MMC-1-WynAqn1ZRqCZrVqHeE9a1ygSSTzp5uOf0L3bn/exec';
  let pdfJsPromise=null;

  function apiUrl(){
    try{if(typeof API!=='undefined'&&API)return String(API);}catch(e){}
    return API_FALLBACK;
  }

  function driveIdFromUrl(value){
    const s=String(value||'').trim();
    let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    if(m)return m[1];
    m=s.match(/[?&]id=([^&#]+)/i);
    return m?decodeURIComponent(m[1]):'';
  }

  function ensurePdfJs(){
    if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
    if(pdfJsPromise)return pdfJsPromise;
    pdfJsPromise=new Promise(function(resolve,reject){
      const script=document.createElement('script');
      script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async=true;
      script.onload=function(){
        if(!window.pdfjsLib){reject(new Error('PDF.js indisponible'));return;}
        try{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}catch(e){}
        resolve(window.pdfjsLib);
      };
      script.onerror=function(){reject(new Error('Chargement PDF.js impossible'));};
      document.head.appendChild(script);
    }).catch(function(err){pdfJsPromise=null;throw err;});
    return pdfJsPromise;
  }

  function makeModal(root){
    root.replaceChildren();
    const overlay=document.createElement('div');
    overlay.className='overlay piece-preview-overlay';
    overlay.onclick=function(e){if(e.target===overlay&&typeof window.closeModal==='function')window.closeModal();};

    const modal=document.createElement('div');
    modal.className='modal piece-modal piece-preview-modal';

    const head=document.createElement('h5');
    head.className='piece-preview-head';
    const title=document.createElement('span');
    title.textContent='Pièce jointe';
    const close=document.createElement('button');
    close.type='button';
    close.textContent='Fermer';
    close.onclick=function(){if(typeof window.closeModal==='function')window.closeModal();};
    head.append(title,close);

    const stage=document.createElement('div');
    stage.className='piece-preview-stage';
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);
    return {overlay:overlay,modal:modal,stage:stage};
  }

  function showFastThumbnail(root,id){
    const ui=makeModal(root);
    ui.stage.classList.add('piece-image-stage');
    ui.stage.style.position='relative';

    const loading=document.createElement('div');
    loading.className='piece-preview-loading';
    loading.textContent='Chargement du document…';
    loading.style.position='absolute';
    loading.style.inset='0';
    loading.style.zIndex='1';
    ui.stage.appendChild(loading);

    const img=document.createElement('img');
    img.alt='Aperçu de la pièce jointe';
    img.style.opacity='0';
    img.style.transition='opacity .12s ease';
    img.src='https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1600';
    img.onload=function(){
      loading.style.display='none';
      img.style.opacity='1';
    };
    img.onerror=function(){img.remove();};
    ui.stage.appendChild(img);
    return ui;
  }

  async function fetchDriveFile(url,id){
    const response=await fetch(apiUrl(),{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'getDriveFile',data:{url:String(url||''),id:String(id||'')}})
    });
    if(!response.ok)throw new Error('API Yaya HTTP '+response.status);
    const json=await response.json();
    if(!json||json.ok!==true)throw new Error(json&&json.error?json.error:'Lecture Drive indisponible');
    const data=json.data||{};
    if(!data.base64)throw new Error('Fichier Drive vide');
    return data;
  }

  function base64ToBytes(base64){
    const raw=atob(String(base64||''));
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    return bytes;
  }

  function showImageBase64(ui,data){
    if(!ui||!ui.stage||!ui.modal.isConnected)return;
    ui.stage.className='piece-preview-stage piece-image-stage';
    ui.stage.replaceChildren();
    const img=document.createElement('img');
    img.alt=data.filename||'Pièce jointe';
    img.src='data:'+(data.mimeType||'image/jpeg')+';base64,'+data.base64;
    ui.stage.appendChild(img);
  }

  async function renderPdf(ui,data){
    if(!ui||!ui.modal.isConnected)return;
    const pdfjs=await ensurePdfJs();
    if(!ui.modal.isConnected)return;

    const task=pdfjs.getDocument({data:base64ToBytes(data.base64),disableWorker:true});
    const pdf=await task.promise;
    if(!ui.modal.isConnected)return;

    ui.stage.className='piece-preview-stage';
    ui.stage.replaceChildren();
    ui.stage.style.position='relative';

    const viewer=document.createElement('div');
    viewer.className='piece-pdf-pages';
    viewer.style.height='100%';
    viewer.style.width='100%';
    viewer.style.overflow='hidden';

    const pageSlot=document.createElement('div');
    pageSlot.className='piece-pdf-page';
    pageSlot.style.height='100%';
    pageSlot.style.minHeight='100%';
    viewer.appendChild(pageSlot);

    const nav=document.createElement('div');
    nav.style.cssText='position:absolute;left:50%;bottom:8px;transform:translateX(-50%);z-index:8;display:flex;align-items:center;gap:6px;padding:5px 7px;border-radius:18px;background:rgba(15,23,42,.82);color:#fff;font-size:11px;';
    const prev=document.createElement('button');
    prev.type='button';prev.textContent='‹';
    const info=document.createElement('span');
    const next=document.createElement('button');
    next.type='button';next.textContent='›';
    [prev,next].forEach(function(btn){btn.style.cssText='width:28px;height:26px;padding:0;border:0;border-radius:13px;background:#fff;color:#162D49;font-size:18px;font-weight:700;';});
    nav.append(prev,info,next);

    ui.stage.append(viewer,nav);

    let current=1;
    let rendering=false;
    let queuedPage=null;
    let rerenderRequested=false;

    function isFullscreen(){
      return ui.modal.dataset.yayaPreviewFullscreen==='1';
    }

    function updateNav(){
      info.textContent='Page '+current+' / '+pdf.numPages;
      prev.disabled=current<=1;
      next.disabled=current>=pdf.numPages;
      prev.style.opacity=prev.disabled?'.4':'1';
      next.style.opacity=next.disabled?'.4':'1';
    }

    async function draw(pageNumber,force){
      pageNumber=Math.max(1,Math.min(pdf.numPages,Number(pageNumber)||1));

      if(rendering){
        queuedPage=pageNumber;
        if(force)rerenderRequested=true;
        return;
      }

      rendering=true;

      try{
        current=pageNumber;
        updateNav();

        const full=isFullscreen();
        pageSlot.innerHTML='<div class="piece-preview-loading">Chargement de la page…</div>';

        const page=await pdf.getPage(current);
        if(!ui.modal.isConnected)return;

        const raw=page.getViewport({scale:1});
        const w=Math.max(120,viewer.clientWidth||ui.stage.clientWidth||600);
        const h=Math.max(120,viewer.clientHeight||ui.stage.clientHeight||600);
        const widthScale=Math.max(.05,(w-16)/raw.width);
        const heightScale=Math.max(.05,(h-16)/raw.height);
        const cssScale=full?widthScale:Math.min(widthScale,heightScale);
        const cssWidth=Math.max(1,Math.floor(raw.width*cssScale));
        const cssHeight=Math.max(1,Math.floor(raw.height*cssScale));
        const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));

        viewer.style.setProperty('overflow-x','hidden','important');
        viewer.style.setProperty('overflow-y',full?'auto':'hidden','important');
        viewer.style.setProperty('scroll-behavior',full?'auto':'smooth','important');
        viewer.style.setProperty('scroll-snap-type','none','important');

        if(full){
          pageSlot.style.setProperty('height',(cssHeight+8)+'px','important');
          pageSlot.style.setProperty('min-height',(cssHeight+8)+'px','important');
          pageSlot.style.setProperty('align-items','flex-start','important');
          pageSlot.style.setProperty('overflow','visible','important');
        }else{
          pageSlot.style.setProperty('height','100%','important');
          pageSlot.style.setProperty('min-height','100%','important');
          pageSlot.style.setProperty('align-items','center','important');
          pageSlot.style.setProperty('overflow','hidden','important');
        }

        const viewport=page.getViewport({scale:cssScale*dpr});
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.floor(viewport.width));
        canvas.height=Math.max(1,Math.floor(viewport.height));
        canvas.style.setProperty('width',cssWidth+'px','important');
        canvas.style.setProperty('height',cssHeight+'px','important');
        canvas.style.setProperty('max-width','100%','important');
        canvas.style.setProperty('max-height',full?'none':'100%','important');

        pageSlot.replaceChildren(canvas);

        await page.render({
          canvasContext:canvas.getContext('2d'),
          viewport:viewport
        }).promise;

        if(full)viewer.scrollTop=0;

      }finally{
        rendering=false;

        if(queuedPage!=null||rerenderRequested){
          const q=queuedPage==null?current:queuedPage;
          const forceAgain=rerenderRequested;
          queuedPage=null;
          rerenderRequested=false;
          draw(q,forceAgain);
        }
      }
    }

    prev.onclick=function(e){e.preventDefault();e.stopPropagation();if(current>1)draw(current-1,true);};
    next.onclick=function(e){e.preventDefault();e.stopPropagation();if(current<pdf.numPages)draw(current+1,true);};
    nav.onclick=function(e){e.stopPropagation();};

    ui.modal.__yayaRedrawPdf=function(){
      return draw(current,true);
    };

    const cleanup=new MutationObserver(function(){
      if(!ui.modal.isConnected){
        cleanup.disconnect();
        try{task.destroy();}catch(e){}
      }
    });
    cleanup.observe(document.documentElement,{childList:true,subtree:true});

    updateNav();
    await draw(1,true);
  }

  window.voirPiece=async function(url){
    const value=String(url||'').trim();
    if(!value)return;
    const id=driveIdFromUrl(value);
    if(!id)return previousVoirPiece(value);

    const root=document.getElementById('modalRoot');
    if(!root)return previousVoirPiece(value);

    // Affichage immédiat d'une vignette Drive, pendant que le fichier complet
    // est récupéré en arrière-plan via l'API Yaya. On n'utilise plus l'iframe
    // Google Drive qui provoquait l'écran noir.
    const ui=showFastThumbnail(root,id);

    try{
      const data=await fetchDriveFile(value,id);
      if(!ui.modal.isConnected)return;
      const mime=String(data.mimeType||'').toLowerCase();
      if(mime.startsWith('image/')){
        showImageBase64(ui,data);
        return;
      }
      if(mime==='application/pdf'||/\.pdf$/i.test(String(data.filename||''))){
        await renderPdf(ui,data);
        return;
      }
      throw new Error('Format non prévisualisable');
    }catch(err){
      console.warn('Lecteur Yaya indisponible, lecteur précédent conservé :',err);
      if(ui.modal.isConnected)previousVoirPiece(value);
    }
  };
})();
