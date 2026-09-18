(function(){
'use strict';
if(window.__YAYA_COMMANDES_LINE_V4)return;
window.__YAYA_COMMANDES_LINE_V4=true;

const GAS='https://script.google.com/macros/s/AKfycbxswcobk2vJMh0qlbxseImn1SZ7GBubSblW5LXFrRLI3zxs-M9zb3NwfUS-rVHDtoY/exec';
const CACHE_KEYS=['AB_COMMANDES_LOCAL_STATE_V1','AB_COMMANDES_EMBED_CACHE_V2'];
const MODAL_ID='ycnIframePiecesV4';
let currentOrderId='';
let currentPieceIndex=0;
let scheduled=false;
let previewToken=0;
let pdfJsPromise=null;

function readState(){
  for(const key of CACHE_KEYS){
    try{const raw=localStorage.getItem(key);if(!raw)continue;const d=JSON.parse(raw);if(Array.isArray(d?.orders))return d;}catch(_){ }
  }
  return {orders:[],documents:[]};
}
function orderById(id){return (readState().orders||[]).find(o=>String(o?.id||'')===String(id||''))||null;}
function docsFor(id){return (readState().documents||[]).filter(d=>String(d?.commande_id||'')===String(id||''));}
function docUrl(d){return String(d?.url_pdf||d?.url||d?.lien||d?.webUrl||d?.oneDriveWebUrl||'').trim();}
function orderUrl(o){return String(o?.lien||o?.url||o?.urlCommande||o?.url_commande||o?.lienUrl||o?.lien_url||o?.webUrl||o?.oneDriveWebUrl||o?.driveUrl||o?.dropboxUrl||'').trim();}
function iframeUrl(url){
  url=String(url||'').trim();if(!url)return '';
  try{const u=new URL(url);if(/(^|\.)dropbox\.com$/i.test(u.hostname)){u.searchParams.delete('dl');u.searchParams.set('raw','1');return u.toString();}}catch(_){ }
  return url;
}
function driveId(url){
  const s=String(url||'').trim();
  let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);if(m&&m[1])return m[1];
  m=s.match(/[?&]id=([^&#]+)/i);return m&&m[1]?decodeURIComponent(m[1]):'';
}
function yayaApiUrl(){
  try{if(typeof API!=='undefined'&&API)return String(API);}catch(_){ }
  return 'https://script.google.com/macros/s/AKfycbxXBpXjWXEF-7p6vvOE3blSBc8_5e62AtQb2stHjnrGE025cOxQGy-zAguYmN2u9O4K/exec';
}
function ensurePdfJs(){
  if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
  if(pdfJsPromise)return pdfJsPromise;
  pdfJsPromise=new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.async=true;
    s.onload=()=>{
      if(!window.pdfjsLib){reject(new Error('PDF.js indisponible'));return;}
      try{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}catch(_){ }
      resolve(window.pdfjsLib);
    };
    s.onerror=()=>reject(new Error('Chargement PDF.js impossible'));
    document.head.appendChild(s);
  }).catch(err=>{pdfJsPromise=null;throw err;});
  return pdfJsPromise;
}
async function fetchDriveFile(url,id){
  const r=await fetch(yayaApiUrl(),{
    method:'POST',
    cache:'no-store',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({action:'getDriveFile',data:{url:String(url||''),id:String(id||'')}})
  });
  if(!r.ok)throw new Error('API Yaya HTTP '+r.status);
  const j=await r.json();
  if(!j||j.ok!==true)throw new Error(String(j&&j.error||'Lecture Drive indisponible'));
  const data=j.data||{};
  if(!data.base64)throw new Error('Fichier Drive vide');
  return data;
}
function base64Bytes(base64){
  const raw=atob(String(base64||'')),out=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
  return out;
}
async function renderPdfInStage(stage,data,token){
  const pdfjs=await ensurePdfJs();
  if(token!==previewToken||!stage.isConnected)return;
  const task=pdfjs.getDocument({data:base64Bytes(data.base64),disableWorker:true});
  const pdf=await task.promise;
  if(token!==previewToken||!stage.isConnected){try{task.destroy();}catch(_){ }return;}
  const viewer=document.createElement('div');viewer.className='v4-pdf';
  stage.replaceChildren(viewer);
  const width=Math.max(280,stage.clientWidth||900);
  const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));
  for(let n=1;n<=pdf.numPages;n++){
    if(token!==previewToken||!stage.isConnected)break;
    const page=await pdf.getPage(n),raw=page.getViewport({scale:1});
    const cssScale=Math.max(.05,(width-20)/raw.width);
    const viewport=page.getViewport({scale:cssScale*dpr});
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.floor(viewport.width));
    canvas.height=Math.max(1,Math.floor(viewport.height));
    canvas.style.width=Math.max(1,Math.floor(raw.width*cssScale))+'px';
    canvas.style.height='auto';
    viewer.appendChild(canvas);
    await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
  }
}
async function renderDriveInStage(stage,url,id,token){
  stage.innerHTML='<div class="v4-loading">Chargement du document…</div>';
  const data=await fetchDriveFile(url,id);
  if(token!==previewToken||!stage.isConnected)return;
  const mime=String(data.mimeType||'').toLowerCase();
  if(mime.startsWith('image/')){
    const img=document.createElement('img');
    img.className='v4-image';
    img.alt=String(data.filename||'Pièce jointe');
    img.src='data:'+(data.mimeType||'image/jpeg')+';base64,'+data.base64;
    stage.replaceChildren(img);
    return;
  }
  if(mime==='application/pdf'||/\.pdf$/i.test(String(data.filename||''))){
    await renderPdfInStage(stage,data,token);
    return;
  }
  throw new Error('Format non prévisualisable');
}
function renderExternalInStage(stage,url,title){
  const iframe=document.createElement('iframe');
  iframe.src=iframeUrl(url);
  iframe.title=title;
  iframe.loading='eager';
  stage.appendChild(iframe);
}
function drivePageCandidates(id,page,width){
  const safe=encodeURIComponent(id),p=Math.max(1,Number(page)||1),w=Math.max(700,Math.min(2200,Math.round(width||1400)));
  return [
    'https://drive.google.com/file/d/'+safe+'/image?pagenumber='+p+'&w='+w,
    'https://docs.google.com/file/d/'+safe+'/image?pagenumber='+p+'&w='+w
  ];
}
function loadDrivePage(urls,timeoutMs){
  return new Promise((resolve,reject)=>{
    let index=0;
    function next(){
      if(index>=urls.length){reject(new Error('Page Drive indisponible'));return;}
      const src=urls[index++];
      const img=new Image();
      let done=false;
      const timer=setTimeout(()=>finish(false),timeoutMs||6500);
      function finish(ok){
        if(done)return;done=true;clearTimeout(timer);img.onload=img.onerror=null;
        if(ok&&img.naturalWidth>30&&img.naturalHeight>30)resolve(src);else next();
      }
      img.onload=()=>finish(true);img.onerror=()=>finish(false);img.src=src;
    }
    next();
  });
}
async function renderDrivePagesFallback(stage,id,token){
  stage.innerHTML='<div class="v4-loading">Chargement du document…</div>';
  let current=1,last=null,busy=false,touchY=null;
  const wrap=document.createElement('div');wrap.className='v4-drive-page-wrap';
  const img=document.createElement('img');img.className='v4-drive-page';
  const nav=document.createElement('div');nav.className='v4-drive-nav';
  const prev=document.createElement('button');prev.type='button';prev.textContent='‹';
  const info=document.createElement('span');
  const next=document.createElement('button');next.type='button';next.textContent='›';
  nav.append(prev,info,next);wrap.append(img,nav);

  function width(){const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));return Math.max(900,(stage.clientWidth||700)*dpr);}
  async function get(n){return loadDrivePage(drivePageCandidates(id,n,width()),6500);}
  function update(){info.textContent='Page '+current+(last?' / '+last:'');prev.disabled=current<=1;next.disabled=!!last&&current>=last;}
  async function show(n){
    if(busy||n<1||n===current)return;
    busy=true;
    try{
      const src=await get(n);
      if(token!==previewToken||!stage.isConnected)return;
      img.src=src;current=n;update();
      if(last==null)get(current+1).catch(()=>{last=current;update();});
    }catch(_){
      if(n>current){last=current;update();}
    }finally{busy=false;}
  }

  const first=await get(1);
  if(token!==previewToken||!stage.isConnected)return;
  img.src=first;stage.replaceChildren(wrap);update();
  get(2).catch(()=>{last=1;update();});
  prev.onclick=e=>{e.preventDefault();e.stopPropagation();if(current>1)show(current-1);};
  next.onclick=e=>{e.preventDefault();e.stopPropagation();if(!last||current<last)show(current+1);};
  wrap.addEventListener('touchstart',e=>{if(e.touches&&e.touches[0])touchY=e.touches[0].clientY;},{passive:true});
  wrap.addEventListener('touchend',e=>{if(touchY==null||!e.changedTouches||!e.changedTouches[0])return;const dy=e.changedTouches[0].clientY-touchY;touchY=null;if(Math.abs(dy)<45)return;if(dy<0)show(current+1);else if(current>1)show(current-1);},{passive:true});
}
function writeDocuments(next){
  for(const key of CACHE_KEYS){
    try{const raw=localStorage.getItem(key);if(!raw)continue;const d=JSON.parse(raw);if(!Array.isArray(d?.orders))continue;d.documents=Array.isArray(next)?next:[];d.savedAt=Date.now();localStorage.setItem(key,JSON.stringify(d));}catch(_){ }
  }
}
function toast(text,kind=''){
  let el=document.getElementById('ycnToast');
  if(!el){el=document.createElement('div');el.id='ycnToast';el.className='ycn-toast';document.body.appendChild(el);}
  el.textContent=text||'';el.className='ycn-toast show'+(kind?' '+kind:'');clearTimeout(el.__t);el.__t=setTimeout(()=>el.className='ycn-toast',3200);
}
function postDelete(id){
  const body=new URLSearchParams({action:'document_delete',id:String(id||'')});
  return fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body});
}

function injectStyle(){
  if(document.getElementById('ycn-line-v4-style'))return;
  const s=document.createElement('style');s.id='ycn-line-v4-style';s.textContent=`
    .yaya-cmd-native-root .ycn-row{cursor:pointer!important}
    .yaya-cmd-native-root .ycn-row-detail,.yaya-cmd-native-root .ycn-row.open .ycn-row-detail{display:none!important}
    .yaya-cmd-native-root .ycn-row-toggle{display:none!important}
    .yaya-cmd-native-root .ycn-row-top{display:grid!important;grid-template-columns:minmax(220px,1.8fr) minmax(140px,.8fr) minmax(150px,.85fr) auto auto!important;gap:7px!important;align-items:center!important;padding:6px 10px!important}
    .yaya-cmd-native-root .ycn-row-summary{display:contents!important}
    .yaya-cmd-native-root .ycn-row-summary .ycn-qte,.yaya-cmd-native-root .ycn-row-summary .ycn-resp{display:none!important}
    .yaya-cmd-native-root .ycn-row-summary strong,.yaya-cmd-native-root .ycn-row-summary .ycn-supplier{display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
    .yaya-cmd-native-root .ycn-v4-status{width:100%!important;height:30px!important;border:1px solid #cbd7e4!important;border-radius:7px!important;background:#fff!important;color:#17324f!important;padding:0 8px!important;font:inherit!important;font-size:10.8px!important;font-weight:800!important;cursor:pointer!important}
    .yaya-cmd-native-root .ycn-v4-pieces,.yaya-cmd-native-root .ycn-v4-url{height:30px!important;border:1px solid #cbd7e4!important;border-radius:7px!important;background:#fff!important;padding:0 9px!important;font:inherit!important;font-size:10.5px!important;font-weight:850!important;white-space:nowrap!important;cursor:pointer!important}
    .yaya-cmd-native-root .ycn-v4-pieces{color:#1f5f9f!important}.yaya-cmd-native-root .ycn-v4-pieces.has{background:#edf7ff!important;border-color:#b9d8f4!important}
    .yaya-cmd-native-root .ycn-v4-url{color:#17653a!important;background:#eef9f1!important;border-color:#b9dfc5!important}
    .yaya-cmd-native-root .ycn-v4-url:disabled{display:none!important}
    #${MODAL_ID}{position:fixed;inset:0;z-index:33000;display:none;align-items:center;justify-content:center;padding:12px;background:rgba(12,27,47,.58)}
    #${MODAL_ID}.show{display:flex}
    #${MODAL_ID} .v4-card{width:min(1120px,calc(100vw - 24px));height:min(88dvh,820px);display:grid;grid-template-rows:auto auto minmax(0,1fr);background:#fff;border-radius:14px;box-shadow:0 28px 90px rgba(8,25,46,.34);overflow:hidden}
    #${MODAL_ID} .v4-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px;border-bottom:1px solid #dfe6ee;color:#162d49}
    #${MODAL_ID} .v4-head strong{font-size:15px}#${MODAL_ID} .v4-close{border:1px solid #cfd9e6;border-radius:8px;background:#fff;color:#334155;min-height:34px;padding:0 12px;font-weight:800;cursor:pointer}
    #${MODAL_ID} .v4-tabs{display:flex;gap:8px;align-items:center;overflow-x:auto;padding:9px 12px;border-bottom:1px solid #e6ebf1;background:#f8fafc}
    #${MODAL_ID} .v4-piece{display:inline-flex;align-items:center;gap:5px;flex:0 0 auto}
    #${MODAL_ID} .v4-view,#${MODAL_ID} .v4-del{min-height:32px;border-radius:7px;font:inherit;font-size:11px;font-weight:800;cursor:pointer}
    #${MODAL_ID} .v4-view{border:1px solid #c8d8e8;background:#fff;color:#205f9d;padding:0 11px}#${MODAL_ID} .v4-view.on{background:#eaf4ff;border-color:#90bce6}
    #${MODAL_ID} .v4-del{width:32px;border:1px solid #efc3c3;background:#fff5f5;color:#b42318}
    #${MODAL_ID} .v4-stage{min-height:0;overflow:hidden;background:#eef2f6}#${MODAL_ID} iframe{display:block;width:100%;height:100%;border:0;background:#fff}
    #${MODAL_ID} .v4-pdf{width:100%;height:100%;overflow:auto;padding:8px;box-sizing:border-box;-webkit-overflow-scrolling:touch}
    #${MODAL_ID} .v4-pdf canvas{display:block;max-width:100%;height:auto!important;margin:0 auto 8px;background:#fff;box-shadow:0 1px 5px rgba(15,23,42,.14)}
    #${MODAL_ID} .v4-image{display:block;width:100%;height:100%;object-fit:contain;background:#fff}
    #${MODAL_ID} .v4-drive-page-wrap{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:6px;box-sizing:border-box;background:#eef2f6;overflow:hidden}
    #${MODAL_ID} .v4-drive-page{display:block;width:100%;height:100%;object-fit:contain;background:#fff}
    #${MODAL_ID} .v4-drive-nav{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:18px;background:rgba(15,23,42,.82);color:#fff;font-size:11px;font-weight:800}
    #${MODAL_ID} .v4-drive-nav button{width:29px;height:27px;border:0;border-radius:14px;background:#fff;color:#162d49;font-size:18px;font-weight:900;line-height:1;cursor:pointer}
    #${MODAL_ID} .v4-drive-nav button:disabled{opacity:.35}
    #${MODAL_ID} .v4-loading,#${MODAL_ID} .v4-error,#${MODAL_ID} .v4-empty{height:100%;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;text-align:center;color:#708095;font-size:13px;font-weight:700}
    @media(max-width:760px){.yaya-cmd-native-root .ycn-row-top{grid-template-columns:minmax(0,1fr) auto auto!important;gap:5px!important;padding:6px 8px!important}.yaya-cmd-native-root .ycn-row-summary .ycn-supplier{display:none!important}.yaya-cmd-native-root .ycn-v4-url:disabled{display:none!important}#${MODAL_ID}{padding:4px}#${MODAL_ID} .v4-card{width:calc(100vw - 8px);height:calc(100dvh - 8px);border-radius:8px}}
  `;document.head.appendChild(s);
}

function ensureModal(){
  let m=document.getElementById(MODAL_ID);if(m)return m;
  m=document.createElement('div');m.id=MODAL_ID;m.setAttribute('aria-hidden','true');
  m.innerHTML='<div class="v4-card" role="dialog" aria-modal="true"><div class="v4-head"><strong>Visualisation des pièces</strong><button type="button" class="v4-close">Fermer</button></div><div class="v4-tabs"></div><div class="v4-stage"></div></div>';
  document.body.appendChild(m);m.querySelector('.v4-close').onclick=closeModal;m.onclick=e=>{if(e.target===m)closeModal();};return m;
}
function closeModal(){
  previewToken++;
  const m=document.getElementById(MODAL_ID);
  if(m){
    m.classList.remove('show');
    m.setAttribute('aria-hidden','true');
    const f=m.querySelector('iframe');if(f)f.src='about:blank';
    const stage=m.querySelector('.v4-stage');if(stage)stage.replaceChildren();
  }
  currentOrderId='';
}
function renderModal(){
  const token=++previewToken;
  const m=ensureModal(),card=m.querySelector('.v4-card'),tabs=m.querySelector('.v4-tabs'),stage=m.querySelector('.v4-stage'),list=docsFor(currentOrderId);
  tabs.innerHTML='';stage.innerHTML='';
  if(!list.length){
    if(card)card.dataset.yayaDownloadUrl='';
    tabs.innerHTML='<span style="font-size:12px;color:#718096">Aucune pièce</span>';
    stage.innerHTML='<div class="v4-empty">Aucune pièce jointe.</div>';
    return;
  }
  currentPieceIndex=Math.max(0,Math.min(currentPieceIndex,list.length-1));
  list.forEach((d,i)=>{
    const wrap=document.createElement('span');wrap.className='v4-piece';
    const view=document.createElement('button');view.type='button';view.className='v4-view'+(i===currentPieceIndex?' on':'');view.textContent='Pièce '+(i+1);view.title=String(d?.nom_fichier||d?.type||('Pièce '+(i+1)));view.onclick=()=>{currentPieceIndex=i;renderModal();};
    const del=document.createElement('button');del.type='button';del.className='v4-del';del.textContent='×';del.title='Supprimer cette pièce';del.onclick=()=>deletePiece(d);
    wrap.append(view,del);tabs.appendChild(wrap);
  });
  const d=list[currentPieceIndex],url=docUrl(d),title=String(d?.nom_fichier||('Pièce '+(currentPieceIndex+1)));
  if(card)card.dataset.yayaDownloadUrl=url||'';
  if(!url){stage.innerHTML='<div class="v4-empty">Lien de cette pièce introuvable.</div>';return;}
  const id=driveId(url);
  if(id){
    renderDriveInStage(stage,url,id,token).catch(async err=>{
      if(token!==previewToken||!stage.isConnected)return;
      console.warn('Yaya Commandes : API Drive indisponible, essai page directe',err);
      try{
        await renderDrivePagesFallback(stage,id,token);
      }catch(err2){
        if(token!==previewToken||!stage.isConnected)return;
        console.warn('Yaya Commandes : page Drive indisponible',err2);
        stage.innerHTML='<div class="v4-error">Aperçu impossible pour cette pièce.<br>Utilisez le bouton Télécharger.</div>';
      }
    });
    return;
  }
  renderExternalInStage(stage,url,title);
}
function openModal(id){currentOrderId=String(id||'');currentPieceIndex=0;const m=ensureModal();renderModal();m.classList.add('show');m.setAttribute('aria-hidden','false');}
function deletePiece(d){
  if(!d?.id||!confirm('Supprimer cette pièce ?'))return;
  const state=readState(),next=(state.documents||[]).filter(x=>String(x?.id||'')!==String(d.id));writeDocuments(next);renderModal();
  try{window.YayaCommandesNativeEmbed?.render();}catch(_){ }
  schedule();toast('Pièce supprimée localement — serveur en arrière-plan');
  postDelete(d.id).then(()=>toast('Pièce supprimée','ok')).catch(()=>toast('Suppression serveur à contrôler','err'));
}

function sanitize(top){top.querySelectorAll('.ycn-top-status,.ycn-top-docs,.ycn-top-note,.ycn-row-direct-actions,.ycn-v4-status,.ycn-v4-pieces,.ycn-v4-url').forEach(x=>x.remove());}
function enhance(row){
  const id=String(row?.dataset?.ycnRow||'');if(!id)return;
  const top=row.querySelector('.ycn-row-top'),edit=row.querySelector('[data-ycn-edit]'),hiddenStatus=row.querySelector('.ycn-row-detail [data-ycn-status]');if(!top||!edit||!hiddenStatus)return;
  sanitize(top);row.classList.remove('open');
  const status=hiddenStatus.cloneNode(true);status.removeAttribute('data-ycn-status');status.className='ycn-v4-status';status.value=hiddenStatus.value;status.onclick=e=>e.stopPropagation();status.onchange=e=>{e.stopPropagation();hiddenStatus.value=status.value;hiddenStatus.dispatchEvent(new Event('change',{bubbles:true}));};
  const n=docsFor(id).length,pieces=document.createElement('button');pieces.type='button';pieces.className='ycn-v4-pieces'+(n?' has':'');pieces.textContent='📎 '+n;pieces.title=n===1?'1 pièce jointe':n+' pièces jointes';pieces.setAttribute('aria-label',pieces.title);pieces.onclick=e=>{e.preventDefault();e.stopPropagation();openModal(id);};
  const o=orderById(id),url=orderUrl(o),link=document.createElement('button');link.type='button';link.className='ycn-v4-url';link.textContent='🔗';link.disabled=!url;link.title=url?'Ouvrir le lien':'Aucun lien';link.setAttribute('aria-label',link.title);link.onclick=e=>{e.preventDefault();e.stopPropagation();if(url)window.open(url,'_blank','noopener');};
  top.append(status,pieces,link);
  if(!top.dataset.ycnV4Edit){top.dataset.ycnV4Edit='1';top.addEventListener('click',e=>{if(e.target.closest('button,a,input,select,textarea,label'))return;e.preventDefault();e.stopPropagation();edit.click();});}
  row.dataset.ycnLineV4='1';
}
function enhanceAll(){scheduled=false;injectStyle();document.querySelectorAll('.yaya-cmd-native-root .ycn-row[data-ycn-row]').forEach(enhance);}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhanceAll);}

injectStyle();ensureModal();schedule();
const obs=new MutationObserver(records=>{
  for(const r of records){
    const target=r.target?.nodeType===1?r.target:null;
    if(target?.closest?.('#'+MODAL_ID))continue;
    if([...r.addedNodes].some(n=>n?.nodeType===1&&(n.matches?.('.ycn-row,.ycn-row-direct-actions,.ycn-top-status,.ycn-top-docs,.ycn-top-note')||n.querySelector?.('.ycn-row,.ycn-row-direct-actions')))){schedule();break;}
  }
});
obs.observe(document.body,{childList:true,subtree:true});
window.addEventListener('yaya:data-refreshed',schedule);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById(MODAL_ID)?.classList.contains('show'))closeModal();});
window.__YAYA_COMMANDES_LINE_V4_VERSION='4.3-compact-glance';
})();