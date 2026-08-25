(function(){
  'use strict';

  const previousVoirPiece=window.voirPiece;
  if(typeof previousVoirPiece!=='function')return;

  const API_FALLBACK='https://script.google.com/macros/s/AKfycbx6IwMFf2plAq7i8qf8qF6f6MMC-1-WynAqn1ZRqCZrVqHeE9a1ygSSTzp5uOf0L3bn/exec';
  let pdfJsPromise=null;

  function apiUrl(){
    try{
      if(typeof API!=='undefined'&&API)return String(API);
    }catch(e){}
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
    pdfJsPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async=true;
      script.onload=()=>window.pdfjsLib?resolve(window.pdfjsLib):reject(new Error('PDF.js indisponible'));
      script.onerror=()=>reject(new Error('Chargement PDF.js impossible'));
      document.head.appendChild(script);
    }).catch(err=>{pdfJsPromise=null;throw err;});
    return pdfJsPromise;
  }

  function makeModal(root){
    root.replaceChildren();
    const overlay=document.createElement('div');
    overlay.className='overlay piece-preview-overlay';
    overlay.onclick=e=>{if(e.target===overlay&&typeof window.closeModal==='function')window.closeModal();};

    const modal=document.createElement('div');
    modal.className='modal piece-modal piece-preview-modal';

    const head=document.createElement('h5');
    head.className='piece-preview-head';
    const title=document.createElement('span');
    title.textContent='Pièce jointe';
    const close=document.createElement('button');
    close.type='button';
    close.textContent='Fermer';
    close.onclick=()=>{if(typeof window.closeModal==='function')window.closeModal();};
    head.append(title,close);

    const stage=document.createElement('div');
    stage.className='piece-preview-stage';
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);
    return {overlay,modal,stage};
  }

  function showLoading(root,text){
    const ui=makeModal(root);
    const loading=document.createElement('div');
    loading.className='piece-preview-loading';
    loading.textContent=text||'Chargement de la pièce…';
    ui.stage.appendChild(loading);
    return ui;
  }

  function base64ToBytes(base64){
    const raw=atob(String(base64||''));
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    return bytes;
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

  function showImageBase64(root,data){
    const ui=makeModal(root);
    ui.stage.classList.add('piece-image-stage');
    const img=document.createElement('img');
    img.alt=data.filename||'Pièce jointe';
    img.src='data:'+(data.mimeType||'image/jpeg')+';base64,'+data.base64;
    ui.stage.appendChild(img);
  }

  async function renderPdfBase64(root,base64){
    const ui=makeModal(root);
    const loading=document.createElement('div');
    loading.className='piece-preview-loading';
    loading.textContent='Chargement du PDF…';
    ui.stage.appendChild(loading);

    const pdfjs=await ensurePdfJs();
    if(!root.contains(ui.modal))throw new Error('Aperçu fermé');
    try{pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}catch(e){}

    const task=pdfjs.getDocument({data:base64ToBytes(base64),disableWorker:true});
    const pdf=await task.promise;
    if(!root.contains(ui.modal))throw new Error('Aperçu fermé');

    const viewer=document.createElement('div');
    viewer.className='piece-pdf-pages';
    ui.stage.replaceChildren(viewer);

    let pageHeight=0;
    let resizeTimer=null;
    let rendering=false;
    let rerender=false;
    let wheelLocked=false;

    async function drawAll(){
      if(rendering){rerender=true;return;}
      if(!root.contains(ui.modal))return;
      rendering=true;
      try{
        const oldHeight=Math.max(1,pageHeight||viewer.clientHeight||1);
        const current=Math.max(0,Math.min(pdf.numPages-1,Math.round(viewer.scrollTop/oldHeight)));
        const width=Math.max(120,viewer.clientWidth);
        const height=Math.max(120,viewer.clientHeight);
        pageHeight=height;
        viewer.replaceChildren();
        const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));

        for(let n=1;n<=pdf.numPages;n++){
          if(!root.contains(ui.modal))return;
          const page=await pdf.getPage(n);
          const raw=page.getViewport({scale:1});
          const scale=Math.min((width-10)/raw.width,(height-10)/raw.height);
          const cssScale=Math.max(0.05,scale);
          const viewport=page.getViewport({scale:cssScale*dpr});

          const slot=document.createElement('div');
          slot.className='piece-pdf-page';
          slot.style.height=height+'px';
          slot.style.minHeight=height+'px';

          const canvas=document.createElement('canvas');
          canvas.width=Math.max(1,Math.floor(viewport.width));
          canvas.height=Math.max(1,Math.floor(viewport.height));
          canvas.style.width=Math.floor(raw.width*cssScale)+'px';
          canvas.style.height=Math.floor(raw.height*cssScale)+'px';
          slot.appendChild(canvas);
          viewer.appendChild(slot);

          await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
        }
        viewer.scrollTop=current*height;
      }finally{
        rendering=false;
        if(rerender){rerender=false;drawAll();}
      }
    }

    viewer.addEventListener('wheel',e=>{
      if(Math.abs(e.deltaY)<4||pdf.numPages<2)return;
      e.preventDefault();
      if(wheelLocked)return;
      wheelLocked=true;
      const h=Math.max(1,pageHeight||viewer.clientHeight);
      const current=Math.round(viewer.scrollTop/h);
      const next=Math.max(0,Math.min(pdf.numPages-1,current+(e.deltaY>0?1:-1)));
      viewer.scrollTo({top:next*h,behavior:'smooth'});
      setTimeout(()=>{wheelLocked=false;},320);
    },{passive:false});

    const onResize=()=>{
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(drawAll,140);
    };
    window.addEventListener('resize',onResize,{passive:true});

    const cleanup=new MutationObserver(()=>{
      if(!root.contains(ui.modal)){
        clearTimeout(resizeTimer);
        window.removeEventListener('resize',onResize);
        cleanup.disconnect();
        try{task.destroy();}catch(e){}
      }
    });
    cleanup.observe(root,{childList:true});

    await drawAll();
  }

  window.voirPiece=async function(url){
    const value=String(url||'').trim();
    if(!value)return;
    const id=driveIdFromUrl(value);
    if(!id){return previousVoirPiece(value);}

    const root=document.getElementById('modalRoot');
    if(!root)return previousVoirPiece(value);
    const pending=showLoading(root,'Chargement de la pièce…');

    try{
      const data=await fetchDriveFile(value,id);
      if(!root.contains(pending.modal))return;
      const mime=String(data.mimeType||'').toLowerCase();
      if(mime.startsWith('image/')){
        showImageBase64(root,data);
        return;
      }
      if(mime==='application/pdf'||/\.pdf$/i.test(String(data.filename||''))){
        await renderPdfBase64(root,data.base64);
        return;
      }
      throw new Error('Format non prévisualisable');
    }catch(err){
      console.warn('Aperçu API Base64 indisponible, ancien lecteur conservé :',err);
      if(root.contains(pending.modal))previousVoirPiece(value);
    }
  };
})();
