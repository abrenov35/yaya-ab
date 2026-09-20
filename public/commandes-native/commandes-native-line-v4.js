(function(){
'use strict';
if(window.__YAYA_COMMANDES_LINE_V4)return;
window.__YAYA_COMMANDES_LINE_V4=true;

const CACHE_KEYS=['YAYA_COMMANDES_EMBED_CACHE_V3'];
const MODAL_ID='ycnIframePiecesV4';
let currentOrderId='';
let currentPieceIndex=0;
let scheduled=false;
let previewToken=0;
let pdfJsPromise=null;
const STATUS_CHOICES=[
  {key:'choice',label:'Attente choix'},
  {key:'todo',label:'À commander'},
  {key:'ordered',label:'Commandé'},
  {key:'received',label:'Reçu'}
];
let openStatusMenu=null;

function statusLabel(key){
  const row=STATUS_CHOICES.find(function(x){return x.key===String(key||'');});
  return row?row.label:'Attente choix';
}

function closeStatusMenu(){
  if(openStatusMenu&&openStatusMenu.isConnected)openStatusMenu.remove();
  openStatusMenu=null;
}

function openFastStatusMenu(anchor,current,onPick){
  closeStatusMenu();
  if(!anchor||!anchor.isConnected)return;

  const rect=anchor.getBoundingClientRect();
  const menu=document.createElement('div');
  menu.className='ycn-v4-status-menu';
  menu.setAttribute('role','menu');

  STATUS_CHOICES.forEach(function(item){
    const b=document.createElement('button');
    b.type='button';
    b.className='ycn-v4-status-choice'+(item.key===current?' selected':'');
    b.textContent=item.label;
    b.dataset.value=item.key;
    b.onclick=function(e){
      e.preventDefault();
      e.stopPropagation();
      closeStatusMenu();
      onPick(item.key,item.label);
    };
    menu.appendChild(b);
  });

  document.body.appendChild(menu);
  openStatusMenu=menu;

  const viewportW=document.documentElement.clientWidth||window.innerWidth||1024;
  const minW=Math.max(190,Math.round(rect.width));
  let left=Math.round(rect.left);
  if(left+minW>viewportW-8)left=Math.max(8,viewportW-minW-8);
  menu.style.left=left+'px';
  menu.style.top=Math.round(rect.bottom+4)+'px';
  menu.style.width=minW+'px';
}

document.addEventListener('pointerdown',function(e){
  if(!openStatusMenu)return;
  if(e.target&&e.target.closest&&e.target.closest('.ycn-v4-status-menu,.ycn-v4-status'))return;
  closeStatusMenu();
},true);
window.addEventListener('resize',closeStatusMenu,{passive:true});
window.addEventListener('scroll',closeStatusMenu,true);

let enhanceStateSnapshot=null;
function readState(){
  if(enhanceStateSnapshot)return enhanceStateSnapshot;
  try{
    if(typeof S!=='undefined'&&S&&Array.isArray(S.commandes)){
      let cachedDocs=[];
      try{const d=JSON.parse(localStorage.getItem(CACHE_KEYS[0])||'{}');cachedDocs=Array.isArray(d?.documents)?d.documents:[];}catch(_){}
      return {orders:S.commandes.slice(),documents:cachedDocs};
    }
  }catch(_){}
  try{const raw=localStorage.getItem(CACHE_KEYS[0]);if(raw){const d=JSON.parse(raw);if(Array.isArray(d?.orders))return d;}}catch(_){}
  return {orders:[],documents:[]};
}
function orderById(id){return (readState().orders||[]).find(o=>String(o?.id||'')===String(id||''))||null;}
function docsFor(id){
  const state=readState();
  const docs=(state.documents||[]).filter(d=>String(d?.commande_id||'')===String(id||''));
  const order=(state.orders||[]).find(o=>String(o?.id||'')===String(id||''))||null;
  const attachmentUrl=String(order?.lien||'').trim();
  const pieceNom=String(order?.pieceNom||order?.piece_nom||'').trim();
  if(attachmentUrl&&pieceNom){
    const exists=docs.some(d=>docUrl(d)===attachmentUrl);
    if(!exists)docs.unshift({
      id:'order-attachment:'+String(order?.id||id||''),
      commande_id:String(order?.id||id||''),
      type:'Fichier',
      nom_fichier:pieceNom,
      url_pdf:attachmentUrl,
      source:'Yaya',
      __yayaOrderAttachment:true
    });
  }
  return docs;
}
function docUrl(d){return String(d?.url_pdf||d?.url||d?.lien||d?.webUrl||d?.oneDriveWebUrl||'').trim();}
function orderUrl(o){const piece=String(o?.pieceNom||o?.piece_nom||'').trim();return String(o?.lienUrl||o?.lien_url||o?.urlCommande||o?.url_commande||o?.url||o?.webUrl||o?.oneDriveWebUrl||o?.driveUrl||o?.dropboxUrl||(!piece?o?.lien:'')||'').trim();}
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
function directDownloadUrl(url){
  url=String(url||'').trim();if(!url)return '';
  const id=driveId(url);
  if(id)return 'https://drive.usercontent.google.com/download?id='+encodeURIComponent(id)+'&export=download&confirm=t';
  try{
    const u=new URL(url);
    if(/(?:^|\.)dropbox\.com$/i.test(u.hostname)){u.searchParams.delete('raw');u.searchParams.set('dl','1');return u.toString();}
    if(/(?:1drv\.ms|onedrive\.live\.com|sharepoint\.com)$/i.test(u.hostname)){u.searchParams.set('download','1');return u.toString();}
  }catch(_){}
  return url;
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
function renderDrivePreviewFast(stage,id,title,token){
  if(token!==previewToken||!stage.isConnected)return;
  const iframe=document.createElement('iframe');
  iframe.src='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
  iframe.title=title||'Pièce jointe';
  iframe.loading='eager';
  iframe.referrerPolicy='no-referrer-when-downgrade';
  stage.replaceChildren(iframe);
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

  function width(){
    const dpr=Math.min(1.6,Math.max(1,window.devicePixelRatio||1));
    return Math.max(760,Math.min(1500,(stage.clientWidth||700)*dpr));
  }
  async function get(n){return loadDrivePage(drivePageCandidates(id,n,width()),4200);}
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
  try{
    const raw=localStorage.getItem(CACHE_KEYS[0]);
    const d=raw?JSON.parse(raw):{orders:(typeof S!=='undefined'&&S&&Array.isArray(S.commandes)?S.commandes:[])};
    d.documents=Array.isArray(next)?next:[];d.savedAt=Date.now();
    localStorage.setItem(CACHE_KEYS[0],JSON.stringify(d));
  }catch(_){}
}
function toast(text,kind=''){
  let el=document.getElementById('ycnToast');
  if(!el){el=document.createElement('div');el.id='ycnToast';el.className='ycn-toast';document.body.appendChild(el);}
  el.textContent=text||'';el.className='ycn-toast show'+(kind?' '+kind:'');clearTimeout(el.__t);el.__t=setTimeout(()=>el.className='ycn-toast',3200);
}
function postDelete(id){return Promise.resolve({ok:true,id:String(id||'')});}

function injectStyle(){
  if(document.getElementById('ycn-line-v4-style'))return;
  const s=document.createElement('style');s.id='ycn-line-v4-style';s.textContent=`
    .yaya-cmd-native-root .ycn-row{cursor:pointer!important}
    .yaya-cmd-native-root .ycn-row-detail,.yaya-cmd-native-root .ycn-row.open .ycn-row-detail{display:none!important}
    .yaya-cmd-native-root .ycn-row-toggle{display:none!important}
    .yaya-cmd-native-root .ycn-row-top{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:6px!important;align-items:center!important;padding:10px!important}
    .yaya-cmd-native-root .ycn-row-summary{display:contents!important}
    .yaya-cmd-native-root .ycn-row-summary .ycn-qte,.yaya-cmd-native-root .ycn-row-summary .ycn-resp{display:none!important}
    .yaya-cmd-native-root .ycn-row-summary strong{display:block!important;grid-column:1/-1!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#102b48!important;font-size:13px!important;font-weight:900!important;line-height:1.25!important}
    .yaya-cmd-native-root .ycn-row-summary .ycn-supplier{display:block!important;grid-column:1/-1!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#6b7b8d!important;font-size:10.8px!important;line-height:1.2!important}
    .yaya-cmd-native-root .ycn-v4-status{grid-column:1/-1!important;width:100%!important;min-width:0!important;max-width:none!important;height:30px!important;border:1px solid #cbd7e4!important;border-radius:7px!important;background:#fff!important;color:#17324f!important;padding:0 8px!important;font:inherit!important;font-size:10.8px!important;font-weight:800!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;text-align:left!important}
    .yaya-cmd-native-root .ycn-v4-status:after{content:'⌄';font-size:13px;line-height:1;color:#61758a}
    .ycn-v4-status-menu{position:fixed;z-index:2147483646;display:grid;gap:2px;padding:5px;background:#fff;border:1px solid #cbd7e4;border-radius:9px;box-shadow:0 12px 34px rgba(15,38,64,.22);box-sizing:border-box}
    .ycn-v4-status-choice{display:block;width:100%;min-height:34px;padding:7px 10px;border:0;border-radius:6px;background:#fff;color:#17324f;text-align:left;font:inherit;font-size:12px;font-weight:750;cursor:pointer}
    .ycn-v4-status-choice:hover,.ycn-v4-status-choice:focus{background:#eef4fa;outline:none}
    .ycn-v4-status-choice.selected{background:#e4edf7;color:#102b48;font-weight:900}
    .yaya-cmd-native-root .ycn-v4-pieces,.yaya-cmd-native-root .ycn-v4-url{width:100%!important;min-width:0!important;height:30px!important;border:1px solid #cbd7e4!important;border-radius:7px!important;background:#fff!important;padding:0 8px!important;font:inherit!important;font-size:10.5px!important;font-weight:850!important;white-space:nowrap!important;cursor:pointer!important;display:inline-flex!important;align-items:center!important;justify-content:center!important}
    .yaya-cmd-native-root .ycn-v4-pieces{grid-column:1!important;color:#1f5f9f!important}
    .yaya-cmd-native-root .ycn-v4-pieces.has{background:#edf7ff!important;border-color:#b9d8f4!important}
    .yaya-cmd-native-root .ycn-v4-url{grid-column:2!important;color:#17653a!important;background:#eef9f1!important;border-color:#b9dfc5!important}
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
    #${MODAL_ID} .v4-loading,#${MODAL_ID} .v4-head-actions{display:flex;align-items:center;gap:9px}
    #${MODAL_ID} .v4-edit,#${MODAL_ID} .v4-download{border:1px solid #9fc0df;background:#eef6ff;color:#245d91;border-radius:8px;min-height:34px;padding:0 13px;font:inherit;font-size:12px;font-weight:850;cursor:pointer}
    #${MODAL_ID} .v4-download{border-color:#b9dfc5;background:#eef9f1;color:#17653a}
    #${MODAL_ID} .v4-edit:hover{background:#e2f0fd;border-color:#7eacd8}
    #${MODAL_ID} .v4-error,#${MODAL_ID} .v4-empty{height:100%;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;text-align:center;color:#708095;font-size:13px;font-weight:700}
    @media(max-width:760px){.yaya-cmd-native-root .ycn-row-top{padding:9px!important}.yaya-cmd-native-root .ycn-v4-url:disabled{display:none!important}#${MODAL_ID}{padding:4px}#${MODAL_ID} .v4-card{width:calc(100vw - 8px);height:calc(100dvh - 8px);border-radius:8px}}
  `;document.head.appendChild(s);
}

function ensureModal(){
  let m=document.getElementById(MODAL_ID);if(m)return m;
  m=document.createElement('div');m.id=MODAL_ID;m.setAttribute('aria-hidden','true');
  m.innerHTML='<div class="v4-card" role="dialog" aria-modal="true"><div class="v4-head"><strong>Visualisation des pièces</strong><div class="v4-head-actions"><button type="button" class="v4-download">Télécharger</button><button type="button" class="v4-edit">Modifier</button><button type="button" class="v4-close">Fermer</button></div></div><div class="v4-tabs"></div><div class="v4-stage"></div></div>';
  document.body.appendChild(m);
  m.querySelector('.v4-close').onclick=closeModal;
  m.querySelector('.v4-download').onclick=function(e){
    e.preventDefault();e.stopPropagation();
    const url=String(m.dataset.yayaDownloadUrl||'').trim();
    if(!url)return;
    const a=document.createElement('a');
    a.href=directDownloadUrl(url);
    a.target='_blank';a.rel='noopener';a.download='';
    document.body.appendChild(a);a.click();a.remove();
  };
  m.querySelector('.v4-edit').onclick=function(e){
    e.preventDefault();e.stopPropagation();
    const id=String(currentOrderId||'').trim();
    closeModal();
    if(!id)return;
    const row=document.querySelector('.yaya-cmd-native-root .ycn-row[data-ycn-row="'+CSS.escape(id)+'"]');
    const edit=row&&row.querySelector('[data-ycn-edit]');
    if(edit)setTimeout(function(){edit.click();},0);
  };
  m.onclick=e=>{if(e.target===m)closeModal();};return m;
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
    wrap.append(view);
    if(!d?.__yayaOrderAttachment){const del=document.createElement('button');del.type='button';del.className='v4-del';del.textContent='×';del.title='Supprimer cette pièce';del.onclick=()=>deletePiece(d);wrap.append(del);}
    tabs.appendChild(wrap);
  });
  const d=list[currentPieceIndex],url=docUrl(d),title=String(d?.nom_fichier||('Pièce '+(currentPieceIndex+1)));
  if(card)card.dataset.yayaDownloadUrl=url||'';
  if(m)m.dataset.yayaDownloadUrl=url||'';
  const dlBtn=m&&m.querySelector('.v4-download');if(dlBtn)dlBtn.style.display=url?'inline-flex':'none';
  if(!url){stage.innerHTML='<div class="v4-empty">Lien de cette pièce introuvable.</div>';return;}
  const id=driveId(url);
  if(id){
    // Chemin ultra-rapide : lecteur Drive natif dans l'iframe.
    // Aucun base64, aucun PDF.js, aucune reconstruction page par page avant affichage.
    renderDrivePreviewFast(stage,id,title,token);
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


function fitStatusWidth(sel){
  if(!sel)return;
  try{
    sel.style.removeProperty('width');
    sel.style.removeProperty('min-width');
    sel.style.removeProperty('max-width');
  }catch(_){}
}

function setImp(el,prop,value){if(el)el.style.setProperty(prop,value,'important');}
function sanitize(row,top){
  top.querySelectorAll('.ycn-top-status,.ycn-top-docs,.ycn-top-note,.ycn-row-direct-actions,.ycn-v4-status,.ycn-v4-pieces,.ycn-v4-url').forEach(x=>x.remove());
  row.querySelectorAll(':scope > .ycn-v4-actions').forEach(x=>x.remove());
}
function styleActionBar(bar,status,pieces,link){
  setImp(bar,'display','flex');
  setImp(bar,'width','calc(100% - 16px)');
  setImp(bar,'max-width','none');
  setImp(bar,'margin','0 8px 8px 8px');
  setImp(bar,'gap','6px');
  setImp(bar,'box-sizing','border-box');
  setImp(bar,'align-items','stretch');
  [[status,'1.4 1 0'],[pieces,'1 1 0'],[link,'.8 1 0']].forEach(pair=>{
    const el=pair[0];
    setImp(el,'flex',pair[1]);
    setImp(el,'width','0');
    setImp(el,'min-width','0');
    setImp(el,'max-width','none');
    setImp(el,'height','32px');
    setImp(el,'margin','0');
    setImp(el,'box-sizing','border-box');
  });
  setImp(pieces,'display','inline-flex');setImp(pieces,'align-items','center');setImp(pieces,'justify-content','center');
  setImp(link,'display','inline-flex');setImp(link,'align-items','center');setImp(link,'justify-content','center');
  if(link.disabled){setImp(link,'visibility','hidden');setImp(link,'pointer-events','none');}
}
function enhance(row){
  const id=String(row?.dataset?.ycnRow||'');if(!id)return;
  const top=row.querySelector('.ycn-row-top'),edit=row.querySelector('[data-ycn-edit]'),hiddenStatus=row.querySelector('.ycn-row-detail [data-ycn-status]');if(!top||!edit||!hiddenStatus)return;
  sanitize(row,top);row.classList.remove('open');
  const status=document.createElement('button');
  status.type='button';
  status.className='ycn-v4-status';
  status.dataset.value=String(hiddenStatus.value||'choice');
  status.textContent=statusLabel(status.dataset.value);
  status.onclick=function(e){
    e.preventDefault();
    e.stopPropagation();
    const current=String(status.dataset.value||hiddenStatus.value||'choice');
    openFastStatusMenu(status,current,function(value,label){
      const api=window.YayaCommandesNativeEmbed;
      if(api&&typeof api.changeStatus==='function'){
        const ok=api.changeStatus(id,value);
        if(ok===false)return;
        return;
      }
      // Secours pour une ancienne version du moteur encore en cache.
      status.dataset.value=value;
      status.textContent=label;
      hiddenStatus.value=value;
      hiddenStatus.dispatchEvent(new Event('change',{bubbles:true}));
    });
  };
  const n=docsFor(id).length,pieces=document.createElement('button');pieces.type='button';pieces.className='ycn-v4-pieces'+(n?' has':'');pieces.textContent=n>1?('📎 '+n):'📎 Pièce';pieces.title=n===1?'Voir la pièce jointe':(n>1?'Voir les '+n+' pièces jointes':'Aucune pièce jointe');pieces.setAttribute('aria-label',pieces.title);pieces.onclick=e=>{e.preventDefault();e.stopPropagation();openModal(id);};
  const o=orderById(id),url=orderUrl(o),pieceNom=String(o?.pieceNom||o?.piece_nom||'').trim(),link=document.createElement('button');link.type='button';link.className='ycn-v4-url';link.textContent='🔗 Lien';link.disabled=!url;link.title=url&&!pieceNom?'Ouvrir le lien':'Aucun lien';link.setAttribute('aria-label',link.title);link.onclick=e=>{e.preventDefault();e.stopPropagation();if(url&&!pieceNom)window.open(url,'_blank','noopener');};
  const bar=document.createElement('div');bar.className='ycn-v4-actions';bar.append(status,pieces,link);styleActionBar(bar,status,pieces,link);row.appendChild(bar);
  if(!top.dataset.ycnV4Edit){top.dataset.ycnV4Edit='1';top.addEventListener('click',e=>{if(e.target.closest('button,a,input,select,textarea,label'))return;e.preventDefault();e.stopPropagation();edit.click();});}
  row.dataset.ycnLineV4='1';
}
function enhanceAll(){
  scheduled=false;
  closeStatusMenu();
  injectStyle();
  enhanceStateSnapshot=readState();
  try{
    document.querySelectorAll('.yaya-cmd-native-root .ycn-row[data-ycn-row]').forEach(enhance);
  }finally{
    enhanceStateSnapshot=null;
  }
}
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
window.__YAYA_COMMANDES_LINE_V4_VERSION='4.5-native-action-bar';
})();