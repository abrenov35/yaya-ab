(function(){
  'use strict';
  if(window.__yayaDevisDrivePreviewFixV3)return;
  window.__yayaDevisDrivePreviewFixV3=true;

  const API_FALLBACK='https://script.google.com/macros/s/AKfycbxXBpXjWXEF-7p6vvOE3blSBc8_5e62AtQb2stHjnrGE025cOxQGy-zAguYmN2u9O4K/exec';
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

  function normalizePayload(raw){
    let data=raw&&typeof raw==='object'?raw:{};
    for(let i=0;i<2;i++){
      if(data&&data.data&&typeof data.data==='object'&&!data.base64&&!data.pdfBase64&&!data.contentBase64&&!data.fileBase64&&!data.dataUrl&&!data.previewUrl){
        data=data.data;
      }else break;
    }

    let base64=String(
      data.base64||
      data.pdfBase64||
      data.contentBase64||
      data.fileBase64||
      data.contenuBase64||
      ''
    ).trim();

    let mimeType=String(
      data.mimeType||
      data.mime||
      data.contentType||
      data.typeMime||
      ''
    ).trim();

    let filename=String(
      data.filename||
      data.fileName||
      data.name||
      data.nom||
      ''
    ).trim();

    const dataUrl=String(data.dataUrl||data.previewUrl||data.urlData||'').trim();
    const match=dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/i);
    if(!base64&&match){
      mimeType=mimeType||match[1];
      base64=match[2];
    }

    base64=base64
      .replace(/^data:[^;]+;base64,/i,'')
      .replace(/\s+/g,'');

    const type=String(data.type||'').toLowerCase();
    if(!mimeType){
      if(type==='pdf'||/\.pdf$/i.test(filename)||data.pdfBase64)mimeType='application/pdf';
      else if(type==='image')mimeType='image/jpeg';
    }
    if(!filename){
      filename=mimeType==='application/pdf'?'devis.pdf':'devis';
    }

    if(!base64){
      try{console.warn('Réponse aperçu Drive sans contenu binaire. Champs reçus :',Object.keys(data||{}));}catch(e){}
      throw new Error('Contenu du fichier non renvoyé par Yaya');
    }

    return Object.assign({},data,{
      base64:base64,
      mimeType:mimeType||'application/octet-stream',
      filename:filename
    });
  }

  async function fetchDriveFile(url,id){
    const response=await fetch(apiUrl(),{
      method:'POST',
      cache:'no-store',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'getDriveFile',data:{url:String(url||''),id:String(id||'')}})
    });
    if(!response.ok)throw new Error('API Yaya HTTP '+response.status);
    const text=await response.text();
    let json;
    try{json=JSON.parse(text);}catch(e){throw new Error('Réponse Yaya invalide');}
    if(!json||json.ok!==true)throw new Error(json&&json.error?json.error:'Lecture Drive indisponible');
    return normalizePayload(json.data||json);
  }

  function base64ToBytes(base64){
    const raw=atob(String(base64||''));
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    return bytes;
  }

  function installStyle(){
    if(document.getElementById('yaya-devis-drive-preview-fix-style'))return;
    const style=document.createElement('style');
    style.id='yaya-devis-drive-preview-fix-style';
    style.textContent=`
      #yayaDevisViewer .ydd-drive-loading,
      #yayaDevisViewer .ydd-drive-error{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;color:#526174;background:#fff;font-size:13px}
      #yayaDevisViewer .ydd-drive-stage{position:relative;width:100%;height:100%;min-height:0;background:#eef1f4;overflow:hidden}
      #yayaDevisViewer .ydd-drive-image{display:block;width:100%;height:100%;object-fit:contain;background:#fff}
      #yayaDevisViewer .ydd-drive-pages{width:100%;height:100%;overflow:hidden;background:#eef1f4}
      #yayaDevisViewer .ydd-drive-page{width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:6px;box-sizing:border-box}
      #yayaDevisViewer .ydd-drive-page canvas{display:block;max-width:100%;max-height:100%;background:#fff;box-shadow:0 2px 8px rgba(15,23,42,.12)}
      #yayaDevisViewer .ydd-drive-nav{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:5;display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:18px;background:rgba(15,23,42,.84);color:#fff;font-size:11px}
      #yayaDevisViewer .ydd-drive-nav button{width:30px;height:28px;padding:0;border:0;border-radius:14px;background:#fff;color:#162d49;font-size:18px;font-weight:800}
      #yayaDevisViewer .ydd-drive-error{flex-direction:column;gap:12px}
      #yayaDevisViewer .ydd-drive-error a{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 14px;border-radius:8px;background:#003d7a;color:#fff;text-decoration:none;font-weight:800}
    `;
    document.head.appendChild(style);
  }

  function showError(view,url,err){
    if(!view||!view.isConnected)return;
    view.innerHTML='';
    const box=document.createElement('div');
    box.className='ydd-drive-error';
    const msg=document.createElement('div');
    msg.textContent='Aperçu impossible dans Yaya : '+String(err&&err.message||err||'erreur inconnue');
    const link=document.createElement('a');
    link.href=String(url||'#');
    link.target='_blank';
    link.rel='noopener';
    link.textContent='Ouvrir le document';
    box.append(msg,link);
    view.appendChild(box);
  }

  async function renderPdf(view,data){
    const pdfjs=await ensurePdfJs();
    if(!view||!view.isConnected)return;
    const task=pdfjs.getDocument({data:base64ToBytes(data.base64),disableWorker:true});
    const pdf=await task.promise;
    if(!view.isConnected)return;

    view.innerHTML='';
    const stage=document.createElement('div');
    stage.className='ydd-drive-stage';
    const pages=document.createElement('div');
    pages.className='ydd-drive-pages';
    const pageSlot=document.createElement('div');
    pageSlot.className='ydd-drive-page';
    pages.appendChild(pageSlot);

    const nav=document.createElement('div');
    nav.className='ydd-drive-nav';
    const prev=document.createElement('button');
    prev.type='button';prev.textContent='‹';
    const info=document.createElement('span');
    const next=document.createElement('button');
    next.type='button';next.textContent='›';
    nav.append(prev,info,next);
    stage.append(pages,nav);
    view.appendChild(stage);

    let current=1;
    let rendering=false;
    let queued=null;

    function updateNav(){
      info.textContent='Page '+current+' / '+pdf.numPages;
      prev.disabled=current<=1;
      next.disabled=current>=pdf.numPages;
      prev.style.opacity=prev.disabled?'.4':'1';
      next.style.opacity=next.disabled?'.4':'1';
    }

    async function draw(pageNumber){
      pageNumber=Math.max(1,Math.min(pdf.numPages,Number(pageNumber)||1));
      if(rendering){queued=pageNumber;return;}
      rendering=true;
      try{
        current=pageNumber;
        updateNav();
        pageSlot.innerHTML='<div class="ydd-drive-loading">Chargement de la page…</div>';
        const page=await pdf.getPage(current);
        if(!view.isConnected)return;
        const raw=page.getViewport({scale:1});
        const w=Math.max(160,pageSlot.clientWidth||view.clientWidth||600)-12;
        const h=Math.max(160,pageSlot.clientHeight||view.clientHeight||600)-12;
        const scale=Math.max(.05,Math.min(w/raw.width,h/raw.height));
        const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));
        const viewport=page.getViewport({scale:scale*dpr});
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.floor(viewport.width));
        canvas.height=Math.max(1,Math.floor(viewport.height));
        canvas.style.width=Math.max(1,Math.floor(raw.width*scale))+'px';
        canvas.style.height=Math.max(1,Math.floor(raw.height*scale))+'px';
        pageSlot.replaceChildren(canvas);
        await page.render({canvasContext:canvas.getContext('2d'),viewport:viewport}).promise;
      }finally{
        rendering=false;
        if(queued!=null){const q=queued;queued=null;draw(q);}
      }
    }

    prev.onclick=function(e){e.preventDefault();e.stopPropagation();if(current>1)draw(current-1);};
    next.onclick=function(e){e.preventDefault();e.stopPropagation();if(current<pdf.numPages)draw(current+1);};
    nav.onclick=function(e){e.stopPropagation();};
    updateNav();
    await draw(1);
  }

  function renderImage(view,data){
    if(!view||!view.isConnected)return;
    view.innerHTML='';
    const img=document.createElement('img');
    img.className='ydd-drive-image';
    img.alt=data.filename||'Devis';
    img.src='data:'+(data.mimeType||'image/jpeg')+';base64,'+data.base64;
    view.appendChild(img);
  }

  async function upgradeFrame(frame){
    if(!frame||!frame.isConnected||frame.dataset.yayaDriveUpgrade==='1')return;
    const url=String(frame.getAttribute('src')||frame.src||'').trim();
    const id=driveIdFromUrl(url);
    if(!id)return;
    frame.dataset.yayaDriveUpgrade='1';
    const view=frame.closest('.ydd-view');
    if(!view)return;
    view.innerHTML='<div class="ydd-drive-loading">Chargement du devis…</div>';
    try{
      const data=await fetchDriveFile(url,id);
      if(!view.isConnected)return;
      const mime=String(data.mimeType||'').toLowerCase();
      if(mime.startsWith('image/')){renderImage(view,data);return;}
      if(mime==='application/pdf'||/\.pdf$/i.test(String(data.filename||''))){await renderPdf(view,data);return;}
      throw new Error('Format non prévisualisable');
    }catch(err){
      console.warn('Aperçu devis Drive indisponible :',err);
      showError(view,url,err);
    }
  }

  function scan(root){
    const scope=root&&root.nodeType===1?root:document;
    if(scope.matches&&scope.matches('#yayaDevisViewer .ydd-frame'))upgradeFrame(scope);
    if(scope.querySelectorAll)scope.querySelectorAll('#yayaDevisViewer .ydd-frame').forEach(upgradeFrame);
  }

  function install(){
    installStyle();
    scan(document);
    new MutationObserver(function(mutations){
      for(const m of mutations){
        for(const node of m.addedNodes){
          if(node&&node.nodeType===1)scan(node);
        }
      }
    }).observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
