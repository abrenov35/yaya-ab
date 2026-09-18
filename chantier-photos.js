(function(){
'use strict';
if(window.__YAYA_PHOTOS_V25)return;window.__YAYA_PHOTOS_V25=true;
var DEF='Titre à définir',TYPE='PHOTO',MAX=8*1024*1024,STYLE='yaya-photos-v25';
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase()}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function iso(v){var m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[1]+'-'+m[2]+'-'+m[3]:''}
function fr(v){var s=iso(v);if(!s)return 'Date à définir';var p=s.split('-');return p[2]+'/'+p[1]+'/'+p[0]}
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function docs(){try{return Array.isArray(S.documents)?S.documents:[]}catch(e){return[]}}
function isPhoto(d){return d&&norm(d.type)===TYPE}
function rows(cid){return docs().filter(function(d){return isPhoto(d)&&String(d.chantierId||'')===String(cid||'')}).sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))})}
function isImageFile(file){var t=String(file&&file.type||'').toLowerCase(),n=String(file&&file.name||'');return t.indexOf('image/')===0||/\.(?:jpe?g|png|heic|heif|webp)$/i.test(n)}
function toastS(m,e){try{toast(m,!!e)}catch(x){}}
function id(){try{if(typeof uid==='function')return String(uid())}catch(e){}return 'photo-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)}
function cardId(card){if(!card)return'';var ns=card.querySelectorAll('[onclick]');for(var i=0;i<ns.length;i++){var m=String(ns[i].getAttribute('onclick')||'').match(/(?:toggleChantier|openDocumentModal|openAchat|openAvenant|delChantier)\(['"]([^'"]+)/);if(m)return m[1]}try{return String(focusChantier||'')}catch(e){return''}}
function root(){return document.getElementById('modalRoot')}
function close(){if(window.__yayaPhotoKeyHandler){try{document.removeEventListener('keydown',window.__yayaPhotoKeyHandler)}catch(e){}window.__yayaPhotoKeyHandler=null}try{closeModal();return}catch(e){}var r=root();if(r)r.innerHTML=''}
function driveId(u){var s=String(u||''),m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);if(m)return m[1];m=s.match(/[?&]id=([^&#]+)/i);return m?decodeURIComponent(m[1]):''}
function preview(u){var x=driveId(u);return x?'https://drive.google.com/file/d/'+encodeURIComponent(x)+'/preview':String(u||'')}
function thumb(u,w){var x=driveId(u),z=Math.max(200,Number(w)||500);return x?'https://drive.google.com/thumbnail?id='+encodeURIComponent(x)+'&sz=w'+z:String(u||'')}
function download(u){var x=driveId(u);return x?'https://drive.google.com/uc?export=download&id='+encodeURIComponent(x):String(u||'')}

function apiUrl(){
  try{if(typeof API!=='undefined'&&API)return String(API)}catch(e){}
  return 'https://script.google.com/macros/s/AKfycbxXBpXjWXEF-7p6vvOE3blSBc8_5e62AtQb2stHjnrGE025cOxQGy-zAguYmN2u9O4K/exec';
}
var photoFileCache=new Map(),heicConverterPromise=null;
var photoThumbObserver=null,photoThumbFallbackQueue=[],photoThumbFallbackActive=0,PHOTO_THUMB_FALLBACK_MAX=2;
var lastPhotoDatasetSignature='';
var PHOTO_PENDING_KEY='YAYA_PENDING_PHOTOS_V1';
var PHOTO_DB='YAYA_PHOTO_UPLOAD_QUEUE_V1';
var PHOTO_STORE='jobs';
var PHOTO_CACHE_KEY='YAYA_CACHE_DATA_V2';
var PHOTO_BINARY_CACHE='yaya-photo-binary-v1';
var PHOTO_BINARY_CACHE_MAX=40;
var photoCommitBusy=false,photoSyncBusy=false,photoJobBusy=false,lastPhotoSyncAt=0;
var photoUploadState={active:false,batchId:'',total:0,done:0,failed:0,startedAt:0,phase:'',detail:''};
var photoUploadUiTimer=0,photoUploadHideTimer=0;

function photoElapsed(){
  if(!photoUploadState.startedAt)return '0 s';
  return Math.max(0,Math.round((Date.now()-photoUploadState.startedAt)/1000))+' s';
}
function ensurePhotoUploadBanner(){
  var box=document.getElementById('yaya-photo-upload-status');
  if(box)return box;
  box=document.createElement('div');
  box.id='yaya-photo-upload-status';
  box.className='yaya-photo-upload-status';
  box.setAttribute('aria-live','polite');
  document.body.appendChild(box);
  return box;
}
function renderPhotoUploadBanner(){
  if(!photoUploadState.active)return;
  var box=ensurePhotoUploadBanner(),total=Math.max(1,Number(photoUploadState.total)||1),done=Math.max(0,Number(photoUploadState.done)||0);
  var title=photoUploadState.phase==='done'?'Photos enregistrées':'Enregistrement des photos en cours';
  var sub=photoUploadState.detail||((done)+' / '+total+' photo(s) traitée(s)');
  var spinner=photoUploadState.phase==='done'?'✓':'<span class="yaya-photo-upload-spinner" aria-hidden="true"></span>';
  box.innerHTML='<div class="yaya-photo-upload-icon">'+spinner+'</div><div class="yaya-photo-upload-copy"><strong>'+esc(title)+'</strong><span>'+esc(sub)+' • '+esc(photoElapsed())+'</span></div>';
  box.classList.toggle('done',photoUploadState.phase==='done');
  box.classList.toggle('error',photoUploadState.phase==='error'||photoUploadState.phase==='waiting');
}
function startPhotoUploadStatus(total,batchId){
  clearTimeout(photoUploadHideTimer);
  photoUploadState={active:true,batchId:String(batchId||''),total:Number(total)||0,done:0,failed:0,startedAt:Date.now(),phase:'upload',detail:'Upload et enregistrement lancés…'};
  renderPhotoUploadBanner();
  clearInterval(photoUploadUiTimer);
  photoUploadUiTimer=setInterval(renderPhotoUploadBanner,1000);
}
function setPhotoUploadStatus(phase,detail,doneDelta,failedDelta){
  if(!photoUploadState.active)return;
  photoUploadState.phase=phase||photoUploadState.phase;
  if(detail!=null)photoUploadState.detail=String(detail);
  if(doneDelta)photoUploadState.done=Math.min(photoUploadState.total,photoUploadState.done+Number(doneDelta||0));
  if(failedDelta)photoUploadState.failed+=Number(failedDelta||0);
  renderPhotoUploadBanner();
}
function finishPhotoUploadStatus(ok,detail){
  if(!photoUploadState.active)return;
  photoUploadState.phase=ok?'done':'error';
  photoUploadState.detail=detail||(ok?photoUploadState.total+' photo(s) enregistrée(s)':'Synchronisation en attente');
  if(ok)photoUploadState.done=photoUploadState.total;
  renderPhotoUploadBanner();
  clearInterval(photoUploadUiTimer);
  photoUploadHideTimer=setTimeout(function(){
    var box=document.getElementById('yaya-photo-upload-status');
    if(box)box.remove();
    photoUploadState.active=false;
  },ok?3200:7000);
}

function photoBinaryRequest(url){
  var fid=driveId(url),key=fid||String(url||'').slice(0,500);
  return new Request(location.origin+'/__yaya_photo_cache__/'+encodeURIComponent(key));
}
async function readPhotoBinaryCache(url){
  if(!('caches' in window)||!url)return null;
  try{
    var cache=await caches.open(PHOTO_BINARY_CACHE);
    var response=await cache.match(photoBinaryRequest(url));
    if(!response)return null;
    var blob=await response.blob();
    if(!blob||!blob.size)return null;
    return {blob:blob,mimeType:response.headers.get('Content-Type')||blob.type||'image/jpeg',filename:response.headers.get('X-Yaya-Filename')||'photo'};
  }catch(e){return null}
}
async function storePhotoBinaryCache(url,blob,filename,mimeType){
  if(!('caches' in window)||!url||!blob||!blob.size)return false;
  try{
    var cache=await caches.open(PHOTO_BINARY_CACHE);
    await cache.put(photoBinaryRequest(url),new Response(blob,{headers:{'Content-Type':mimeType||blob.type||'image/jpeg','X-Yaya-Filename':String(filename||'photo'),'X-Yaya-Cached-At':String(Date.now())}}));
    var keys=await cache.keys();
    while(keys.length>PHOTO_BINARY_CACHE_MAX){await cache.delete(keys.shift())}
    return true;
  }catch(e){return false}
}
function photoBinaryResult(cached){
  return {url:URL.createObjectURL(cached.blob),filename:cached.filename,mimeType:cached.mimeType};
}

function clonePhoto(v){
  try{return JSON.parse(JSON.stringify(v));}
  catch(e){return v&&typeof v==='object'?Object.assign({},v):v}
}
function readPhotoPending(){
  try{
    var p=JSON.parse(localStorage.getItem(PHOTO_PENDING_KEY)||'{"upserts":{},"deletes":{}}');
    if(!p||typeof p!=='object')p={};
    if(!p.upserts||typeof p.upserts!=='object')p.upserts={};
    if(!p.deletes||typeof p.deletes!=='object')p.deletes={};
    return p;
  }catch(e){return {upserts:{},deletes:{}}}
}
function writePhotoPending(p){
  try{
    if(!p||(!Object.keys(p.upserts||{}).length&&!Object.keys(p.deletes||{}).length))localStorage.removeItem(PHOTO_PENDING_KEY);
    else localStorage.setItem(PHOTO_PENDING_KEY,JSON.stringify(p));
  }catch(e){}
}
function queuePhotoUpsert(row){
  if(!row||!row.id)return;
  var p=readPhotoPending(),key=String(row.id),token=Date.now()+'_'+Math.random().toString(36).slice(2);
  p.upserts[key]={token:token,doc:clonePhoto(row)};
  delete p.deletes[key];
  writePhotoPending(p);
}
function queuePhotoDelete(rowId){
  var key=String(rowId||'');if(!key)return;
  var p=readPhotoPending(),token=Date.now()+'_'+Math.random().toString(36).slice(2);
  delete p.upserts[key];
  p.deletes[key]={token:token};
  writePhotoPending(p);
}
function applyPhotoPending(baseRows,pending){
  var map=new Map();
  (Array.isArray(baseRows)?baseRows:[]).forEach(function(d){var k=String(d&&d.id||'');if(k)map.set(k,clonePhoto(d))});
  Object.keys(pending&&pending.deletes||{}).forEach(function(k){map.delete(String(k))});
  Object.values(pending&&pending.upserts||{}).forEach(function(item){var d=item&&item.doc,k=String(d&&d.id||'');if(k)map.set(k,clonePhoto(d))});
  return Array.from(map.values());
}
function pendingDocumentRows(){
  var out=[];
  try{
    var p=JSON.parse(localStorage.getItem('YAYA_PENDING_DOCUMENT_UPSERT_V1')||'{"items":{}}');
    Object.values(p&&p.items||{}).forEach(function(item){if(item&&item.doc&&item.doc.id)out.push(clonePhoto(item.doc))});
  }catch(e){}
  return out;
}
function mergeRowsById(base,extra){
  var map=new Map();
  (Array.isArray(base)?base:[]).forEach(function(d){var k=String(d&&d.id||'');if(k)map.set(k,clonePhoto(d))});
  (Array.isArray(extra)?extra:[]).forEach(function(d){var k=String(d&&d.id||'');if(k)map.set(k,clonePhoto(d))});
  return Array.from(map.values());
}
function savePhotoCache(){
  try{
    var cache=JSON.parse(localStorage.getItem(PHOTO_CACHE_KEY)||'{}')||{};
    cache.documents=docs().map(clonePhoto);
    localStorage.setItem(PHOTO_CACHE_KEY,JSON.stringify(cache));
  }catch(e){}
}
async function fetchFreshDocuments(){
  var api=apiUrl();if(!api)throw new Error('API Yaya indisponible');
  var sep=api.indexOf('?')>=0?'&':'?';
  var ctrl=typeof AbortController!=='undefined'?new AbortController():null;
  var timer=ctrl?setTimeout(function(){try{ctrl.abort()}catch(e){}},15000):0;
  try{
    var opts={method:'GET',cache:'no-store'};if(ctrl)opts.signal=ctrl.signal;
    var r=await fetch(api+sep+'tabs=documents&_yaya_photos='+Date.now(),opts);
    if(!r.ok)throw new Error('Synchronisation photos HTTP '+r.status);
    var j=await r.json();
    if(!j||j.ok!==true||!j.data||!Array.isArray(j.data.documents))throw new Error('Documents serveur indisponibles');
    return j.data.documents;
  }finally{if(timer)clearTimeout(timer)}
}
async function commitPhotoPending(){
  if(photoCommitBusy)return false;
  var snapshot=readPhotoPending();
  if(!Object.keys(snapshot.upserts).length&&!Object.keys(snapshot.deletes).length)return true;
  if(typeof window.apiPost!=='function')return false;
  photoCommitBusy=true;
  try{
    var fresh=await fetchFreshDocuments();
    fresh=mergeRowsById(fresh,pendingDocumentRows());
    var merged=applyPhotoPending(fresh,snapshot);
    var ok=await window.apiPost('setDocuments',merged);
    if(!ok)throw new Error('Écriture photos refusée');

    var latest=readPhotoPending();
    Object.keys(snapshot.upserts).forEach(function(k){
      if(latest.upserts[k]&&latest.upserts[k].token===snapshot.upserts[k].token)delete latest.upserts[k];
    });
    Object.keys(snapshot.deletes).forEach(function(k){
      if(latest.deletes[k]&&latest.deletes[k].token===snapshot.deletes[k].token)delete latest.deletes[k];
    });
    writePhotoPending(latest);

    if(typeof S!=='undefined'&&S)S.documents=applyPhotoPending(merged,latest);
    savePhotoCache();
    lastPhotoSyncAt=Date.now();
    return true;
  }catch(e){
    console.warn('Yaya Photos — synchronisation en attente :',e);
    return false;
  }finally{photoCommitBusy=false}
}
async function syncPhotosFromServer(force){
  if(photoSyncBusy)return false;
  if(!force&&Date.now()-lastPhotoSyncAt<12000)return true;
  photoSyncBusy=true;
  try{
    var fresh=await fetchFreshDocuments(),pending=readPhotoPending();
    var serverPhotos=fresh.filter(isPhoto);
    var mergedPhotos=applyPhotoPending(serverPhotos,pending);
    var currentPhotos=docs().filter(isPhoto);
    var sortSig=function(a,b){
      return String(a&&a.id||'').localeCompare(String(b&&b.id||''));
    };
    var beforeSig=photoSignature(currentPhotos.slice().sort(sortSig));
    var afterSig=photoSignature(mergedPhotos.slice().sort(sortSig));
    lastPhotoSyncAt=Date.now();

    // Si rien n'a changé côté serveur, ne reconstruit ni le cache ni l'interface.
    if(beforeSig===afterSig)return true;

    var localNonPhotos=docs().filter(function(d){return !isPhoto(d)});
    if(typeof S!=='undefined'&&S)S.documents=mergedPhotos.concat(localNonPhotos);
    savePhotoCache();
    refresh();
    return true;
  }catch(e){
    console.warn('Yaya Photos — lecture serveur impossible :',e);
    return false;
  }finally{photoSyncBusy=false}
}
function openPhotoDb(){
  return new Promise(function(resolve,reject){
    if(!window.indexedDB){reject(new Error('Stockage local indisponible'));return}
    var req=indexedDB.open(PHOTO_DB,1);
    req.onupgradeneeded=function(){var db=req.result;if(!db.objectStoreNames.contains(PHOTO_STORE))db.createObjectStore(PHOTO_STORE,{keyPath:'id'})};
    req.onsuccess=function(){resolve(req.result)};
    req.onerror=function(){reject(req.error||new Error('Stockage photo indisponible'))};
  });
}
async function putPhotoJob(job){
  var db=await openPhotoDb();
  return new Promise(function(resolve,reject){
    var tx=db.transaction(PHOTO_STORE,'readwrite');tx.objectStore(PHOTO_STORE).put(job);
    tx.oncomplete=function(){db.close();resolve(true)};tx.onerror=function(){var e=tx.error;db.close();reject(e)}
  });
}
async function deletePhotoJob(jobId){
  var db=await openPhotoDb();
  return new Promise(function(resolve,reject){
    var tx=db.transaction(PHOTO_STORE,'readwrite');tx.objectStore(PHOTO_STORE).delete(jobId);
    tx.oncomplete=function(){db.close();resolve(true)};tx.onerror=function(){var e=tx.error;db.close();reject(e)}
  });
}
async function listPhotoJobs(){
  var db=await openPhotoDb();
  return new Promise(function(resolve,reject){
    var tx=db.transaction(PHOTO_STORE,'readonly'),req=tx.objectStore(PHOTO_STORE).getAll();
    req.onsuccess=function(){var a=Array.isArray(req.result)?req.result:[];db.close();a.sort(function(x,y){return Number(x.createdAt||0)-Number(y.createdAt||0)});resolve(a)};
    req.onerror=function(){var e=req.error;db.close();reject(e)}
  });
}
function fileFromJob(job){
  var blob=job&&job.blob;if(!blob)return null;
  try{return new File([blob],job.name||'photo.jpg',{type:job.type||blob.type||'image/jpeg',lastModified:job.lastModified||Date.now()})}
  catch(e){try{blob.name=job.name||'photo.jpg'}catch(_e){}return blob}
}
function localUpsertPhoto(row,doRefresh){
  if(typeof S==='undefined'||!S||!Array.isArray(S.documents))return;
  var i=S.documents.findIndex(function(d){return String(d&&d.id||'')===String(row.id)});
  if(i>=0)S.documents[i]=clonePhoto(row);else S.documents.unshift(clonePhoto(row));
  savePhotoCache();
  if(doRefresh!==false)refresh();
}
async function enqueuePhotoJobs(cid,batch,batchId){
  var count=0,seen=new Set();
  for(var i=0;i<batch.length;i++){
    var x=batch[i],f=x&&x.f;if(!f)continue;
    var fp=[cid,f.name,f.size,f.lastModified,iso(x.d)].join('|');
    if(seen.has(fp))continue;seen.add(fp);
    var rowId=id(),jobId='pj_'+rowId;
    await putPhotoJob({
      id:jobId,rowId:rowId,chantierId:String(cid||''),date:iso(x.d)||today(),
      title:groupTitle(rows(cid).filter(function(p){return iso(p.date)===iso(x.d)})),
      name:String(f.name||'photo.jpg'),type:String(f.type||'image/jpeg'),
      lastModified:Number(f.lastModified||Date.now()),blob:f,link:'',createdAt:Date.now()+i,attempts:0,batchId:String(batchId||'')
    });
    count++;
  }
  return count;
}
async function processPhotoJobs(){
  if(photoJobBusy)return;
  if(typeof S==='undefined'||!S||!Array.isArray(S.documents)||typeof window.apiPost!=='function')return;
  photoJobBusy=true;
  var retryNeeded=false;
  try{
    var jobs=[];
    try{jobs=await listPhotoJobs()}catch(e){return}
    var eligible=jobs.filter(function(j){return Number(j&&j.attempts||0)<4});
    if(!eligible.length){
      if(photoUploadState.active)finishPhotoUploadStatus(false,'Aucune photo en cours — vérifiez la connexion');
      return;
    }
    if(!photoUploadState.active)startPhotoUploadStatus(eligible.length,'');

    var ready=[],currentBatchReady=0,currentBatchFailed=0;
    for(var i=0;i<eligible.length;i++){
      var job=eligible[i],isCurrent=!photoUploadState.batchId||String(job.batchId||'')===String(photoUploadState.batchId||'');
      try{
        if(isCurrent)setPhotoUploadStatus('upload','Upload de la photo '+Math.min(i+1,photoUploadState.total)+' / '+photoUploadState.total+'…');
        if(!job.link){
          var file=fileFromJob(job);if(!file)throw new Error('Photo locale absente');
          var t0=Date.now();
          job.link=await archive(file);
          job.uploadMs=Date.now()-t0;
          await putPhotoJob(job);
        }
        var row={id:job.rowId,chantierId:job.chantierId,type:'Photo',titre:job.title||DEF,sujet:job.name||'Photo chantier',date:job.date||today(),lien:job.link};
        queuePhotoUpsert(row);
        localUpsertPhoto(row,false);
        ready.push(job);
        if(isCurrent)currentBatchReady++;
      }catch(e){
        job.attempts=Number(job.attempts||0)+1;job.lastError=String(e&&e.message||e);job.lastTryAt=Date.now();
        try{await putPhotoJob(job)}catch(_e){}
        if(isCurrent)currentBatchFailed++;
        retryNeeded=true;
        console.warn('Yaya Photos — import en attente :',e);
      }
    }

    if(ready.length){
      setPhotoUploadStatus('sync','Upload terminé — enregistrement dans Yaya…');
      var syncStart=Date.now(),ok=await commitPhotoPending(),syncMs=Date.now()-syncStart;
      if(ok){
        for(var k=0;k<ready.length;k++){
          try{await deletePhotoJob(ready[k].id)}catch(_e){}
        }
        savePhotoCache();
        refresh();
        if(currentBatchReady)setPhotoUploadStatus('sync','Synchronisation terminée ('+Math.max(1,Math.round(syncMs/1000))+' s)',currentBatchReady,0);
      }else{
        retryNeeded=true;
        setPhotoUploadStatus('waiting','Photos envoyées — synchronisation Yaya en attente');
      }
    }

    var remaining=[];
    try{remaining=await listPhotoJobs()}catch(e){}
    var currentRemaining=photoUploadState.batchId
      ? remaining.filter(function(j){return String(j&&j.batchId||'')===String(photoUploadState.batchId)})
      : remaining;

    if(photoUploadState.active){
      if(!currentRemaining.length&&currentBatchFailed===0){
        finishPhotoUploadStatus(true,photoUploadState.total+' photo(s) enregistrée(s) — '+photoElapsed());
      }else if(currentBatchFailed){
        setPhotoUploadStatus('waiting',currentBatchFailed+' photo(s) en attente — nouvel essai automatique',0,currentBatchFailed);
        retryNeeded=true;
      }
    }
  }finally{
    photoJobBusy=false;
    if(retryNeeded)setTimeout(processPhotoJobs,5000);
  }
}
function photoSyncPulse(force){
  commitPhotoPending().finally(function(){syncPhotosFromServer(!!force).finally(function(){processPhotoJobs()})});
}
function base64Blob(base64,mime){
  var raw=atob(String(base64||'')),bytes=new Uint8Array(raw.length);
  for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  return new Blob([bytes],{type:mime||'image/jpeg'});
}
function isHeic(value,name){
  return /image\/hei[cf]/i.test(String(value&&value.type||value||''))||/\.(?:heic|heif)$/i.test(String(name||value&&value.name||''));
}
function ensureHeicConverter(){
  if(typeof window.heic2any==='function')return Promise.resolve(window.heic2any);
  if(heicConverterPromise)return heicConverterPromise;
  heicConverterPromise=new Promise(function(resolve,reject){
    var s=document.createElement('script'),done=false;
    var timer=setTimeout(function(){if(done)return;done=true;reject(new Error('Conversion HEIC indisponible'))},15000);
    s.src='https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
    s.async=true;
    s.onload=function(){if(done)return;done=true;clearTimeout(timer);typeof window.heic2any==='function'?resolve(window.heic2any):reject(new Error('Convertisseur HEIC invalide'))};
    s.onerror=function(){if(done)return;done=true;clearTimeout(timer);reject(new Error('Chargement du convertisseur HEIC impossible'))};
    document.head.appendChild(s);
  }).catch(function(e){heicConverterPromise=null;throw e});
  return heicConverterPromise;
}
async function convertHeicBlob(blob){
  var converter=await ensureHeicConverter();
  var out=await converter({blob:blob,toType:'image/jpeg',quality:.88});
  if(Array.isArray(out))out=out[0];
  if(!(out instanceof Blob))throw new Error('Conversion HEIC impossible');
  return out;
}
async function fetchPhotoFile(url){
  var key=String(url||'').trim();
  if(!key)throw new Error('Lien photo manquant');
  if(photoFileCache.has(key))return photoFileCache.get(key);
  var promise=(async function(){
    var cached=await readPhotoBinaryCache(key);
    if(cached)return photoBinaryResult(cached);
    var api=apiUrl(),fid=driveId(key),ctrl=typeof AbortController!=='undefined'?new AbortController():null;
    if(!api||!fid)throw new Error('Lecture photo indisponible');
    var timer=ctrl?setTimeout(function(){try{ctrl.abort()}catch(e){}},20000):0;
    try{
      var opts={method:'POST',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'getDriveFile',data:{url:key,id:fid}})};
      if(ctrl)opts.signal=ctrl.signal;
      var r=await fetch(api,opts);
      if(!r.ok)throw new Error('Lecture photo HTTP '+r.status);
      var j=await r.json();
      if(!j||j.ok!==true)throw new Error(j&&j.error?j.error:'Lecture photo impossible');
      var d=j.data||{};
      if(!d.base64)throw new Error('Photo vide');
      var mime=String(d.mimeType||'image/jpeg'),filename=String(d.filename||'photo');
      var blob=base64Blob(d.base64,mime);
      if(isHeic(blob,filename)){blob=await convertHeicBlob(blob);mime='image/jpeg';filename=filename.replace(/\.(?:heic|heif)$/i,'')+'.jpg'}
      await storePhotoBinaryCache(key,blob,filename,mime);
      return {url:URL.createObjectURL(blob),filename:filename,mimeType:mime};
    }catch(e){
      if(e&&e.name==='AbortError')throw new Error('Lecture photo trop longue');
      throw e;
    }finally{if(timer)clearTimeout(timer)}
  })();
  photoFileCache.set(key,promise);
  try{return await promise}catch(e){photoFileCache.delete(key);throw e}
}
function pumpPhotoThumbFallbackQueue(){
  while(photoThumbFallbackActive<PHOTO_THUMB_FALLBACK_MAX&&photoThumbFallbackQueue.length){
    var img=photoThumbFallbackQueue.shift();
    if(!img||!img.isConnected||img.dataset.yayaFallback==='1')continue;
    img.dataset.yayaFallback='1';
    photoThumbFallbackActive++;
    (async function(target){
      var tile=target.closest('.yaya-pic');
      try{
        var f=await fetchPhotoFile(target.dataset.photoLink||'');
        if(!target.isConnected)return;
        target.onload=function(){if(tile){tile.classList.add('loaded');tile.classList.remove('fallback')}};
        target.onerror=function(){target.style.display='none';if(tile){tile.classList.add('fallback');tile.classList.remove('loaded')}};
        target.src=f.url;
      }catch(e){
        if(target.isConnected){
          target.style.display='none';
          if(tile){tile.classList.add('fallback');tile.classList.remove('loaded')}
        }
      }finally{
        photoThumbFallbackActive=Math.max(0,photoThumbFallbackActive-1);
        pumpPhotoThumbFallbackQueue();
      }
    })(img);
  }
}
window.yayaPhotoThumbFallback=function(img){
  if(!img||img.dataset.yayaFallback==='1'||img.dataset.yayaFallbackQueued==='1')return;
  img.dataset.yayaFallbackQueued='1';
  photoThumbFallbackQueue.push(img);
  pumpPhotoThumbFallbackQueue();
};
function activatePhotoThumb(img){
  if(!img||img.dataset.yayaActivated==='1')return;
  img.dataset.yayaActivated='1';
  var tile=img.closest('.yaya-pic');
  img.onload=function(){
    if(tile){tile.classList.add('loaded');tile.classList.remove('fallback')}
  };
  img.onerror=function(){
    window.yayaPhotoThumbFallback&&window.yayaPhotoThumbFallback(img)
  };
  var src=String(img.dataset.src||''),photoLink=String(img.dataset.photoLink||'');
  (async function(){
    var cached=await readPhotoBinaryCache(photoLink);
    if(!img.isConnected)return;
    if(cached){img.src=URL.createObjectURL(cached.blob);return}
    if(src)img.src=src;
  })();
  setTimeout(function(){
    if(!img.isConnected||img.dataset.yayaFallback==='1')return;
    if(!img.complete||!img.naturalWidth)window.yayaPhotoThumbFallback&&window.yayaPhotoThumbFallback(img);
  },6500);
}
function ensurePhotoThumbObserver(){
  if(photoThumbObserver||!('IntersectionObserver' in window))return photoThumbObserver;
  photoThumbObserver=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      photoThumbObserver.unobserve(entry.target);
      activatePhotoThumb(entry.target);
    });
  },{rootMargin:'220px 0px',threshold:0.01});
  return photoThumbObserver;
}
function hydratePhotoThumbs(pane){
  if(!pane)return;
  var observer=ensurePhotoThumbObserver();
  pane.querySelectorAll('.yaya-photo-thumb').forEach(function(img){
    if(img.dataset.yayaActivated==='1')return;
    if(observer)observer.observe(img);
    else activatePhotoThumb(img);
  });
}
function style(){if(document.getElementById(STYLE))return;var s=document.createElement('style');s.id=STYLE;s.textContent=
'#pane-chantiers .yaya-detail-section-tab[data-section="photos"]{background:#f2f7f3!important;border-color:#b8d6c0!important;color:#356b45!important}'+
'#pane-chantiers .yaya-detail-section-tab[data-section="photos"].on{background:#e1f0e5!important;border-color:#78ae87!important;color:#2f633e!important}'+
'#pane-chantiers .yaya-detail-section-tab[data-section="photos"] small{background:#dcebfa!important;color:#1e5b9e!important;border-color:#c7dcf2!important}'+
'#pane-chantiers .card[data-yaya-detail-section="photos"]>.yaya-detail-section-action-row[data-section="photos"]{display:flex!important}'+
'#pane-chantiers .yaya-detail-section-action-row[data-section="photos"]{background:#f3f8f4!important;border-left:4px solid #78ae87!important}'+
'#pane-chantiers .yaya-detail-section-action-row[data-section="photos"]>.yaya-detail-section-action-button{display:none!important}'+
'#pane-chantiers .yaya-photo-action-buttons{display:flex!important;gap:8px!important;align-items:center!important;flex-wrap:wrap!important;margin-left:auto!important}'+
'#pane-chantiers .yaya-photo-action-buttons button{min-height:36px!important;height:36px!important;padding:0 13px!important;border-radius:8px!important;font-size:11.5px!important;font-weight:850!important;white-space:nowrap!important;box-shadow:none!important}'+
'#pane-chantiers .yaya-photo-action-buttons .yaya-photo-camera-action{background:#173f69!important;border:1px solid #173f69!important;color:#fff!important}'+
'#pane-chantiers .yaya-photo-action-buttons .yaya-photo-camera-action:hover{background:#0f3154!important;border-color:#0f3154!important}'+
'#pane-chantiers .yaya-photo-action-buttons .yaya-photo-import-action{background:#fff!important;border:1px solid #7f98b3!important;color:#173f69!important}'+
'#pane-chantiers .yaya-photo-action-buttons .yaya-photo-import-action:hover{background:#eef4fa!important;border-color:#5f7f9f!important}'+
'@media(max-width:560px){#pane-chantiers .yaya-detail-section-action-row[data-section="photos"]{align-items:stretch!important}#pane-chantiers .yaya-photo-action-buttons{width:100%!important;margin-left:0!important;display:grid!important;grid-template-columns:1fr!important;gap:7px!important}#pane-chantiers .yaya-photo-action-buttons button{width:100%!important;justify-content:center!important}}'+
'#pane-chantiers .yaya-detail-photos-pane{display:none!important;margin:0 0 8px!important}#pane-chantiers .card[data-yaya-detail-section="photos"]>.yaya-detail-photos-pane[data-empty="0"]{display:block!important}'+
'.yaya-pg{margin:0 0 9px;border:1px solid #e0e7ee;border-radius:9px;overflow:hidden}.yaya-ph{display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center;padding:7px 9px;background:#f7f9fb}.yaya-pd{font-size:11px;font-weight:800}.yaya-pt{font-size:11px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.yaya-pe{width:28px;height:28px;padding:0}.yaya-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px;padding:7px}.yaya-pic{aspect-ratio:4/3;padding:0;border:1px solid #d8e1ea;border-radius:7px;overflow:hidden;background:#eef2f5}.yaya-pic img{width:100%;height:100%;object-fit:cover}.yaya-pic.fallback:after{content:\"📷\";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;color:#6b7d90}.yaya-photo-view-img{display:block;width:100%;height:min(70vh,760px);object-fit:contain;background:#eef1f4;border:1px solid #d9e1e8;border-radius:8px}'+
'#modalRoot .yaya-photo-overlay{align-items:center!important;justify-content:center!important;padding:12px!important;box-sizing:border-box!important}'+
'#modalRoot .yaya-photo-overlay>.modal{margin:auto!important;max-height:calc(100vh - 24px)!important;overflow:auto!important;box-sizing:border-box!important}'+
'#modalRoot .yaya-pa{width:min(680px,calc(100vw - 24px))!important}.yaya-pactions{display:flex;gap:8px;margin:12px 0;flex-wrap:wrap}.yaya-pactions button{flex:1 1 180px;min-height:42px}.yaya-pq{display:grid;gap:7px;max-height:42vh;overflow:auto}.yaya-pqr{display:grid;grid-template-columns:54px 1fr 145px;gap:8px;align-items:center;padding:6px;border:1px solid #dfe6ed;border-radius:7px}.yaya-pqr img{width:54px;height:44px;object-fit:cover;border-radius:5px}.yaya-pqr input{height:34px}.yaya-pframe{width:100%;height:70vh;border:1px solid #d9e1e8;border-radius:8px}'+
'.yaya-photo-head{display:flex;align-items:center;gap:8px;padding:9px 10px;border-bottom:1px solid #dfe6ed}.yaya-photo-head-title{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:850;color:#173f69}.yaya-photo-head-actions{display:flex;align-items:center;gap:5px;flex:0 0 auto}.yaya-photo-head-actions button{height:32px!important;min-height:32px!important;padding:0 9px!important;border-radius:8px!important;font-size:11px!important;line-height:1!important;white-space:nowrap!important}.yaya-photo-head-actions .cl{background:#173f69!important;border-color:#173f69!important;color:#fff!important}'+
'.yaya-pfoot{display:flex;align-items:center;gap:5px;margin-top:8px;flex-wrap:nowrap;overflow:visible}.yaya-pfoot .del{margin-right:auto}.yaya-pfoot button,.yaya-photo-nav button{height:32px!important;min-height:32px!important;padding:0 9px!important;border-radius:8px!important;font-size:11px!important;line-height:1!important;white-space:nowrap!important}.yaya-photo-nav{display:flex;align-items:center;gap:5px;flex:0 0 auto}'+
'@media(max-width:760px){.yaya-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;padding:5px}.yaya-pqr{grid-template-columns:50px 1fr}.yaya-pqr input{grid-column:1/-1}.yaya-pframe{height:64vh}.yaya-photo-head{padding:7px 8px;gap:6px}.yaya-photo-head-title{font-size:12px}.yaya-photo-head-actions button{height:31px!important;min-height:31px!important;padding:0 8px!important;font-size:10.5px!important}.yaya-pfoot{gap:4px}.yaya-pfoot button,.yaya-photo-nav button{height:31px!important;min-height:31px!important;padding:0 7px!important;font-size:10.5px!important}.yaya-pfoot .del{margin-right:auto}}'+
'.yaya-pic-wrap{position:relative;min-width:0}.yaya-pic{position:relative;width:100%;display:flex;align-items:center;justify-content:center}.yaya-photo-placeholder{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;color:#6b7d90;background:#eef2f5}.yaya-pic img{position:relative;z-index:1;opacity:0;transition:opacity .15s ease}.yaya-pic.loaded img{opacity:1}.yaya-pic.loaded .yaya-photo-placeholder{display:none}.yaya-pic.fallback .yaya-photo-placeholder{display:flex}.yaya-photo-delete{position:absolute;z-index:4;top:4px;right:4px;width:28px;height:28px;padding:0;border:1px solid rgba(255,255,255,.92);border-radius:8px;background:rgba(174,31,31,.94);color:#fff;font-size:17px;font-weight:900;line-height:1;box-shadow:0 2px 7px rgba(0,0,0,.22)}.yaya-photo-delete:disabled{opacity:.55}.yaya-photo-view-stage{position:relative;min-height:260px;background:#eef1f4;border:1px solid #d9e1e8;border-radius:8px;overflow:hidden;touch-action:pan-y}.yaya-photo-view-count{position:absolute;z-index:3;top:10px;right:10px;padding:5px 9px;border-radius:999px;background:rgba(17,24,39,.72);color:#fff;font-size:11px;font-weight:800;line-height:1}.yaya-photo-nav{display:flex;align-items:center;gap:6px}.yaya-photo-nav button{white-space:nowrap}.yaya-photo-view-error{padding:24px;text-align:center;color:#6b7280;font-size:13px;font-weight:700}'+
'@media(max-width:760px){.yaya-photo-nav{display:none!important}}'+
'.yaya-photo-confirm-delete{position:fixed;z-index:2147483646;inset:0;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;background:rgba(15,23,42,.34)}'+
'.yaya-photo-confirm-card{width:min(360px,calc(100vw - 36px));display:flex;flex-direction:column;gap:9px;padding:20px;border:1px solid #d8e1ea;border-radius:14px;background:#fff;box-shadow:0 18px 50px rgba(15,23,42,.28);text-align:center;box-sizing:border-box}'+
'.yaya-photo-confirm-card strong{font-size:17px;color:#172f4e}.yaya-photo-confirm-card>span{font-size:12px;color:#64748b;line-height:1.4}'+
'.yaya-photo-confirm-actions{display:flex;justify-content:center;gap:8px;margin-top:7px}.yaya-photo-confirm-actions button{min-width:100px;height:36px;padding:0 14px;border-radius:9px;font-size:12px;font-weight:850}'+
'.yaya-photo-confirm-actions .danger{border:1px solid #b42318;background:#b42318;color:#fff}.yaya-photo-confirm-actions .danger:hover{background:#951f16;border-color:#951f16}'+
'.yaya-photo-save-state{min-height:170px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;padding:18px;text-align:center}.yaya-photo-save-state strong{font-size:16px;color:#173f69}.yaya-photo-save-state span{font-size:12px;color:#617184;max-width:420px}.yaya-photo-save-spinner,.yaya-photo-upload-spinner{display:inline-block;width:30px;height:30px;border:3px solid #cfd8e3;border-top-color:#173f69;border-radius:50%;animation:yayaPhotoSpin .8s linear infinite}@keyframes yayaPhotoSpin{to{transform:rotate(360deg)}}'+
'.yaya-photo-upload-status{position:fixed;z-index:2147483000;right:14px;bottom:14px;display:flex;align-items:center;gap:10px;min-width:250px;max-width:min(380px,calc(100vw - 28px));padding:11px 13px;border:1px solid #b8c8da;border-radius:12px;background:#fff;box-shadow:0 8px 28px rgba(15,35,60,.18);color:#173f69}.yaya-photo-upload-status.done{border-color:#9bc6a4;background:#f4fbf5;color:#275d35}.yaya-photo-upload-status.error{border-color:#e2b7b7;background:#fff7f7;color:#8a2424}.yaya-photo-upload-icon{width:32px;min-width:32px;text-align:center;font-size:22px;font-weight:900}.yaya-photo-upload-copy{display:flex;flex-direction:column;gap:2px;min-width:0}.yaya-photo-upload-copy strong{font-size:12.5px;line-height:1.2}.yaya-photo-upload-copy span{font-size:11px;line-height:1.25;opacity:.9}.yaya-photo-upload-status .yaya-photo-upload-spinner{width:22px;height:22px;border-width:2px}'+
'@media(max-width:560px){.yaya-photo-upload-status{left:10px;right:10px;bottom:10px;max-width:none}.yaya-photo-delete{width:30px;height:30px;top:3px;right:3px}}';document.head.appendChild(s)}
function groupTitle(list){for(var i=0;i<list.length;i++){var t=String(list[i].titre||'').trim();if(t&&norm(t)!==norm(DEF)&&norm(t)!=='PHOTO')return t}return DEF}
function photoSignature(list){
  return (Array.isArray(list)?list:[]).map(function(p){
    return [String(p&&p.id||''),iso(p&&p.date),String(p&&p.titre||''),String(p&&p.lien||'')].join('|');
  }).join('¦');
}
function photoIndexByChantier(){
  var out=new Map();
  docs().forEach(function(d){
    if(!isPhoto(d))return;
    var k=String(d.chantierId||'');
    if(!out.has(k))out.set(k,[]);
    out.get(k).push(d);
  });
  out.forEach(function(list){
    list.sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))||String(b.id||'').localeCompare(String(a.id||''))});
  });
  return out;
}
function ensurePane(card,tabs,list){
  var cid=cardId(card),pane=card.querySelector(':scope>.yaya-detail-photos-pane');
  if(!pane){
    pane=document.createElement('div');
    pane.className='yaya-detail-section-node yaya-detail-photos-pane';
    pane.dataset.section='photos';
    tabs.insertAdjacentElement('afterend',pane);
  }
  list=Array.isArray(list)?list:rows(cid);
  pane.dataset.empty=list.length?'0':'1';

  // Ne construit la galerie que lorsque l'onglet Photos est réellement ouvert.
  if(String(card.dataset.yayaDetailSection||'')!=='photos')return pane;

  var sig=photoSignature(list);
  if(pane.dataset.photoSignature===sig){
    hydratePhotoThumbs(pane);
    return pane;
  }
  pane.dataset.photoSignature=sig;

  if(!list.length){
    if(pane.childNodes.length)pane.replaceChildren();
    return pane;
  }

  var groups={};
  list.forEach(function(p){var d=iso(p.date)||'';(groups[d]||(groups[d]=[])).push(p)});
  pane.innerHTML=Object.keys(groups).sort().reverse().map(function(d){
    var a=groups[d],t=groupTitle(a);
    return '<section class="yaya-pg"><div class="yaya-ph"><b class="yaya-pd">'+esc(fr(d))+'</b><span class="yaya-pt">'+esc(t)+'</span><button class="yaya-pe" data-date="'+esc(d)+'">✏️</button></div><div class="yaya-grid">'+a.map(function(p){
      var image=p.lien
        ? '<span class="yaya-photo-placeholder" aria-hidden="true">📷</span><img class="yaya-photo-thumb" data-src="'+esc(thumb(p.lien,360))+'" data-photo-link="'+esc(p.lien)+'" alt="Photo" loading="lazy" decoding="async">'
        : '<span class="yaya-photo-placeholder" aria-hidden="true">📷</span>';
      return '<button type="button" class="yaya-pic" data-id="'+esc(p.id)+'" aria-label="Ouvrir la photo">'+image+'</button>';
    }).join('')+'</div></section>';
  }).join('');
  hydratePhotoThumbs(pane);
  return pane;
}
window.yayaEnsurePhotosPane=ensurePane;window.yayaPhotosForChantier=rows;
function refresh(){
  style();
  var photoIndex=photoIndexByChantier();
  document.querySelectorAll('#pane-chantiers .card:has(>.yaya-detail-section-tabs)').forEach(function(card){
    var tabs=card.querySelector(':scope>.yaya-detail-section-tabs');
    if(!tabs)return;
    var cid=cardId(card),a=photoIndex.get(String(cid))||[];
    ensurePane(card,tabs,a);
    var sm=tabs.querySelector('[data-section="photos"] small');
    if(sm){
      var count=String(a.length);
      if(sm.textContent!==count)sm.textContent=count;
      sm.style.display='inline-flex';
    }
    var row=card.querySelector(':scope>.yaya-detail-section-action-row[data-section="photos"]');
    if(row){
      var box=row.querySelector('.yaya-photo-action-buttons');
      if(!box){
        box=document.createElement('span');
        box.className='yaya-photo-action-buttons';
        box.innerHTML='<button type="button" class="btnp yaya-photo-camera-action">📷 Prendre une photo</button><button type="button" class="btn2 yaya-photo-import-action">🖼 Importer des photos</button>';
        row.appendChild(box);
        box.querySelector('.yaya-photo-camera-action').onclick=function(e){e.preventDefault();e.stopPropagation();pickPhotos(cid,'camera')};
        box.querySelector('.yaya-photo-import-action').onclick=function(e){e.preventDefault();e.stopPropagation();pickPhotos(cid,'import')};
      }
    }
  });
}
function readAscii(v,p,n){var o='';for(var i=0;i<n;i++){var c=v.getUint8(p+i);if(!c)break;o+=String.fromCharCode(c)}return o}
function parseExifDateText(raw){var m=String(raw||'').trim().match(/^(\d{4}):(\d{2}):(\d{2})/);return m?iso(m[1]+'-'+m[2]+'-'+m[3]):''}
function photoDateFromFilename(name){
  var s=String(name||'');
  var m=s.match(/(?:^|[^0-9])(\d{2})[-_. ](\d{2})[-_. ](\d{4})(?:[^0-9]|$)/);
  if(m)return iso(m[3]+'-'+m[2]+'-'+m[1]);
  m=s.match(/(?:^|[^0-9])(20\d{2})[-_.]?(\d{2})[-_.]?(\d{2})(?:[^0-9]|$)/);
  if(m)return iso(m[1]+'-'+m[2]+'-'+m[3]);
  return '';
}
function photoDateFromFileTimestamp(file){
  var t=Number(file&&file.lastModified||0);
  if(!t)return '';
  var d=new Date(t);
  if(!isFinite(d.getTime())||d.getFullYear()<2000)return '';
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
async function exifDate(file){
    if(!file||!/(?:jpe?g)$/i.test(String(file.name||''))&&!/^image\/jpeg$/i.test(String(file.type||'')))return '';
    let buffer;
    try{buffer=await file.slice(0,512*1024).arrayBuffer();}catch(e){return '';}
    const view=new DataView(buffer);
    if(view.byteLength<4||view.getUint16(0,false)!==0xFFD8)return '';
    let offset=2;
    while(offset+4<view.byteLength){
      if(view.getUint8(offset)!==0xFF){offset++;continue;}
      const marker=view.getUint8(offset+1);
      if(marker===0xDA||marker===0xD9)break;
      const len=view.getUint16(offset+2,false);
      if(len<2||offset+2+len>view.byteLength)break;
      if(marker===0xE1){
        const data=offset+4;
        if(data+6<view.byteLength&&readAscii(view,data,6)==='Exif'){
          const tiff=data+6;
          if(tiff+8>=view.byteLength)return '';
          const endian=view.getUint16(tiff,false);
          const little=endian===0x4949;
          if(!little&&endian!==0x4D4D)return '';
          const u16=function(pos){return view.getUint16(pos,little);};
          const u32=function(pos){return view.getUint32(pos,little);};
          function readValue(entry){
            const type=u16(entry+2),count=u32(entry+4);
            if(type!==2||!count)return '';
            const ptr=count<=4?entry+8:tiff+u32(entry+8);
            if(ptr<0||ptr+count>view.byteLength)return '';
            return readAscii(view,ptr,count);
          }
          function scanIfd(ifdOffset,wantExif){
            const pos=tiff+ifdOffset;
            if(pos<0||pos+2>view.byteLength)return {date:'',exif:0};
            const n=u16(pos);let date='',exif=0;
            for(let i=0;i<n;i++){
              const entry=pos+2+i*12;if(entry+12>view.byteLength)break;
              const tag=u16(entry);
              if(tag===0x8769)exif=u32(entry+8);
              if(tag===0x0132||tag===0x9003||tag===0x9004){
                const parsed=parseExifDateText(readValue(entry));
                if(parsed){date=parsed;if(tag===0x9003)break;}
              }
            }
            return {date:date,exif:exif};
          }
          const ifd0=u32(tiff+4);
          const first=scanIfd(ifd0,false);
          if(first.exif){
            const second=scanIfd(first.exif,true);
            if(second.date)return second.date;
          }
          if(first.date)return first.date;
        }
      }
      offset+=2+len;
    }
    return '';
  }
function base64(file){return new Promise(function(ok,no){var r=new FileReader();r.onerror=no;r.onload=function(){ok(String(r.result||'').split(',')[1]||'')};r.readAsDataURL(file)})}
async function resize(file){
  var heic=isHeic(file,file&&file.name);
  if(heic){
    try{
      var converted=await convertHeicBlob(file);
      file=new File([converted],String(file.name||'photo').replace(/\.(?:heic|heif)$/i,'')+'.jpg',{type:'image/jpeg',lastModified:file.lastModified||Date.now()});
    }catch(e){
      throw new Error('Cette photo iPhone HEIC ne peut pas être convertie. Réessayez après quelques secondes.');
    }
  }
  if(file.size<=MAX)return file;
  var u=URL.createObjectURL(file);
  try{
    var img=await new Promise(function(ok,no){var i=new Image();i.onload=function(){ok(i)};i.onerror=no;i.src=u});
    var r=Math.min(1,1800/Math.max(img.width,img.height)),c=document.createElement('canvas');
    c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    var blob=await new Promise(function(ok){c.toBlob(ok,'image/jpeg',.84)});
    return blob?new File([blob],String(file.name||'photo').replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg',lastModified:file.lastModified||Date.now()}):file;
  }catch(e){return file}finally{URL.revokeObjectURL(u)}
}
async function archive(file){
  var api='';try{api=String(API||'')}catch(e){}
  if(!api)throw new Error('API Yaya indisponible');
  file=await resize(file);
  if(file.size>MAX)throw new Error('Photo trop lourde');
  var b=await base64(file);
  var ctrl=typeof AbortController!=='undefined'?new AbortController():null;
  var timer=ctrl?setTimeout(function(){try{ctrl.abort()}catch(e){}},60000):0;
  try{
    var opts={method:'POST',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'archiverDevis',data:{filename:file.name,mimeType:file.type||'image/jpeg',base64:b}})};
    if(ctrl)opts.signal=ctrl.signal;
    var r=await fetch(api,opts);
    var j=await r.json();
    if(!j.ok)throw new Error(j.error||'Import impossible');
    var x=j.data||{},link=String(x.lienDrive||x.lien||'');
    if(!link)throw new Error(x.archiveErreur||'Photo non archivée');
    if(!isHeic(file,file.name))await storePhotoBinaryCache(link,file,file.name,file.type||'image/jpeg');
    return link;
  }catch(e){
    if(e&&e.name==='AbortError')throw new Error('Import trop long — vérifiez la connexion');
    throw e;
  }finally{
    if(timer)clearTimeout(timer);
  }
}
function pickPhotos(cid,mode){
  cid=String(cid||'');
  var input=document.createElement('input');
  input.type='file';
  input.accept='image/*';
  if(mode==='camera')input.setAttribute('capture','environment');
  else input.multiple=true;
  input.style.position='fixed';
  input.style.left='-9999px';
  input.style.opacity='0';
  document.body.appendChild(input);

  function cleanupPicker(){
    if(input&&input.parentNode)input.parentNode.removeChild(input);
  }

  input.onchange=async function(){
    var files=Array.from(input.files||[]);
    cleanupPicker();
    if(!files.length)return;
    await openPhotoReview(cid,files,mode);
  };

  // Sur iPhone, le retour de la photothèque peut rendre le focus avant l'événement change.
  // Ne pas supprimer l'input sur focus : on attend change ou cancel.
  input.addEventListener('cancel',cleanupPicker,{once:true});

  input.click();
}

async function openPhotoReview(cid,files,mode){
  var r=root();
  if(!r)return;

  var q=[],urls=[];
  for(var f of Array.from(files||[])){
    if(!isImageFile(f))continue;
    var exif=await exifDate(f);
    var fromName=photoDateFromFilename(f&&f.name);
    var fromFile=photoDateFromFileTimestamp(f);
    var d=exif||fromName||fromFile||today();
    var u=URL.createObjectURL(f);
    urls.push(u);
    q.push({f:f,d:d,u:u,exif:!!exif,sourceDate:exif?'EXIF':(fromName?'nom du fichier':(fromFile?'date du fichier':'date du jour'))});
  }

  if(!q.length){
    toastS('Aucune photo sélectionnée',true);
    return;
  }

  r.innerHTML='<div class="overlay yaya-photo-overlay"><div class="modal yaya-pa">'
    +'<h5>Photos sélectionnées<button class="cl">Fermer</button></h5>'
    +'<div class="note">Vérifiez la date puis cliquez sur Enregistrer.</div>'
    +'<div class="yaya-pq"></div>'
    +'<div class="msg note" style="min-height:20px;margin-top:8px"></div>'
    +'<div class="mfoot"><button class="btn2 cl">Annuler</button><button class="btnp go sv">Enregistrer les photos</button></div>'
    +'</div></div>';

  var m=r.querySelector('.yaya-pa');
  var qe=m.querySelector('.yaya-pq');
  var sv=m.querySelector('.sv');
  var msg=m.querySelector('.msg');

  function closeReview(){
    urls.forEach(function(u){
      try{URL.revokeObjectURL(u)}catch(e){}
    });
    close();
  }

  function draw(){
    qe.innerHTML=q.map(function(x,i){
      return '<div class="yaya-pqr">'
        +'<img src="'+esc(x.u)+'">'
        +'<div><b>'+esc(x.f.name)+'</b><div class="note">Date détectée : '+esc(x.sourceDate||'date du jour')+'</div></div>'
        +'<input type="date" data-i="'+i+'" value="'+esc(x.d)+'">'
        +'</div>';
    }).join('');
    sv.disabled=!q.length||q.some(function(x){return !iso(x.d)});
  }

  draw();

  m.querySelectorAll('.cl').forEach(function(b){
    b.onclick=closeReview;
  });

  qe.oninput=function(e){
    if(!e.target.matches('input[type=date]'))return;
    q[Number(e.target.dataset.i)].d=iso(e.target.value);
    draw();
  };

  sv.onclick=async function(){
    if(sv.disabled)return;
    sv.disabled=true;
    var batch=q.slice(),batchId='pb_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);

    // Retour visuel IMMEDIAT : l'opérateur sait que le clic a bien été pris en compte.
    m.innerHTML='<h5>Enregistrement des photos</h5>'
      +'<div class="yaya-photo-save-state">'
      +'<span class="yaya-photo-save-spinner" aria-hidden="true"></span>'
      +'<strong>Enregistrement lancé</strong>'
      +'<span class="yaya-photo-save-detail">Préparation et sécurisation de '+batch.length+' photo(s)…</span>'
      +'</div>';

    try{
      var queued=await enqueuePhotoJobs(cid,batch,batchId);
      if(!queued)throw new Error('Aucune photo à enregistrer');
      startPhotoUploadStatus(queued,batchId);
      var detail=m.querySelector('.yaya-photo-save-detail');
      var strong=m.querySelector('.yaya-photo-save-state strong');
      if(strong)strong.textContent='Upload et enregistrement en cours';
      if(detail)detail.textContent=queued+' photo(s) sécurisée(s) sur cet appareil. Vous pouvez continuer à travailler.';
      setTimeout(closeReview,1300);
      setTimeout(processPhotoJobs,0);
    }catch(e){
      m.innerHTML='<h5>Enregistrement des photos</h5><div class="yaya-photo-save-state"><strong style="color:#a32626">Enregistrement impossible</strong><span>'+esc(String(e&&e.message||e))+'</span><button type="button" class="btn2 cl">Fermer</button></div>';
      var cl=m.querySelector('.cl');if(cl)cl.onclick=closeReview;
      toastS(String(e&&e.message||e),true);
    }
  };
}

window.openPhotosForChantier=function(cid){pickPhotos(cid,'import')};
window.yayaOpenPhotoCamera=function(cid){pickPhotos(cid,'camera')};
window.yayaOpenPhotoImport=function(cid){pickPhotos(cid,'import')};
function find(idv){return docs().find(function(d){return isPhoto(d)&&String(d.id)===String(idv)})}
function confirmPhotoDelete(){
  return new Promise(function(resolve){
    var old=document.getElementById('yaya-photo-confirm-delete');
    if(old)old.remove();

    var wrap=document.createElement('div');
    wrap.id='yaya-photo-confirm-delete';
    wrap.className='yaya-photo-confirm-delete';
    wrap.innerHTML='<div class="yaya-photo-confirm-card" role="dialog" aria-modal="true" aria-labelledby="yayaPhotoConfirmTitle">'
      +'<strong id="yayaPhotoConfirmTitle">Supprimer cette photo ?</strong>'
      +'<span>Cette action supprimera la photo du chantier.</span>'
      +'<div class="yaya-photo-confirm-actions">'
      +'<button type="button" class="btn2 cancel">Annuler</button>'
      +'<button type="button" class="danger confirm">Supprimer</button>'
      +'</div></div>';

    function done(value){
      document.removeEventListener('keydown',onKey,true);
      if(wrap&&wrap.parentNode)wrap.parentNode.removeChild(wrap);
      resolve(!!value);
    }
    function onKey(e){
      if(e.key==='Escape'){e.preventDefault();done(false)}
      else if(e.key==='Enter'){e.preventDefault();done(true)}
    }

    wrap.addEventListener('click',function(e){
      if(e.target===wrap)done(false);
    });
    wrap.querySelector('.cancel').onclick=function(){done(false)};
    wrap.querySelector('.confirm').onclick=function(){done(true)};
    document.addEventListener('keydown',onKey,true);
    document.body.appendChild(wrap);
    setTimeout(function(){
      var b=wrap.querySelector('.confirm');
      if(b)b.focus();
    },0);
  });
}
async function deletePhoto(p,button,closeAfter){
  if(!p)return;
  var confirmed=await confirmPhotoDelete();
  if(!confirmed)return;
  if(button)button.disabled=true;
  var before=docs().slice();
  if(typeof S!=='undefined'&&S)S.documents=before.filter(function(d){return String(d.id)!==String(p.id)});
  queuePhotoDelete(p.id);savePhotoCache();
  if(closeAfter)close();
  refresh();
  var ok=await commitPhotoPending();
  if(!ok){
    toastS('Suppression enregistrée localement — synchronisation en attente',true);
    if(button)button.disabled=false;
    return;
  }
  toastS('Photo supprimée et synchronisée ✓');
}
function sameEntryPhotos(p){
  if(!p)return [];
  var cid=String(p.chantierId||''),d=iso(p.date);
  // Même ordre que les vignettes affichées : gauche -> droite.
  // Ainsi "précédente" va bien vers la vignette de gauche et "suivante" vers celle de droite.
  return rows(cid)
    .filter(function(x){return iso(x.date)===d})
    .sort(function(a,b){return String(b.id||'').localeCompare(String(a.id||''))});
}
async function openPic(p){
  if(!p)return;
  var r=root(),direct=thumb(p.lien,1600),gallery=sameEntryPhotos(p);
  var currentIndex=gallery.findIndex(function(x){return String(x.id)===String(p.id)});
  if(currentIndex<0){gallery=[p];currentIndex=0}
  var countHtml=gallery.length>1?'<span class="yaya-photo-view-count">'+(currentIndex+1)+' / '+gallery.length+'</span>':'';
  var navHtml=gallery.length>1?'<span class="yaya-photo-nav"><button type="button" class="btn2 prev"'+(currentIndex<=0?' disabled':'')+'>Photo précédente</button><button type="button" class="btn2 next"'+(currentIndex>=gallery.length-1?' disabled':'')+'>Photo suivante</button></span>':'';
  r.innerHTML='<div class="overlay yaya-photo-overlay"><div class="modal"><div class="yaya-photo-head"><div class="yaya-photo-head-title">'+esc(fr(p.date))+' — '+esc(p.titre||DEF)+'</div><div class="yaya-photo-head-actions"><button type="button" class="btn2 dl">Télécharger</button><button type="button" class="btnp cl">Fermer</button></div></div><div class="yaya-photo-view-stage"><span class="yaya-photo-placeholder">📷</span>'+countHtml+(direct?'<img class="yaya-photo-view-img" src="'+esc(direct)+'" alt="Photo chantier">':'')+'</div><div class="yaya-pfoot"><button class="btn2 del">Supprimer</button>'+navHtml+'</div></div></div>';
  r.querySelectorAll('.cl').forEach(function(b){b.onclick=close});
  var stage=r.querySelector('.yaya-photo-view-stage'),view=stage&&stage.querySelector('img'),del=r.querySelector('.del'),dl=r.querySelector('.dl'),prev=r.querySelector('.prev'),next=r.querySelector('.next'),file=null,fallbackStarted=false;

  function navigate(delta){
    var targetIndex=currentIndex+delta;
    if(targetIndex<0||targetIndex>=gallery.length)return;
    openPic(gallery[targetIndex]);
  }
  if(prev)prev.onclick=function(){navigate(-1)};
  if(next)next.onclick=function(){navigate(1)};

  if(window.__yayaPhotoKeyHandler){try{document.removeEventListener('keydown',window.__yayaPhotoKeyHandler)}catch(e){}}
  window.__yayaPhotoKeyHandler=function(e){
    if(!r.querySelector('.yaya-photo-overlay'))return;
    if(e.key==='ArrowLeft'&&currentIndex>0){e.preventDefault();navigate(-1)}
    else if(e.key==='ArrowRight'&&currentIndex<gallery.length-1){e.preventDefault();navigate(1)}
  };
  document.addEventListener('keydown',window.__yayaPhotoKeyHandler);

  if(stage&&gallery.length>1){
    var touchStartX=0,touchStartY=0;
    stage.addEventListener('touchstart',function(e){
      var t=e.touches&&e.touches[0];if(!t)return;
      touchStartX=t.clientX;touchStartY=t.clientY;
    },{passive:true});
    stage.addEventListener('touchend',function(e){
      var t=e.changedTouches&&e.changedTouches[0];if(!t)return;
      var dx=t.clientX-touchStartX,dy=t.clientY-touchStartY;
      if(Math.abs(dx)<45||Math.abs(dx)<=Math.abs(dy)*1.15)return;
      if(dx<0)navigate(1);else navigate(-1);
    },{passive:true});
  }

  [gallery[currentIndex-1],gallery[currentIndex+1]].forEach(function(x){
    if(!x||!x.lien)return;
    try{var preload=new Image();preload.src=thumb(x.lien,1600)}catch(e){}
  });

  if(del)del.onclick=function(){deletePhoto(p,del,true)};

  async function loadOriginal(){
    if(file)return file;
    file=await fetchPhotoFile(p.lien);
    return file;
  }
  async function fallbackToOriginal(){
    if(fallbackStarted)return;
    fallbackStarted=true;
    if(stage&&stage.isConnected)stage.innerHTML='<div class="yaya-photo-view-error">Chargement de la photo…</div>';
    try{
      var f=await loadOriginal();
      if(!stage||!stage.isConnected)return;
      if(f&&f.mimeType&&String(f.mimeType).toLowerCase().indexOf('image/')!==0){
        close();
        if(typeof window.voirPiece==='function')window.voirPiece(p.lien);
        else window.open(p.lien,'_blank','noopener');
        return;
      }
      stage.innerHTML='<img class="yaya-photo-view-img" src="'+esc(f.url)+'" alt="Photo chantier">';
    }catch(e){
      if(stage&&stage.isConnected)stage.innerHTML='<div class="yaya-photo-view-error">Cette photo ne peut pas être affichée, mais elle reste téléchargeable.</div>';
    }
  }

  if(view){
    view.onload=function(){
      var ph=stage&&stage.querySelector('.yaya-photo-placeholder');
      if(ph)ph.remove();
    };
    view.onerror=function(){fallbackToOriginal()};
    if(view.complete&&view.naturalWidth>0)view.onload();
    else setTimeout(function(){
      if(view&&view.isConnected&&(!view.complete||!view.naturalWidth))fallbackToOriginal();
    },7000);
  }else{
    fallbackToOriginal();
  }

  if(dl)dl.onclick=async function(){
    var old=dl.textContent;
    dl.disabled=true;
    dl.textContent='Préparation…';
    try{
      var f=await loadOriginal(),a=document.createElement('a');
      a.href=f.url;
      a.download=f.filename||'photo';
      a.click();
    }catch(e){
      var a=document.createElement('a');
      a.href=download(p.lien);
      a.target='_blank';
      a.rel='noopener';
      a.click();
    }finally{
      if(dl&&dl.isConnected){dl.disabled=false;dl.textContent=old}
    }
  };
}
function editTitle(cid,d,current){var r=root();r.innerHTML='<div class="overlay yaya-photo-overlay"><div class="modal"><h5>Titre du '+esc(fr(d))+'<button class="cl">Fermer</button></h5><div class="mrow"><input class="msel ti" maxlength="80" value="'+esc(current||DEF)+'"></div><div class="mfoot"><button class="btn2 cl">Annuler</button><button class="btnp go sv">Enregistrer</button></div></div></div>';r.querySelectorAll('.cl').forEach(function(b){b.onclick=close});r.querySelector('.sv').onclick=async function(){var v=String(r.querySelector('.ti').value||'').trim()||DEF,a=rows(cid).filter(function(p){return iso(p.date)===iso(d)});a.forEach(function(p){p.titre=v;queuePhotoUpsert(p)});savePhotoCache();close();refresh();var ok=await commitPhotoPending();toastS(ok?'Titre enregistré et synchronisé ✓':'Titre enregistré localement — synchronisation en attente',!ok)}}
function photoFromTile(tile){
  if(!tile)return null;
  var p=find(tile.dataset.id);
  if(p)return p;
  var img=tile.querySelector('.yaya-photo-thumb');
  var link=String(img&&img.dataset.photoLink||'');
  return link?docs().find(function(d){return isPhoto(d)&&String(d.lien||'')===link}):null;
}
var lastTouchOpenAt=0;
function openPhotoTile(e,isTouch){
  var tile=e.target.closest&&e.target.closest('.yaya-pic[data-id]');
  if(!tile)return false;
  e.preventDefault();
  e.stopPropagation();
  var now=Date.now();
  if(now-lastTouchOpenAt<450)return true;
  if(isTouch)lastTouchOpenAt=now;
  openPic(photoFromTile(tile));
  return true;
}
document.addEventListener('pointerup',function(e){
  if(e.pointerType==='touch')openPhotoTile(e,true);
},true);
if(!window.PointerEvent){
  document.addEventListener('touchend',function(e){openPhotoTile(e,true)},true);
}
document.addEventListener('click',function(e){
  if(openPhotoTile(e,false))return;
  var ed=e.target.closest&&e.target.closest('.yaya-pe[data-date]');
  if(ed){e.preventDefault();e.stopPropagation();var c=ed.closest('.card'),cid=cardId(c),d=ed.dataset.date;editTitle(cid,d,groupTitle(rows(cid).filter(function(p){return iso(p.date)===d})))}
},true);
style();refresh();var refreshTimer=0,pane=document.getElementById('pane-chantiers');if(pane)new MutationObserver(function(){if(refreshTimer)return;refreshTimer=setTimeout(function(){refreshTimer=0;refresh()},90)}).observe(pane,{childList:true,subtree:true});window.addEventListener('yaya:data-refreshed',function(){setTimeout(refresh,30)});

document.addEventListener('click',function(e){
  var tab=e.target.closest&&e.target.closest('[data-section="photos"]');
  if(tab)setTimeout(function(){photoSyncPulse(true)},0);
},true);
window.addEventListener('focus',function(){setTimeout(function(){photoSyncPulse(true)},250)});
window.addEventListener('online',function(){setTimeout(function(){photoSyncPulse(true)},250)});
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(function(){photoSyncPulse(true)},250)});
setInterval(function(){
  if(document.hidden)return;
  if(document.querySelector('#pane-chantiers .card[data-yaya-detail-section="photos"]'))photoSyncPulse(false);
},60000);
setTimeout(function(){processPhotoJobs();if(document.querySelector('#pane-chantiers .card[data-yaya-detail-section="photos"]'))photoSyncPulse(true)},1400);
})();