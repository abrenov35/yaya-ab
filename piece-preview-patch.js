(function(){
  'use strict';

  const originalVoirPiece=window.voirPiece;
  if(typeof originalVoirPiece!=='function')return;

  const STYLE_ID='yaya-piece-preview-v4-style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .piece-preview-overlay{align-items:center!important;justify-content:center!important;padding:8px!important;overflow:hidden!important;}
      .piece-preview-modal{width:min(90vw,900px)!important;height:min(88dvh,760px)!important;max-width:900px!important;max-height:88dvh!important;padding:9px!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;}
      .piece-preview-head{flex:0 0 auto!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin:0 0 6px!important;min-height:32px!important;}
      .piece-preview-head button{flex:0 0 auto!important;padding:6px 13px!important;border:1px solid rgba(22,45,73,.24)!important;border-radius:8px!important;background:#fff!important;color:var(--navy)!important;font-size:13px!important;font-weight:600!important;}
      .piece-preview-stage{position:relative!important;flex:1 1 auto!important;min-height:0!important;min-width:0!important;width:100%!important;overflow:hidden!important;border-radius:8px!important;background:#eef1f5!important;}
      .piece-image-stage,.piece-drive-pages-stage{display:flex!important;align-items:center!important;justify-content:center!important;padding:4px!important;touch-action:pan-y!important;overscroll-behavior:contain!important;}
      .piece-image-stage img,.piece-drive-pages-stage img{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;user-select:none!important;-webkit-user-drag:none!important;}
      .piece-drive-pages-stage{cursor:default!important;}
      .piece-page-indicator{position:absolute!important;left:50%!important;bottom:8px!important;transform:translateX(-50%)!important;z-index:3!important;padding:5px 10px!important;border-radius:14px!important;background:rgba(20,31,48,.78)!important;color:#fff!important;font-size:11.5px!important;font-weight:700!important;pointer-events:none!important;box-shadow:0 1px 4px rgba(0,0,0,.18)!important;}
      .piece-page-loading{position:absolute!important;inset:0!important;display:flex!important;align-items:center!important;justify-content:center!important;background:rgba(238,241,245,.72)!important;color:var(--navy)!important;font-size:12.5px!important;font-weight:600!important;z-index:2!important;}
      .piece-pdf-pages{height:100%!important;width:100%!important;overflow-y:auto!important;overflow-x:hidden!important;scroll-snap-type:y mandatory!important;scroll-behavior:smooth!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;}
      .piece-pdf-page{width:100%!important;min-width:0!important;display:flex!important;align-items:center!important;justify-content:center!important;scroll-snap-align:start!important;scroll-snap-stop:always!important;overflow:hidden!important;padding:4px!important;background:#eef1f5!important;}
      .piece-pdf-page canvas{display:block!important;max-width:100%!important;max-height:100%!important;background:#fff!important;box-shadow:0 1px 6px rgba(0,0,0,.12)!important;}
      .piece-preview-loading{height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;text-align:center!important;font-size:13px!important;color:var(--navy)!important;}
      @media(max-width:640px){
        .piece-preview-overlay{padding:4px!important;}
        .piece-preview-modal{width:calc(100vw - 8px)!important;height:calc(100dvh - 8px)!important;max-width:none!important;max-height:none!important;padding:5px!important;border-radius:8px!important;}
        .piece-preview-head{margin-bottom:3px!important;min-height:30px!important;}
        .piece-preview-head button{padding:5px 10px!important;font-size:12px!important;}
        .piece-page-indicator{bottom:5px!important;}
      }
      @media(max-height:520px) and (orientation:landscape){
        .piece-preview-overlay{padding:2px!important;}
        .piece-preview-modal{width:calc(100vw - 4px)!important;height:calc(100dvh - 4px)!important;max-width:none!important;max-height:none!important;padding:3px!important;border-radius:6px!important;}
        .piece-preview-head{min-height:25px!important;margin-bottom:2px!important;font-size:13px!important;}
        .piece-preview-head button{padding:3px 9px!important;font-size:11.5px!important;}
        .piece-image-stage,.piece-drive-pages-stage,.piece-pdf-page{padding:2px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  let pdfJsPromise=null;
  function ensurePdfJs(){
    if(window.pdfjsLib){
      try{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}catch(e){}
      return Promise.resolve(window.pdfjsLib);
    }
    if(pdfJsPromise)return pdfJsPromise;
    pdfJsPromise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.async=true;
      s.onload=()=>{
        if(!window.pdfjsLib){reject(new Error('PDF.js indisponible'));return;}
        try{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}catch(e){}
        resolve(window.pdfjsLib);
      };
      s.onerror=()=>reject(new Error('Chargement PDF.js impossible'));
      document.head.appendChild(s);
    }).catch(err=>{pdfJsPromise=null;throw err;});
    return pdfJsPromise;
  }

  function driveIdFromUrl(u){
    const m=String(u||'').match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    return m?m[1]:'';
  }
  function dropboxRaw(u){
    try{const d=new URL(u);d.searchParams.delete('dl');d.searchParams.set('raw','1');return d.toString();}
    catch(e){return u;}
  }
  function imageByExtension(u){return /\.(jpe?g|png|webp|gif|bmp|svg)(?:[?#]|$)/i.test(String(u||''));}
  function pdfByExtension(u){return /\.pdf(?:[?#]|$)/i.test(String(u||''));}

  function makeModal(root){
    root.replaceChildren();
    const overlay=document.createElement('div');
    overlay.className='overlay piece-preview-overlay';
    overlay.onclick=e=>{if(e.target===overlay&&typeof window.closeModal==='function')window.closeModal();};
    const modal=document.createElement('div');
    modal.className='modal piece-modal piece-preview-modal';
    const head=document.createElement('h5');
    head.className='piece-preview-head';
    const title=document.createElement('span');title.textContent='Pièce jointe';
    const close=document.createElement('button');close.type='button';close.textContent='Fermer';close.onclick=()=>window.closeModal();
    head.append(title,close);
    const stage=document.createElement('div');stage.className='piece-preview-stage';
    modal.append(head,stage);overlay.appendChild(modal);root.appendChild(overlay);
    return {overlay,modal,stage};
  }

  function showLoading(root,text){
    const ui=makeModal(root);
    const loading=document.createElement('div');loading.className='piece-preview-loading';loading.textContent=text||'Chargement de la pièce…';ui.stage.appendChild(loading);
    return ui;
  }

  function showImage(root,src){
    const ui=makeModal(root);
    ui.stage.classList.add('piece-image-stage');
    const img=document.createElement('img');img.alt='Pièce jointe';img.src=src;ui.stage.appendChild(img);
    return ui;
  }

  function canLoadImage(src,timeoutMs){
    return new Promise(resolve=>{
      let done=false;
      const img=new Image();
      const finish=ok=>{if(done)return;done=true;clearTimeout(timer);img.onload=img.onerror=null;resolve(ok);};
      const timer=setTimeout(()=>finish(false),timeoutMs||2200);
      img.onload=()=>finish(!!(img.naturalWidth&&img.naturalHeight));
      img.onerror=()=>finish(false);
      img.src=src;
    });
  }

  function loadImageFromCandidates(urls,timeoutMs){
    return new Promise((resolve,reject)=>{
      let index=0;
      function next(){
        if(index>=urls.length){reject(new Error('Page Drive indisponible'));return;}
        const url=urls[index++];
        let finished=false;
        const img=new Image();
        const timer=setTimeout(()=>finish(false),timeoutMs||5500);
        function finish(ok){
          if(finished)return;finished=true;clearTimeout(timer);img.onload=img.onerror=null;
          if(ok&&img.naturalWidth>20&&img.naturalHeight>20)resolve({img,url});else next();
        }
        img.onload=()=>finish(true);
        img.onerror=()=>finish(false);
        img.src=url;
      }
      next();
    });
  }

  function drivePageCandidates(id,page,width){
    const safeId=encodeURIComponent(id);
    const p=Math.max(1,Number(page)||1);
    const w=Math.max(600,Math.min(2200,Math.round(width||1400)));
    return [
      'https://drive.google.com/file/d/'+safeId+'/image?pagenumber='+p+'&w='+w,
      'https://docs.google.com/file/d/'+safeId+'/image?pagenumber='+p+'&w='+w
    ];
  }

  async function renderDrivePdfPages(root,id){
    const ui=makeModal(root);
    ui.stage.classList.add('piece-drive-pages-stage');
    const img=document.createElement('img');
    img.alt='Page PDF';
    const indicator=document.createElement('div');indicator.className='piece-page-indicator';indicator.textContent='Page 1';
    const loading=document.createElement('div');loading.className='piece-page-loading';loading.textContent='Chargement de la page…';
    ui.stage.append(img,loading,indicator);

    let current=1;
    let busy=false;
    let wheelLocked=false;
    let touchY=null;
    const cache=new Map();
    let knownLastPage=null;

    function targetWidth(){
      const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));
      return Math.round(Math.max(900,ui.stage.clientWidth*dpr));
    }

    async function getPage(n){
      if(n<1)throw new Error('Première page');
      if(knownLastPage&&n>knownLastPage)throw new Error('Dernière page');
      if(cache.has(n))return cache.get(n);
      const promise=loadImageFromCandidates(drivePageCandidates(id,n,targetWidth()),6500).then(r=>r.url).catch(err=>{cache.delete(n);throw err;});
      cache.set(n,promise);
      return promise;
    }

    async function showPage(n){
      if(busy||n<1||n===current)return false;
      busy=true;loading.style.display='flex';
      try{
        const src=await getPage(n);
        if(!root.contains(ui.modal))return false;
        img.src=src;
        current=n;
        indicator.textContent='Page '+current+(knownLastPage?' / '+knownLastPage:'');
        if(!knownLastPage){
          getPage(current+1).catch(()=>{knownLastPage=current;indicator.textContent='Page '+current+' / '+knownLastPage;});
        }
        return true;
      }catch(e){
        if(n>current){knownLastPage=current;indicator.textContent='Page '+current+' / '+knownLastPage;}
        return false;
      }finally{loading.style.display='none';busy=false;}
    }

    const first=await getPage(1);
    if(!root.contains(ui.modal))throw new Error('Aperçu fermé');
    img.src=first;
    loading.style.display='none';
    getPage(2).catch(()=>{knownLastPage=1;indicator.textContent='Page 1 / 1';});

    ui.stage.addEventListener('wheel',e=>{
      if(Math.abs(e.deltaY)<3)return;
      e.preventDefault();
      if(wheelLocked||busy)return;
      wheelLocked=true;
      showPage(current+(e.deltaY>0?1:-1)).finally(()=>setTimeout(()=>{wheelLocked=false;},260));
    },{passive:false});

    ui.stage.addEventListener('touchstart',e=>{if(e.touches&&e.touches[0])touchY=e.touches[0].clientY;},{passive:true});
    ui.stage.addEventListener('touchend',e=>{
      if(touchY==null||!e.changedTouches||!e.changedTouches[0])return;
      const dy=e.changedTouches[0].clientY-touchY;touchY=null;
      if(Math.abs(dy)<38||busy)return;
      showPage(current+(dy<0?1:-1));
    },{passive:true});

    const onKey=e=>{
      if(!root.contains(ui.modal))return;
      if(['ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();showPage(current+1);}
      else if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();showPage(current-1);}
    };
    window.addEventListener('keydown',onKey);
    const cleanupObserver=new MutationObserver(()=>{
      if(!root.contains(ui.modal)){window.removeEventListener('keydown',onKey);cleanupObserver.disconnect();}
    });
    cleanupObserver.observe(root,{childList:true});
    return ui;
  }

  async function renderPdf(root,pdfUrl){
    const ui=makeModal(root);
    const loading=document.createElement('div');loading.className='piece-preview-loading';loading.textContent='Chargement du PDF…';ui.stage.appendChild(loading);
    const pdfjs=await ensurePdfJs();
    if(!root.contains(ui.modal))throw new Error('Aperçu fermé');
    const task=pdfjs.getDocument({url:pdfUrl,withCredentials:false});
    const pdf=await task.promise;
    if(!root.contains(ui.modal))throw new Error('Aperçu fermé');
    const viewer=document.createElement('div');viewer.className='piece-pdf-pages';ui.stage.replaceChildren(viewer);

    let lastPageHeight=0,resizeTimer=null,rendering=false,rerenderRequested=false,wheelLocked=false;
    async function drawAll(){
      if(rendering){rerenderRequested=true;return;}
      if(!root.contains(ui.modal))return;
      rendering=true;
      try{
        const oldHeight=Math.max(1,lastPageHeight||viewer.clientHeight||1);
        const current=Math.max(0,Math.min(pdf.numPages-1,Math.round(viewer.scrollTop/oldHeight)));
        const w=Math.max(120,viewer.clientWidth),h=Math.max(120,viewer.clientHeight);
        lastPageHeight=h;viewer.replaceChildren();
        const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));
        for(let n=1;n<=pdf.numPages;n++){
          if(!root.contains(ui.modal))return;
          const slot=document.createElement('div');slot.className='piece-pdf-page';slot.style.height=h+'px';slot.style.minHeight=h+'px';
          const canvas=document.createElement('canvas');slot.appendChild(canvas);viewer.appendChild(slot);
          const page=await pdf.getPage(n),raw=page.getViewport({scale:1});
          const cssScale=Math.min(Math.max(0.05,(w-10)/raw.width),Math.max(0.05,(h-10)/raw.height));
          const viewport=page.getViewport({scale:cssScale*dpr});
          canvas.width=Math.max(1,Math.floor(viewport.width));canvas.height=Math.max(1,Math.floor(viewport.height));
          canvas.style.width=Math.floor(raw.width*cssScale)+'px';canvas.style.height=Math.floor(raw.height*cssScale)+'px';
          await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
        }
        viewer.scrollTop=current*h;
      }finally{rendering=false;if(rerenderRequested){rerenderRequested=false;drawAll();}}
    }
    viewer.addEventListener('wheel',e=>{
      if(Math.abs(e.deltaY)<4||pdf.numPages<2)return;e.preventDefault();if(wheelLocked)return;wheelLocked=true;
      const h=Math.max(1,lastPageHeight||viewer.clientHeight),current=Math.round(viewer.scrollTop/h);
      const next=Math.max(0,Math.min(pdf.numPages-1,current+(e.deltaY>0?1:-1)));
      viewer.scrollTo({top:next*h,behavior:'smooth'});setTimeout(()=>{wheelLocked=false;},320);
    },{passive:false});
    const onResize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>drawAll(),140);};
    window.addEventListener('resize',onResize,{passive:true});
    const cleanupObserver=new MutationObserver(()=>{
      if(!root.contains(ui.modal)){clearTimeout(resizeTimer);window.removeEventListener('resize',onResize);cleanupObserver.disconnect();try{task.destroy();}catch(e){}}
    });
    cleanupObserver.observe(root,{childList:true});
    await drawAll();return ui;
  }

  function showFallback(root,u){
    if(root.querySelector('.piece-preview-modal')&&typeof originalVoirPiece==='function')originalVoirPiece(u);
  }

  window.voirPiece=async function(u){
    u=String(u||'').trim();if(!u)return;
    const root=document.getElementById('modalRoot');if(!root)return;
    const driveId=driveIdFromUrl(u);
    let direct=u;if(String(u).toLowerCase().includes('dropbox.com'))direct=dropboxRaw(u);

    if(imageByExtension(direct)){showImage(root,direct);return;}

    if(driveId){
      const pending=showLoading(root,'Analyse de la pièce…');
      const imageCandidate='https://drive.google.com/uc?export=view&id='+encodeURIComponent(driveId);
      try{
        const isImage=await canLoadImage(imageCandidate,1700);
        if(!root.contains(pending.modal))return;
        if(isImage){showImage(root,imageCandidate);return;}
      }catch(e){if(!root.contains(pending.modal))return;}

      try{
        await renderDrivePdfPages(root,driveId);
        return;
      }catch(e){
        console.warn('Rendu Drive page-par-page indisponible :',e);
      }

      const pdfCandidate='https://drive.google.com/uc?export=download&id='+encodeURIComponent(driveId);
      try{await renderPdf(root,pdfCandidate);return;}
      catch(e){console.warn('PDF.js Drive indisponible, retour lecteur Drive :',e);showFallback(root,u);return;}
    }

    if(pdfByExtension(direct)||!imageByExtension(direct)){
      try{await renderPdf(root,direct);return;}
      catch(e){console.warn('Aperçu PDF page-par-page indisponible, retour lecteur actuel :',e);showFallback(root,u);return;}
    }
    if(typeof originalVoirPiece==='function')originalVoirPiece(u);
  };
})();
